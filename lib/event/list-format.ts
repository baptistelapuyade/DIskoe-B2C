import type { Lang } from "@/lib/i18n";
import { instantToLocal } from "@/lib/domain/time";

const WEEKDAY: Record<Lang, readonly string[]> = {
  de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

export type ListWhen = {
  weekday: string;
  // "14.11.2026" (no leading zeros, as in Figma EVL-01).
  date: string;
  time: string;
};

// The date of a row in Europe/Berlin (UX-06). The weekday comes from the
// calendar date, not from a locale table. Null when the instant is not valid.
export function listWhen(
  lang: Lang,
  startAt: string,
  zone?: string,
): ListWhen | null {
  const local = instantToLocal(startAt, zone);
  const parts = local ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(local.date) : null;

  if (!local || !parts) return null;

  const [year, month, day] = [
    Number(parts[1]),
    Number(parts[2]),
    Number(parts[3]),
  ];
  const weekday =
    WEEKDAY[lang][new Date(Date.UTC(year, month - 1, day)).getUTCDay()];

  return { weekday, date: `${day}.${month}.${year}`, time: local.time };
}
