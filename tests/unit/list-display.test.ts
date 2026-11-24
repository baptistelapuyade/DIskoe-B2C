import { describe, expect, it } from "vitest";

import type { EventListRow } from "../../lib/domain/event-list";
import { toRowDisplay } from "../../lib/event/list-display";

const row = (patch: Partial<EventListRow>): EventListRow => ({
  id: "e1",
  title: "Sommerfest im Hof",
  startAt: "2026-11-14T19:00:00Z",
  placeName: "Hof am Kanal",
  city: "Berlin",
  state: "live",
  ...patch,
});

describe("toRowDisplay", () => {
  it("EVL-01a: live event", () => {
    expect(toRowDisplay("de", row({}))).toMatchObject({
      title: "Sommerfest im Hof",
      line: "Sa, 14.11.2026, 20:00 · Hof am Kanal, Berlin",
      stateLabel: "Live",
      tone: "success",
      actionLabel: "Verwalten",
      actionHref: "/organizer/events/e1/manage",
      actionName: "Verwalten: Sommerfest im Hof",
    });
  });

  it("private draft continues editing", () => {
    expect(toRowDisplay("de", row({ state: "private" }))).toMatchObject({
      stateLabel: "Privater Entwurf",
      actionLabel: "Weiter bearbeiten",
      actionHref: "/organizer/events/e1/edit",
    });
  });

  it("in review and question are view-only", () => {
    for (const state of ["inReview", "question"] as const) {
      expect(toRowDisplay("de", row({ state }))).toMatchObject({
        actionLabel: "Eingereichtes ansehen",
        actionHref: "/organizer/events/e1/review",
      });
    }
  });

  it("postponed shows 'new date to follow' instead of a date", () => {
    expect(
      toRowDisplay(
        "de",
        row({ state: "postponed", startAt: null, placeName: "Haus 4" }),
      ).line,
    ).toBe("Neuer Termin folgt · Haus 4, Berlin");
  });

  it("cancelled and past show the day without the time", () => {
    expect(toRowDisplay("de", row({ state: "cancelled" })).line).toBe(
      "Sa, 14.11.2026 · Hof am Kanal, Berlin",
    );
    expect(toRowDisplay("de", row({ state: "past" })).line).toBe(
      "Sa, 14.11.2026 · Hof am Kanal, Berlin",
    );
  });

  it("an unknown date is said, never blank or invented", () => {
    expect(
      toRowDisplay("de", row({ state: "private", startAt: null })).line,
    ).toBe("Termin noch offen · Hof am Kanal, Berlin");
  });

  it("no title and no place", () => {
    const d = toRowDisplay(
      "de",
      row({ title: null, placeName: null, city: null }),
    );

    expect(d.title).toBe("Ohne Titel");
    expect(d.line).toBe("Sa, 14.11.2026, 20:00");
  });

  it("English", () => {
    expect(toRowDisplay("en", row({})).line).toBe(
      "Sat, 14.11.2026, 20:00 · Hof am Kanal, Berlin",
    );
    expect(toRowDisplay("en", row({})).actionLabel).toBe("Manage");
  });
});
