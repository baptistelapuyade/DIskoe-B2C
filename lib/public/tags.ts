// Fixed tag colours (docs/startpaket/04-design-tokens.md, "Feste Farben").
// Complete class names, so that the style sheet generator finds them.

import type { PrimaryFormat } from "../domain/event-publication";

export const FORMAT_TAG_CLASS: Record<PrimaryFormat, string> = {
  concert: "bg-brand-pink text-foreground",
  dj_set: "bg-brand-iris text-white",
  club_night: "bg-brand-yellow text-foreground",
  listening_session: "bg-brand-blue text-foreground",
  opening: "bg-brand-lavender text-foreground",
  exhibition: "bg-success text-white",
  screening: "bg-brand-peach text-foreground",
};

const CALM = "bg-brand-blue text-foreground";
const SOCIAL = "bg-brand-peach text-foreground";
const LIVELY = "bg-brand-yellow text-foreground";
const ODD = "bg-brand-pink text-foreground";

const ATMOSPHERE_TAG_CLASS: Record<string, string> = {
  Gemütlich: CALM,
  "Intim/persönlich": CALM,
  Entspannt: CALM,
  Ungezwungen: SOCIAL,
  "Community-geprägt": SOCIAL,
  Lebhaft: LIVELY,
  Immersiv: LIVELY,
  Experimentell: ODD,
  "Underground/DIY": ODD,
  "Alternativ/unabhängig": ODD,
};

export function atmosphereTagClass(tag: string): string {
  return ATMOSPHERE_TAG_CLASS[tag] ?? "bg-secondary text-foreground";
}
