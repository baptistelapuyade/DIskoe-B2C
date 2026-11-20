// The rows of the summary cards of the submit screens (Figma EIN-01, PRF-02):
// what the owner sees about the profile and the first event, one line per
// value, and which rows are missing. Pure: built from SubmitData. Nothing is
// invented for a missing value; a missing value is a row that says so.

import type { Crop } from "../domain/profile-publication";
import type { EventGapCode } from "../domain/event-publication";
import { t, type Lang, type MessageId } from "../i18n";
import type { SubmitData } from "./load";
import {
  accessSummary,
  atmosphereText,
  formatName,
  linksSummary,
  moreSummary,
  placeSummary,
  priceSummary,
  whenSummary,
} from "./format";

export type SummaryRow = {
  key: string;
  label: string;
  // The value as one text; "\n" starts a new line.
  text?: string | null;
  image?: {
    shape: "avatar" | "event";
    url: string | null;
    alt: string;
    crop: Crop | null;
  };
  // A required value that is not there: the badge, the text and the way to
  // add it.
  missing?: { text: string; fixHref: string };
};

type RowKey =
  | "title"
  | "format"
  | "description"
  | "when"
  | "place"
  | "price"
  | "access"
  | "atmosphere"
  | "eventImage"
  | "more";

// Which row a gap belongs to, which editor step fixes it, and the names the
// banner and the button use.
const GAP: Record<
  EventGapCode,
  { row: RowKey; step: string; name: MessageId; short?: MessageId }
> = {
  title: { row: "title", step: "basics", name: "Z27.gap.title" },
  description: {
    row: "description",
    step: "basics",
    name: "Z27.gap.description",
  },
  primary_format: { row: "format", step: "basics", name: "Z27.gap.format" },
  start: { row: "when", step: "time", name: "Z27.gap.start" },
  place: { row: "place", step: "place", name: "Z27.gap.place" },
  price: { row: "price", step: "price", name: "Z27.gap.price" },
  access: { row: "access", step: "price", name: "Z27.gap.access" },
  access_url: { row: "access", step: "price", name: "Z27.gap.accessUrl" },
  atmosphere: {
    row: "atmosphere",
    step: "atmosphere",
    name: "Z27.gap.atmosphere",
  },
  visit_mode: {
    row: "more",
    step: "more",
    name: "Z27.gap.visitMode",
    short: "Z27.gap.visitMode.short",
  },
  language: {
    row: "more",
    step: "more",
    name: "Z27.gap.language",
    short: "Z27.gap.language.short",
  },
  event_image: { row: "eventImage", step: "image", name: "Z27.gap.image" },
  revision_missing: { row: "title", step: "basics", name: "Z27.gap.title" },
};

export function gapHref(eventId: string, code: EventGapCode): string {
  return `/organizer/events/${eventId}/edit/${GAP[code].step}`;
}

export function gapName(lang: Lang, code: EventGapCode): string {
  return t(lang, GAP[code].name);
}

export function gapShortName(lang: Lang, code: EventGapCode): string {
  return t(lang, GAP[code].short ?? GAP[code].name);
}

// "Atmosphäre und Eventbild", "A, B und C".
export function joinNames(lang: Lang, names: readonly string[]): string {
  if (names.length <= 1) return names.join("");

  const head = names.slice(0, -1).join(", ");

  return t(lang, "Z27.list.and", { a: head, b: names[names.length - 1] });
}

const MISSING_TEXT: Partial<Record<EventGapCode, MessageId>> = {
  visit_mode: "Z27.row.visitModeMissing",
  language: "Z27.row.languageMissing",
};

export function profileRows(lang: Lang, data: SubmitData): SummaryRow[] {
  const { profile } = data;
  const revision = profile.revision;
  const image = profile.image;

  return [
    {
      key: "name",
      label: t(lang, "Z27.row.name"),
      text: revision?.name ?? null,
    },
    {
      key: "intro",
      label: t(lang, "Z27.row.intro"),
      text: revision?.shortIntro ?? null,
    },
    {
      key: "slug",
      label: t(lang, "Z27.row.slug"),
      text: `/${profile.profile.slug}`,
    },
    {
      key: "links",
      label: t(lang, "Z27.row.links"),
      text: revision
        ? linksSummary({
            officialUrl: revision.officialUrl,
            instagramHandle: revision.instagramHandle,
            extraLinks: revision.extraLinks,
            publicContact: revision.publicContact,
          })
        : null,
    },
    {
      key: "image",
      label: t(lang, "Z27.row.profileImage"),
      image: {
        shape: "avatar",
        url: image?.signedUrl ?? null,
        alt: image?.altText ?? "",
        crop: data.profileCrop,
      },
    },
  ];
}

export function eventRows(lang: Lang, data: SubmitData): SummaryRow[] {
  const event = data.event;

  if (!event) return [];

  const { form, image, modules } = event;
  const eventId = event.event.id;
  const gaps = new Map<RowKey, EventGapCode>();

  for (const code of data.eventGapCodes) {
    if (!gaps.has(GAP[code].row)) gaps.set(GAP[code].row, code);
  }

  function row(
    key: RowKey,
    label: MessageId,
    text: string | null,
  ): SummaryRow {
    const gap = gaps.get(key);

    if (gap) {
      return {
        key,
        label: t(lang, label),
        missing: {
          text: t(lang, MISSING_TEXT[gap] ?? "Z27.row.notEntered"),
          fixHref: gapHref(eventId, gap),
        },
      };
    }

    return { key, label: t(lang, label), text };
  }

  const imageGap = gaps.get("eventImage");

  return [
    row("title", "Z27.row.title", form.title.trim() || null),
    row("format", "Z27.row.format", formatName(lang, form)),
    row("description", "Z27.row.description", form.description.trim() || null),
    row("when", "Z27.row.when", whenSummary(lang, form)),
    row("place", "Z27.row.place", placeSummary(form)),
    row("price", "Z27.row.price", priceSummary(lang, form)),
    row("access", "Z27.row.access", accessSummary(lang, form)),
    row("atmosphere", "Z27.row.atmosphere", atmosphereText(lang, form)),
    imageGap
      ? row("eventImage", "Z27.row.eventImage", null)
      : {
          key: "eventImage",
          label: t(lang, "Z27.row.eventImage"),
          image: {
            shape: "event",
            url: image?.signedUrl ?? null,
            alt: image?.altText ?? "",
            crop: null,
          },
        },
    row(
      "more",
      "Z27.row.more",
      moreSummary(lang, modules) ?? t(lang, "Z27.row.moreNone"),
    ),
  ];
}
