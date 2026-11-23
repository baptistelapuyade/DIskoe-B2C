import { loadLiveEvent } from "@/lib/event/live";
import { loadOwnerEvents } from "@/lib/event/load";
import { loadOwnerProfileView } from "@/lib/profile/load";
import { createClient } from "@/lib/supabase/server";

// What the "Your profile is live" screens show (Figma LIV-01 to LIV-03): the
// public addresses of the profile and of its first public event, and since
// when the profile is public. Null while the profile is not live.
export type LiveData = {
  profileName: string;
  profilePath: string;
  // The oldest event that is public, or null (LIV-01b).
  event: { id: string; title: string; path: string } | null;
  // The founder's first approval; null if the audit has no row for it.
  since: string | null;
};

export async function loadLiveData(
  profileId: string,
  currentPath: string,
): Promise<LiveData | null> {
  const view = await loadOwnerProfileView(profileId, currentPath);

  if (!view.live) return null;

  const supabase = await createClient();
  // The first event of the profile is its oldest one (the list is newest
  // first); the first public one is the oldest of the public ones.
  const published = (await loadOwnerEvents([profileId]))
    .filter((event) => event.published)
    .at(-1);
  const live = published
    ? await loadLiveEvent(published.id, currentPath)
    : null;

  const { data, error } = await supabase
    .from("publication_audit")
    .select("created_at")
    .eq("entity_type", "profile")
    .eq("entity_id", profileId)
    .in("action", ["approve_first", "publish"])
    .order("id", { ascending: true })
    .limit(1);

  if (error) {
    throw new Error("Audit lookup failed");
  }

  return {
    profileName: view.revision?.name || view.profile.slug,
    profilePath: `/${view.profile.slug}`,
    event: live
      ? {
          id: live.view.event.id,
          title: live.live.title || "",
          path: `/e/${live.view.event.slug}`,
        }
      : null,
    since: data?.[0]?.created_at ?? null,
  };
}
