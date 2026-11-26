// The one public shape of an event and of a profile. The page, the meta tags,
// the JSON-LD and the sitemap are all derived from these objects, so they can
// not disagree. Pure: no database or framework imports (unit-tested).
//
// Rows come from the views public_events and public_profiles, which contain
// the confirmed, published state only. Nothing here reads a draft.

import type { Database, Json } from "../db/types";
import {
  ACCESS_KINDS,
  type AccessKind,
  type PrimaryFormat,
} from "../domain/event-publication";
import { priceLabel, type PriceView } from "../domain/money";
import { ACCESS_ID } from "../event/labels";
import { t, type Lang, type MessageId } from "../i18n";
import { parseStored, type StoredModules } from "../domain/event-modules";
import { linkLabel, readCrop, type Crop } from "../domain/profile-publication";
import { archiveInstant, describeEventTime } from "../domain/time";
import { formatEventDate, yearIn } from "./format";

type Views = Database["public"]["Views"];
export type PublicEventRow = Views["public_events"]["Row"];
export type PublicProfileRow = Views["public_profiles"]["Row"];

// The names of the format tags as the design shows them (Figma, tokens doc
// "Format-Tags"), as catalog IDs. The editor uses shorter labels (FORMAT_ID).
export const PUBLIC_FORMAT_ID: Record<PrimaryFormat, MessageId> = {
  concert: "Z34.format.concert",
  dj_set: "Z34.format.djSet",
  club_night: "Z34.format.clubNight",
  listening_session: "Z34.format.listeningSession",
  opening: "Z34.format.opening",
  exhibition: "Z34.format.exhibition",
  screening: "Z34.format.screening",
};

export type PublicStatus =
  "scheduled" | "rescheduled" | "postponed_undated" | "cancelled";

export type PublicProfile = {
  id: string;
  slug: string;
  name: string;
  shortIntro: string | null;
  officialUrl: string | null;
  publicContact: string | null;
  // The Instagram handle without "@" and further links (domain as label).
  instagram: string | null;
  extraLinks: { url: string; label: string }[];
  imageUrl: string | null;
  // The square the owner picked; null shows the image centred (cover).
  imageCrop: Crop | null;
};

export type PublicAccess = {
  kind: AccessKind;
  label: string;
  url: string | null;
  soldOut: boolean;
};

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
  // The archive cut-off (known end, else the next day 12:00 local). Not an
  // actual end. `past` is set from it for a scheduled or rescheduled event.
  archiveAt: string;
  past: boolean;
  // Display lines in the event's zone. All null for a postponed event without
  // a new date: the old date is not valid any more.
  dateLine: string | null;
  // Local start time "HH:MM"; null for a postponed event without a new date.
  startTime: string | null;
  timeLine: string | null;
  untilLine: string | null;
  placeName: string | null;
  addressLines: string[];
  // Shown text: "12,00 €", "Free", "Price not known yet" or null (not asked).
  priceText: string | null;
  // Machine readable price for JSON-LD. Only for a provided price.
  // highAmount is set for a price range (amount is then the lower end).
  offer: { amount: string; highAmount?: string; currency: string } | null;
  access: PublicAccess[];
  // Link to buy or register. Never set for a cancelled event.
  ticketUrl: string | null;
  atmosphereTags: string[];
  atmosphereDescription: string | null;
  // The blocks of "Mehr zum Abend" that the page shows (Einlass und Alter,
  // Besuchsmodus, Sprache und Untertitel, Musik). Times are local "HH:MM".
  modules: StoredModules;
  imageUrl: string;
  publishedAt: string | null;
  organizer: PublicProfile;
};

export function publicImageUrl(
  base: string,
  path: string | null,
): string | null {
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
    instagram: row.instagram_handle || null,
    extraLinks: extraLinksFrom(row.extra_links),
    imageUrl: publicImageUrl(mediaBase, row.profile_image_path),
    imageCrop: readCrop(row.profile_image_crop),
  };
}

function extraLinksFrom(json: Json | null): { url: string; label: string }[] {
  if (!Array.isArray(json)) return [];

  const links: { url: string; label: string }[] = [];

  for (const item of json) {
    const url =
      typeof item === "object" && item !== null && !Array.isArray(item)
        ? safeUrl(typeof item.url === "string" ? item.url : null)
        : null;

    if (url) links.push({ url, label: linkLabel(url) });
  }

  return links;
}

export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function accessFrom(lang: Lang, json: Json | null): PublicAccess[] {
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

      // Only an online ticket can be sold out. Other routes stay as they are
      // (P09: the other ways in remain visible).
      const soldOut =
        kind === "online_ticket" && item.availability === "sold_out";

      routes.push({
        kind,
        label: t(
          lang,
          soldOut ? "Z25.availability.pageLabel" : ACCESS_ID[kind],
        ),
        url: typeof item.url === "string" ? safeUrl(item.url) : null,
        soldOut,
      });
    }
  }

  return routes;
}

