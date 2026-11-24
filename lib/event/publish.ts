import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/types";
import { loadImage } from "@/lib/profile/image";

import { loadEventRevision } from "./draft";

type Client = SupabaseClient<Database>;

// The image of the *published* revision of an event, as the public bucket
// should have it. Row Level Security decides who sees the rows (the owner and
// the founder do).
async function publishedEventImage(supabase: Client, eventId: string) {
  const { data: event, error } = await supabase
    .from("events")
    .select("published_revision_id")
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    throw new Error("Event lookup failed");
  }

  if (!event?.published_revision_id) {
    return null;
  }

  const revision = await loadEventRevision(
    supabase,
    event.published_revision_id,
  );

  if (!revision?.event_image_use_id) {
    return null;
  }

  return loadImage(supabase, revision.event_image_use_id);
}

// Is the published event image readable in the public bucket? null = nothing
// to publish (no published revision or no reserved path yet).
export async function isPublishedEventImagePublic(
  supabase: Client,
  eventId: string,
): Promise<boolean | null> {
  const image = await publishedEventImage(supabase, eventId);

  if (!image?.publicObjectPath) {
    return null;
  }

  const slash = image.publicObjectPath.lastIndexOf("/");
  const folder = image.publicObjectPath.slice(0, slash);
  const file = image.publicObjectPath.slice(slash + 1);

  const { data, error } = await supabase.storage
    .from("public-media")
    .list(folder, { search: file, limit: 10 });

  if (error) {
    return false;
  }

  return (data ?? []).some((entry) => entry.name === file);
}

// Copies the original into the public bucket at the path the database reserved
// for it. Runs with the caller's own session (the owner for a later event, the
// founder at the first approval): the storage policy allows exactly this path,
// and only once the revision is the published one. Safe to repeat.
export async function copyPublishedEventImage(
  supabase: Client,
  eventId: string,
): Promise<"copied" | "failed"> {
  const image = await publishedEventImage(supabase, eventId);

  if (!image?.publicObjectPath || !image.privateObjectPath) {
    return "failed";
  }

  const { error } = await supabase.storage
    .from("private-media")
    .copy(image.privateObjectPath, image.publicObjectPath, {
      destinationBucket: "public-media",
    });

  if (error && !/exist|duplicate/i.test(error.message)) {
    return "failed";
  }

  return (await isPublishedEventImagePublic(supabase, eventId)) === true
    ? "copied"
    : "failed";
}
