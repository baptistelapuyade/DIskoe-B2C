import { describe, expect, it } from "vitest";

import { inSitemapWindow } from "../../lib/public/sitemap-window";

const NOW = new Date("2026-11-03T10:00:00Z");
const zone = "Europe/Berlin";

const event = (startInstant: string | null, status = "scheduled") => ({
  status,
  startInstant,
  endInstant: null,
  timezone: zone,
});

describe("inSitemapWindow", () => {
  it("keeps upcoming and recent events", () => {
    expect(inSitemapWindow(event("2026-12-01T20:00:00Z"), NOW)).toBe(true);
    expect(inSitemapWindow(event("2026-05-01T20:00:00Z"), NOW)).toBe(true);
  });

  it("drops events more than 12 months past their cut-off", () => {
    expect(inSitemapWindow(event("2025-10-01T20:00:00Z"), NOW)).toBe(false);
  });

  it("uses the cut-off, not the start, for the boundary", () => {
    // Cut-off 2025-11-04T11:00Z (next day 12:00 Berlin) + 12 months > NOW.
    expect(inSitemapWindow(event("2025-11-03T20:00:00Z"), NOW)).toBe(true);
    // Cut-off 2025-11-02T11:00Z + 12 months < NOW.
    expect(inSitemapWindow(event("2025-11-01T20:00:00Z"), NOW)).toBe(false);
  });

  it("never drops a postponed event without a date or an undatable one", () => {
    expect(inSitemapWindow(event("2020-01-01T20:00:00Z", "postponed_undated"), NOW)).toBe(true);
    expect(inSitemapWindow(event(null), NOW)).toBe(true);
  });
});
