import { notFound } from "next/navigation";

import { requireOwner } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import {
  localGapCodes,
  reviewStatus,
  type GapCode,
  type ReviewStatus,
} from "@/lib/domain/profile-publication";
import { loadImage, type ProfileImage } from "@/lib/profile/image";
import { isPublishedImagePublic } from "@/lib/profile/publish";
import {
  loadLatestQuestion,
  loadProfileState,
  loadQuestionForRevision,
  loadRevision,
  wasSubmitted,
  type ProfileState,
  type ReviewQuestion,
  type RevisionFields,
} from "@/lib/profile/draft";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type { ProfileImage };

export type OwnerProfileView = {
  userId: string;
  profile: ProfileState;
  revision: RevisionFields | null;
  image: ProfileImage | null;
  gaps: GapCode[];
  status: ReviewStatus;
  // Something has been published at least once.
  live: boolean;
  // The founder's question about the current draft (status "question").
  question: ReviewQuestion | null;
  // The latest question while the profile is not approved yet. It stays
  // available after the owner started to correct it.
  latestQuestion: ReviewQuestion | null;
  // null = nothing published yet.
  publishedImagePublic: boolean | null;
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

  const image = revision?.profileImageUseId
    ? await loadImage(supabase, revision.profileImageUseId)
    : null;

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

  const question = revision
    ? await loadQuestionForRevision(supabase, revision.id)
    : null;
  const latestQuestion =
    profile.firstApprovedRevisionId === null
      ? await loadLatestQuestion(supabase, profileId)
      : null;

  const status = reviewStatus({
    gapCount: gaps.length,
    draftRevisionId: profile.draftRevisionId,
    firstApprovedRevisionId: profile.firstApprovedRevisionId,
    publishedRevisionId: profile.publishedRevisionId,
    submittedRevisionId: submitted ? (revision?.id ?? null) : null,
    questionRevisionId: question ? (revision?.id ?? null) : null,
  });

  const publishedImagePublic = profile.publishedRevisionId
    ? await isPublishedImagePublic(supabase, profileId)
    : null;

  return {
    userId,
    profile,
    revision,
    image,
    gaps,
    status,
    live: profile.publishedRevisionId !== null,
    question,
    latestQuestion,
    publishedImagePublic,
  };
}
