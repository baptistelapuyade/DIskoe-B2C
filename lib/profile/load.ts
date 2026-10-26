import { notFound } from "next/navigation";

import { requireOwner } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import {
  localGapCodes,
  reviewStatus,
  type GapCode,
  type ReviewStatus,
} from "@/lib/domain/profile-publication";
import {
  loadProfileState,
  loadRevision,
  wasSubmitted,
  type ProfileState,
  type RevisionFields,
} from "@/lib/profile/draft";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ProfileImage = {
  useId: string;
  altText: string | null;
  confirmed: boolean;
  signedUrl: string | null;
};

export type OwnerProfileView = {
  userId: string;
  profile: ProfileState;
  revision: RevisionFields | null;
  image: ProfileImage | null;
  gaps: GapCode[];
  status: ReviewStatus;
};

// Page and action guard in one: signed in, assigned to at least one profile,
// and the requested profile is one of the caller's own. Anything else is 404 so
// that other profiles' ids cannot be probed.
export async function requireOwnedProfileId(
  profileId: string,
  currentPath: string,
): Promise<string> {
  const access = await requireOwner(currentPath);

  if (
    !UUID.test(profileId) ||
    !access.profiles.some((profile) => profile.id === profileId)
  ) {
    notFound();
  }

  return profileId;
}

export async function loadOwnerProfileView(
  profileId: string,
  currentPath: string,
): Promise<OwnerProfileView> {
  await requireOwnedProfileId(profileId, currentPath);

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    notFound();
  }

  const profile = await loadProfileState(supabase, profileId);

  if (!profile) {
    notFound();
  }

  const revision = profile.draftRevisionId
    ? await loadRevision(supabase, profile.draftRevisionId)
    : null;

  let image: ProfileImage | null = null;

  if (revision?.profileImageUseId) {
    const { data: use } = await supabase
      .from("media_uses")
      .select("id, alt_text, confirmed_at, public_object_path, asset_id")
      .eq("id", revision.profileImageUseId)
      .maybeSingle();

    if (use) {
      const { data: asset } = await supabase
        .from("media_assets")
        .select("private_object_path")
        .eq("id", use.asset_id)
        .maybeSingle();

      let signedUrl: string | null = null;
      if (asset) {
        const { data: signed } = await supabase.storage
          .from("private-media")
          .createSignedUrl(asset.private_object_path, 300);
        signedUrl = signed?.signedUrl ?? null;
      }

      image = {
        useId: use.id,
        altText: use.alt_text,
        confirmed: use.confirmed_at !== null && use.public_object_path !== null,
        signedUrl,
      };
    }
  }

  const gaps = localGapCodes(
    {
      name: revision?.name ?? "",
      shortIntro: revision?.shortIntro ?? "",
      officialUrl: revision?.officialUrl ?? "",
      publicContact: revision?.publicContact ?? "",
    },
    image?.confirmed === true,
  );

  const submitted =
    revision !== null && (await wasSubmitted(supabase, profileId, revision.id));

  const status = reviewStatus({
    gapCount: gaps.length,
    draftRevisionId: profile.draftRevisionId,
    firstApprovedRevisionId: profile.firstApprovedRevisionId,
    publishedRevisionId: profile.publishedRevisionId,
    submittedRevisionId: submitted ? (revision?.id ?? null) : null,
  });

  return { userId, profile, revision, image, gaps, status };
}
