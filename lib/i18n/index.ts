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

// The language a browser asks for ("de-DE,de;q=0.9,en;q=0.8"): the first
// supported language by weight. Used only when no choice is stored in the
// cookie. Anything else (no header, other languages only) gives the default.
export function langFromAcceptLanguage(
  header: string | null | undefined,
): Lang {
  const ranked = (header ?? "")
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const weight = params
        .map((param) => /^\s*q\s*=\s*([0-9.]+)\s*$/.exec(param)?.[1])
        .find((value) => value !== undefined);
      const q = weight === undefined ? 1 : Number(weight);

      return { primary: tag.split("-")[0], q: Number.isNaN(q) ? 0 : q, index };
    })
    .filter(
      (entry) =>
        entry.q > 0 && (entry.primary === "de" || entry.primary === "en"),
    )
    .sort((a, b) => b.q - a.q || a.index - b.index);

  return ranked.length > 0 ? (ranked[0].primary as Lang) : DEFAULT_LANG;
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
