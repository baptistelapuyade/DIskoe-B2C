// The date of an event as the status pages show it (Figma EVV-01 to 05, EVA).
// Pure: built from the stored local date and time, in Europe/Berlin.

import type { Lang } from "@/lib/i18n";

const WEEKDAY: Record<Lang, readonly string[]> = {
  de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

export type StatusWhen = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

// "Sa, 14.11.2026" for a local date "YYYY-MM-DD"; the weekday comes from the
// calendar date, not from a locale table.
function day(lang: Lang, iso: string): string | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);

  if (!parts) return null;

  const weekday =
    WEEKDAY[lang][
      new Date(Date.UTC(+parts[1], +parts[2] - 1, +parts[3])).getUTCDay()
    ];

  return `${weekday}, ${parts[3]}.${parts[2]}.${parts[1]}`;
}

// "Sa, 14.11.2026, 20:00" · "Sa, 14.11.2026, 20:00 → 04:00" (end on the same
// calendar day or unknown time of day) · "Sa, 21.11.2026, 20:00 → So,
// 22.11.2026, 04:00" (end on another day). Without a known end only the start
// is shown. Null when there is no readable start.
export function statusWhen(lang: Lang, when: StatusWhen): string | null {
  const start = day(lang, when.startDate);

  if (start === null || when.startTime === "") return null;

  const from = `${start}, ${when.startTime}`;

  if (when.endDate === "" || when.endTime === "") return from;

  if (when.endDate === when.startDate) return `${from} → ${when.endTime}`;

  const end = day(lang, when.endDate);

  return end === null ? from : `${from} → ${end}, ${when.endTime}`;
}

// "Hof am Kanal, Berlin": the place name and the city (EVA-01a).
export function statusPlace(place: {
  placeName: string;
  city: string;
}): string {
  return [place.placeName, place.city].filter((part) => part !== "").join(", ");
}
