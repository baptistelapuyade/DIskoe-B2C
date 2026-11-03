import { describe, expect, it } from "vitest";

import { buildRobots } from "../../lib/public/robots-rules";
import { indexingEnabled } from "../../lib/public/site";

describe("indexingEnabled", () => {
  it("opens only for the exact value on", () => {
    expect(indexingEnabled({ SITE_INDEXING: "on" })).toBe(true);
  });

  it("stays closed for a missing, empty or different value", () => {
    for (const value of [undefined, "", "true", "ON", "1", "off"]) {
      expect(indexingEnabled({ SITE_INDEXING: value })).toBe(false);
    }
  });
});

describe("buildRobots", () => {
  it("closed: disallows everything and names no sitemap", () => {
    const robots = buildRobots(false, "https://x.test");
    expect(robots.rules).toEqual({ userAgent: "*", disallow: "/" });
    expect(robots.sitemap).toBeUndefined();
  });

  it("open: keeps private areas out and names the sitemap", () => {
    const robots = buildRobots(true, "https://x.test");
    expect(robots.sitemap).toBe("https://x.test/sitemap.xml");
    expect(JSON.stringify(robots.rules)).toContain("/organizer");
  });
});
