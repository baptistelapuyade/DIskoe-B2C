import { de, type MessageId } from "./messages.de";
import { en } from "./messages.en";

// Platform copy is German and English. English is the default (founder,
// 10.11.2026); the choice lives in the `lang` cookie. Texts written by
// organizers are never translated and do not pass through here.
export const LANGS = ["en", "de"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "lang";

export type { MessageId };

const CATALOG: Record<Lang, Record<MessageId, string>> = { de, en };

export function parseLang(value: unknown): Lang {
  return value === "de" || value === "en" ? value : DEFAULT_LANG;
}

export type Params = Record<string, string | number>;

// Looks up a catalog text and fills {placeholders}. A placeholder without a
// value stays visible instead of turning into "undefined".
export function t(lang: Lang, id: MessageId, params?: Params): string {
  const text = CATALOG[lang][id];
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

export function messageIds(lang: Lang): string[] {
  return Object.keys(CATALOG[lang]);
}

export function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

export function textFor(lang: Lang, id: MessageId): string {
  return CATALOG[lang][id];
}
