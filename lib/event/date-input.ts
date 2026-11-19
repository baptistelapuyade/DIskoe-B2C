// Date typed by the organizer (EVT-02). The form works with the ISO form
// "YYYY-MM-DD" (what lib/domain/time.ts expects); the field shows and accepts
// the written form of the language: 20.11.2026 in German, 20/11/2026 in
// English. Day first in both, as in Berlin. The separators . / - are accepted
// in either language, and so is the ISO form.

import type { Lang } from "@/lib/i18n";

export type DateInput =
  | { ok: true; iso: string }
  | { ok: false };

const DAY_FIRST = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/;
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number, length: number): string {
  return String(value).padStart(length, "0");
}

function build(year: number, month: number, day: number): DateInput {
  const check = new Date(Date.UTC(year, month - 1, day));

  // 31.02.2026 would roll over into March; years outside 2000 to 2100 are
  // typos in practice (the same bounds as lib/domain/time.ts).
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    year < 2000 ||
    year > 2100
  ) {
    return { ok: false };
  }

  return { ok: true, iso: `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}` };
}

// Empty text is a valid "nothing entered" (iso "").
export function parseDateInput(raw: string): DateInput {
  const text = raw.trim();

  if (text === "") {
    return { ok: true, iso: "" };
  }

  const iso = ISO.exec(text);

  if (iso) {
    return build(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const dayFirst = DAY_FIRST.exec(text);

  if (dayFirst) {
    return build(Number(dayFirst[3]), Number(dayFirst[2]), Number(dayFirst[1]));
  }

  return { ok: false };
}

// "2026-11-20" to the written form; anything that is not an ISO date is
// returned unchanged, so that a typo stays visible in the field.
export function formatDateInput(iso: string, lang: Lang): string {
  const match = ISO.exec(iso);

  if (!match) {
    return iso;
  }

  const separator = lang === "de" ? "." : "/";

  return [match[3], match[2], match[1]].join(separator);
}

// "2026-11-20" to a Date at local noon (what the calendar widget selects),
// or undefined.
export function isoToCalendarDate(iso: string): Date | undefined {
  const match = ISO.exec(iso);

  if (!match) {
    return undefined;
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
}

export function calendarDateToIso(date: Date): string {
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}`;
}

// The day after an ISO date, as ISO ("" when the input is not a date).
export function nextDayIso(iso: string): string {
  const date = isoToCalendarDate(iso);

  if (!date) {
    return "";
  }

  date.setDate(date.getDate() + 1);

  return calendarDateToIso(date);
}
