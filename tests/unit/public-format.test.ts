import { describe, expect, it } from "vitest";

import { langFromAcceptLanguage } from "../../lib/i18n";
import {
  formatConfirmedDate,
  formatEventDate,
  yearIn,
} from "../../lib/public/format";

describe("dates on the public pages", () => {
  it("writes the weekday and the month in the language of the reader", () => {
    expect(formatEventDate("de", "2026-10-23", 2026)).toBe("Fr, 23. Oktober");
    expect(formatEventDate("en", "2026-10-23", 2026)).toBe("Fri, 23 October");
  });

  it("adds the year only when it is not the current one", () => {
    expect(formatEventDate("de", "2027-01-02", 2026)).toBe(
      "Sa, 2. Januar 2027",
    );
    expect(formatEventDate("en", "2027-01-02", 2026)).toBe(
      "Sat, 2 January 2027",
    );
  });

  it("gives back a value that is no date as it is", () => {
    expect(formatEventDate("de", "bald", 2026)).toBe("bald");
  });

  it("takes the day of confirmation in the zone of the event", () => {
    // 23:30 UTC on 19 October is already 20 October in Berlin.
    expect(formatConfirmedDate("de", "2026-10-19T22:30:00Z")).toBe(
      "20. Oktober 2026",
    );
    expect(formatConfirmedDate("en", "2026-10-19T22:30:00Z")).toBe(
      "20 October 2026",
    );
    expect(formatConfirmedDate("de", null)).toBeNull();
    expect(formatConfirmedDate("de", "kaputt")).toBeNull();
  });

  it("reads the year of now in the zone of the event", () => {
    expect(yearIn("Europe/Berlin", new Date("2026-12-31T23:30:00Z"))).toBe(
      2027,
    );
    expect(yearIn("UTC", new Date("2026-12-31T23:30:00Z"))).toBe(2026);
  });
});

describe("language from the browser header", () => {
  it("takes the first supported language by weight", () => {
    expect(langFromAcceptLanguage("de-DE,de;q=0.9,en;q=0.8")).toBe("de");
    expect(langFromAcceptLanguage("en-US,en;q=0.9,de;q=0.8")).toBe("en");
    expect(langFromAcceptLanguage("fr;q=0.9, de;q=0.8, en;q=0.4")).toBe("de");
    expect(langFromAcceptLanguage("en;q=0.5, de;q=0.9")).toBe("de");
  });

  it("falls back to English for no header, other languages and a weight of zero", () => {
    expect(langFromAcceptLanguage(null)).toBe("en");
    expect(langFromAcceptLanguage("")).toBe("en");
    expect(langFromAcceptLanguage("fr-FR,fr;q=0.9")).toBe("en");
    expect(langFromAcceptLanguage("de;q=0")).toBe("en");
  });
});
