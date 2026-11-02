// The bars of "Gut zu wissen" (Delta v0.5 §9): one bar per piece of
// information, a missing piece has no bar. Exceptions: "Zugänglichkeit" is
// always there, and missing data is never shown as "not accessible". Pure.

import { safeUrl, type PublicEvent } from "./dto";

export type InfoBar = {
  key: "entry" | "accessibility";
  label: string;
  value: string;
  pills: string[];
  detail: string | null;
  action: { label: string; href: string } | null;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The public contact is free text. Only an e-mail address or an http(s) link
// can be opened; anything else gives no button.
export function contactHref(contact: string | null): string | null {
  const text = contact?.trim() ?? "";

  if (text === "") return null;
  if (EMAIL.test(text)) return `mailto:${text}`;
  if (/^https?:\/\//i.test(text)) return safeUrl(text);

  return null;
}

export const ACCESSIBILITY_UNKNOWN_TEXT =
  "Der Veranstalter hat dazu nichts bestätigt. Das heißt nicht, dass der Ort nicht zugänglich ist.";

export function infoBars(
  event: Pick<PublicEvent, "priceText" | "access" | "organizer">,
): InfoBar[] {
  const bars: InfoBar[] = [];

  // "Eintritt" needs an answer about the cost. A confirmed "unknown" is an
  // answer ("Preis noch offen"); no answer at all leaves the bar out.
  if (event.priceText !== null) {
    bars.push({
      key: "entry",
      label: "Eintritt",
      value: event.priceText,
      pills: event.access.map((route) => route.label),
      detail: null,
      action: null,
    });
  }

  // The alpha collects no accessibility details yet, so the neutral state is
  // the only one. "Veranstalter fragen" only when a public contact exists.
  const href = contactHref(event.organizer.publicContact);

  bars.push({
    key: "accessibility",
    label: "Zugänglichkeit",
    value: "Noch keine Angaben",
    pills: [],
    detail: ACCESSIBILITY_UNKNOWN_TEXT,
    action: href ? { label: "Veranstalter fragen", href } : null,
  });

  return bars;
}
