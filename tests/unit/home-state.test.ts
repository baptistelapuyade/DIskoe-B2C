import { describe, expect, it } from "vitest";

import { homeState, type HomeInput } from "../../lib/domain/home-state";

const base: HomeInput = {
  status: "ready",
  live: false,
  gaps: [],
  firstEvent: "none",
  hasPublishedEvent: false,
};

const kind = (patch: Partial<HomeInput>) =>
  homeState({ ...base, ...patch }).kind;

describe("homeState", () => {
  it("103a: profile with gaps", () => {
    const state = homeState({
      ...base,
      status: "incomplete",
      gaps: ["name"],
    });
    expect(state).toMatchObject({ kind: "profile_in_progress", stage: 0 });
  });

  it("103a wins over a complete first event", () => {
    expect(
      kind({ status: "incomplete", gaps: ["name"], firstEvent: "ready" }),
    ).toBe("profile_in_progress");
  });

  it("103b: profile done, no event or incomplete event", () => {
    expect(homeState(base)).toMatchObject({ kind: "profile_done", stage: 1 });
    expect(kind({ firstEvent: "incomplete" })).toBe("profile_done");
  });

  it("103c: profile and first event complete", () => {
    expect(homeState({ ...base, firstEvent: "ready" })).toMatchObject({
      kind: "ready_to_submit",
      stage: 2,
    });
  });

  it("103d and 103e: review and question share step four", () => {
    expect(kind({ status: "in_review", firstEvent: "ready" })).toBe(
      "in_review",
    );
    expect(homeState({ ...base, status: "question" })).toMatchObject({
      kind: "question",
      stage: 3,
    });
  });

  it("103f: live without changes", () => {
    expect(
      homeState({ ...base, status: "published", live: true }),
    ).toMatchObject({
      kind: "live",
      stage: 4,
      hasUnpublishedChanges: false,
    });
  });

  it("103g: live with a complete new version", () => {
    expect(
      homeState({ ...base, status: "update_ready", live: true }),
    ).toMatchObject({ kind: "live_changes", hasUnpublishedChanges: true });
  });

  it("live with an incomplete new version has its own state", () => {
    expect(
      homeState({
        ...base,
        status: "incomplete",
        live: true,
        gaps: ["short_intro"],
      }),
    ).toMatchObject({ kind: "live_incomplete", hasUnpublishedChanges: true });
  });

  it("a live profile never falls back to an earlier step", () => {
    for (const status of ["in_review", "question", "ready"] as const) {
      expect(kind({ status, live: true })).toBe("live");
    }
  });
});
