import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/types";
import {
  describeEventGaps,
  eventGapCodes,
  type EventGap,
} from "@/lib/domain/event-publication";
import { loadEventRevision } from "@/lib/event/draft";
import { rowToFormValues, rowToValues, type EventFormValues } from "@/lib/event/values";
import { loadImage, type ProfileImage } from "@/lib/profile/image";

type Client = SupabaseClient<Database>;

// The event that was submitted together with the profile (before approval) or
// that was approved together with it (after).
export type FounderEventView = {
  eventId: string;
  revisionId: string;
  form: EventFormValues;
  image: ProfileImage | null;
  gaps: EventGap[];
  submittedAt: string | null;
};

export async function loadFounderEventView(
  supabase: Client,
  profileId: string,
  profileApproved: boolean,
): Promise<FounderEventView | null> {
  const { data: events, error } = await supabase
    .from("events")
    .select("id, draft_revision_id, first_approved_revision_id, created_at")
    .eq("organizer_id", profileId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Event lookup failed");
  }

  let chosen: { eventId: string; revisionId: string; submittedAt: string | null } | null =
    null;

  for (const event of events ?? []) {
    if (profileApproved) {
      // The first event that the founder approved.
      if (!event.first_approved_revision_id) continue;

      const { data: approved } = await supabase
        .from("publication_audit")
        .select("created_at")
        .eq("entity_type", "event")
        .eq("entity_id", event.id)
        .eq("action", "approve_first")
        .limit(1);

      if ((approved ?? []).length > 0) {
        chosen = {
          eventId: event.id,
          revisionId: event.first_approved_revision_id,
          submittedAt: null,
        };
        break;
      }

      continue;
    }

    // Before approval: an event without approval whose current draft was
    // submitted. The latest submission wins.
    if (event.first_approved_revision_id || !event.draft_revision_id) continue;

    const { data: submitted } = await supabase
      .from("publication_audit")
      .select("created_at")
      .eq("entity_type", "event")
      .eq("entity_id", event.id)
      .eq("revision_id", event.draft_revision_id)
      .eq("action", "submit_for_review")
      .order("created_at", { ascending: false })
      .limit(1);

    const at = submitted?.[0]?.created_at;

    if (at && (!chosen || (chosen.submittedAt ?? "") < at)) {
      chosen = {
        eventId: event.id,
        revisionId: event.draft_revision_id,
        submittedAt: at,
      };
    }
  }

  if (!chosen) {
    return null;
  }

  const revision = await loadEventRevision(supabase, chosen.revisionId);

  if (!revision) {
    return null;
  }

  const image = revision.event_image_use_id
    ? await loadImage(supabase, revision.event_image_use_id)
    : null;

  return {
    eventId: chosen.eventId,
    revisionId: chosen.revisionId,
    form: rowToFormValues(revision),
    image,
    gaps: describeEventGaps(
      eventGapCodes(rowToValues(revision), image?.confirmed === true),
    ),
    submittedAt: chosen.submittedAt,
  };
}
