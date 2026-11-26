import type { Database } from "@/lib/db/types";

// What the owner saw when a status page was opened. The page binds it to the
// action, the action hands it to the database function, which refuses with
// DK001 (stale) when the event changed in between. Reading the state again
// when the form is sent would compare the event with itself and never notice
// another change.
export type ExpectedState = {
  publishedRevisionId: string;
  stateVersion: number;
  publicStatus: Database["public"]["Enums"]["event_status"];
};

export function expectedState(event: {
  publishedRevisionId: string | null;
  stateVersion: number;
  publicStatus: Database["public"]["Enums"]["event_status"];
}): ExpectedState {
  return {
    // A status page exists only for a published event.
    publishedRevisionId: event.publishedRevisionId as string,
    stateVersion: event.stateVersion,
    publicStatus: event.publicStatus,
  };
}

// The arguments the status functions take for the same three values.
export function expectedArgs(expected: ExpectedState) {
  return {
    p_expected_published_revision_id: expected.publishedRevisionId,
    p_expected_state_version: expected.stateVersion,
    p_expected_status: expected.publicStatus,
  };
}
