import { describe, expect, it } from "vitest";

import { resolveAccess, type AssignedProfile } from "../../lib/auth/guards";

const profile: AssignedProfile = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "club-a",
  publicationState: "private",
  draftName: "Club A",
};

describe("resolveAccess", () => {
  it("treats a missing user as anonymous", () => {
    expect(
      resolveAccess({ userId: null, isFounder: false, profiles: [] }),
    ).toEqual({ kind: "anonymous" });
  });

  it("never grants access without a user, even if profiles are passed", () => {
    expect(
      resolveAccess({ userId: null, isFounder: true, profiles: [profile] }),
    ).toEqual({ kind: "anonymous" });
  });

  it("gives a signed-in user without an assignment no organizer rights", () => {
    expect(
      resolveAccess({ userId: "u-visitor", isFounder: false, profiles: [] }),
    ).toEqual({ kind: "no_assignment", isFounder: false });
  });

  it("does not turn the founder role into organizer rights", () => {
    expect(
      resolveAccess({ userId: "u-founder", isFounder: true, profiles: [] }),
    ).toEqual({ kind: "no_assignment", isFounder: true });
  });

  it("gives an assigned user exactly the profiles that were passed in", () => {
    expect(
      resolveAccess({
        userId: "u-owner",
        isFounder: false,
        profiles: [profile],
      }),
    ).toEqual({ kind: "owner", isFounder: false, profiles: [profile] });
  });
});
