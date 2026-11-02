// The one public shape of an event and of a profile. The page, the meta tags,
// the JSON-LD and the sitemap are all derived from these objects, so they can
// not disagree. Pure: no database or framework imports (unit-tested).
//
// Rows come from the views public_events and public_profiles, which contain
// the confirmed, published state only. Nothing here reads a draft.

import type { Database, Json } from "../db/types";
import {
  ACCESS_KINDS,
  ACCESS_LABEL,
  FORMAT_LABEL,
  type AccessKind,
  type PrimaryFormat,
} from "../domain/event-publication";
import { priceLabel, type PriceView } from "../domain/money";
import { describeEventTime, formatLocalDate } from "../domain/time";

type Views = Database["public"]["Views"];
export type PublicEventRow = Views["public_events"]["Row"];
export type PublicProfileRow = Views["public_profiles"]["Row"];

export type PublicStatus = "scheduled" | "rescheduled" | "postponed_undated" | "cancelled";

export type PublicProfile = {
  id: string;
  slug: string;
  name: string;
  shortIntro: string | null;
  officialUrl: string | null;
  publicContact: string | null;
  imageUrl: string | null;
};

export type PublicAccess = { kind: AccessKind; label: string; url: string | null };

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  format: PrimaryFormat;
  formatLabel: string;
  status: PublicStatus;
  // UTC instants plus the IANA zone. The end is null when it is not known.
  startInstant: string;
  endInstant: string | null;
  timezone: string;
  // Display lines in the event's zone. All null for a postponed event without
  // a new date: the old date is not valid any more.
  dateLine: string | null;
  timeLine: string | null;
  untilLine: string | null;
  placeName: string | null;
  addressLines: string[];
  // Shown text: "12,00 €", "Frei", "Preis noch offen" or null (not asked).
  priceText: string | null;
  // Machine readable price for JSON-LD. Only for a provided price.
  offer: { amount: string; currency: string } | null;
  access: PublicAccess[];
  // Link to buy or register. Never set for a cancelled event.
  ticketUrl: string | null;
  atmosphereTags: string[];
  atmosphereDescription: string | null;
  imageUrl: string;
  publishedAt: string | null;
  organizer: PublicProfile;
};

export function publicImageUrl(base: string, path: string | null): string | null {
  if (!path) return null;

  const root = base.replace(/\/+$/, "");
  const encoded = path.split("/").map(encodeURIComponent).join("/");

  return `${root}/storage/v1/object/public/public-media/${encoded}`;
}

export function toPublicProfile(
  row: PublicProfileRow,
  mediaBase: string,
): PublicProfile | null {
  if (!row.id || !row.slug || !row.name) return null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortIntro: row.short_intro || null,
    officialUrl: safeUrl(row.official_url),
    publicContact: row.public_contact || null,
    imageUrl: publicImageUrl(mediaBase, row.profile_image_path),
  };
}

export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function accessFrom(json: Json | null): PublicAccess[] {
  if (!Array.isArray(json)) return [];

  const routes: PublicAccess[] = [];

  for (const item of json) {
    if (
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      typeof item.kind === "string" &&
      (ACCESS_KINDS as readonly string[]).includes(item.kind)
    ) {
      const kind = item.kind as AccessKind;

      routes.push({
        kind,
        label: ACCESS_LABEL[kind],
        url: typeof item.url === "string" ? safeUrl(item.url) : null,
      });
    }
  }

  return routes;
}

function priceView(row: PublicEventRow): PriceView {
  if (row.price_state === "provided") {
    if (row.price_model === "free") return { state: "provided", model: "free" };

    if (row.price_model === "fixed" && row.price_amount_minor !== null) {
      return {
        state: "provided",
        model: "fixed",
        amountMinor: row.price_amount_minor,
        currency: row.currency ?? undefined,
      };
    }

    // A provided price without a usable value is not "Frei".
    return { state: "unknown" };
  }

  if (row.price_state === "unknown") return { state: "unknown" };

  return { state: "unanswered" };
}

function offerFrom(view: PriceView): PublicEvent["offer"] {
  if (view.state !== "provided") return null;

  if (view.model === "free") return { amount: "0", currency: "EUR" };

  const whole = Math.floor(view.amountMinor / 100);
  const cents = (view.amountMinor % 100).toString().padStart(2, "0");

  return { amount: `${whole}.${cents}`, currency: view.currency ?? "EUR" };
}

const STATUSES: readonly string[] = [
  "scheduled",
  "rescheduled",
  "postponed_undated",
  "cancelled",
];

export function toPublicEvent(
  row: PublicEventRow,
  organizer: PublicProfile,
  mediaBase: string,
): PublicEvent | null {
  const imageUrl = publicImageUrl(mediaBase, row.event_image_path);

  if (
    !row.id ||
    !row.slug ||
    !row.title ||
    !row.start_at ||
    !row.timezone ||
    !row.primary_format ||
    !row.public_status ||
    !STATUSES.includes(row.public_status) ||
    !imageUrl
  ) {
    return null;
  }

  const status = row.public_status as PublicStatus;
  const endInstant = row.end_state === "provided" ? row.end_at : null;
  const time = describeEventTime(row.start_at, endInstant, row.timezone);

  if (!time) return null;

  const hasDate = status !== "postponed_undated";
  const view = priceView(row);
  const access = accessFrom(row.access_routes);
  const town = [row.postal_code, row.city].filter(Boolean).join(" ");
  const addressLines = [row.address_line, town].filter(
    (line): line is string => Boolean(line),
  );
  const ticket = access.find((route) => route.url !== null);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || null,
    format: row.primary_format,
    formatLabel: FORMAT_LABEL[row.primary_format],
    status,
    startInstant: row.start_at,
    endInstant,
    timezone: row.timezone,
    dateLine: hasDate ? formatLocalDate(time.startDate) : null,
    timeLine: hasDate
      ? time.endTime
        ? `${time.startTime} → ${time.endTime}`
        : `${time.startTime} Uhr`
      : null,
    untilLine:
      hasDate && time.endDate && time.endDate !== time.startDate
        ? `Bis ${formatLocalDate(time.endDate)}`
        : null,
    placeName: row.place_name || null,
    addressLines,
    priceText: priceLabel(view),
    offer: offerFrom(view),
    access,
    ticketUrl: status === "cancelled" ? null : (ticket?.url ?? null),
    atmosphereTags: row.atmosphere_tags ?? [],
    atmosphereDescription: row.atmosphere_description || null,
    imageUrl,
    publishedAt: row.published_at,
    organizer,
  };
}

// Is the event still to come? A known end counts; an unknown end is not
// invented, and the start alone decides then.
export function isUpcoming(event: PublicEvent, now: Date): boolean {
  const reference = event.endInstant ?? event.startInstant;

  return new Date(reference).getTime() >= now.getTime();
}
