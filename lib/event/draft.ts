import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, TablesInsert } from "@/lib/db/types";
import { eventSlug } from "@/lib/domain/event-slug";

import {
  EVENT_REVISION_COLUMNS,
  rowToCopy,
  valuesToRow,
  type EventRevisionRow,
} from "./values";
import type { EventDraftValues } from "@/lib/domain/event-publication";
import type { ReviewQuestion } from "@/lib/profile/draft";

type Client = SupabaseClient<Database>;

export type EventState = {
  id: string;
  organizerId: string;
  slug: string;
  draftRevisionId: string | null;
  firstApprovedRevisionId: string | null;
  publishedRevisionId: string | null;
  // What publish_event expects back (optimistic check against a stale page).
  stateVersion: number;
  publicStatus: Database["public"]["Enums"]["event_status"];
};

export async function loadEventState(
  supabase: Client,
  eventId: string,
): Promise<EventState | null> {
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, organizer_id, slug, draft_revision_id, first_approved_revision_id, published_revision_id, state_version, public_status",
    )
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    throw new Error("Event lookup failed");
  }

  return data
    ? {
        id: data.id,
        organizerId: data.organizer_id,
        slug: data.slug,
        draftRevisionId: data.draft_revision_id,
        firstApprovedRevisionId: data.first_approved_revision_id,
        publishedRevisionId: data.published_revision_id,
        stateVersion: data.state_version,
        publicStatus: data.public_status,
      }
    : null;
}

export async function loadEventRevision(
  supabase: Client,
  revisionId: string,
): Promise<EventRevisionRow | null> {
  const { data, error } = await supabase
    .from("event_revisions")
    .select(EVENT_REVISION_COLUMNS)
    .eq("id", revisionId)
    .maybeSingle();

  if (error) {
    throw new Error("Event revision lookup failed");
  }

  return data as EventRevisionRow | null;
}

// The counter of a draft revision, raised by the database with every change
// of its content. The publish screen hands it back to publish_event().
export async function loadEventRevisionVersion(
  supabase: Client,
  revisionId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("event_revisions")
    .select("content_version")
    .eq("id", revisionId)
    .maybeSingle();

  if (error) {
    throw new Error("Event revision version lookup failed");
  }

  return data?.content_version ?? null;
}

// revision_no is assigned by a database trigger and is deliberately not
// grantable to clients; the generated type still lists it as required.
type NewRevision = Omit<TablesInsert<"event_revisions">, "revision_no">;

async function insertRevision(
  supabase: Client,
  row: NewRevision,
): Promise<string> {
  const { data, error } = await supabase
    .from("event_revisions")
    .insert(row as TablesInsert<"event_revisions">)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Could not create an event revision");
  }

  return data.id;
}

async function pointDraftAt(
  supabase: Client,
  eventId: string,
  revisionId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("events")
    .update({ draft_revision_id: revisionId })
    .eq("id", eventId)
    .select("id");

  if (error || !data || data.length !== 1) {
    throw new Error("Could not switch to the event draft revision");
  }
}

// A new private event with its first draft revision. The slug is derived from
// the title and fixed from then on; a clash on the unique slug is retried with
// a new random suffix.
export async function createEventDraft(
  supabase: Client,
  userId: string,
  organizerId: string,
  values: EventDraftValues,
  title: string,
): Promise<string> {
  let eventId: string | null = null;

  for (let attempt = 0; attempt < 4 && eventId === null; attempt += 1) {
    const { data, error } = await supabase
      .from("events")
      .insert({ organizer_id: organizerId, slug: eventSlug(title) })
      .select("id")
      .single();

    if (data) {
      eventId = data.id;
    } else if (error?.code !== "23505") {
      break;
    }
  }

  if (eventId === null) {
    throw new Error("Could not create the event");
  }

  const revisionId = await insertRevision(supabase, {
    event_id: eventId,
    created_by: userId,
    ...valuesToRow(values),
  });
  await pointDraftAt(supabase, eventId, revisionId);

  return eventId;
}

// Returns the revision that may be edited. A draft that is confirmed or
// first-approved is frozen: editing it would change what the founder
// approved. Then a new revision is created as a copy and becomes the draft.
// A draft that does not exist yet (the first revision failed) is created.
export async function ensureEditableEventDraft(
  supabase: Client,
  userId: string,
  event: EventState,
): Promise<{ revisionId: string; created: boolean }> {
  const current = event.draftRevisionId
    ? await loadEventRevision(supabase, event.draftRevisionId)
    : null;

  const frozen =
    current !== null &&
    (current.confirmed_at !== null ||
      current.id === event.firstApprovedRevisionId);

  if (current && !frozen) {
    return { revisionId: current.id, created: false };
  }

  const revisionId = await insertRevision(supabase, {
    event_id: event.id,
    created_by: userId,
    ...(current ? rowToCopy(current) : {}),
  });
  await pointDraftAt(supabase, event.id, revisionId);

  return { revisionId, created: true };
}

export async function wasEventSubmitted(
  supabase: Client,
  eventId: string,
  revisionId: string,
): Promise<boolean> {
  // The latest of "submit_for_review" and "withdraw" decides (same rule as
  // app_private.is_submitted in the database).
  const { data, error } = await supabase
    .from("publication_audit")
    .select("action")
    .eq("entity_type", "event")
    .eq("entity_id", eventId)
    .eq("revision_id", revisionId)
    .in("action", ["submit_for_review", "withdraw"])
    .order("id", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error("Audit lookup failed");
  }

  return data?.[0]?.action === "submit_for_review";
}

// Did the founder approve this event (together with the profile)? An event
// that its owner published himself has no approve_first row.
export async function wasEventApprovedByFounder(
  supabase: Client,
  eventId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("publication_audit")
    .select("id")
    .eq("entity_type", "event")
    .eq("entity_id", eventId)
    .eq("action", "approve_first")
    .limit(1);

  if (error) {
    throw new Error("Audit lookup failed");
  }

  return (data ?? []).length > 0;
}

// The founder's question about exactly this pair of revisions.
export async function loadPairQuestion(
  supabase: Client,
  profileRevisionId: string,
  eventRevisionId: string,
): Promise<ReviewQuestion | null> {
  const { data, error } = await supabase
    .from("review_requests")
    .select("message, created_at")
    .eq("revision_id", profileRevisionId)
    .eq("event_revision_id", eventRevisionId)
    .limit(1);

  if (error) {
    throw new Error("Question lookup failed");
  }

  const row = data?.[0];
  return row
    ? { message: row.message, createdAt: row.created_at, withEvent: true }
    : null;
}
