import {
  listState,
  type EventListRow,
  type EventStatus,
  type ReviewHint,
} from "@/lib/domain/event-list";
import { hasEventChanges } from "@/lib/domain/event-changes";
import { archiveInstant } from "@/lib/domain/time";
import { createClient } from "@/lib/supabase/server";

import { eventContentOf } from "./changes";
import { EVENT_REVISION_COLUMNS, type EventRevisionRow } from "./values";

// The owner's events for the list (Figma EVL-01). The caller passes the ids
// of the owner's own profiles; Row Level Security enforces it anyway. What a
// row shows: the public stand of a published event, the private draft of an
// event that was never published.
//
// Everything is read in two queries and filtered in memory: an organizer has
// tens of events, not thousands (Alpha). Revisit when that changes.
export async function loadEventRows(
  profileIds: string[],
  reviewByProfile: ReadonlyMap<string, ReviewHint>,
  now: Date = new Date(),
): Promise<EventListRow[]> {
  if (profileIds.length === 0) return [];

  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select(
      "id, organizer_id, draft_revision_id, published_revision_id, public_status",
    )
    .in("organizer_id", profileIds);

  if (error) throw new Error("Event list lookup failed");

  const ids = new Set<string>();

  for (const event of events ?? []) {
    if (event.draft_revision_id) ids.add(event.draft_revision_id);
    if (event.published_revision_id) ids.add(event.published_revision_id);
  }

  const revisions = new Map<string, EventRevisionRow>();

  if (ids.size > 0) {
    const { data, error: revisionError } = await supabase
      .from("event_revisions")
      .select(`${EVENT_REVISION_COLUMNS}, timezone`)
      .in("id", [...ids]);

    if (revisionError) throw new Error("Event revision lookup failed");

    for (const revision of (data ?? []) as unknown as (EventRevisionRow & {
      timezone: string;
    })[]) {
      revisions.set(revision.id, revision);
    }
  }

  return (events ?? []).map((event): EventListRow => {
    const draft = event.draft_revision_id
      ? (revisions.get(event.draft_revision_id) ?? null)
      : null;
    const published = event.published_revision_id
      ? (revisions.get(event.published_revision_id) ?? null)
      : null;
    const shown = published ?? draft;
    const status = event.public_status as EventStatus;
    const end = shown && shown.end_state === "provided" ? shown.end_at : null;
    const archiveAt =
      shown && shown.start_at
        ? archiveInstant(
            shown.start_at,
            end,
            (shown as { timezone?: string }).timezone,
          )
        : null;
    const draftDiffers =
      published !== null &&
      draft !== null &&
      published.id !== draft.id &&
      hasEventChanges(eventContentOf(published), eventContentOf(draft));

    return {
      id: event.id,
      title: shown?.title ?? null,
      startAt: shown?.start_at ?? null,
      placeName: shown?.place_name ?? null,
      city: shown?.city ?? null,
      state: listState({
        published: published !== null,
        draftDiffers,
        status,
        archiveAt,
        review: reviewByProfile.get(event.organizer_id) ?? null,
        now,
      }),
    };
  });
}
