// Dates for the public pages in the language of the reader. Pure. Weekday and
// month names come from the catalog (Z34.date.*), not from a locale of the
// system, so the output is the same on every server.

import { t, type Lang } from "../i18n";

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function list(
  lang: Lang,
  id: "Z34.date.weekdays" | "Z34.date.months",
): string[] {
  return t(lang, id).split(",");
}

function dayMonth(lang: Lang, day: number, month: number): string {
  return t(lang, "Z34.date.dayMonth", {
    day,
    month: list(lang, "Z34.date.months")[month - 1],
  });
}

// "Fr, 23. Oktober" / "Fri, 23 October" for a local date "YYYY-MM-DD". The
// year is added when it differs from `currentYear`, so a date next year is
// not mistaken for this year.
export function formatEventDate(
  lang: Lang,
  date: string,
  currentYear: number,
): string {
  const d = DATE.exec(date);

  if (!d) return date;

  const [year, month, day] = [Number(d[1]), Number(d[2]), Number(d[3])];
  const weekday = list(lang, "Z34.date.weekdays")[
    new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  ];
  const text = `${weekday}, ${dayMonth(lang, day, month)}`;

  return year === currentYear ? text : `${text} ${year}`;
}

// The calendar date of an instant in a zone, "YYYY-MM-DD".
function localDate(instant: string, zone: string): string | null {
  const ms = Date.parse(instant);

  if (Number.isNaN(ms)) return null;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

// "20. Oktober 2026" / "20 October 2026": the day the organizer confirmed the
// event, in the zone of the event.
export function formatConfirmedDate(
  lang: Lang,
  instant: string | null,
  zone: string = "Europe/Berlin",
): string | null {
  const d = instant ? DATE.exec(localDate(instant, zone) ?? "") : null;

  return d ? `${dayMonth(lang, Number(d[3]), Number(d[2]))} ${d[1]}` : null;
}

// The year of "now" in the zone of the event.
export function yearIn(zone: string, now: Date): number {
  return Number(localDate(now.toISOString(), zone)?.slice(0, 4));
}
