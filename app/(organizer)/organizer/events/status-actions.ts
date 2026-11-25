"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  checkReschedule,
  type RescheduleErrors,
} from "@/lib/domain/event-reschedule";
import { type ExpectedState, expectedArgs } from "@/lib/event/expected";
import { loadLiveEvent } from "@/lib/event/live";
import {
  canCancel,
  canPostpone,
  canReopen,
  canReschedule,
} from "@/lib/event/status";
import { localToInstant } from "@/lib/domain/time";
import { createClient } from "@/lib/supabase/server";

// What a status form shows after a call. A call that goes through does not
// return: it redirects to the result page (Figma EVV-04, 05b, EVA-02).
export type StatusFormState =
  | { status: "idle" }
  // The entries are refused (EVV-01b); the codes become texts in the form.
  | { status: "invalid"; errors: RescheduleErrors }
  // "I am cancelling this event" is not ticked (EVA-01b).
  | { status: "unchecked" }
  // The event changed since the page was loaded (state version or status).
  | { status: "stale" }
  // The call did not go through; nothing changed (EVV-02b, EVA-01c).
  | { status: "failed" };

export type RescheduleFormState = StatusFormState;

function managePath(eventId: string) {
  return `/organizer/events/${eventId}/manage`;
}

function done(eventId: string, result: string): never {
  revalidatePath("/organizer");
  revalidatePath("/organizer/events");
  revalidatePath(`/organizer/events/${eventId}`, "layout");
  redirect(`/organizer/events/${eventId}/${result}`);
}

// DK001: another change came first. DK003: the status no longer allows the
// call. Both mean "reload and look"; anything else did not go through.
function failure(code: string | undefined): StatusFormState {
  return code === "DK001" || code === "DK003"
    ? { status: "stale" }
    : { status: "failed" };
}

// NACH-15, EVA-01. Status only: the database never publishes the private
// draft here. Nothing a person typed is logged.
export async function cancelEvent(
  eventId: string,
  expected: ExpectedState,
  _previous: StatusFormState,
  formData: FormData,
): Promise<StatusFormState> {
  const { view } = await loadLiveEvent(
    eventId,
    `/organizer/events/${eventId}/cancel`,
  );
  const event = view.event;

  if (!canCancel(event.publicStatus)) redirect(managePath(eventId));

  if (formData.get("confirm") !== "on") return { status: "unchecked" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_event", {
    p_event_id: eventId,
    ...expectedArgs(expected),
  });

  if (error) return failure(error.code);

  done(eventId, "cancelled");
}

// NACH-12, EVV-02. Without a replacement date; the published text stays as it
// was.
export async function postponeEvent(
  eventId: string,
  expected: ExpectedState,
  _previous: StatusFormState,
): Promise<StatusFormState> {
  const { view } = await loadLiveEvent(
    eventId,
    `/organizer/events/${eventId}/reschedule/open`,
  );
  const event = view.event;

  if (!canPostpone(event.publicStatus)) redirect(managePath(eventId));

  const supabase = await createClient();
  const { error } = await supabase.rpc("postpone_event", {
    p_event_id: eventId,
    ...expectedArgs(expected),
  });

  if (error) return failure(error.code);

  done(eventId, "postponed");
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

// NACH-11, EVV-01 and EVV-05. The database builds the new public revision from
// the live one and changes only start and end; the private draft takes over
// the new date. `from` is where the form lives, for the sign-in redirect.
export async function rescheduleEvent(
  eventId: string,
  from: "reschedule" | "schedule",
  expected: ExpectedState,
  _previous: StatusFormState,
  formData: FormData,
): Promise<StatusFormState> {
  const { view, live } = await loadLiveEvent(
    eventId,
    `/organizer/events/${eventId}/${from}`,
  );
  const event = view.event;

  if (!canReschedule(event.publicStatus)) redirect(managePath(eventId));

  const current = localToInstant(live.startDate, live.startTime);
  const checked = checkReschedule(
    {
      startDate: field(formData, "startDate"),
      startTime: field(formData, "startTime"),
      endDate: field(formData, "endDate"),
      endTime: field(formData, "endTime"),
    },
    current.ok ? current.instant : null,
    new Date(),
  );

  if (!checked.ok) return { status: "invalid", errors: checked.errors };

  const supabase = await createClient();
  const { error } = await supabase.rpc("reschedule_event_date", {
    p_event_id: eventId,
    ...expectedArgs(expected),
    p_new_start: checked.start,
    // No end is an unknown end; the generated type does not show that the
    // parameter accepts null.
    p_new_end: checked.end as string,
  });

  if (error) {
    if (error.code === "22023") {
      return { status: "invalid", errors: { endDate: "endBeforeStart" } };
    }

    return failure(error.code);
  }

  done(eventId, from === "schedule" ? "scheduled" : "rescheduled");
}

// EVV-06. A cancelled event is reopened with a new date: the database lifts
// the cancellation, builds the new public revision from the live one and lets
// the private draft take over the date (reopen_event).
export async function reopenEvent(
  eventId: string,
  expected: ExpectedState,
  _previous: StatusFormState,
  formData: FormData,
): Promise<StatusFormState> {
  const { view } = await loadLiveEvent(
    eventId,
    `/organizer/events/${eventId}/reopen`,
  );
  const event = view.event;

  if (!canReopen(event.publicStatus)) redirect(managePath(eventId));

  const checked = checkReschedule(
    {
      startDate: field(formData, "startDate"),
      startTime: field(formData, "startTime"),
      endDate: field(formData, "endDate"),
      endTime: field(formData, "endTime"),
    },
    // A cancelled event may come back on the date it had (cancelled by
    // mistake); only a start in the past is refused.
    null,
    new Date(),
  );

  if (!checked.ok) return { status: "invalid", errors: checked.errors };

  const supabase = await createClient();
  const { error } = await supabase.rpc("reopen_event", {
    p_event_id: eventId,
    ...expectedArgs(expected),
    p_new_start: checked.start,
    // No end is an unknown end; the generated type does not show that the
    // parameter accepts null.
    p_new_end: checked.end as string,
  });

  if (error) {
    if (error.code === "22023") {
      return { status: "invalid", errors: { endDate: "endBeforeStart" } };
    }

    return failure(error.code);
  }

  done(eventId, "reopened");
}
