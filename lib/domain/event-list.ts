// The owner's event list (Figma EVL-01a to 01g): which state a row shows,
// the filter, the search and the pages. Pure rules: no framework or database
// imports, so every branch can be tested.

export type EventStatus =
  "scheduled" | "rescheduled" | "postponed_undated" | "cancelled";

// What the row says about the event.
//   live       public, nothing waiting
//   changes    public, and the private draft differs from the public page
//   private    never published
//   inReview   never published, submitted together with the profile
//   question   never published, the founder asked something
//   postponed  public without a date
//   cancelled  public and cancelled
//   past       public and over (after the archive cut-off)
export type EventListState =
  | "live"
  | "changes"
  | "private"
  | "inReview"
  | "question"
  | "postponed"
  | "cancelled"
  | "past";

export type ReviewHint = "in_review" | "question" | null;

export function listState(input: {
  published: boolean;
  draftDiffers: boolean;
  status: EventStatus;
  // The archive cut-off of the public revision (ISO instant) or null.
  archiveAt: string | null;
  review: ReviewHint;
  now: Date;
}): EventListState {
  if (!input.published) {
    if (input.review === "question") return "question";
    if (input.review === "in_review") return "inReview";

    return "private";
  }

  if (input.status === "cancelled") return "cancelled";
  if (input.status === "postponed_undated") return "postponed";

  const over =
    input.archiveAt !== null &&
    input.now.getTime() >= Date.parse(input.archiveAt);

  if (over) return "past";

  return input.draftDiffers ? "changes" : "live";
}

export type EventListRow = {
  id: string;
  title: string | null;
  // ISO instant of the start shown in the row; null while there is none.
  startAt: string | null;
  placeName: string | null;
  city: string | null;
  state: EventListState;
};

// "Kommende" is the default. "Alle Events" has everything, "Entwürfe" the
// events that were never published, "Vorbei" the archive.
export const EVENT_FILTERS = ["upcoming", "all", "drafts", "past"] as const;
export type EventFilter = (typeof EVENT_FILTERS)[number];

export const DEFAULT_FILTER: EventFilter = "upcoming";

export function parseFilter(value: unknown): EventFilter {
  return (EVENT_FILTERS as readonly unknown[]).includes(value)
    ? (value as EventFilter)
    : DEFAULT_FILTER;
}

export function matchesFilter(
  state: EventListState,
  filter: EventFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "drafts":
      return (
        state === "private" || state === "inReview" || state === "question"
      );
    case "past":
      return state === "past";
    case "upcoming":
      return state !== "past" && state !== "cancelled";
  }
}

// Case and accents do not matter ("kellerbuhne" finds "Kellerbühne").
function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("de");
}

export function matchesQuery(row: EventListRow, query: string): boolean {
  const needle = fold(query.trim());

  if (needle === "") return true;

  const haystack = fold(
    [row.title, row.placeName, row.city].filter(Boolean).join(" "),
  );

  return haystack.includes(needle);
}

const GROUP: Record<EventListState, number> = {
  live: 0,
  changes: 0,
  private: 0,
  inReview: 0,
  question: 0,
  postponed: 1,
  cancelled: 2,
  past: 3,
};

function time(row: EventListRow): number | null {
  if (row.startAt === null) return null;
  const ms = Date.parse(row.startAt);

  return Number.isNaN(ms) ? null : ms;
}

// Current events by start (without a date last), then events waiting for a
// date, then cancelled ones, then the archive with the latest first.
export function sortRows(rows: readonly EventListRow[]): EventListRow[] {
  return [...rows].sort((a, b) => {
    const byGroup = GROUP[a.state] - GROUP[b.state];

    if (byGroup !== 0) return byGroup;

    const ta = time(a);
    const tb = time(b);

    if (ta === null && tb === null) return a.id.localeCompare(b.id);
    if (ta === null) return 1;
    if (tb === null) return -1;

    return GROUP[a.state] === 3 ? tb - ta : ta - tb;
  });
}

export const PAGE_SIZE = 25;

export type Page<T> = {
  items: T[];
  page: number;
  pages: number;
  total: number;
  // 1-based, for "Zeige 1–25 von 61 Events."
  from: number;
  to: number;
};

export function parsePage(value: unknown): number {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : NaN;

  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export function paginate<T>(
  items: readonly T[],
  requested: number,
  size: number = PAGE_SIZE,
): Page<T> {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const page = Math.min(Math.max(1, requested), pages);
  const start = (page - 1) * size;
  const slice = items.slice(start, start + size);

  return {
    items: slice,
    page,
    pages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: start + slice.length,
  };
}

export type ListView = {
  rows: EventListRow[];
  // The owner has no event at all (EVL-01b), whatever the filter says.
  empty: boolean;
  // A filter or a search is active and nothing matches (EVL-01c).
  noMatch: boolean;
  page: Page<EventListRow>;
};

export function buildListView(
  all: readonly EventListRow[],
  options: { filter: EventFilter; query: string; page: number },
): ListView {
  const matching = sortRows(
    all.filter(
      (row) =>
        matchesFilter(row.state, options.filter) &&
        matchesQuery(row, options.query),
    ),
  );
  const page = paginate(matching, options.page);

  return {
    rows: page.items,
    empty: all.length === 0,
    noMatch: all.length > 0 && matching.length === 0,
    page,
  };
}
