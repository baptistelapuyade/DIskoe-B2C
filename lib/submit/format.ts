// Texts of the submit screens (Figma EIN-01, EIN-02, PRF-01 to PRF-03): the
// values of profile and first event as one short line each, in the language of
// the organizer. Pure: built from saved values only, never from guesses. An
// unknown price is never "Free", and nothing is invented for a missing value.

import { parseAmount } from "../domain/money";
import { MODULE_KEYS, storedToForm } from "../domain/event-modules";
import type { StoredModules } from "../domain/event-modules";
import type { AccessKind } from "../domain/event-publication";
import { ACCESS_ID, ATMOSPHERE_ID, FORMAT_ID } from "../event/labels";
import { BLOCK_ID, moduleSummary } from "../event/module-summary";
import type { EventFormValues } from "../event/values";
import { t, type Lang, type MessageId } from "../i18n";

const ZONE = "Berlin";
const DAY_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

const WEEKDAYS: Record<Lang, readonly string[]> = {
  de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};
const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

type Day = { year: number; month: number; day: number; weekday: number };

function parseDay(iso: string): Day | null {
  const match = DAY_ISO.exec(iso);

  if (!match) return null;

  const [year, month, day] = [match[1], match[2], match[3]].map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return { year, month, day, weekday };
}

// "6.11.2026" or "6 Nov 2026"; the year can be left out ("21.11.", "21 Nov").
function dayNumbers(lang: Lang, day: Day, withYear: boolean): string {
  if (lang === "de") {
    return `${day.day}.${day.month}.${withYear ? day.year : ""}`;
  }

  return `${day.day} ${MONTHS_EN[day.month - 1]}${withYear ? ` ${day.year}` : ""}`;
}

// "Fr, 20.11.2026" / "Fri, 20 Nov 2026".
export function formatDay(lang: Lang, iso: string, withYear = true): string {
  const day = parseDay(iso);

  if (!day) return iso;

  return `${WEEKDAYS[lang][day.weekday]}, ${dayNumbers(lang, day, withYear)}`;
}

// "6.11.2026" / "6 Nov 2026".
export function formatDateOnly(lang: Lang, iso: string): string {
  const day = parseDay(iso);

  return day ? dayNumbers(lang, day, true) : iso;
}

// The wall clock of Europe/Berlin for an instant: date "YYYY-MM-DD" and time
// "HH:MM". The platform shows Berlin time everywhere (flow map, time rule).
export function berlinClock(instant: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(instant));
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

// "Fr, 6.11.2026, 14:32" for the pill of the review page.
export function formatStamp(lang: Lang, instant: string): string {
  const { date, time } = berlinClock(instant);

  return t(lang, "Z27.when.clock", { day: formatDay(lang, date), time });
}

function dayTime(lang: Lang, iso: string, time: string, withYear: boolean) {
  const day = formatDay(lang, iso, withYear);

  return time === "" ? day : t(lang, "Z27.when.clock", { day, time });
}

// "Fr, 20.11.2026, 22:00 bis Sa, 21.11., 04:00 (Berlin)". Null while no start
// exists. The end shows only the time on the same day and no year within the
// same year.
export function whenSummary(lang: Lang, v: EventFormValues): string | null {
  if (v.startDate === "") return null;

  const start = dayTime(lang, v.startDate, v.startTime, true);

  if (v.endUnknown || v.endDate === "") {
    return t(lang, "Z27.when.single", { start, zone: ZONE });
  }

  const startDay = parseDay(v.startDate);
  const endDay = parseDay(v.endDate);
  const end =
    v.endDate === v.startDate
      ? v.endTime
      : dayTime(lang, v.endDate, v.endTime, startDay?.year !== endDay?.year);

  return t(lang, "Z27.when.range", { start, end, zone: ZONE });
}

export function placeSummary(v: EventFormValues): string | null {
  const town = [v.postalCode, v.city].filter((part) => part !== "").join(" ");
  const parts = [v.placeName, v.addressLine, town].filter(
    (part) => part !== "",
  );

  return parts.length > 0 ? parts.join(", ") : null;
}

