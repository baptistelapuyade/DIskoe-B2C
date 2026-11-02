"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  parseEventInput,
  type EventFieldErrors,
} from "@/lib/domain/event-publication";
import { ensureEditableEventDraft } from "@/lib/event/draft";
import { loadLiveEvent } from "@/lib/event/live";
import {
  canCancel,
  canPostpone,
  canReschedule,
} from "@/lib/event/status";
import { valuesToRow, type EventFormValues } from "@/lib/event/values";
import { createClient } from "@/lib/supabase/server";

export type StatusFormState = {
  ok: boolean;
  message?: string;
  errors?: Pick<EventFieldErrors, "start" | "end">;
  gaps?: string[];
};

const GENERIC_ERROR =
  "Das hat leider nicht geklappt. Bitte versucht es noch einmal.";
const CHANGED_ERROR =
  "Das Event hat sich zwischenzeitlich geändert. Bitte ladet die Seite neu und prüft den Stand noch einmal.";

function managePath(eventId: string) {
  return `/organizer/events/${eventId}/manage`;
}

function done(eventId: string): never {
  revalidatePath("/organizer");
  revalidatePath(`/organizer/events/${eventId}`, "layout");
  redirect(managePath(eventId));
}

function errorMessage(code: string | undefined, refused: string): string {
  if (code === "DK001") return CHANGED_ERROR;
  if (code === "DK003") return refused;

  return GENERIC_ERROR;
}

// "2026-10-23T22:00" (one date-time control) to date and time.
function splitLocal(raw: FormDataEntryValue | null): {
  date: string;
  time: string;
} {
  const [date = "", time = ""] = (typeof raw === "string" ? raw : "").split("T");

  return { date, time: time.slice(0, 5) };
}

// NACH-15. Status only: the database never publishes the private draft here.
export async function cancelEvent(
  eventId: string,
  _previous: StatusFormState,
): Promise<StatusFormState> {
  const { view } = await loadLiveEvent(eventId, `/organizer/events/${eventId}/cancel`);
  const event = view.event;

  if (!canCancel(event.publicStatus)) {
    return { ok: false, message: "Dieses Event ist bereits abgesagt." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_event", {
    p_event_id: eventId,
    p_expected_published_revision_id: event.publishedRevisionId as string,
    p_expected_state_version: event.stateVersion,
    p_expected_status: event.publicStatus,
  });

  if (error) {
    return {
      ok: false,
      message: errorMessage(error.code, "Dieses Event ist bereits abgesagt."),
    };
  }

  done(eventId);
}

// NACH-12. Without a replacement date; the published text stays as it was.
export async function postponeEvent(
  eventId: string,
  _previous: StatusFormState,
): Promise<StatusFormState> {
  const { view } = await loadLiveEvent(eventId, `/organizer/events/${eventId}/reschedule`);
  const event = view.event;

  if (!canPostpone(event.publicStatus)) {
    return {
      ok: false,
      message: "Dieses Event kann gerade nicht ohne neuen Termin verschoben werden.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("postpone_event", {
    p_event_id: eventId,
    p_expected_published_revision_id: event.publishedRevisionId as string,
    p_expected_state_version: event.stateVersion,
    p_expected_status: event.publicStatus,
  });

  if (error) {
    return {
      ok: false,
      message: errorMessage(
        error.code,
        "Dieses Event kann gerade nicht ohne neuen Termin verschoben werden.",
      ),
    };
  }

  done(eventId);
}

// NACH-11. The draft is saved with the new date and published as a whole by
// reschedule_event; so it must equal the public version apart from the date.
export async function rescheduleEvent(
  eventId: string,
  _previous: StatusFormState,
  formData: FormData,
): Promise<StatusFormState> {
  const { view, live, draftHasOtherChanges } = await loadLiveEvent(
    eventId,
    `/organizer/events/${eventId}/reschedule`,
  );
  const event = view.event;

  if (!canReschedule(event.publicStatus)) {
    return { ok: false, message: "Ein abgesagtes Event kann nicht verschoben werden." };
  }

  if (draftHasOtherChanges) {
    return {
      ok: false,
      message:
        "Euer Entwurf enthält weitere private Änderungen. Sie würden mitveröffentlicht und werden deshalb nicht übernommen.",
    };
  }

  const start = splitLocal(formData.get("start"));
  const end = splitLocal(formData.get("end"));
  const merged: EventFormValues = {
    ...view.form,
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    endUnknown: formData.get("endUnknown") === "on",
  };

  if (merged.startDate === live.startDate && merged.startTime === live.startTime) {
    return {
      ok: false,
      errors: { start: "Der neue Beginn muss sich vom bisherigen unterscheiden." },
    };
  }

  const parsed = parseEventInput({
    ...merged,
    endUnknown: merged.endUnknown ? "on" : null,
  });

  if (!parsed.ok) {
    const { start: startError, end: endError, ...other } = parsed.errors;
    const rest = Object.values(other).filter((text) => Boolean(text));

    // Another field of the draft is invalid; the editor is where to fix it.
    return {
      ok: false,
      errors: { start: startError, end: endError },
      message:
        rest.length > 0
          ? `Euer Entwurf enthält Angaben, die erst im Editor korrigiert werden müssen: ${rest.join(" ")}`
          : undefined,
    };
  }

  const supabase = await createClient();
  let revisionId: string;

  try {
    ({ revisionId } = await ensureEditableEventDraft(supabase, view.userId, event));

    const { data, error } = await supabase
      .from("event_revisions")
      .update(valuesToRow(parsed.value))
      .eq("id", revisionId)
      .select("id");

    if (error || !data || data.length !== 1) {
      return { ok: false, message: GENERIC_ERROR };
    }
  } catch {
    return { ok: false, message: GENERIC_ERROR };
  }

  const { error } = await supabase.rpc("reschedule_event", {
    p_event_id: eventId,
    p_expected_draft_revision_id: revisionId,
    p_expected_published_revision_id: event.publishedRevisionId as string,
    p_expected_state_version: event.stateVersion,
    p_expected_status: event.publicStatus,
  });

  if (error) {
    if (error.code === "DK002") {
      return { ok: false, message: "Es fehlen noch Angaben im Entwurf." };
    }

    return {
      ok: false,
      message: errorMessage(error.code, "Der neue Beginn muss sich vom bisherigen unterscheiden."),
    };
  }

  done(eventId);
}
