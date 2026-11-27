// The private preview of the owner (Figma VOR-01a/b): the real public page,
// filled with the draft instead of the published state. Pure: no database or
// framework imports (unit-tested).
//
// The draft is turned into the same row the public views return and then goes
// through the same DTO functions as a published page. So the preview can not
// show something the page would not show. The page itself is not copied.

import type { Lang } from "../i18n";
import type { EventRevisionRow } from "../event/values";
import {
  toPublicEvent,
  toPublicProfile,
  type PublicEvent,
  type PublicEventRow,
  type PublicProfile,
  type PublicProfileRow,
} from "./dto";

// A placeholder where the DTO functions expect a storage path. The preview
// replaces the resulting address with the owner's short-lived signed URL.
const NO_PUBLIC_PATH = "preview";

export type DraftProfile = {
  id: string;
  slug: string;
  name: string | null;
  shortIntro: string | null;
  officialUrl: string | null;
  publicContact: string | null;
  instagramHandle: string | null;
  // Complete addresses, at most five.
  extraLinks: string[];
  imageUrl: string | null;
  imageCrop: PublicProfileRow["profile_image_crop"];
};

// null while a required detail is missing (name, slug): the caller then sends
// the owner back to the checklist, which names the gaps.
export function previewProfile(draft: DraftProfile): PublicProfile | null {
  const profile = toPublicProfile(
    {
      id: draft.id,
      slug: draft.slug,
      name: draft.name,
      short_intro: draft.shortIntro,
      official_url: draft.officialUrl,
      public_contact: draft.publicContact,
      instagram_handle: draft.instagramHandle,
      extra_links: draft.extraLinks.map((url) => ({ url })),
      profile_image_path: null,
      profile_image_crop: draft.imageCrop,
      published_at: null,
    },
    "",
  );

  return profile ? { ...profile, imageUrl: draft.imageUrl } : null;
}

// What an event looks like on its page. A draft is always shown as a
// scheduled event: moving or cancelling belongs to a live event.
export function previewEvent(
  lang: Lang,
  input: {
    revision: EventRevisionRow & { timezone: string };
    eventId: string;
    slug: string;
    organizer: PublicProfile;
    // The owner's signed URL of the draft flyer; null while there is none.
    imageUrl: string | null;
  },
  now: Date = new Date(),
): PublicEvent | null {
  const { revision } = input;

  if (!input.imageUrl) return null;

  const row: PublicEventRow = {
    id: input.eventId,
    slug: input.slug,
    organizer_id: input.organizer.id,
    public_status: "scheduled",
    title: revision.title,
    description: revision.description,
    primary_format: revision.primary_format,
    start_at: revision.start_at,
    timezone: revision.timezone,
    end_state: revision.end_state,
    end_at: revision.end_at,
    place_name: revision.place_name,
    address_line: revision.address_line,
    postal_code: revision.postal_code,
    city: revision.city,
    country_code: null,
    price_state: revision.price_state,
    price_model: revision.price_model,
    price_amount_minor: revision.price_amount_minor,
    price_max_amount_minor: revision.price_max_amount_minor,
    price_fee_model: revision.price_fee_model,
    currency: revision.currency,
    access_routes: revision.access_routes,
    atmosphere_tags: revision.atmosphere_tags,
    atmosphere_description: revision.atmosphere_description,
    modules: revision.modules,
    event_image_path: NO_PUBLIC_PATH,
    published_at: null,
    previous_start_at: null,
  };
  const event = toPublicEvent(lang, row, input.organizer, "", now);

  return event ? { ...event, imageUrl: input.imageUrl } : null;
}
