import { describe, expect, it } from "vitest";

import {
  EVENT_SLUG_PATTERN,
  eventSlug,
  randomSlugSuffix,
  slugBase,
} from "../../lib/domain/event-slug";
import { formatAmountInput } from "../../lib/domain/money";

describe("event slug", () => {
  it("derives a readable base from the title", () => {
    expect(slugBase("Nacht der Klänge")).toBe("nacht-der-klaenge");
    expect(slugBase("  Straße & Büro!! ")).toBe("strasse-buero");
    expect(slugBase("Café Müller")).toBe("cafe-mueller");
  });

  it("falls back when the title gives nothing usable", () => {
    expect(slugBase("")).toBe("event");
    expect(slugBase("!!!")).toBe("event");
    expect(slugBase("日本語")).toBe("event");
  });

  it("keeps the slug valid for the database", () => {
    for (const title of ["", "A", "x".repeat(300), "Nacht der Klänge", "--"]) {
      expect(EVENT_SLUG_PATTERN.test(eventSlug(title, "abc123"))).toBe(true);
    }
  });

  it("cuts a long title without a trailing hyphen", () => {
    const slug = eventSlug(`${"ab ".repeat(40)}`, "abc123");

    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug).not.toMatch(/--/);
  });

  it("adds a random suffix of six lowercase letters or digits", () => {
    const suffix = randomSlugSuffix();

    expect(suffix).toMatch(/^[a-z0-9]{6}$/);
  });
});

describe("formatAmountInput", () => {
  it("writes cents the way they are typed", () => {
    expect(formatAmountInput(1250)).toBe("12,50");
    expect(formatAmountInput(5)).toBe("0,05");
    expect(formatAmountInput(100000)).toBe("1000,00");
  });
});
