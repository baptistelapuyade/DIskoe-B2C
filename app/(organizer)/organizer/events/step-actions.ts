"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/server";
import {
  parseEventInput,
  type EventFormInput,
} from "@/lib/domain/event-publication";
import {
  EVENT_STEPS,
  nextStepPath,
  validateStep,
  type EventStep,
  type StepErrors,
  type StepInput,
  type StepIntent,
} from "@/lib/domain/event-steps";
import {
  createEventDraft,
  ensureEditableEventDraft,
  loadEventRevision,
} from "@/lib/event/draft";
import { requireOwnedEvent } from "@/lib/event/load";
import {
  EMPTY_FORM_VALUES,
  rowToFormValues,
  valuesToRow,
  type EventFormValues,
} from "@/lib/event/values";
import { createClient } from "@/lib/supabase/server";

// Saves one of the first three event steps (Figma EVT-01 to EVT-03). The
// answer carries codes, never texts: the screen looks them up in the catalog
// in the language of the organizer. Nothing a person typed is logged.
export type StepResult =
  | { status: "saved"; next: string }
  | { status: "invalid"; errors: StepErrors }
  | { status: "failed" };

export type StepRequest = {
  step: EventStep;
  intent: StepIntent;
  // null while the event does not exist yet (the first step of a new event).
  eventId: string | null;
  profileId: string;
  input: StepInput;
};

const FAILED: StepResult = { status: "failed" };

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

// Only the fields of the step are taken over; the rest of the draft stays as
// saved, so that saving one step never clears another.
function overlay(
  step: EventStep,
  current: EventFormValues,
  input: StepInput,
): EventFormValues {
  if (step === "basics") {
    return {
      ...current,
      title: text(input.title),
      description: text(input.description),
      format: text(input.format),
    };
  }

  if (step === "time") {
    const endUnknown = input.endUnknown === true;

    return {
      ...current,
      startDate: text(input.startDate),
      startTime: text(input.startTime),
      endUnknown,
      endDate: endUnknown ? "" : text(input.endDate),
      endTime: endUnknown ? "" : text(input.endTime),
    };
  }

  return {
    ...current,
    placeName: text(input.placeName),
    addressLine: text(input.addressLine),
    postalCode: text(input.postalCode),
    city: text(input.city),
  };
}

function isEmptyStep(step: EventStep, input: StepInput): boolean {
  const fields: Array<keyof StepInput> =
    step === "basics"
      ? ["title", "description", "format"]
      : step === "time"
        ? ["startDate", "startTime", "endDate", "endTime"]
        : ["placeName", "addressLine", "postalCode", "city"];

  return (
    fields.every((field) => text(input[field]).trim() === "") &&
    input.endUnknown !== true
  );
}

function inputFromValues(values: EventFormValues): EventFormInput {
  return { ...values, endUnknown: values.endUnknown ? "on" : null };
}

function destination(
  eventId: string,
  step: EventStep,
  intent: StepIntent,
): string {
  const base = `/organizer/events/${eventId}`;

  if (intent === "later") {
    return `${base}/saved`;
  }

  const next = nextStepPath(step);

  // Price and access are not one of the new steps yet (later slice).
  return next === "price" ? `${base}/access` : `${base}/edit/${next}`;
}

export async function saveEventStep(
  request: StepRequest,
): Promise<StepResult> {
  const { step, intent, eventId, profileId, input } = request;

  if (
    !(EVENT_STEPS as readonly string[]).includes(step) ||
    (intent !== "next" && intent !== "later")
  ) {
    return FAILED;
  }

  const errors = validateStep(step, input, intent);

  if (Object.keys(errors).length > 0) {
    return { status: "invalid", errors };
  }

  const supabase = await createClient();

  try {
    if (eventId === null) {
      const access = await requireOwner("/organizer/events/new");

      if (!access.profiles.some((profile) => profile.id === profileId)) {
        return FAILED;
      }

      // "Later" without anything typed: there is nothing to keep, and no empty
      // draft is created.
      if (intent === "later" && isEmptyStep(step, input)) {
        return { status: "saved", next: "/organizer" };
      }

      const merged = overlay(step, EMPTY_FORM_VALUES, input);
      const parsed = parseEventInput(inputFromValues(merged));
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!parsed.ok || !userId) {
        return FAILED;
      }

      const newId = await createEventDraft(
        supabase,
        userId,
        profileId,
        parsed.value,
        merged.title.trim(),
      );

      revalidatePath("/organizer");
      return { status: "saved", next: destination(newId, step, intent) };
    }

    const { userId, event } = await requireOwnedEvent(
      eventId,
      `/organizer/events/${eventId}/edit`,
    );
    const revision = event.draftRevisionId
      ? await loadEventRevision(supabase, event.draftRevisionId)
      : null;
    const current = revision ? rowToFormValues(revision) : EMPTY_FORM_VALUES;
    const merged = overlay(step, current, input);
    const parsed = parseEventInput(inputFromValues(merged));

    if (!parsed.ok) {
      return FAILED;
    }

    const { revisionId } = await ensureEditableEventDraft(
      supabase,
      userId,
      event,
    );

    // Row Level Security filters silently: an update that touches no row is a
    // failure, not a success.
    const { data, error } = await supabase
      .from("event_revisions")
      .update(valuesToRow(parsed.value))
      .eq("id", revisionId)
      .select("id");

    if (error || !data || data.length !== 1) {
      return FAILED;
    }

    revalidatePath(`/organizer/events/${eventId}`, "layout");
    revalidatePath("/organizer");

    return { status: "saved", next: destination(eventId, step, intent) };
  } catch (error) {
    // The framework signals redirect() and notFound() by throwing; those must
    // pass through. Everything else is a failed save.
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      /^NEXT_(REDIRECT|HTTP_ERROR_FALLBACK|NOT_FOUND)/.test(
        (error as { digest: string }).digest,
      )
    ) {
      throw error;
    }

    return FAILED;
  }
}
