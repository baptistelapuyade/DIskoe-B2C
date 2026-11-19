import { describe, expect, it } from "vitest";

import {
  firstOpenStep,
  isMissingCode,
  noticeKind,
  validateStep,
} from "../../lib/domain/event-steps";

describe("step 1: basics (EVT-01)", () => {
  it("names a missing title and format on 'next' (EVT-01b)", () => {
    expect(validateStep("basics", { description: "Ein Abend." }, "next")).toEqual({
      title: "titleMissing",
      format: "formatMissing",
    });
  });

  it("saves an empty step on 'later'", () => {
    expect(validateStep("basics", {}, "later")).toEqual({});
  });

  it("refuses text that is too long and a format that is not offered", () => {
    expect(
      validateStep(
        "basics",
        { title: "x".repeat(121), format: "workshop", description: "y".repeat(2001) },
        "later",
      ),
    ).toEqual({
      title: "titleTooLong",
      format: "formatInvalid",
      description: "descriptionTooLong",
    });
  });

  it("is complete with title and format; the description is checked at submit", () => {
    expect(validateStep("basics", { title: "Nacht", format: "club_night" }, "next")).toEqual({});
  });
});

describe("step 2: date and time (EVT-02)", () => {
  it("accepts a start and an optional end", () => {
    expect(
      validateStep(
        "time",
        { startDate: "2026-11-20", startTime: "22:00", endDate: "2026-11-21", endTime: "04:00" },
        "next",
      ),
    ).toEqual({});
  });

  it("does not require a start on 'next' (the submit check names it)", () => {
    expect(validateStep("time", {}, "next")).toEqual({});
  });

  it("marks the end date when the end is before the start (EVT-02b)", () => {
    expect(
      validateStep(
        "time",
        { startDate: "2026-11-20", startTime: "22:00", endDate: "2026-11-19", endTime: "04:00" },
        "next",
      ),
    ).toEqual({ endDate: "endBeforeStart" });
  });

  it("names the half that is missing, also on 'later'", () => {
    expect(validateStep("time", { startDate: "2026-11-20" }, "later")).toEqual({
      startTime: "timeMissing",
    });
    expect(validateStep("time", { startTime: "22:00" }, "later")).toEqual({
      startDate: "dateMissing",
    });
  });

  it("refuses an invalid date and an invalid time", () => {
    expect(
      validateStep("time", { startDate: "31.02.2026", startTime: "25:00" }, "later"),
    ).toEqual({ startDate: "dateInvalid", startTime: "timeInvalid" });
    expect(
      validateStep("time", { startDate: "2026-02-31", startTime: "20:00" }, "later"),
    ).toEqual({ startDate: "dateInvalid" });
  });

  it("reports a time that does not exist at the daylight saving change", () => {
    expect(
      validateStep("time", { startDate: "2027-03-28", startTime: "02:30" }, "later"),
    ).toEqual({ startTime: "timeNonexistent" });
  });

  it("ignores a typed end when the end is deliberately unknown", () => {
    expect(
      validateStep(
        "time",
        {
          startDate: "2026-11-20",
          startTime: "22:00",
          endDate: "2026-11-19",
          endTime: "04:00",
          endUnknown: true,
        },
        "next",
      ),
    ).toEqual({});
  });
});

describe("step 3: place (EVT-03)", () => {
  it("names street and city when they are missing (EVT-03b)", () => {
    expect(
      validateStep("place", { placeName: "Nebenraum", postalCode: "10997" }, "next"),
    ).toEqual({ addressLine: "streetMissing", city: "cityMissing" });
  });

  it("keeps a half-filled place on 'later'", () => {
    expect(validateStep("place", { placeName: "Nebenraum" }, "later")).toEqual({});
  });

  it("does not need a postal code", () => {
    expect(
      validateStep(
        "place",
        { placeName: "Nebenraum", addressLine: "Hinterhof 4", city: "Berlin" },
        "next",
      ),
    ).toEqual({});
  });

  it("refuses a part that is too long", () => {
    expect(validateStep("place", { city: "x".repeat(81) }, "later")).toEqual({
      city: "cityTooLong",
    });
  });
});

describe("notice text and progress", () => {
  it("says 'missing' only when every error is a missing field", () => {
    expect(noticeKind({ title: "titleMissing", format: "formatMissing" })).toBe("missing");
    expect(noticeKind({ title: "titleMissing", description: "descriptionTooLong" })).toBe(
      "invalid",
    );
  });

  it("names the end-before-start problem in full (EVT-02b)", () => {
    expect(noticeKind({ endDate: "endBeforeStart" })).toBe("endBeforeStart");
    expect(isMissingCode("endBeforeStart")).toBe(false);
  });

  it("goes back to the first step that is not complete", () => {
    expect(firstOpenStep({ title: true, format: false, start: true, place: true })).toBe("basics");
    expect(firstOpenStep({ title: true, format: true, start: false, place: false })).toBe("time");
    expect(firstOpenStep({ title: true, format: true, start: true, place: false })).toBe("place");
  });
});
