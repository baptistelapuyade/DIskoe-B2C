import { describe, expect, it } from "vitest";

import {
  calendarDateToIso,
  formatDateInput,
  isoToCalendarDate,
  nextDayIso,
  parseDateInput,
} from "../../lib/event/date-input";

describe("parseDateInput", () => {
  it("reads day first with . / - and the ISO form", () => {
    for (const raw of ["20.11.2026", "20/11/2026", "20-11-2026", "2026-11-20", " 20.11.2026 "]) {
      expect(parseDateInput(raw)).toEqual({ ok: true, iso: "2026-11-20" });
    }
  });

  it("reads one-digit day and month", () => {
    expect(parseDateInput("5.1.2027")).toEqual({ ok: true, iso: "2027-01-05" });
  });

  it("treats empty text as nothing entered", () => {
    expect(parseDateInput("  ")).toEqual({ ok: true, iso: "" });
  });

  it("refuses what is not a real date", () => {
    for (const raw of ["31.02.2026", "20.13.2026", "20.11.26", "morgen", "1999-12-31", "2101-01-01"]) {
      expect(parseDateInput(raw)).toEqual({ ok: false });
    }
  });
});

describe("formatDateInput and calendar helpers", () => {
  it("writes the date the way the language does", () => {
    expect(formatDateInput("2026-11-20", "de")).toBe("20.11.2026");
    expect(formatDateInput("2026-11-20", "en")).toBe("20/11/2026");
  });

  it("leaves text that is not an ISO date as typed", () => {
    expect(formatDateInput("morgen", "de")).toBe("morgen");
  });

  it("goes to the calendar and back without moving the day", () => {
    const date = isoToCalendarDate("2026-11-20");

    expect(date && calendarDateToIso(date)).toBe("2026-11-20");
    expect(isoToCalendarDate("20.11.2026")).toBeUndefined();
  });

  it("finds the next day across a month end", () => {
    expect(nextDayIso("2026-11-30")).toBe("2026-12-01");
    expect(nextDayIso("")).toBe("");
  });
});
