import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/types";
import { loadImage } from "@/lib/profile/image";
import { loadRevision } from "@/lib/profile/draft";

type Client = SupabaseClient<Database>;

// The image of the *published* revision, as the public bucket should have it.
// Reads the base table (not my_profiles) so that the owner and the founder can
// both use it; Row Level Security decides who sees the row.
async function publishedImage(supabase: Client, profileId: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("published_revision_id")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error("Profile lookup failed");
  }

  if (!profile?.published_revision_id) {
    return null;
  }

  const revision = await loadRevision(supabase, profile.published_revision_id);

  if (!revision?.profileImageUseId) {
    return null;
  }

  return loadImage(supabase, revision.profileImageUseId);
}

// Is the published image readable in the public bucket? null = nothing to
// publish (no published revision yet).
export async function isPublishedImagePublic(
  supabase: Client,
  profileId: string,
): Promise<boolean | null> {
  const image = await publishedImage(supabase, profileId);

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
// for it. Runs with the caller's own session (founder at approval, owner for a
// later publication): the storage policy allows exactly this path, and only
// once the revision is the published one. Safe to repeat.
export async function copyPublishedImage(
  supabase: Client,
  profileId: string,
): Promise<"copied" | "failed"> {
  const image = await publishedImage(supabase, profileId);

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

  return (await isPublishedImagePublic(supabase, profileId)) === true
    ? "copied"
    : "failed";
}
