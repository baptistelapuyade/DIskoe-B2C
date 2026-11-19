"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  describeGaps,
  parseGapDetail,
} from "@/lib/domain/profile-publication";
import { describeEventGaps } from "@/lib/domain/event-publication";
import { copyPublishedEventImage } from "@/lib/event/publish";
import { loadProfileState } from "@/lib/profile/draft";
import { requireOwnedEvent } from "@/lib/event/load";
import { createClient } from "@/lib/supabase/server";

const GENERIC_ERROR =
  "Das hat leider nicht geklappt. Bitte versuche es noch einmal.";

// ---------------------------------------------------------------------------
// Publication (Slice 5)
// ---------------------------------------------------------------------------
export type PublishFormState = {
  ok: boolean;
  message?: string;
  errors?: { rights?: string };
  gaps?: string[];
};

const DECLARATIONS_MISSING =
  "Bitte bestätigt beide Punkte ausdrücklich, bevor es weitergeht.";

// DETAIL of a DK002 error: "profile.<code>,event.<code>" (joint submission)
// or "<code>" (single event).
function gapMessages(details: string | null | undefined): string[] {
  const codes = parseGapDetail(details);
  const profile = codes
    .filter((code) => code.startsWith("profile."))
    .map((code) => code.slice("profile.".length));
  const event = codes.map((code) =>
    code.startsWith("event.") ? code.slice("event.".length) : code,
  );

  return [
    ...describeGaps(profile).map((gap) => `Profil: ${gap.message}`),
    ...describeEventGaps(event.filter((code) => !code.startsWith("profile."))).map(
      (gap) => gap.message,
    ),
  ];
}

export async function submitFirstPublication(
  eventId: string,
  _previous: PublishFormState,
  formData: FormData,
): Promise<PublishFormState> {
  const path = `/organizer/events/${eventId}/submit`;
  const { event } = await requireOwnedEvent(eventId, path);

  const rights = formData.get("rights") === "on";
  const usage = formData.get("usage") === "on";

  if (!rights || !usage) {
    return { ok: false, errors: { rights: DECLARATIONS_MISSING } };
  }

  const supabase = await createClient();
  const profile = await loadProfileState(supabase, event.organizerId);

  if (!profile?.draftRevisionId || !event.draftRevisionId) {
    return { ok: false, message: GENERIC_ERROR };
  }

  const { error } = await supabase.rpc("submit_first_publication", {
    p_profile_id: event.organizerId,
    p_expected_draft_revision_id: profile.draftRevisionId,
    p_event_id: eventId,
    p_expected_event_draft_revision_id: event.draftRevisionId,
    p_confirmed_rights: rights,
    p_confirmed_usage: usage,
  });

  if (error) {
    switch (error.code) {
      case "DK001":
        return {
          ok: false,
          message:
            "Der Entwurf wurde zwischenzeitlich geändert. Bitte ladet die Seite neu und prüft die Vorschau noch einmal.",
        };
      case "DK002":
        return {
          ok: false,
          message: "Es fehlen noch Angaben.",
          gaps: gapMessages(error.details),
        };
      case "DK003":
        return {
          ok: false,
          message:
            "Dieser Stand kann nicht noch einmal eingereicht werden. Bitte ändert zuerst eine Angabe, besonders wenn DISKOE euch eine Frage gestellt hat.",
        };
      default:
        return { ok: false, message: GENERIC_ERROR };
    }
  }

  revalidatePath("/organizer");
  revalidatePath(`/organizer/events/${eventId}`, "layout");
  revalidatePath(`/organizer/profiles/${event.organizerId}`, "layout");
  redirect(`/organizer/events/${eventId}/review`);
}

export async function publishLaterEvent(
  eventId: string,
  _previous: PublishFormState,
  formData: FormData,
): Promise<PublishFormState> {
  const path = `/organizer/events/${eventId}/publish`;
  const { event } = await requireOwnedEvent(eventId, path);

  const rights = formData.get("rights") === "on";
  const usage = formData.get("usage") === "on";

  if (!rights || !usage) {
    return { ok: false, errors: { rights: DECLARATIONS_MISSING } };
  }

  if (!event.draftRevisionId) {
    return { ok: false, message: GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("publish_event", {
    p_event_id: eventId,
    p_expected_draft_revision_id: event.draftRevisionId,
    p_expected_published_revision_id: event.publishedRevisionId as string,
    p_expected_state_version: event.stateVersion,
    p_expected_status: event.publicStatus,
    p_confirmed_rights: rights,
    p_confirmed_usage: usage,
  });

  if (error) {
    switch (error.code) {
      case "DK001":
        return {
          ok: false,
          message:
            "Das Event hat sich zwischenzeitlich geändert. Bitte ladet die Seite neu und prüft die Vorschau noch einmal.",
        };
      case "DK002":
        return {
          ok: false,
          message: "Es fehlen noch Angaben.",
          gaps: gapMessages(error.details),
        };
      case "DK003":
        return {
          ok: false,
          message:
            "Veröffentlichen ist gerade nicht möglich: Euer Profil ist noch nicht von DISKOE freigegeben, oder es gibt nichts Neues.",
        };
      default:
        return { ok: false, message: GENERIC_ERROR };
    }
  }

  // The public copy of the image. If it fails the event is live already; the
  // confirmation page offers to try again.
  await copyPublishedEventImage(supabase, eventId);

  revalidatePath("/organizer");
  revalidatePath(`/organizer/events/${eventId}`, "layout");
  redirect(`/organizer/events/${eventId}/published`);
}

export async function retryEventImagePublish(
  eventId: string,
  _previous: PublishFormState,
): Promise<PublishFormState> {
  await requireOwnedEvent(eventId, `/organizer/events/${eventId}/published`);

  const supabase = await createClient();
  const result = await copyPublishedEventImage(supabase, eventId);

  revalidatePath(`/organizer/events/${eventId}/published`);
  return result === "copied"
    ? { ok: true, message: "Das Eventbild ist jetzt öffentlich." }
    : {
        ok: false,
        message:
          "Das Bild konnte nicht veröffentlicht werden. Bitte versucht es später noch einmal.",
      };
}
