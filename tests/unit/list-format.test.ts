import { describe, expect, it } from "vitest";

import { listWhen } from "../../lib/event/list-format";

describe("listWhen", () => {
  it("local date and time in Berlin, weekday in the language", () => {
    // 19:00 UTC is 20:00 in Berlin in November.
    expect(listWhen("de", "2026-11-14T19:00:00Z")).toEqual({
      weekday: "Sa",
      date: "14.11.2026",
      time: "20:00",
    });
    expect(listWhen("en", "2026-11-14T19:00:00Z")?.weekday).toBe("Sat");
  });

  it("no leading zeros in day and month", () => {
    expect(listWhen("de", "2026-12-06T10:00:00Z")?.date).toBe("6.12.2026");
    expect(listWhen("de", "2026-04-18T10:00:00Z")?.date).toBe("18.4.2026");
  });

  it("an event after midnight local time belongs to the next day", () => {
    // 23:30 UTC on 13.11. is 00:30 on 14.11. in Berlin.
    expect(listWhen("de", "2026-11-13T23:30:00Z")).toMatchObject({
      date: "14.11.2026",
      time: "00:30",
    });
  });

  it("an invalid instant gives null", () => {
    expect(listWhen("de", "nonsense")).toBeNull();
  });
});
