import { describe, expect, it } from "vitest";

import { EMPTY_FORM_VALUES, type EventFormValues } from "../../lib/event/values";
import {
  accessSummary,
  atmosphereText,
  berlinClock,
  formatAmount,
  formatDateOnly,
  formatDay,
  formatName,
  formatStamp,
  linksSummary,
  moreSummary,
  placeSummary,
  priceSummary,
  whenSummary,
} from "../../lib/submit/format";

function form(overrides: Partial<EventFormValues> = {}): EventFormValues {
  return { ...EMPTY_FORM_VALUES, ...overrides };
}

describe("dates in the language of the organizer", () => {
  it("writes the weekday and date as in the frame", () => {
    expect(formatDay("de", "2026-11-20")).toBe("Fr, 20.11.2026");
    expect(formatDay("en", "2026-11-20")).toBe("Fri, 20 Nov 2026");
    expect(formatDay("de", "2026-11-21", false)).toBe("Sa, 21.11.");
    expect(formatDateOnly("en", "2026-11-06")).toBe("6 Nov 2026");
  });

  it("reads the Berlin wall clock of an instant, summer and winter", () => {
    expect(berlinClock("2026-11-06T13:32:00Z")).toEqual({
      date: "2026-11-06",
      time: "14:32",
    });
    expect(berlinClock("2026-07-01T21:30:00Z")).toEqual({
      date: "2026-07-01",
      time: "23:30",
    });
    expect(formatStamp("de", "2026-11-06T13:32:00Z")).toBe(
      "Fr, 6.11.2026, 14:32",
    );
  });

  it("shows start and end like the frame", () => {
    const v = form({
      startDate: "2026-11-20",
      startTime: "22:00",
      endDate: "2026-11-21",
      endTime: "04:00",
    });

    expect(whenSummary("de", v)).toBe(
      "Fr, 20.11.2026, 22:00 bis Sa, 21.11., 04:00 (Berlin)",
    );
    expect(whenSummary("en", v)).toBe(
      "Fri, 20 Nov 2026, 22:00 to Sat, 21 Nov, 04:00 (Berlin)",
    );
  });

  it("shows only the time of the end on the same day and the year when it changes", () => {
    expect(
      whenSummary(
        "de",
        form({
          startDate: "2026-11-20",
          startTime: "19:00",
          endDate: "2026-11-20",
          endTime: "23:00",
        }),
      ),
    ).toBe("Fr, 20.11.2026, 19:00 bis 23:00 (Berlin)");
    expect(
      whenSummary(
        "de",
        form({
          startDate: "2026-12-31",
          startTime: "22:00",
          endDate: "2027-01-01",
          endTime: "03:00",
        }),
      ),
    ).toBe("Do, 31.12.2026, 22:00 bis Fr, 1.1.2027, 03:00 (Berlin)");
  });

  it("has no end text for an unknown end and nothing without a start", () => {
    expect(
      whenSummary(
        "en",
        form({ startDate: "2026-11-20", startTime: "22:00", endUnknown: true }),
      ),
    ).toBe("Fri, 20 Nov 2026, 22:00 (Berlin)");
    expect(whenSummary("de", form())).toBeNull();
  });
});

describe("price: unknown is never free", () => {
  it("formats amounts per language", () => {
    expect(formatAmount("de", 1200)).toBe("12,00 €");
    expect(formatAmount("en", 1200)).toBe("€12.00");
    expect(formatAmount("de", 123450)).toBe("1.234,50 €");
    expect(formatAmount("en", 123450)).toBe("€1,234.50");
  });

  it("shows the price forms", () => {
    expect(priceSummary("de", form({ priceModel: "fixed", priceAmount: "12" }))).toBe(
      "12,00 €",
    );
    expect(priceSummary("en", form({ priceModel: "free" }))).toBe("Free");
    expect(
      priceSummary(
        "de",
        form({ priceModel: "from_price", priceAmount: "8", priceFees: "included" }),
      ),
    ).toBe("ab 8,00 € inkl. Gebühren");
    expect(
      priceSummary(
        "en",
        form({ priceModel: "range", priceAmount: "10", priceAmountMax: "15" }),
      ),
    ).toBe("€10.00–€15.00");
    expect(priceSummary("en", form({ priceModel: "min_donation", priceAmount: "5" }))).toBe(
      "Admission by donation, from €5.00",
    );
  });

  it("answers 'not known yet' as such and nothing while unanswered", () => {
    expect(priceSummary("en", form({ priceModel: "unknown" }))).toBe(
      "Price not known yet",
    );
    expect(priceSummary("de", form({ priceModel: "unknown" }))).not.toBe("Frei");
    expect(priceSummary("de", form())).toBeNull();
    expect(priceSummary("de", form({ priceModel: "fixed", priceAmount: "" }))).toBeNull();
  });
});

describe("the other rows", () => {
  it("names format, access and atmosphere in both languages", () => {
    const v = form({
      format: "club_night",
      accessKinds: ["door", "online_ticket"],
      atmosphereTags: ["Intim/persönlich", "Experimentell"],
    });

    expect(formatName("de", v)).toBe("Party/Club");
    expect(accessSummary("de", v)).toBe("Abendkasse, Online-Ticket");
    expect(atmosphereText("de", v)).toBe("Intim/persönlich, Experimentell");
    expect(accessSummary("en", v)).toContain(", ");
    expect(atmosphereText("en", form())).toBeNull();
  });

  it("joins the place from the saved parts", () => {
    expect(
      placeSummary(
        form({
          placeName: "Nebenraum",
          addressLine: "Hinterhof 12",
          postalCode: "10997",
          city: "Berlin",
        }),
      ),
    ).toBe("Nebenraum, Hinterhof 12, 10997 Berlin");
    expect(placeSummary(form())).toBeNull();
  });

  it("sums up the links without protocol and with the @ of Instagram", () => {
    expect(
      linksSummary({
        officialUrl: "https://www.nebenraum.example/",
        instagramHandle: "nebenraum",
        extraLinks: [],
        publicContact: null,
      }),
    ).toBe("nebenraum.example · @nebenraum");
    expect(
      linksSummary({
        officialUrl: null,
        instagramHandle: null,
        extraLinks: [],
        publicContact: null,
      }),
    ).toBeNull();
  });

  it("has no 'more' text without answered blocks", () => {
    expect(moreSummary("de", null)).toBeNull();
    expect(moreSummary("de", {})).toBeNull();
    expect(
      moreSummary("en", {
        visit_mode: {
          mode: "drop_in",
          window_from: "18:00",
          window_to: null,
          short_visit: null,
        },
      }),
    ).toContain("18:00");
  });
});
