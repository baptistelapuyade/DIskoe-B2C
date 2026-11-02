import { notFound } from "next/navigation";

import { loadEventRevision } from "@/lib/event/draft";
import { loadOwnerEventView, type OwnerEventView } from "@/lib/event/load";
import { differsOutsideTime } from "@/lib/event/status";
import { rowToFormValues, type EventFormValues } from "@/lib/event/values";
import { createClient } from "@/lib/supabase/server";

export type LiveEventView = {
  view: OwnerEventView;
  // The public version, as the owner confirmed it.
  live: EventFormValues;
  // True when the private draft differs from the public version in more than
  // the date and time (or has another image). Then a replacement date can not
  // be published without also publishing those changes.
  draftHasOtherChanges: boolean;
};

// The owner's view of an event that is live. A draft or unpublished event has
// no status to change: 404.
export async function loadLiveEvent(
  eventId: string,
  currentPath: string,
): Promise<LiveEventView> {
  const view = await loadOwnerEventView(eventId, currentPath);
  const publishedId = view.event.publishedRevisionId;

  if (publishedId === null) {
    notFound();
  }

  const supabase = await createClient();
  const published = await loadEventRevision(supabase, publishedId);

  if (!published) {
    notFound();
  }

  const draft =
    view.event.draftRevisionId && view.event.draftRevisionId !== publishedId
      ? await loadEventRevision(supabase, view.event.draftRevisionId)
      : published;
  const live = rowToFormValues(published);

  return {
    view,
    live,
    draftHasOtherChanges: draft
      ? differsOutsideTime(
          live,
          rowToFormValues(draft),
          published.event_image_use_id,
          draft.event_image_use_id,
        )
      : false,
  };
}
