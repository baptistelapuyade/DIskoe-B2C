"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/server";
import {
  extensionFor,
  inspectProfileImage,
  safeFileName,
} from "@/lib/domain/profile-publication";
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

// Saves one of the event steps (Figma EVT-01 to EVT-06). The
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

  if (step === "place") {
    return {
      ...current,
      placeName: text(input.placeName),
      addressLine: text(input.addressLine),
      postalCode: text(input.postalCode),
      city: text(input.city),
    };
  }

  if (step === "price") {
    return {
      ...current,
      priceModel: text(input.priceModel),
      priceAmount: text(input.priceAmount),
      priceAmountMax: text(input.priceAmountMax),
      priceFees: text(input.priceFees),
      accessKinds: input.accessKinds ?? [],
      onlineTicketUrl: text(input.onlineTicketUrl),
      onlineRegistrationUrl: text(input.onlineRegistrationUrl),
      onlineTicketAvailability: text(input.onlineTicketAvailability),
    };
  }

  if (step === "atmosphere") {
    return {
      ...current,
      atmosphereTags: input.atmosphereTags ?? [],
      atmosphereDescription: text(input.atmosphereDescription),
    };
  }

  // The image step keeps its description on the picture, not on the draft.
  return current;
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

  // After the atmosphere comes the optional step 7 (a later slice): until
  // then the overview of the draft.
  return next === "more" ? `${base}/edit` : `${base}/edit/${next}`;
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

    // The image step saves only the description of the picture; the picture
    // itself is uploaded when it is chosen.
    if (step === "image") {
      const altText = text(input.altText).trim();

      if (!(await saveImageDescription(supabase, userId, event, altText || null))) {
        return FAILED;
      }

      revalidatePath(`/organizer/events/${eventId}`, "layout");
      return { status: "saved", next: destination(eventId, step, intent) };
    }

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


// ---------------------------------------------------------------------------
// Event image (Figma EVT-05a to 05f)
// ---------------------------------------------------------------------------
type Client = Awaited<ReturnType<typeof createClient>>;

// The description of the current picture. The use is edited in place while no
// confirmed revision refers to it; otherwise a new use of the same file takes
// over and the old revisions keep what they showed. Without a picture there is
// nothing to describe: that is fine, the description is saved with the picture.
async function saveImageDescription(
  supabase: Client,
  userId: string,
  event: Awaited<ReturnType<typeof requireOwnedEvent>>["event"],
  altText: string | null,
): Promise<boolean> {
  const revision = event.draftRevisionId
    ? await loadEventRevision(supabase, event.draftRevisionId)
    : null;

  if (!revision?.event_image_use_id) {
    return true;
  }

  const { data: use } = await supabase
    .from("media_uses")
    .select("id, asset_id, alt_text")
    .eq("id", revision.event_image_use_id)
    .maybeSingle();

  if (!use) {
    return false;
  }

  if ((use.alt_text ?? null) === altText) {
    return true;
  }

  const { data: updated, error } = await supabase
    .from("media_uses")
    .update({ alt_text: altText })
    .eq("id", use.id)
    .select("id");

  if (!error && updated && updated.length === 1) {
    return true;
  }

  const useId = await createConfirmedEventUse(supabase, {
    assetId: use.asset_id,
    eventId: event.id,
    altText,
  });

  return useId !== null && (await linkEventImage(supabase, userId, event, useId));
}

// A new use of an asset, confirmed at once. The confirmation only marks the
// picture as the chosen one for the private draft; the rights are confirmed
// when the event is submitted, and nothing is public before the founder
// approves (same as the profile picture).
async function createConfirmedEventUse(
  supabase: Client,
  input: { assetId: string; eventId: string; altText: string | null },
): Promise<string | null> {
  const { data: use, error } = await supabase
    .from("media_uses")
    .insert({
      asset_id: input.assetId,
      event_id: input.eventId,
      role: "event_image",
      alt_text: input.altText,
    })
    .select("id")
    .single();

  if (error || !use) return null;

  const { data: confirmed, error: confirmError } = await supabase
    .from("media_uses")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("id", use.id)
    .select("id");

  return confirmError || !confirmed || confirmed.length !== 1 ? null : use.id;
}

async function linkEventImage(
  supabase: Client,
  userId: string,
  event: Awaited<ReturnType<typeof requireOwnedEvent>>["event"],
  useId: string,
): Promise<boolean> {
  const { revisionId } = await ensureEditableEventDraft(supabase, userId, event);

  const { data, error } = await supabase
    .from("event_revisions")
    .update({ event_image_use_id: useId })
    .eq("id", revisionId)
    .select("id");

  return !error && data !== null && data.length === 1;
}

export type EventImageResult =
  | { status: "ok" }
  | {
      status: "error";
      code: "tooBig" | "tooSmall" | "format" | "failed";
      // Only for tooBig (bytes) and tooSmall (width, height).
      bytes?: number;
      width?: number;
      height?: number;
    };

// A chosen file is checked (type by content, size, pixels), stored privately
// and becomes the picture of the draft. Nothing is cropped (Figma: the image
// is shown as it is).
export async function uploadEventImageFile(
  eventId: string,
  formData: FormData,
): Promise<EventImageResult> {
  const { userId, event } = await requireOwnedEvent(
    eventId,
    `/organizer/events/${eventId}/edit/image`,
  );

  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", code: "format" };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const inspected = inspectProfileImage(bytes);

  if (!inspected.ok) {
    switch (inspected.code) {
      case "tooBig":
        return { status: "error", code: "tooBig", bytes: inspected.bytes };
      case "tooSmall":
        return {
          status: "error",
          code: "tooSmall",
          width: inspected.width,
          height: inspected.height,
        };
      default:
        return { status: "error", code: "format" };
    }
  }

  try {
    const supabase = await createClient();
    const path = `${userId}/${crypto.randomUUID()}.${extensionFor(inspected.type)}`;

    const { error: uploadError } = await supabase.storage
      .from("private-media")
      .upload(path, bytes, { contentType: inspected.type, upsert: false });

    if (uploadError) return { status: "error", code: "failed" };

    // From here on a failure leaves an unused private file behind. Clients
    // cannot delete objects (no delete policy); cleanup is a later step.
    const { data: asset, error: assetError } = await supabase
      .from("media_assets")
      .insert({
        uploader_id: userId,
        private_object_path: path,
        mime_type: inspected.type,
        original_filename: safeFileName(file.name),
      })
      .select("id")
      .single();

    if (assetError || !asset) return { status: "error", code: "failed" };

    const useId = await createConfirmedEventUse(supabase, {
      assetId: asset.id,
      eventId,
      altText: null,
    });

    if (!useId || !(await linkEventImage(supabase, userId, event, useId))) {
      return { status: "error", code: "failed" };
    }
  } catch (error) {
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

    return { status: "error", code: "failed" };
  }

  revalidatePath(`/organizer/events/${eventId}`, "layout");
  return { status: "ok" };
}
