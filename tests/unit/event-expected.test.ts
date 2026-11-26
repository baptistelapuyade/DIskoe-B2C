import { describe, expect, it } from "vitest";

import { expectedArgs, expectedState } from "@/lib/event/expected";

describe("expected state of a status page", () => {
  const event = {
    publishedRevisionId: "rev-1",
    stateVersion: 7,
    publicStatus: "rescheduled" as const,
  };

  it("keeps what the owner saw", () => {
    expect(expectedState(event)).toEqual(event);
  });

  it("maps to the database function arguments", () => {
    expect(expectedArgs(expectedState(event))).toEqual({
      p_expected_published_revision_id: "rev-1",
      p_expected_state_version: 7,
      p_expected_status: "rescheduled",
    });
  });
});
