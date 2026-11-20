"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { loadProfileState } from "@/lib/profile/draft";
import { requireOwnedProfileId } from "@/lib/profile/load";
import { createClient } from "@/lib/supabase/server";

// Takes the submission of profile and first event back (Figma PRF-03a). The
// drafts stay as they are. Every outcome is a page: done (PRF-03b), already
// decided (PRF-03d), or not done (PRF-03c); nothing is shown as done that is
// not.
export async function withdrawAction(profileId: string): Promise<void> {
  const base = `/organizer/profiles/${profileId}`;

  await requireOwnedProfileId(profileId, `${base}/withdraw`);

  const supabase = await createClient();
  const profile = await loadProfileState(supabase, profileId);

  if (!profile?.draftRevisionId) {
    redirect(`${base}/withdraw?result=failed`);
  }

  const { error } = await supabase.rpc("withdraw_submission", {
    p_profile_id: profileId,
    p_expected_draft_revision_id: profile.draftRevisionId,
  });

  if (error) {
    // A first approval or a question exists: the review went on while the
    // owner was here.
    redirect(
      `${base}/withdraw?result=${error.code === "DK003" ? "decided" : "failed"}`,
    );
  }

  revalidatePath("/organizer");
  revalidatePath(base, "layout");
  redirect(`${base}/withdrawn`);
}
