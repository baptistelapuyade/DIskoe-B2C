// Event times: a UTC instant plus the IANA zone (AGENTS.md, "Zeit"). Local
// wall-clock input in Europe/Berlin is converted with the built-in Intl API;
// no fixed UTC hours. A local time that does not exist (spring) or exists
// twice (autumn) is reported, never guessed.

export const EVENT_ZONE = "Europe/Berlin";

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function wallFormatter(zone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(zone);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatterCache.set(zone, formatter);
  }

  return formatter;
}

type Wall = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function wallParts(instantMs: number, zone: string): Wall {
  const parts: Record<string, number> = {};

  for (const part of wallFormatter(zone).formatToParts(new Date(instantMs))) {
    if (part.type !== "literal") {
      parts[part.type] = Number.parseInt(part.value, 10);
    }
  }

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

function wallAsUtcMs(wall: Wall): number {
  return Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
  );
}

// Offset of the zone at an instant, in milliseconds (positive east of UTC).
function offsetMs(instantMs: number, zone: string): number {
  return wallAsUtcMs(wallParts(instantMs, zone)) - instantMs;
}

export type LocalTimeError = "invalid" | "nonexistent" | "ambiguous";

export type LocalToInstant =
  | { ok: true; instant: string }
  | { ok: false; reason: LocalTimeError };

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

// date "YYYY-MM-DD" and time "HH:MM" as typed in the zone. Returns the UTC
// instant as ISO string, or the reason why there is no unique instant.
export function localToInstant(
  date: string,
  time: string,
  zone: string = EVENT_ZONE,
): LocalToInstant {
  const d = DATE_PATTERN.exec(date);
  const t = TIME_PATTERN.exec(time);

  if (!d || !t) {
    return { ok: false, reason: "invalid" };
  }

  const wall: Wall = {
    year: Number.parseInt(d[1], 10),
    month: Number.parseInt(d[2], 10),
    day: Number.parseInt(d[3], 10),
    hour: Number.parseInt(t[1], 10),
    minute: Number.parseInt(t[2], 10),
    second: 0,
  };
  const asUtc = wallAsUtcMs(wall);
  const check = new Date(asUtc);

  // 2026-02-31 would roll over into March; reject it.
  if (
    check.getUTCFullYear() !== wall.year ||
    check.getUTCMonth() !== wall.month - 1 ||
    check.getUTCDate() !== wall.day ||
    wall.year < 2000 ||
    wall.year > 2100
  ) {
    return { ok: false, reason: "invalid" };
  }

  // The zone's offset one day before and after bounds every offset that can
  // apply to this wall-clock time. Each candidate instant is valid only if it
  // shows the same wall-clock time in the zone.
  const day = 24 * 60 * 60 * 1000;
  const offsets = new Set([
    offsetMs(asUtc - day, zone),
    offsetMs(asUtc + day, zone),
  ]);
  const matches = new Set<number>();

  for (const offset of offsets) {
    const instantMs = asUtc - offset;

    if (wallAsUtcMs(wallParts(instantMs, zone)) === asUtc) {
      matches.add(instantMs);
    }
  }

  if (matches.size === 0) {
    return { ok: false, reason: "nonexistent" };
  }

  if (matches.size > 1) {
    return { ok: false, reason: "ambiguous" };
  }

  const [instantMs] = [...matches];

  return { ok: true, instant: new Date(instantMs).toISOString() };
}

export const LOCAL_TIME_MESSAGE: Record<LocalTimeError, string> = {
  invalid: "Bitte gib Datum und Uhrzeit an, zum Beispiel 31.10.2026 und 21:00.",
  nonexistent:
    "Diese Uhrzeit gibt es wegen der Zeitumstellung nicht. Bitte wähle eine andere Zeit.",
  ambiguous:
    "Diese Uhrzeit gibt es wegen der Zeitumstellung zweimal. Bitte wähle eine andere Zeit.",
};

export type LocalDateTime = { date: string; time: string };

// An instant as local date "YYYY-MM-DD" and time "HH:MM" in the zone.
export function instantToLocal(
  instant: string,
  zone: string = EVENT_ZONE,
): LocalDateTime | null {
  const ms = Date.parse(instant);

  if (Number.isNaN(ms)) {
    return null;
  }

  const w = wallParts(ms, zone);
  const two = (n: number) => n.toString().padStart(2, "0");

  return {
    date: `${w.year}-${two(w.month)}-${two(w.day)}`,
    time: `${two(w.hour)}:${two(w.minute)}`,
  };
}

export function isEndAfterStart(startInstant: string, endInstant: string): boolean {
  return Date.parse(endInstant) > Date.parse(startInstant);
}

const WEEKDAY = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;

// "Sa., 31.10.2026" for a local date "YYYY-MM-DD". The weekday comes from the
// calendar date itself, not from a locale table that differs between systems.
export function formatLocalDate(date: string): string {
  const d = DATE_PATTERN.exec(date);

  if (!d) {
    return date;
  }

  const weekday = WEEKDAY[new Date(Date.UTC(+d[1], +d[2] - 1, +d[3])).getUTCDay()];

  return `${weekday}., ${d[3]}.${d[2]}.${d[1]}`;
}

export type EventTimeView = {
  startDate: string;
  startTime: string;
  // null when the end is unknown. An unknown end is never invented, and the
  // archive cut-off is not an event end.
  endDate: string | null;
  endTime: string | null;
  // One entry when the event stays within one calendar day or the end is
  // unknown, two when it ends on another calendar day (night events).
  days: string[];
};

export function describeEventTime(
  startInstant: string,
  endInstant: string | null,
  zone: string = EVENT_ZONE,
): EventTimeView | null {
  const start = instantToLocal(startInstant, zone);

  if (!start) {
    return null;
  }

  const end = endInstant ? instantToLocal(endInstant, zone) : null;
  const days =
    end && end.date !== start.date ? [start.date, end.date] : [start.date];

  return {
    startDate: start.date,
    startTime: start.time,
    endDate: end?.date ?? null,
    endTime: end?.time ?? null,
    days,
  };
}

// "Sa., 31.10.2026, 23:00 Uhr bis So., 01.11.2026, 04:00 Uhr". Without a known
// end only the start is shown.
export function formatEventTime(
  startInstant: string,
  endInstant: string | null,
  zone: string = EVENT_ZONE,
): string | null {
  const view = describeEventTime(startInstant, endInstant, zone);

  if (!view) {
    return null;
  }

  const start = `${formatLocalDate(view.startDate)}, ${view.startTime} Uhr`;

  if (!view.endDate || !view.endTime) {
    return start;
  }

  return view.endDate === view.startDate
    ? `${start} bis ${view.endTime} Uhr`
    : `${start} bis ${formatLocalDate(view.endDate)}, ${view.endTime} Uhr`;
}
