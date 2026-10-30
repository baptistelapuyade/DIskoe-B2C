import { loadOwnerEventView, type OwnerEventView } from "@/lib/event/load";
import { loadPairQuestion, wasEventSubmitted } from "@/lib/event/draft";
import { loadOwnerProfileView, type OwnerProfileView } from "@/lib/profile/load";
import type { ReviewQuestion } from "@/lib/profile/draft";
import { createClient } from "@/lib/supabase/server";

// Where the owner stands with this event.
//   first    the profile has no first approval yet: profile and first event go
//            to the founder together
//   later    the profile is approved and live: the owner publishes this event
//            himself
//   approved the event has its own first approval already (changes to a live
//            event are not part of this step)
export type PublicationMode = "first" | "later" | "approved";

export type PublicationStatus =
  | "incomplete"
  | "ready"
  | "in_review"
  | "question"
  | "published"
  | "update";

export type PublicationView = {
  event: OwnerEventView;
  profile: OwnerProfileView;
  mode: PublicationMode;
  status: PublicationStatus;
  question: ReviewQuestion | null;
  // The latest question while nothing is approved; it stays visible after the
  // owner started to correct the draft.
  latestQuestion: ReviewQuestion | null;
};

export async function loadPublicationView(
  eventId: string,
  currentPath: string,
): Promise<PublicationView> {
  const event = await loadOwnerEventView(eventId, currentPath);
  const profile = await loadOwnerProfileView(
    event.event.organizerId,
    currentPath,
  );
  const supabase = await createClient();

  const eventApproved = event.event.firstApprovedRevisionId !== null;
  const profileApproved = profile.profile.firstApprovedRevisionId !== null;
  const mode: PublicationMode = eventApproved
    ? "approved"
    : profileApproved
      ? "later"
      : "first";

  const eventDraft = event.event.draftRevisionId;
  const profileDraft = profile.profile.draftRevisionId;
  const published =
    eventDraft !== null && event.event.publishedRevisionId === eventDraft;
  const complete =
    event.gaps.length === 0 && (mode !== "first" || profile.gaps.length === 0);

  const question =
    mode === "first" && eventDraft && profileDraft
      ? await loadPairQuestion(supabase, profileDraft, eventDraft)
      : null;
  const submitted =
    mode === "first" &&
    eventDraft !== null &&
    (profile.status === "in_review" || profile.status === "question") &&
    (await wasEventSubmitted(supabase, event.event.id, eventDraft));

  let status: PublicationStatus;

  if (published) {
    status = "published";
  } else if (!complete) {
    status = "incomplete";
  } else if (mode === "approved") {
    status = "update";
  } else if (mode === "later") {
    status = "ready";
  } else if (question) {
    status = "question";
  } else if (submitted) {
    status = "in_review";
  } else {
    status = "ready";
  }

  return {
    event,
    profile,
    mode,
    status,
    question,
    latestQuestion: mode === "first" ? profile.latestQuestion : null,
  };
}
