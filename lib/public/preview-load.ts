// Loads the private preview of an owner (Figma VOR-01a/b). Both loaders go
// through the owner guards of the screens before them (signed in, assigned to
// the profile, 404 for anything else) and read the draft with the owner's own
// session, so Row Level Security applies. Nothing here is public: the images
// are short-lived signed URLs and the routes are never cached.

import { notFound } from "next/navigation";

import { loadOwnerEvents } from "@/lib/event/load";
import {
  loadPublicationView,
  type PublicationMode,
} from "@/lib/event/publication";
import {
  EVENT_REVISION_COLUMNS,
  type EventRevisionRow,
} from "@/lib/event/values";
import type { Lang } from "@/lib/i18n";
import {
  loadOwnerProfileView,
  type OwnerProfileView,
} from "@/lib/profile/load";
import { createClient } from "@/lib/supabase/server";

import type { PublicEvent, PublicProfile } from "./dto";
import { previewEvent, previewProfile } from "./preview";
import { getPublicProfileById, listUpcomingEvents } from "./queries";

type Client = Awaited<ReturnType<typeof createClient>>;

async function draftProfile(
  supabase: Client,
  view: OwnerProfileView,
): Promise<PublicProfile | null> {
  const { revision, image } = view;
  const { data: use } = image
    ? await supabase
        .from("media_uses")
        .select("crop")
        .eq("id", image.useId)
        .maybeSingle()
    : { data: null };

  return previewProfile({
    id: view.profile.id,
    slug: view.profile.slug,
    name: revision?.name ?? null,
    shortIntro: revision?.shortIntro ?? null,
    officialUrl: revision?.officialUrl ?? null,
    publicContact: revision?.publicContact ?? null,
    instagramHandle: revision?.instagramHandle ?? null,
    extraLinks: revision?.extraLinks ?? [],
    imageUrl: image?.signedUrl ?? null,
    imageCrop: use?.crop ?? null,
  });
}

// Which profile a page shows. A profile that is live is what visitors see
// today, so that is what the preview shows (a further event appears next to
// it); the draft of such a profile has its own screens (changes). Before the
// first approval the page shows the draft, and only a complete one.
async function profileForPage(
  supabase: Client,
  view: OwnerProfileView,
): Promise<PublicProfile | null> {
  if (view.profile.publishedRevisionId !== null) {
    const live = await getPublicProfileById(view.profile.id);

    if (live) return live;
  }

  return view.gaps.length === 0 ? draftProfile(supabase, view) : null;
}

export type ProfilePreview = {
  profile: PublicProfile;
  // Only the events that are public today. The draft event is on its own tab.
  events: PublicEvent[];
  // The first event of the profile (oldest), for the tab "Event".
  eventId: string | null;
};

// null while the profile has gaps: the owner goes back to the checklist.
export async function loadProfilePreview(
  lang: Lang,
  profileId: string,
  currentPath: string,
): Promise<ProfilePreview | null> {
  const view = await loadOwnerProfileView(profileId, currentPath);
  const supabase = await createClient();
  const profile = await profileForPage(supabase, view);

  if (!profile) return null;

  const owned = await loadOwnerEvents([profileId]);

  return {
    profile,
    events: await listUpcomingEvents(lang, profile),
    eventId: owned.at(-1)?.id ?? null,
  };
}

export type EventPreview = {
  // null while the event or the profile has gaps (or no flyer yet): the owner
  // goes back, where the gaps are named.
  event: PublicEvent | null;
  organizerId: string;
  mode: PublicationMode;
};

export async function loadEventPreview(
  lang: Lang,
  eventId: string,
  currentPath: string,
): Promise<EventPreview> {
  const publication = await loadPublicationView(eventId, currentPath);
  const { event: view, profile: profileView, mode } = publication;
  const organizerId = view.event.organizerId;
  const revisionId = view.event.draftRevisionId;
  const none = { event: null, organizerId, mode };

  if (view.gaps.length > 0 || !revisionId) return none;

  const supabase = await createClient();
  const { data: revision, error } = await supabase
    .from("event_revisions")
    .select(`${EVENT_REVISION_COLUMNS}, timezone`)
    .eq("id", revisionId)
    .maybeSingle();

  if (error) throw new Error("Event revision lookup failed");
  if (!revision) notFound();

  const organizer = await profileForPage(supabase, profileView);

  if (!organizer) return none;

  const event = previewEvent(lang, {
    revision: revision as unknown as EventRevisionRow & { timezone: string },
    eventId: view.event.id,
    slug: view.event.slug,
    organizer,
    imageUrl: view.image?.signedUrl ?? null,
  });

  return { event, organizerId, mode };
}
