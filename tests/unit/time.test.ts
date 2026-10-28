import { describe, expect, it } from "vitest";

import {
  describeEventTime,
  formatEventTime,
  instantToLocal,
  isEndAfterStart,
  localToInstant,
} from "../../lib/domain/time";

describe("localToInstant (Europe/Berlin)", () => {
  it("uses summer time in October before the change", () => {
    expect(localToInstant("2026-10-24", "21:00")).toEqual({
      ok: true,
      instant: "2026-10-24T19:00:00.000Z",
    });
  });

  it("uses winter time in November", () => {
    expect(localToInstant("2026-11-15", "21:00")).toEqual({
      ok: true,
      instant: "2026-11-15T20:00:00.000Z",
    });
  });

  it("does not use fixed UTC hours: the same wall time differs by season", () => {
    const summer = localToInstant("2026-07-10", "20:00");
    const winter = localToInstant("2026-01-10", "20:00");

    expect(summer).toEqual({ ok: true, instant: "2026-07-10T18:00:00.000Z" });
    expect(winter).toEqual({ ok: true, instant: "2026-01-10T19:00:00.000Z" });
  });

  it("P13: a time skipped by the spring change does not exist", () => {
    expect(localToInstant("2026-03-29", "02:30")).toEqual({
      ok: false,
      reason: "nonexistent",
    });
  });

  it("P13: a time repeated by the autumn change is ambiguous", () => {
    expect(localToInstant("2026-10-25", "02:30")).toEqual({
      ok: false,
      reason: "ambiguous",
    });
  });

  it("accepts times right outside the change window", () => {
    expect(localToInstant("2026-03-29", "01:59").ok).toBe(true);
    expect(localToInstant("2026-03-29", "03:00").ok).toBe(true);
    expect(localToInstant("2026-10-25", "01:59").ok).toBe(true);
    expect(localToInstant("2026-10-25", "03:00").ok).toBe(true);
  });

  it("rejects malformed and impossible input", () => {
    for (const [date, time] of [
      ["", "21:00"],
      ["2026-10-24", ""],
      ["24.10.2026", "21:00"],
      ["2026-02-31", "21:00"],
      ["2026-13-01", "21:00"],
      ["2026-10-24", "24:00"],
      ["2026-10-24", "9:00"],
    ]) {
      expect(localToInstant(date, time)).toEqual({
        ok: false,
        reason: "invalid",
      });
    }
  });

  it("round-trips through the local view", () => {
    const result = localToInstant("2026-10-24", "21:15");

    expect(result.ok && instantToLocal(result.instant)).toEqual({
      date: "2026-10-24",
      time: "21:15",
    });
  });
});

describe("P11: night events in Europe/Berlin", () => {
  const start = "2026-10-31T22:00:00.000Z"; // 23:00 local (winter time)
  const end = "2026-11-01T03:00:00.000Z"; // 04:00 on 01.11. local

  it("shows both calendar days when the end is after midnight", () => {
    const view = describeEventTime(start, end);

    expect(view?.days).toEqual(["2026-10-31", "2026-11-01"]);
    expect(view?.startTime).toBe("23:00");
    expect(view?.endTime).toBe("04:00");
  });

  it("formats the range with both dates", () => {
    expect(formatEventTime(start, end)).toBe(
      "Sa., 31.10.2026, 23:00 Uhr bis So., 01.11.2026, 04:00 Uhr",
    );
  });

  it("keeps one day when the event ends the same evening", () => {
    const sameDay = "2026-10-31T21:00:00.000Z"; // 22:00 local
    const view = describeEventTime("2026-10-31T18:00:00.000Z", sameDay);

    expect(view?.days).toEqual(["2026-10-31"]);
  });

  it("uses the local day, not the UTC day", () => {
    // 23:30 local on 31.10. is 22:30 UTC the same day, 00:30 local on 01.11.
    // is 23:30 UTC on 31.10.: UTC says one day, Berlin says two.
    const view = describeEventTime(
      "2026-10-31T22:30:00.000Z",
      "2026-10-31T23:30:00.000Z",
    );

    expect(view?.days).toEqual(["2026-10-31", "2026-11-01"]);
  });

  it("requires the end to be after the start", () => {
    expect(isEndAfterStart(start, end)).toBe(true);
    expect(isEndAfterStart(end, start)).toBe(false);
    expect(isEndAfterStart(start, start)).toBe(false);
  });
});

describe("P12: unknown end", () => {
  it("invents no end", () => {
    const view = describeEventTime("2026-10-31T22:00:00.000Z", null);

    expect(view?.endDate).toBeNull();
    expect(view?.endTime).toBeNull();
    expect(view?.days).toEqual(["2026-10-31"]);
  });

  it("formats only the start", () => {
    expect(formatEventTime("2026-10-31T22:00:00.000Z", null)).toBe(
      "Sa., 31.10.2026, 23:00 Uhr",
    );
  });
});
