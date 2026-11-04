import { describe, expect, it } from "vitest";

import { routeHref } from "../../lib/public/route-link";

describe("routeHref", () => {
  it("builds a map search from place name and address", () => {
    const href = routeHref("Nebenraum", ["Beispielstraße 12", "10999 Berlin"]);

    expect(href).toBe(
      "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent("Nebenraum, Beispielstraße 12, 10999 Berlin"),
    );
  });

  it("works without a place name", () => {
    expect(routeHref(null, ["Beispielstraße 12"])).toContain("Beispielstra%C3%9Fe%2012");
  });

  it("gives no link without an address", () => {
    expect(routeHref("Nebenraum", [])).toBeNull();
    expect(routeHref(null, ["  "])).toBeNull();
  });
});
