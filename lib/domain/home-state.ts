// Pure mapping from the owner's data to the state of the start page card
// (Figma ORG-103a to g). No framework or database imports, so it can be
// unit-tested. The database stays the authority for completeness and review;
// this only decides which of the card's states applies.
import type { GapCode, ReviewStatus } from "./profile-publication";

export type HomeKind =
  | "profile_in_progress" // 103a: profile has gaps
  | "profile_done" // 103b: profile ready, first event missing or incomplete
  | "ready_to_submit" // 103c: profile and first event complete
  | "in_review" // 103d
  | "question" // 103e
  | "live" // 103f
  | "live_changes" // 103g
  | "live_incomplete"; // profile live, new version incomplete (no frame)

// Where the first event (the oldest one) stands while the profile is not live.
// "none" = no event yet.
export type FirstEventState = "none" | "incomplete" | "ready";

export type HomeInput = {
  status: ReviewStatus;
  live: boolean;
  gaps: readonly GapCode[];
  firstEvent: FirstEventState;
  // At least one event of this profile is public.
  hasPublishedEvent: boolean;
};

export type HomeState = {
  kind: HomeKind;
  // Index in the five steps: Profil, Erstes Event, Einreichen, Prüfung, Live.
  stage: number;
  // The two pills of 103g: the second one is shown next to "Live".
  hasUnpublishedChanges: boolean;
};

export const HOME_STEP_COUNT = 5;

export function homeState(input: HomeInput): HomeState {
  if (input.live) {
    if (input.status === "update_ready") {
      return { kind: "live_changes", stage: 4, hasUnpublishedChanges: true };
    }

    if (input.status === "incomplete") {
      return { kind: "live_incomplete", stage: 4, hasUnpublishedChanges: true };
    }

    return { kind: "live", stage: 4, hasUnpublishedChanges: false };
  }

  const state = (kind: HomeKind, stage: number): HomeState => ({
    kind,
    stage,
    hasUnpublishedChanges: false,
  });

  if (input.status === "question") {
    return state("question", 3);
  }

  if (input.status === "in_review") {
    return state("in_review", 3);
  }

  if (input.status === "incomplete" || input.gaps.length > 0) {
    return state("profile_in_progress", 0);
  }

  // Profile is complete and not submitted yet.
  if (input.firstEvent === "ready") {
    return state("ready_to_submit", 2);
  }

  return state("profile_done", 1);
}
