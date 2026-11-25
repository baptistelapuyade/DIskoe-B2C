import { describe, expect, it } from "vitest";

import { checkReschedule } from "../../lib/domain/event-reschedule";
import { statusWhen } from "../../lib/event/status-display";

const NOW = new Date("2026-11-10T12:00:00Z");
// Sa 14.11.2026, 20:00 in Berlin
const CURRENT = "2026-11-14T19:00:00.000Z";

const EMPTY = { startDate: "", startTime: "", endDate: "", endTime: "" };

describe("checkReschedule (EVV-01, EVV-05)", () => {
  it("accepts a future start without an end", () => {
    expect(
      checkReschedule(
        { ...EMPTY, startDate: "2026-11-21", startTime: "20:00" },
        CURRENT,
        NOW,
      ),
    ).toEqual({ ok: true, start: "2026-11-21T19:00:00.000Z", end: null });
  });

  it("accepts a start with an end on the next day", () => {
    expect(
      checkReschedule(
        {
          startDate: "2026-11-21",
          startTime: "20:00",
          endDate: "2026-11-22",
          endTime: "04:00",
        },
        CURRENT,
        NOW,
      ),
    ).toEqual({
      ok: true,
      start: "2026-11-21T19:00:00.000Z",
      end: "2026-11-22T03:00:00.000Z",
    });
  });

  it("names the missing start fields", () => {
    expect(checkReschedule(EMPTY, CURRENT, NOW)).toEqual({
      ok: false,
      errors: { startDate: "dateMissing", startTime: "timeMissing" },
    });
  });

  it("refuses a start in the past (EVV-01b)", () => {
    expect(
      checkReschedule(
        { ...EMPTY, startDate: "2026-11-09", startTime: "20:00" },
        CURRENT,
        NOW,
      ),
    ).toEqual({ ok: false, errors: { startDate: "startPast" } });
  });

  it("refuses the start that is already public", () => {
    expect(
      checkReschedule(
        { ...EMPTY, startDate: "2026-11-14", startTime: "20:00" },
        CURRENT,
        NOW,
      ),
    ).toEqual({ ok: false, errors: { startDate: "startUnchanged" } });
  });

  it("takes any future start when the current start is unknown", () => {
    expect(
      checkReschedule(
        { ...EMPTY, startDate: "2026-11-14", startTime: "20:00" },
        null,
        NOW,
      ).ok,
    ).toBe(true);
  });

  it("refuses an end before the start", () => {
    expect(
      checkReschedule(
        {
          startDate: "2026-11-21",
          startTime: "20:00",
          endDate: "2026-11-21",
          endTime: "19:00",
        },
        CURRENT,
        NOW,
      ),
    ).toEqual({ ok: false, errors: { endDate: "endBeforeStart" } });
  });

  it("names half an end instead of dropping it", () => {
    expect(
      checkReschedule(
        {
          ...EMPTY,
          startDate: "2026-11-21",
          startTime: "20:00",
          endTime: "04:00",
        },
        CURRENT,
        NOW,
      ),
    ).toEqual({ ok: false, errors: { endDate: "dateMissing" } });
  });

  it("names a date that cannot be read and a time that does not exist", () => {
    expect(
      checkReschedule(
        { ...EMPTY, startDate: "31.02.2027", startTime: "20:00" },
        CURRENT,
        NOW,
      ),
    ).toEqual({ ok: false, errors: { startDate: "dateInvalid" } });
    expect(
      checkReschedule(
        { ...EMPTY, startDate: "2027-03-28", startTime: "02:30" },
        CURRENT,
        NOW,
      ),
    ).toEqual({ ok: false, errors: { startTime: "timeNonexistent" } });
  });
});

describe("statusWhen", () => {
  const same = {
    startDate: "2026-11-14",
    startTime: "20:00",
    endDate: "2026-11-14",
    endTime: "23:30",
  };

  it("shows start and end of one day on one line", () => {
    expect(statusWhen("de", same)).toBe("Sa, 14.11.2026, 20:00 → 23:30");
  });

  it("names the second day of a night event", () => {
    expect(
      statusWhen("de", {
        ...same,
        startDate: "2026-11-21",
        endDate: "2026-11-22",
        endTime: "04:00",
      }),
    ).toBe("Sa, 21.11.2026, 20:00 → So, 22.11.2026, 04:00");
    expect(
      statusWhen("en", {
        ...same,
        startDate: "2026-11-21",
        endDate: "2026-11-22",
        endTime: "04:00",
      }),
    ).toBe("Sat, 21.11.2026, 20:00 → Sun, 22.11.2026, 04:00");
  });

  it("shows only the start when the end is unknown", () => {
    expect(statusWhen("de", { ...same, endDate: "", endTime: "" })).toBe(
      "Sa, 14.11.2026, 20:00",
    );
  });

  it("has no text without a readable start", () => {
    expect(statusWhen("de", { ...same, startDate: "" })).toBeNull();
  });
});
