"use server";

import { revalidatePath } from "next/cache";

import { requireFounder } from "@/lib/auth/server";
import { describeGaps, parseGapDetail } from "@/lib/domain/profile-publication";
import { createClient } from "@/lib/supabase/server";

import type { FormState } from "../../(organizer)/organizer/profiles/[profileId]/actions";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The founder approves exactly the revision that was shown on the page: the
// revision id travels with the form and the database rejects a changed draft.
export async function approveFirst(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFounder();

  const profileId = String(formData.get("profileId") ?? "");
  const revisionId = String(formData.get("revisionId") ?? "");

  if (!UUID.test(profileId) || !UUID.test(revisionId)) {
    return { ok: false, message: "Ungültige Anfrage." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_first_profile", {
    p_profile_id: profileId,
    p_expected_draft_revision_id: revisionId,
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
        return { ok: false, message: "Dieses Profil ist bereits freigegeben." };
      case "42501":
        return {
          ok: false,
          message: "Diese Freigabe ist nicht erlaubt (zum Beispiel für ein eigenes Profil).",
        };
      default:
        return {
          ok: false,
          message: "Das hat leider nicht geklappt. Bitte versuche es noch einmal.",
        };
    }
  }

  revalidatePath("/internal/approvals");
  revalidatePath(`/internal/approvals/${profileId}`);
  return {
    ok: true,
    message: "Freigegeben. Der Organizer kann das Profil jetzt selbst veröffentlichen.",
  };
}
