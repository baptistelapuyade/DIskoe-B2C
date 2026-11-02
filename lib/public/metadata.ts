import type { Metadata } from "next";

import type { PublicEvent, PublicProfile } from "./dto";
import { siteUrl } from "./site";

function shorten(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();

  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function eventMetadata(event: PublicEvent): Metadata {
  const when =
    event.status === "cancelled"
      ? "Abgesagt"
      : event.status === "postponed_undated"
        ? "Neuer Termin folgt"
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
      locale: "de_DE",
      images: [{ url: event.imageUrl }],
    },
    twitter: { card: "summary_large_image", title, description, images: [event.imageUrl] },
  };
}

export function profileMetadata(profile: PublicProfile): Metadata {
  const description = shorten(profile.shortIntro ?? `Events von ${profile.name}`, 160);
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
      locale: "de_DE",
      ...(profile.imageUrl ? { images: [{ url: profile.imageUrl }] } : {}),
    },
  };
}
