// Fixed tag colours (docs/startpaket/04-design-tokens.md, "Feste Farben").
// Complete class names, so that the style sheet generator finds them.

import type { PrimaryFormat } from "../domain/event-publication";
import { ATMOSPHERE_ID } from "../event/labels";
import { t, type Lang, type MessageId } from "../i18n";

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

// Keyed by the catalog ID of the term, so no German word sits in this file.
const ATMOSPHERE_TAG_CLASS: Partial<Record<MessageId, string>> = {
  "Z25.atmo.cozy": CALM,
  "Z25.atmo.intimate": CALM,
  "Z25.atmo.relaxed": CALM,
  "Z25.atmo.casual": SOCIAL,
  "Z25.atmo.community": SOCIAL,
  "Z25.atmo.lively": LIVELY,
  "Z25.atmo.immersive": LIVELY,
  "Z25.atmo.experimental": ODD,
  "Z25.atmo.underground": ODD,
  "Z25.atmo.alternative": ODD,
};

// The stored term (the closed list of the data contract) to its catalog ID.
function atmosphereId(tag: string): MessageId | undefined {
  return (ATMOSPHERE_ID as Record<string, MessageId>)[tag];
}

export function atmosphereTagClass(tag: string): string {
  const id = atmosphereId(tag);

  return (id && ATMOSPHERE_TAG_CLASS[id]) || "bg-secondary text-foreground";
}

// The name of a term in the language of the reader. A term that is not in the
// list (an older value) is shown as it is stored.
export function atmosphereLabel(lang: Lang, tag: string): string {
  const id = atmosphereId(tag);

  return id ? t(lang, id) : tag;
}
