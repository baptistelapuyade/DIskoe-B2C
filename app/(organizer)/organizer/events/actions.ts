"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth/server";
import {
  parseEventInput,
  type EventFieldErrors,
  type EventFormInput,
} from "@/lib/domain/event-publication";
import {
  checkImage,
  extensionFor,
  parseAltText,
} from "@/lib/domain/profile-publication";
import { createEventDraft, ensureEditableEventDraft } from "@/lib/event/draft";
import { requireOwnedEvent } from "@/lib/event/load";
import { valuesToRow, type EventFormValues } from "@/lib/event/values";
import { createClient } from "@/lib/supabase/server";

export type EventFormState = {
  ok: boolean;
  message?: string;
  errors?: EventFieldErrors & { image?: string; altText?: string; rights?: string };
  // What was typed, so that a rejected save does not wipe the form.
  echo?: EventFormValues;
};

const GENERIC_ERROR =
  "Das hat leider nicht geklappt. Bitte versuche es noch einmal.";

function editPath(eventId: string) {
  return `/organizer/events/${eventId}/edit`;
}

function textOf(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function listOf(formData: FormData, name: string): string[] {
  return formData.getAll(name).filter((v): v is string => typeof v === "string");
}

function inputFromForm(formData: FormData): EventFormInput {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    format: formData.get("format"),
    startDate: formData.get("startDate"),
    startTime: formData.get("startTime"),
    endDate: formData.get("endDate"),
    endTime: formData.get("endTime"),
    endUnknown: formData.get("endUnknown"),
    placeName: formData.get("placeName"),
    addressLine: formData.get("addressLine"),
    postalCode: formData.get("postalCode"),
    city: formData.get("city"),
    priceModel: formData.get("priceModel"),
    priceAmount: formData.get("priceAmount"),
    accessKinds: listOf(formData, "accessKinds"),
    onlineTicketUrl: formData.get("onlineTicketUrl"),
    onlineRegistrationUrl: formData.get("onlineRegistrationUrl"),
    atmosphereTags: listOf(formData, "atmosphereTags"),
    atmosphereDescription: formData.get("atmosphereDescription"),
  };
}

function echoOf(formData: FormData): EventFormValues {
  return {
    title: textOf(formData.get("title")),
    description: textOf(formData.get("description")),
    format: textOf(formData.get("format")),
    startDate: textOf(formData.get("startDate")),
    startTime: textOf(formData.get("startTime")),
    endDate: textOf(formData.get("endDate")),
    endTime: textOf(formData.get("endTime")),
    endUnknown: formData.get("endUnknown") === "on",
    placeName: textOf(formData.get("placeName")),
    addressLine: textOf(formData.get("addressLine")),
    postalCode: textOf(formData.get("postalCode")),
    city: textOf(formData.get("city")),
    priceModel: textOf(formData.get("priceModel")),
    priceAmount: textOf(formData.get("priceAmount")),
    accessKinds: listOf(formData, "accessKinds"),
    onlineTicketUrl: textOf(formData.get("onlineTicketUrl")),
    onlineRegistrationUrl: textOf(formData.get("onlineRegistrationUrl")),
    atmosphereTags: listOf(formData, "atmosphereTags"),
    atmosphereDescription: textOf(formData.get("atmosphereDescription")),
  };
}