function feesOf(row: PublicEventRow): "included" | "unknown" | null {
  return row.price_fee_model === "included" || row.price_fee_model === "unknown"
    ? row.price_fee_model
    : null;
}

function priceView(row: PublicEventRow): PriceView {
  if (row.price_state === "provided") {
    const low = row.price_amount_minor;
    const high = row.price_max_amount_minor;
    const currency = row.currency ?? undefined;
    const fees = feesOf(row);

    if (row.price_model === "free" || row.price_model === "donation") {
      return { state: "provided", model: row.price_model };
    }

    if (
      (row.price_model === "fixed" ||
        row.price_model === "from_price" ||
        row.price_model === "min_donation") &&
      low !== null
    ) {
      return {
        state: "provided",
        model: row.price_model,
        amountMinor: low,
        currency,
        fees,
      };
    }

    if (row.price_model === "range" && low !== null && high !== null) {
      return {
        state: "provided",
        model: "range",
        amountMinor: low,
        maxAmountMinor: high,
        currency,
        fees,
      };
    }

    // A provided price without a usable value is not "Frei".
    return { state: "unknown" };
  }

  if (row.price_state === "unknown") return { state: "unknown" };

  return { state: "unanswered" };
}

// Structured data only for a price that is exactly one number or a range: a
// fixed price, a range (lowPrice/highPrice) and an explicit free entry. A
// from-price, a donation and an unknown price give no offer (never a price 0
// for them).
function offerFrom(view: PriceView): PublicEvent["offer"] {
  if (view.state !== "provided") return null;

  if (view.model === "free") return { amount: "0", currency: "EUR" };

  if (view.model === "fixed") {
    return {
      amount: decimal(view.amountMinor),
      currency: view.currency ?? "EUR",
    };
  }

  if (view.model === "range") {
    return {
      amount: decimal(view.amountMinor),
      highAmount: decimal(view.maxAmountMinor),
      currency: view.currency ?? "EUR",
    };
  }

  return null;
}

function decimal(amountMinor: number): string {
  const whole = Math.floor(amountMinor / 100);
  const cents = (amountMinor % 100).toString().padStart(2, "0");

  return `${whole}.${cents}`;
}

// The blocks the page shows. The two free-text blocks have no public design
// yet and never leave the database view; they are dropped here as well.
function publicModules(json: Json | null): StoredModules {
  const { participants, bring_participation, ...shown } =
    parseStored(json) ?? {};

  void participants;
  void bring_participation;

  return shown;
}

const STATUSES: readonly string[] = [
  "scheduled",
  "rescheduled",
  "postponed_undated",
  "cancelled",
];

export function toPublicEvent(
  lang: Lang,
  row: PublicEventRow,
  organizer: PublicProfile,
  mediaBase: string,
  now: Date = new Date(),
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

  const archiveAt = archiveInstant(row.start_at, endInstant, row.timezone);

  if (!archiveAt) return null;

  // A cancelled event stays cancelled and a postponed one has no date: only a
  // scheduled or rescheduled event can be over.
  const past =
    (status === "scheduled" || status === "rescheduled") &&
    now.getTime() >= new Date(archiveAt).getTime();
  const hasDate = status !== "postponed_undated";
  const thisYear = yearIn(row.timezone, now);
  const view = priceView(row);
  const access = accessFrom(lang, row.access_routes);
  const town = [row.postal_code, row.city].filter(Boolean).join(" ");
  const addressLines = [row.address_line, town].filter((line): line is string =>
    Boolean(line),
  );
  // A sold-out ticket link is not offered as the way in.
  const ticket = access.find((route) => route.url !== null && !route.soldOut);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || null,
    format: row.primary_format,
    formatLabel: t(lang, PUBLIC_FORMAT_ID[row.primary_format]),
    status,
    startInstant: row.start_at,
    endInstant,
    timezone: row.timezone,
    archiveAt,
    past,
    dateLine: hasDate ? formatEventDate(lang, time.startDate, thisYear) : null,
    startTime: hasDate ? time.startTime : null,
    timeLine: hasDate
      ? time.endTime
        ? `${time.startTime} → ${time.endTime}`
        : t(lang, "Z34.event.timeFrom", { time: time.startTime })
      : null,
    untilLine:
      hasDate && time.endDate && time.endDate !== time.startDate
        ? t(lang, "Z34.event.until", {
            date: formatEventDate(lang, time.endDate, thisYear),
          })
        : null,
    placeName: row.place_name || null,
    addressLines,
    priceText: priceLabel(lang, view),
    offer: offerFrom(view),
    access,
    ticketUrl: status === "cancelled" || past ? null : (ticket?.url ?? null),
    atmosphereTags: row.atmosphere_tags ?? [],
    atmosphereDescription: row.atmosphere_description || null,
    modules: publicModules(row.modules),
    imageUrl,
    publishedAt: row.published_at,
    organizer,
  };
}
