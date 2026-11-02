import {
  isUpcoming,
  toPublicEvent,
  toPublicProfile,
  type PublicEvent,
  type PublicProfile,
} from "./dto";
import { publicClient } from "./client";
import { mediaBase } from "./site";

// Reserved first path segments are not profile slugs (mirrors the database
// constraint on profiles.slug). A request for one is a 404 without a lookup.
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;
const EVENT_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$/;

export async function getPublicProfileBySlug(
  slug: string,
): Promise<PublicProfile | null> {
  if (!SLUG_PATTERN.test(slug)) return null;

  const { data, error } = await publicClient()
    .from("public_profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error("Public profile lookup failed");

  return data ? toPublicProfile(data, mediaBase()) : null;
}

async function getPublicProfileById(id: string): Promise<PublicProfile | null> {
  const { data, error } = await publicClient()
    .from("public_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Public profile lookup failed");

  return data ? toPublicProfile(data, mediaBase()) : null;
}

export async function getPublicEvent(slug: string): Promise<PublicEvent | null> {
  if (!EVENT_SLUG_PATTERN.test(slug)) return null;

  const { data, error } = await publicClient()
    .from("public_events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error("Public event lookup failed");
  if (!data?.organizer_id) return null;

  const organizer = await getPublicProfileById(data.organizer_id);

  return organizer ? toPublicEvent(data, organizer, mediaBase()) : null;
}

// Events of one profile that are still to come, soonest first. Cancelled events
// are left out. A postponed event without a new date has no date to sort by and
// follows the dated ones.
export async function listUpcomingEvents(
  profile: PublicProfile,
  now: Date = new Date(),
): Promise<PublicEvent[]> {
  const { data, error } = await publicClient()
    .from("public_events")
    .select("*")
    .eq("organizer_id", profile.id)
    .neq("public_status", "cancelled")
    .order("start_at", { ascending: true });

  if (error) throw new Error("Public events lookup failed");

  const events = (data ?? [])
    .map((row) => toPublicEvent(row, profile, mediaBase()))
    .filter((event): event is PublicEvent => event !== null);

  const dated = events.filter(
    (event) => event.status !== "postponed_undated" && isUpcoming(event, now),
  );
  const undated = events.filter((event) => event.status === "postponed_undated");

  return [...dated, ...undated];
}

// Every public address for the sitemap: published profiles and their events
// that are not cancelled.
export async function listSitemapEntries(): Promise<{
  profiles: { slug: string; updatedAt: string | null }[];
  events: { slug: string; updatedAt: string | null }[];
}> {
  const client = publicClient();
  const [profiles, events] = await Promise.all([
    client.from("public_profiles").select("slug, published_at"),
    client
      .from("public_events")
      .select("slug, published_at")
      .neq("public_status", "cancelled"),
  ]);

  if (profiles.error || events.error) {
    throw new Error("Sitemap lookup failed");
  }

  const entries = (
    rows: { slug: string | null; published_at: string | null }[] | null,
  ) =>
    (rows ?? [])
      .filter((row): row is { slug: string; published_at: string | null } =>
        Boolean(row.slug),
      )
      .map((row) => ({ slug: row.slug, updatedAt: row.published_at }));

  return { profiles: entries(profiles.data), events: entries(events.data) };
}
