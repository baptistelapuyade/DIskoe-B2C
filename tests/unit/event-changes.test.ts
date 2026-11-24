import { describe, expect, it } from "vitest";

import {
  diffEventContent,
  hasEventChanges,
  type EventContent,
} from "../../lib/domain/event-changes";

const base: EventContent = {
  title: "Sommerfest im Hof",
  description: "Ein Abend im Hof.",
  format: "party",
  startDate: "2026-11-14",
  startTime: "20:00",
  endDate: null,
  endTime: null,
  placeName: "Hof am Kanal",
  address: "Kanalstraße 12, 10999 Berlin",
  price: "12,00 €",
  access: "Abendkasse",
  atmosphere: null,
  imageUseId: "img-1",
  modules: null,
};

describe("diffEventContent", () => {
  it("identical content is no change (EVB-03c)", () => {
    expect(diffEventContent(base, { ...base })).toEqual([]);
    expect(hasEventChanges(base, { ...base })).toBe(false);
  });

  it("whitespace and empty text are not changes", () => {
    expect(
      hasEventChanges(base, {
        ...base,
        title: "  Sommerfest im Hof ",
        atmosphere: "  ",
      }),
    ).toBe(false);
  });

  it("start and place show before and after (EVM-01b, EVB-03a)", () => {
    const changes = diffEventContent(base, {
      ...base,
      startTime: "21:00",
      placeName: "Kellerbühne",
    });

    expect(changes).toEqual([
      {
        field: "start",
        kind: "values",
        before: "2026-11-14T20:00",
        after: "2026-11-14T21:00",
      },
      {
        field: "place",
        kind: "values",
        before: "Hof am Kanal",
        after: "Kellerbühne",
      },
    ]);
  });

  it("a long text only says that it changed", () => {
    expect(
      diffEventContent(base, { ...base, description: "Neuer Text." }),
    ).toEqual([{ field: "description", kind: "changed" }]);
  });

  it("added and removed content", () => {
    expect(diffEventContent(base, { ...base, atmosphere: "Laut" })).toEqual([
      { field: "atmosphere", kind: "added" },
    ]);
    expect(diffEventContent(base, { ...base, imageUseId: null })).toEqual([
      { field: "image", kind: "removed" },
    ]);
    expect(diffEventContent(base, { ...base, imageUseId: "img-2" })).toEqual([
      { field: "image", kind: "changed" },
    ]);
  });

  it("an unanswered price stays unanswered, not 'free'", () => {
    expect(
      diffEventContent({ ...base, price: null }, { ...base, price: null }),
    ).toEqual([]);
    expect(diffEventContent(base, { ...base, price: null })).toEqual([
      { field: "price", kind: "values", before: "12,00 €", after: null },
    ]);
  });

  it("changes come in the order of the form", () => {
    const fields = diffEventContent(base, {
      ...base,
      address: "Anderswo 1",
      title: "Neu",
      startDate: "2026-11-15",
    }).map((c) => c.field);

    expect(fields).toEqual(["title", "start", "address"]);
  });
});
