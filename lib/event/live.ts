import { notFound } from "next/navigation";

import { loadEventRevision } from "@/lib/event/draft";
import { loadOwnerEventView, type OwnerEventView } from "@/lib/event/load";
import { rowToFormValues, type EventFormValues } from "@/lib/event/values";
import { createClient } from "@/lib/supabase/server";

export type LiveEventView = {
  view: OwnerEventView;
  // The public version, as the owner confirmed it.
  live: EventFormValues;
  // A private draft that is not the public version exists.
  draftDiffers: boolean;
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

  return {
    view,
    live: rowToFormValues(published),
    draftDiffers: view.event.draftRevisionId !== publishedId,
  };
}
