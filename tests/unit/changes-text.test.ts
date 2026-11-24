import { describe, expect, it } from "vitest";

import { changeRows } from "../../lib/event/changes-text";

describe("changeRows", () => {
  it("EVM-01b: start on the same day shows only the times", () => {
    expect(
      changeRows("de", [
        {
          field: "start",
          kind: "values",
          before: "2026-11-14T20:00",
          after: "2026-11-14T21:00",
        },
        { field: "description", kind: "changed" },
      ]),
    ).toEqual([
      {
        field: "start",
        label: "Beginn",
        value: "Bisher 20:00 Uhr · Neu 21:00 Uhr",
      },
      { field: "description", label: "Beschreibung", value: "Geändert" },
    ]);
  });

  it("a start on another day shows weekday and date", () => {
    const [row] = changeRows("de", [
      {
        field: "start",
        kind: "values",
        before: "2026-11-14T20:00",
        after: "2026-11-15T20:00",
      },
    ]);

    expect(row.value).toBe(
      "Bisher Sa, 14.11.2026, 20:00 Uhr · Neu So, 15.11.2026, 20:00 Uhr",
    );
  });

  it("place: before and after (EVM-01b)", () => {
    expect(
      changeRows("de", [
        {
          field: "place",
          kind: "values",
          before: "Hof am Kanal",
          after: "Kellerbühne",
        },
      ])[0].value,
    ).toBe("Bisher Hof am Kanal · Neu Kellerbühne");
  });

  it("an empty side is said, not left blank", () => {
    expect(
      changeRows("de", [
        { field: "price", kind: "values", before: null, after: "12,00 €" },
      ])[0].value,
    ).toBe("Bisher Nichts angegeben · Neu 12,00 €");
  });

  it("added, removed and English", () => {
    expect(
      changeRows("de", [{ field: "image", kind: "added" }])[0],
    ).toMatchObject({
      label: "Eventbild",
      value: "Neu",
    });
    expect(
      changeRows("en", [{ field: "image", kind: "removed" }])[0].value,
    ).toBe("Removed");
    expect(
      changeRows("en", [
        {
          field: "start",
          kind: "values",
          before: "2026-11-14T20:00",
          after: "2026-11-14T21:00",
        },
      ])[0].value,
    ).toBe("Before 20:00 · Now 21:00");
  });
});
