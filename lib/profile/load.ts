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
  diffRevisions,
  hasChanges,
  type ProfileChanges,
} from "@/lib/domain/profile-changes";
import { loadImage, type ProfileImage } from "@/lib/profile/image";
import { isPublishedImagePublic } from "@/lib/profile/publish";
import {
  loadLatestQuestion,
  loadLatestSubmitAt,
  loadProfileState,
  loadQuestionForRevision,
  loadRevision,
  wasSubmitted,
  type ProfileState,
  type ReviewQuestion,
  type RevisionFields,
} from "@/lib/profile/draft";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  // The latest question that has not been answered by a new submission yet.
  // It also stays open when the owner changed the first event and the pair no
  // longer matches the question (the status is then "ready", not "in_review").
  openQuestion: ReviewQuestion | null;
  // null = nothing published yet.
  publishedImagePublic: boolean | null;
  // Live profiles only: what the private draft changes against the public
  // page. null while nothing is published or the draft is the published
  // revision itself.
  changes: ProfileChanges | null;
  // The draft really differs from the public page (not just a different
  // revision id).
  hasChanges: boolean;
  // The published revision, for screens that show "public so far".
  published: RevisionFields | null;
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
      instagram: revision?.instagramHandle ?? "",
      extraLinks: revision?.extraLinks ?? [],
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

  const lastSubmitAt =
    latestQuestion !== null
      ? await loadLatestSubmitAt(supabase, profileId)
      : null;
  const openQuestion =
    latestQuestion !== null &&
    (lastSubmitAt === null ||
      Date.parse(latestQuestion.createdAt) > Date.parse(lastSubmitAt))
      ? latestQuestion
      : null;

  let status = reviewStatus({
    gapCount: gaps.length,
    draftRevisionId: profile.draftRevisionId,
    firstApprovedRevisionId: profile.firstApprovedRevisionId,
    publishedRevisionId: profile.publishedRevisionId,
    submittedRevisionId: submitted ? (revision?.id ?? null) : null,
    questionRevisionId: question ? (revision?.id ?? null) : null,
  });

  // The owner changed the first event after the question: the old pair is no
  // longer what is in review, the new one has to be submitted again.
  if (openQuestion !== null && status === "in_review") {
    status = "ready";
  }

  // A live profile with a draft: compare the content with the public page.
  // The same values as the public page are not a change, whatever the ids say.
  const published =
    profile.publishedRevisionId !== null &&
    profile.draftRevisionId !== profile.publishedRevisionId
      ? await loadRevision(supabase, profile.publishedRevisionId)
      : null;
  const changes =
    published !== null && revision !== null
      ? diffRevisions(published, revision)
      : null;

  if (status === "update_ready" && changes !== null && !hasChanges(changes)) {
    status = "published";
  }

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
    openQuestion,
    publishedImagePublic,
    changes,
    hasChanges: changes !== null && hasChanges(changes),
    published,
  };
}
