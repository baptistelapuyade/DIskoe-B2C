import { describe, expect, it } from "vitest";

import {
  buildListView,
  listState,
  matchesFilter,
  matchesQuery,
  paginate,
  parseFilter,
  parsePage,
  sortRows,
  type EventListRow,
  type EventListState,
} from "../../lib/domain/event-list";

const NOW = new Date("2026-11-24T12:00:00Z");
const base = {
  published: true,
  draftDiffers: false,
  status: "scheduled" as const,
  archiveAt: "2026-12-01T11:00:00Z",
  review: null,
  now: NOW,
};

describe("listState", () => {
  it("never published: private, in review, question", () => {
    expect(listState({ ...base, published: false })).toBe("private");
    expect(listState({ ...base, published: false, review: "in_review" })).toBe(
      "inReview",
    );
    expect(listState({ ...base, published: false, review: "question" })).toBe(
      "question",
    );
  });

  it("published: live, changes, postponed, cancelled, past", () => {
    expect(listState(base)).toBe("live");
    expect(listState({ ...base, draftDiffers: true })).toBe("changes");
    expect(listState({ ...base, status: "postponed_undated" })).toBe(
      "postponed",
    );
    expect(listState({ ...base, status: "cancelled" })).toBe("cancelled");
    expect(listState({ ...base, archiveAt: "2026-11-01T11:00:00Z" })).toBe(
      "past",
    );
  });

  it("a cancelled or postponed event is never 'past' or 'changes'", () => {
    const old = { ...base, archiveAt: "2026-01-01T00:00:00Z" };

    expect(listState({ ...old, status: "cancelled" })).toBe("cancelled");
    expect(
      listState({ ...old, status: "postponed_undated", draftDiffers: true }),
    ).toBe("postponed");
  });

  it("a rescheduled event can be over", () => {
    expect(
      listState({
        ...base,
        status: "rescheduled",
        archiveAt: "2026-11-24T12:00:00Z",
      }),
    ).toBe("past");
  });
});

function row(
  id: string,
  state: EventListState,
  startAt: string | null,
  title: string | null = id,
  placeName: string | null = "Kellerbühne",
  city: string | null = "Berlin",
): EventListRow {
  return { id, title, startAt, placeName, city, state };
}

describe("filter", () => {
  const states: EventListState[] = [
    "live",
    "changes",
    "private",
    "inReview",
    "question",
    "postponed",
    "cancelled",
    "past",
  ];
  const pick = (filter: Parameters<typeof matchesFilter>[1]) =>
    states.filter((s) => matchesFilter(s, filter));

  it("upcoming hides the archive and cancelled events", () => {
    expect(pick("upcoming")).toEqual([
      "live",
      "changes",
      "private",
      "inReview",
      "question",
      "postponed",
    ]);
  });

  it("all, drafts, past", () => {
    expect(pick("all")).toEqual(states);
    expect(pick("drafts")).toEqual(["private", "inReview", "question"]);
    expect(pick("past")).toEqual(["past"]);
  });

  it("an unknown value is the default", () => {
    expect(parseFilter("nonsense")).toBe("upcoming");
    expect(parseFilter(undefined)).toBe("upcoming");
    expect(parseFilter("past")).toBe("past");
  });
});

describe("search", () => {
  const r = row(
    "1",
    "live",
    null,
    "Sommerfest im Hof",
    "Hof am Kanal",
    "Berlin",
  );

  it("finds title and place, ignoring case and accents", () => {
    expect(matchesQuery(r, "sommer")).toBe(true);
    expect(matchesQuery(r, "KANAL")).toBe(true);
    expect(matchesQuery(r, "berlin")).toBe(true);
    expect(
      matchesQuery(row("2", "live", null, "Café", null, null), "cafe"),
    ).toBe(true);
    expect(matchesQuery(r, "Open Mic")).toBe(false);
  });

  it("an empty search matches everything", () => {
    expect(matchesQuery(r, "")).toBe(true);
    expect(matchesQuery(r, "   ")).toBe(true);
  });

  it("a row without title still matches by place", () => {
    expect(matchesQuery(row("3", "private", null, null), "keller")).toBe(true);
  });
});

describe("sortRows", () => {
  it("current events by start, undated last, then postponed, cancelled, archive (latest first)", () => {
    const rows = [
      row("past-old", "past", "2026-01-01T10:00:00Z"),
      row("past-new", "past", "2026-04-18T10:00:00Z"),
      row("cancelled", "cancelled", "2026-12-06T10:00:00Z"),
      row("postponed", "postponed", null),
      row("undated", "private", null),
      row("late", "live", "2026-11-27T20:00:00Z"),
      row("early", "live", "2026-11-14T19:00:00Z"),
    ];

    expect(sortRows(rows).map((r) => r.id)).toEqual([
      "early",
      "late",
      "undated",
      "postponed",
      "cancelled",
      "past-new",
      "past-old",
    ]);
  });

  it("does not change the input", () => {
    const rows = [
      row("b", "live", "2026-11-27T20:00:00Z"),
      row("a", "live", null),
    ];
    sortRows(rows);

    expect(rows.map((r) => r.id)).toEqual(["b", "a"]);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 61 }, (_, i) => i + 1);

  it("25 per page: 1-25 of 61, page 1 of 3", () => {
    const p = paginate(items, 1);

    expect(p).toMatchObject({ page: 1, pages: 3, total: 61, from: 1, to: 25 });
    expect(p.items).toHaveLength(25);
  });

  it("last page holds the rest", () => {
    const p = paginate(items, 3);

    expect(p).toMatchObject({ page: 3, from: 51, to: 61 });
    expect(p.items).toHaveLength(11);
  });

  it("a page beyond the end shows the last page", () => {
    expect(paginate(items, 99).page).toBe(3);
    expect(paginate(items, 0).page).toBe(1);
  });

  it("empty list: one page, from 0 to 0", () => {
    expect(paginate([], 1)).toMatchObject({
      pages: 1,
      total: 0,
      from: 0,
      to: 0,
    });
  });

  it("parsePage accepts only whole numbers from 1", () => {
    expect(parsePage("2")).toBe(2);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("x")).toBe(1);
    expect(parsePage(undefined)).toBe(1);
  });
});

describe("buildListView", () => {
  const all = [
    row("a", "live", "2026-11-14T19:00:00Z", "Sommerfest"),
    row("b", "private", "2026-11-20T18:00:00Z", "Open Mic"),
    row("c", "past", "2026-04-18T10:00:00Z", "Frühlingsfest"),
  ];
  const opts = { filter: "upcoming" as const, query: "", page: 1 };

  it("EVL-01a: upcoming events", () => {
    const view = buildListView(all, opts);

    expect(view.rows.map((r) => r.id)).toEqual(["a", "b"]);
    expect(view.empty).toBe(false);
    expect(view.noMatch).toBe(false);
  });

  it("EVL-01b: no event at all", () => {
    expect(buildListView([], opts)).toMatchObject({
      empty: true,
      noMatch: false,
    });
  });

  it("EVL-01c: events exist, nothing matches the search", () => {
    expect(buildListView(all, { ...opts, query: "Sommer Open" })).toMatchObject(
      {
        empty: false,
        noMatch: true,
      },
    );
  });

  it("a filter without events is 'no match', not 'empty'", () => {
    const view = buildListView([all[0]], { ...opts, filter: "past" });

    expect(view).toMatchObject({ empty: false, noMatch: true });
  });
});
