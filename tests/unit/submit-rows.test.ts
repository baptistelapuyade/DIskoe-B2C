import { describe, expect, it } from "vitest";

import { EMPTY_FORM_VALUES } from "@/lib/event/values";
import type { OwnerEventView } from "@/lib/event/load";
import { eventRowsOf, gapHref } from "@/lib/submit/rows";

// Only the parts eventRowsOf reads.
function view(title: string): OwnerEventView {
  return {
    event: { id: "e1" },
    form: { ...EMPTY_FORM_VALUES, title },
    image: null,
    modules: null,
  } as unknown as OwnerEventView;
}

describe("eventRowsOf", () => {
  it("names a missing detail and links to the editor step that fixes it", () => {
    const rows = eventRowsOf("de", view(""), ["title"]);
    const title = rows.find((row) => row.key === "title");

    expect(title?.missing?.fixHref).toBe(gapHref("e1", "title"));
    expect(title?.missing?.fixHref).toBe("/organizer/events/e1/edit/basics");
  });

  it("shows entered values without gaps (the publish screen passes none)", () => {
    const rows = eventRowsOf("en", view("Bass Night"), []);
    const title = rows.find((row) => row.key === "title");

    expect(title?.text).toBe("Bass Night");
    expect(title?.missing).toBeUndefined();
  });
});
