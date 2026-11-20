import { notFound } from "next/navigation";

import { requireOwner } from "@/lib/auth/server";
import {
  describeEventGaps,
  eventGapCodes,
  type EventGap,
} from "@/lib/domain/event-publication";
import { parseStored, type StoredModules } from "@/lib/domain/event-modules";
import { createClient } from "@/lib/supabase/server";
import { loadImage, type ProfileImage } from "@/lib/profile/image";

import {
  loadEventRevision,
  loadEventState,
  type EventState,
} from "./draft";
import {
  EMPTY_FORM_VALUES,
  rowToFormValues,
  rowToValues,
  type EventFormValues,
} from "./values";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type OwnerEventView = {
  userId: string;
  profileName: string;
  event: EventState;
  form: EventFormValues;
  // The blocks of "Mehr zum Abend"; null while the step was never saved.
  modules: StoredModules | null;
  image: ProfileImage | null;
  gaps: EventGap[];
};

// Page and action guard in one: signed in, assigned to a profile, and the
// event is one of that profile's. Anything else is 404 so that other events'
// ids cannot be probed. Row Level Security filters the lookup as well.
export async function requireOwnedEvent(
  eventId: string,
  currentPath: string,
): Promise<{ userId: string; event: EventState; profileName: string }> {
  const access = await requireOwner(currentPath);

  if (!UUID.test(eventId)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  const event = userId ? await loadEventState(supabase, eventId) : null;
  const profile = event
    ? access.profiles.find((item) => item.id === event.organizerId)
    : undefined;

  if (!userId || !event || !profile) {
    notFound();
  }

  return { userId, event, profileName: profile.draftName ?? profile.slug };
}

export async function loadOwnerEventView(
  eventId: string,
  currentPath: string,
): Promise<OwnerEventView> {
  const { userId, event, profileName } = await requireOwnedEvent(
    eventId,
    currentPath,
  );
  const supabase = await createClient();

  const revision = event.draftRevisionId
    ? await loadEventRevision(supabase, event.draftRevisionId)
    : null;

  const image = revision?.event_image_use_id
    ? await loadImage(supabase, revision.event_image_use_id)
    : null;

  const gaps = revision
    ? describeEventGaps(
        eventGapCodes(
          rowToValues(revision),
          image?.confirmed === true,
          parseStored(revision.modules),
        ),
      )
    : describeEventGaps(["revision_missing"]);

  return {
    userId,
    profileName,
    event,
    form: revision ? rowToFormValues(revision) : EMPTY_FORM_VALUES,
    modules: revision ? parseStored(revision.modules) : null,
    image,
    gaps,
  };
}

export type OwnerEventListItem = {
  id: string;
  title: string | null;
  organizerId: string;
  // Something of this event is public.
  published: boolean;
};

// The owner's events with the title of the current draft. The caller passes
// the ids of the owner's own profiles; Row Level Security enforces it anyway.
export async function loadOwnerEvents(
  profileIds: string[],
): Promise<OwnerEventListItem[]> {
  if (profileIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, organizer_id, draft_revision_id, published_revision_id, created_at")
    .in("organizer_id", profileIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Event list lookup failed");
  }

  const draftIds = (events ?? [])
    .map((event) => event.draft_revision_id)
    .filter((id): id is string => id !== null);
  const titles = new Map<string, string | null>();

  if (draftIds.length > 0) {
    const { data: revisions, error: revisionError } = await supabase
      .from("event_revisions")
      .select("id, title")
      .in("id", draftIds);

    if (revisionError) {
      throw new Error("Event title lookup failed");
    }

    for (const revision of revisions ?? []) {
      titles.set(revision.id, revision.title);
    }
  }

  return (events ?? []).map((event) => ({
    id: event.id,
    organizerId: event.organizer_id,
    published: event.published_revision_id !== null,
    title: event.draft_revision_id
      ? (titles.get(event.draft_revision_id) ?? null)
      : null,
  }));
}
