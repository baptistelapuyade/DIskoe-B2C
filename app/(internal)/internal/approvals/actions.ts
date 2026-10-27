"use server";

import { revalidatePath } from "next/cache";

import { requireFounder } from "@/lib/auth/server";
import {
  describeGaps,
  parseGapDetail,
  parseQuestion,
} from "@/lib/domain/profile-publication";
import { copyPublishedImage } from "@/lib/profile/publish";
import { createClient } from "@/lib/supabase/server";

import type { FormState } from "@/app/(organizer)/organizer/profiles/[profileId]/actions";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const GENERIC_ERROR =
  "Das hat leider nicht geklappt. Bitte versuche es noch einmal.";

function refresh(profileId: string) {
  revalidatePath("/internal/approvals");
  revalidatePath(`/internal/approvals/${profileId}`);
  revalidatePath("/organizer");
}

function ids(formData: FormData): { profileId: string; revisionId: string } | null {
  const profileId = String(formData.get("profileId") ?? "");
  const revisionId = String(formData.get("revisionId") ?? "");

  return UUID.test(profileId) && UUID.test(revisionId)
    ? { profileId, revisionId }
    : null;
}

// The founder approves exactly the revision that was shown on the page: the
// revision id travels with the form and the database rejects a changed draft.
// Approval publishes the revision; the public copy of the image follows with
// the founder's own session.
export async function approveFirst(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFounder();

  const target = ids(formData);
  if (!target) {
    return { ok: false, message: "Ungültige Anfrage." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_first_profile", {
    p_profile_id: target.profileId,
    p_expected_draft_revision_id: target.revisionId,
  });

  if (error) {
    switch (error.code) {
      case "DK001":
        return {
          ok: false,
          message:
            "Der Entwurf wurde nach deiner Ansicht geändert. Bitte lade die Seite neu und prüfe den neuen Stand.",
        };
      case "DK002":
        return {
          ok: false,
          message: "Es fehlen noch Angaben.",
          gaps: describeGaps(parseGapDetail(error.details)).map(
            (gap) => gap.message,
          ),
        };
      case "DK003":
        return {
          ok: false,
          message:
            "Dieser Stand kann nicht freigegeben werden: Er wurde nicht eingereicht oder das Profil ist schon freigegeben.",
        };
      case "42501":
        return {
          ok: false,
          message:
            "Diese Freigabe ist nicht erlaubt (zum Beispiel für ein eigenes Profil).",
        };
      default:
        return { ok: false, message: GENERIC_ERROR };
    }
  }

  const copied = await copyPublishedImage(supabase, target.profileId);
  refresh(target.profileId);

  return copied === "copied"
    ? { ok: true, message: "Freigegeben und veröffentlicht." }
    : {
        ok: true,
        message:
          "Freigegeben und veröffentlicht, aber das Bild ist noch nicht öffentlich. Bitte versuche es mit „Bild erneut veröffentlichen“ noch einmal.",
      };
}

export async function requestChanges(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFounder();

  const target = ids(formData);
  if (!target) {
    return { ok: false, message: "Ungültige Anfrage." };
  }

  const question = parseQuestion(formData.get("message"));
  if (!question.ok) {
    return { ok: false, message: question.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("request_profile_changes", {
    p_profile_id: target.profileId,
    p_expected_draft_revision_id: target.revisionId,
    p_message: question.value,
  });

  if (error) {
    switch (error.code) {
      case "DK001":
        return {
          ok: false,
          message:
            "Der Entwurf wurde nach deiner Ansicht geändert. Bitte lade die Seite neu.",
        };
      case "DK003":
        return {
          ok: false,
          message:
            "Zu diesem Stand kann keine Rückfrage gestellt werden: Er wurde nicht eingereicht, ist schon freigegeben oder hat schon eine Frage.",
        };
      case "42501":
        return {
          ok: false,
          message: "Diese Rückfrage ist nicht erlaubt.",
        };
      case "22023":
        return { ok: false, message: "Bitte prüfe die Länge der Frage." };
      default:
        return { ok: false, message: GENERIC_ERROR };
    }
  }

  refresh(target.profileId);
  return {
    ok: true,
    message: "Rückfrage gespeichert. Das Profil bleibt privat.",
  };
}

export async function retryImage(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFounder();

  const profileId = String(formData.get("profileId") ?? "");
  if (!UUID.test(profileId)) {
    return { ok: false, message: "Ungültige Anfrage." };
  }

  const supabase = await createClient();
  const copied = await copyPublishedImage(supabase, profileId);
  refresh(profileId);

  return copied === "copied"
    ? { ok: true, message: "Das Bild ist jetzt öffentlich." }
    : {
        ok: false,
        message:
          "Das Bild konnte noch nicht veröffentlicht werden. Bitte versuche es später noch einmal.",
      };
}
