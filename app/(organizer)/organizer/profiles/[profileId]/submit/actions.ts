"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { loadEventState } from "@/lib/event/draft";
import { loadOwnerEvents } from "@/lib/event/load";
import { loadProfileState } from "@/lib/profile/draft";
import { requireOwnedProfileId } from "@/lib/profile/load";
import { createClient } from "@/lib/supabase/server";

// What the confirmation screen shows after the owner pressed "Submit"
// (Figma EIN-02a to 02e). Texts live in the client, in the catalog.
export type SubmitState =
  | { status: "idle" }
  // One or both ticks are missing (EIN-02d).
  | { status: "missing"; rights: boolean; usage: boolean }
  // The call did not go through (EIN-02e).
  | { status: "failed" }
  // The draft changed since the owner saw it (DK001).
  | { status: "changed" }
  // Required details are missing (DK002).
  | { status: "gaps" }
  // Already submitted or decided (DK003).
  | { status: "decided" };

// The two ticks are the two confirmations the database stores with the
// submission: the first one is "rights" (authorised to publish for the
// project), the second one is "usage" (rights to texts and images). The
// database refuses anything else; this check only names what is missing.
export async function submitAction(
  profileId: string,
  withEvent: boolean,
  _previous: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const base = `/organizer/profiles/${profileId}`;

  await requireOwnedProfileId(profileId, `${base}/submit/confirm`);

  const rights = formData.get("rights") === "on";
  const usage = formData.get("usage") === "on";

  if (!rights || !usage) {
    return { status: "missing", rights, usage };
  }

  const supabase = await createClient();
  const profile = await loadProfileState(supabase, profileId);

  if (!profile?.draftRevisionId) {
    return { status: "failed" };
  }

  let error: { code?: string } | null;

  if (withEvent) {
    // The first event of the profile is its oldest one (the list is newest
    // first). Without it there is nothing to send with the profile.
    const first = (await loadOwnerEvents([profileId])).at(-1);
    const event = first ? await loadEventState(supabase, first.id) : null;

    if (!event?.draftRevisionId) {
      return { status: "changed" };
    }

    ({ error } = await supabase.rpc("submit_first_publication", {
      p_profile_id: profileId,
      p_expected_draft_revision_id: profile.draftRevisionId,
      p_event_id: event.id,
      p_expected_event_draft_revision_id: event.draftRevisionId,
      p_confirmed_rights: rights,
      p_confirmed_usage: usage,
    }));
  } else {
    ({ error } = await supabase.rpc("submit_profile_for_review", {
      p_profile_id: profileId,
      p_expected_draft_revision_id: profile.draftRevisionId,
      p_confirmed_rights: rights,
      p_confirmed_usage: usage,
    }));
  }

  if (error) {
    switch (error.code) {
      case "DK001":
        return { status: "changed" };
      case "DK002":
        return { status: "gaps" };
      case "DK003":
        return { status: "decided" };
      default:
        return { status: "failed" };
    }
  }

  revalidatePath("/organizer");
  revalidatePath(base, "layout");
  redirect(`${base}/status`);
}
