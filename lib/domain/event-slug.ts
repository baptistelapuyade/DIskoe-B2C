// Event addresses. The slug is globally unique (events_slug_key) and must
// match events_slug_format: lowercase letters, digits and hyphens, 3 to 80
// characters, starting and ending with a letter or digit.
//
// TODO(spec): the scheme (title plus a random suffix, fixed after creation)
// is a working proposal, not a product decision.

const MAX_BASE_LENGTH = 60;
const SUFFIX_LENGTH = 6;
const SUFFIX_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export const EVENT_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,78})[a-z0-9]$/;

export function slugBase(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_BASE_LENGTH)
    .replace(/-+$/g, "");

  return base === "" ? "event" : base;
}

export function randomSlugSuffix(): string {
  const bytes = new Uint8Array(SUFFIX_LENGTH);
  crypto.getRandomValues(bytes);

  return Array.from(
    bytes,
    (byte) => SUFFIX_ALPHABET[byte % SUFFIX_ALPHABET.length],
  ).join("");
}

export function eventSlug(
  title: string,
  suffix: string = randomSlugSuffix(),
): string {
  return `${slugBase(title)}-${suffix}`;
}
