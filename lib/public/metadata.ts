import type { Metadata } from "next";

import { t, type Lang } from "../i18n";
import type { PublicEvent, PublicProfile } from "./dto";
import { siteUrl } from "./site";

function shorten(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();

  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

// Open Graph locale of the page language.
const OG_LOCALE: Record<Lang, string> = { de: "de_DE", en: "en_US" };

export function eventMetadata(lang: Lang, event: PublicEvent): Metadata {
  const when =
    event.status === "cancelled"
      ? t(lang, "Z34.notice.cancelled.eyebrow")
      : event.status === "postponed_undated"
        ? t(lang, "Z34.event.dateTbd")
        : [event.dateLine, event.timeLine].filter(Boolean).join(", ");
  const description = shorten(
    event.description ??
      [event.formatLabel, when, event.placeName].filter(Boolean).join(" · "),
    160,
  );
  const title = `${event.title} · ${event.organizer.name}`;
  const url = `${siteUrl()}/e/${event.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      locale: OG_LOCALE[lang],
      images: [{ url: event.imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [event.imageUrl],
    },
  };
}

export function profileMetadata(lang: Lang, profile: PublicProfile): Metadata {
  const description = shorten(
    profile.shortIntro ??
      t(lang, "Z34.meta.profileDescription", { name: profile.name }),
    160,
  );
  const url = `${siteUrl()}/${profile.slug}`;

  return {
    title: profile.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      title: profile.name,
      description,
      url,
      locale: OG_LOCALE[lang],
      ...(profile.imageUrl ? { images: [{ url: profile.imageUrl }] } : {}),
    },
  };
}