// Creates a private event draft with a title and sends the owner to the editor.
export async function createEvent(
  _previous: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const access = await requireOwner("/organizer/events/new");
  const profileId = textOf(formData.get("profileId"));

  if (!access.profiles.some((profile) => profile.id === profileId)) {
    return { ok: false, message: GENERIC_ERROR };
  }

  const parsed = parseEventInput({ title: formData.get("title") });

  if (!parsed.ok) {
    return { ok: false, errors: parsed.errors };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  let eventId: string | null = null;

  if (userId) {
    try {
      eventId = await createEventDraft(
        supabase,
        userId,
        profileId,
        parsed.value,
        textOf(formData.get("title")).trim(),
      );
    } catch {
      eventId = null;
    }
  }

  if (!eventId) {
    return { ok: false, message: GENERIC_ERROR };
  }

  revalidatePath("/organizer");
  redirect(editPath(eventId));
}

export async function saveEventDetails(
  eventId: string,
  _previous: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const { userId, event } = await requireOwnedEvent(eventId, editPath(eventId));
  const parsed = parseEventInput(inputFromForm(formData));

  if (!parsed.ok) {
    return { ok: false, errors: parsed.errors, echo: echoOf(formData) };
  }

  const supabase = await createClient();

  try {
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
      return { ok: false, message: GENERIC_ERROR, echo: echoOf(formData) };
    }
  } catch {
    return { ok: false, message: GENERIC_ERROR, echo: echoOf(formData) };
  }

  revalidatePath(editPath(eventId));
  revalidatePath("/organizer");
  return { ok: true, message: "Gespeichert. Der Entwurf bleibt privat." };
}

export async function uploadEventImage(
  eventId: string,
  _previous: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const { userId, event } = await requireOwnedEvent(eventId, editPath(eventId));

  const file = formData.get("image");
  const alt = parseAltText(formData.get("altText"));
  const rights = formData.get("rights") === "on";
  const errors: NonNullable<EventFormState["errors"]> = {};

  if (!alt.ok) errors.altText = alt.message;
  if (!rights) {
    errors.rights =
      "Bitte bestätige, dass du das Bild verwenden und öffentlich zeigen darfst.";
  }

  if (!(file instanceof File) || file.size === 0) {
    errors.image = "Bitte wähle eine Bilddatei aus.";
  }

  if (Object.keys(errors).length > 0 || !(file instanceof File) || !alt.ok) {
    return { ok: false, errors };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const checked = checkImage(bytes);

  if (!checked.ok) {
    return { ok: false, errors: { image: checked.message } };
  }

  const supabase = await createClient();
  const path = `${userId}/${crypto.randomUUID()}.${extensionFor(checked.type)}`;

  const { error: uploadError } = await supabase.storage
    .from("private-media")
    .upload(path, bytes, { contentType: checked.type, upsert: false });

  if (uploadError) {
    return { ok: false, message: GENERIC_ERROR };
  }

  // From here on a failure leaves an unused private file behind. Clients cannot
  // delete objects (no delete policy); cleanup is a later, explicit step.
  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .insert({
      uploader_id: userId,
      private_object_path: path,
      mime_type: checked.type,
    })
    .select("id")
    .single();

  if (assetError || !asset) {
    return { ok: false, message: GENERIC_ERROR };
  }

  const { data: use, error: useError } = await supabase
    .from("media_uses")
    .insert({
      asset_id: asset.id,
      event_id: eventId,
      role: "event_image",
      alt_text: alt.value,
    })
    .select("id")
    .single();

  if (useError || !use) {
    return { ok: false, message: GENERIC_ERROR };
  }

  // The checkbox is the explicit confirmation. The database stamps who and
  // when, and reserves the public path.
  const { data: confirmed, error: confirmError } = await supabase
    .from("media_uses")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("id", use.id)
    .select("id");

  if (confirmError || !confirmed || confirmed.length !== 1) {
    return { ok: false, message: GENERIC_ERROR };
  }

  try {
    const { revisionId } = await ensureEditableEventDraft(
      supabase,
      userId,
      event,
    );

    const { data: linked, error: linkError } = await supabase
      .from("event_revisions")
      .update({ event_image_use_id: use.id })
      .eq("id", revisionId)
      .select("id");

    if (linkError || !linked || linked.length !== 1) {
      return { ok: false, message: GENERIC_ERROR };
    }
  } catch {
    return { ok: false, message: GENERIC_ERROR };
  }

  revalidatePath(editPath(eventId));
  return {
    ok: true,
    message: "Das Bild ist gespeichert und bleibt bis zur Freigabe privat.",
  };
}
