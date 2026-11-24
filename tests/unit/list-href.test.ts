import { describe, expect, it } from "vitest";

import { listHref } from "../../lib/event/list-href";

describe("listHref", () => {
  it("defaults give the plain address", () => {
    expect(listHref({})).toBe("/organizer/events");
    expect(listHref({ query: "  ", filter: "upcoming", page: 1 })).toBe(
      "/organizer/events",
    );
  });

  it("search, filter and page", () => {
    expect(listHref({ query: "Open Mic", filter: "all", page: 2 })).toBe(
      "/organizer/events?q=Open+Mic&state=all&page=2",
    );
    expect(listHref({ filter: "past" })).toBe("/organizer/events?state=past");
  });
});