// "12,00 €" in German, "€12.00" in English. Whole numbers of cents only.
export function formatAmount(lang: Lang, amountMinor: number): string {
  const whole = Math.floor(amountMinor / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, lang === "de" ? "." : ",");
  const fraction = (amountMinor % 100).toString().padStart(2, "0");

  return lang === "de"
    ? `${whole},${fraction} €`
    : `€${whole}.${fraction}`;
}

// Null while the price is not answered. "Unknown" is an answer and shown as
// such; it is never turned into "Free".
export function priceSummary(lang: Lang, v: EventFormValues): string | null {
  const fees = v.priceFees === "included";
  const withFees = (price: string) =>
    fees ? t(lang, "Z27.price.fees", { price }) : price;
  const low = parseAmount(v.priceAmount);

  switch (v.priceModel) {
    case "free":
      return t(lang, "Z27.price.free");
    case "donation":
      return t(lang, "Z27.price.donation");
    case "unknown":
      return t(lang, "Z27.price.unknown");
    case "fixed":
      return low.ok ? withFees(formatAmount(lang, low.amountMinor)) : null;
    case "from_price":
      return low.ok
        ? withFees(
            t(lang, "Z27.price.from", {
              amount: formatAmount(lang, low.amountMinor),
            }),
          )
        : null;
    case "min_donation":
      return low.ok
        ? t(lang, "Z27.price.minDonation", {
            amount: formatAmount(lang, low.amountMinor),
          })
        : null;
    case "range": {
      const high = parseAmount(v.priceAmountMax);

      return low.ok && high.ok
        ? withFees(
            `${formatAmount(lang, low.amountMinor)}–${formatAmount(lang, high.amountMinor)}`,
          )
        : null;
    }
    default:
      return null;
  }
}

export function accessSummary(lang: Lang, v: EventFormValues): string | null {
  const labels = v.accessKinds
    .filter((kind): kind is AccessKind => kind in ACCESS_ID)
    .map((kind) => t(lang, ACCESS_ID[kind]));

  return labels.length > 0 ? labels.join(", ") : null;
}

export function atmosphereText(lang: Lang, v: EventFormValues): string | null {
  const parts: string[] = [];
  const tags = v.atmosphereTags
    .filter((tag) => tag in ATMOSPHERE_ID)
    .map((tag) => t(lang, ATMOSPHERE_ID[tag as keyof typeof ATMOSPHERE_ID]));

  if (tags.length > 0) parts.push(tags.join(", "));
  if (v.atmosphereDescription.trim() !== "") {
    parts.push(v.atmosphereDescription.trim());
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function formatName(lang: Lang, v: EventFormValues): string | null {
  return v.format in FORMAT_ID
    ? t(lang, FORMAT_ID[v.format as keyof typeof FORMAT_ID])
    : null;
}

// "Mehr zum Abend": one line per block that has an answer, "Block: answer".
// Null when no block has anything in it (the row then says "Keine Angaben").
export function moreSummary(
  lang: Lang,
  stored: StoredModules | null,
): string | null {
  if (stored === null) return null;

  const form = storedToForm(stored);
  const lines: string[] = [];

  for (const key of MODULE_KEYS) {
    if (!(key in stored)) continue;

    const summary = moduleSummary(lang, key, form);

    if (summary) {
      lines.push(`${t(lang, BLOCK_ID[key] as MessageId)}: ${summary}`);
    }
  }

  return lines.length > 0 ? lines.join("\n") : null;
}

function bareLink(link: string): string {
  return link
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

// "nebenraum.example · @nebenraum": the website, Instagram, further links and
// the public contact, as saved.
export function linksSummary(fields: {
  officialUrl: string | null;
  instagramHandle: string | null;
  extraLinks: readonly string[];
  publicContact: string | null;
}): string | null {
  const parts: string[] = [];

  if (fields.officialUrl) parts.push(bareLink(fields.officialUrl));

  if (fields.instagramHandle) {
    parts.push(`@${fields.instagramHandle.replace(/^@/, "")}`);
  }

  for (const link of fields.extraLinks) parts.push(bareLink(link));

  if (fields.publicContact) parts.push(fields.publicContact.trim());

  const filled = parts.filter((part) => part !== "");

  return filled.length > 0 ? filled.join(" · ") : null;
}
