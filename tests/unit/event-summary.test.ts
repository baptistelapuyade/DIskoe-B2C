import { describe, expect, it } from "vitest";

import {
  accessText,
  atmosphereSummary,
  placeText,
  priceAccessSummary,
  priceText,
  whenText,
} from "../../lib/event/summary";
import {
  EMPTY_FORM_VALUES,
  type EventFormValues,
} from "../../lib/event/values";

const base: EventFormValues = { ...EMPTY_FORM_VALUES };

describe("price text", () => {
  it("never shows Frei for an unanswered price", () => {
    expect(priceText("de", base)).toBeNull();
    expect(priceAccessSummary("de", base)).toBeNull();
  });

  it("shows an unknown price as open, not as free", () => {
    expect(priceText("de", { ...base, priceModel: "unknown" })).toBe(
      "Preis noch offen",
    );
  });

  it("shows free and fixed prices", () => {
    expect(priceText("de", { ...base, priceModel: "free" })).toBe("Frei");
    expect(
      priceText("de", { ...base, priceModel: "fixed", priceAmount: "12,5" }),
    ).toBe("12,50 €");
  });

  it("shows the other price forms of EVT-04", () => {
    expect(priceText("de", { ...base, priceModel: "donation" })).toBe(
      "Eintritt gegen Spende",
    );
    expect(
      priceText("de", { ...base, priceModel: "from_price", priceAmount: "10" }),
    ).toBe("ab 10,00 €");
    expect(
      priceText("de", {
        ...base,
        priceModel: "range",
        priceAmount: "8",
        priceAmountMax: "15",
        priceFees: "included",
      }),
    ).toBe("8,00–15,00 € inkl. Gebühren");
    expect(
      priceText("de", {
        ...base,
        priceModel: "range",
        priceAmount: "8",
        priceAmountMax: "",
      }),
    ).toBeNull();
  });

  it("shows nothing for a fixed price without a valid amount", () => {
    expect(
      priceText("de", { ...base, priceModel: "fixed", priceAmount: "" }),
    ).toBeNull();
  });
});

describe("access and summary text", () => {
  it("uses the labels of the access routes", () => {
    expect(
      accessText("de", { ...base, accessKinds: ["online_ticket", "door"] }),
    ).toBe("Online-Ticket · Abendkasse");
    expect(accessText("de", base)).toBeNull();
  });

  it("joins price and access", () => {
    expect(
      priceAccessSummary("de", {
        ...base,
        priceModel: "free",
        accessKinds: ["walk_in"],
      }),
    ).toBe("Frei · Ohne Anmeldung");
  });
});

describe("atmosphere, time and place text", () => {
  it("lists terms and the own description", () => {
    expect(atmosphereSummary(base)).toBeNull();
    expect(
      atmosphereSummary({
        ...base,
        atmosphereTags: ["Gemütlich"],
        atmosphereDescription: " Kleine Tanzfläche ",
      }),
    ).toBe("Gemütlich · Kleine Tanzfläche");
  });

  it("describes the time, with a known and an unknown end", () => {
    expect(whenText(base)).toBeNull();
    expect(
      whenText({
        ...base,
        startDate: "2026-10-23",
        startTime: "22:00",
        endDate: "2026-10-24",
        endTime: "04:00",
      }),
    ).toBe("Fr., 23.10.2026, 22:00 Uhr bis Sa., 24.10.2026, 04:00 Uhr");
    expect(
      whenText({
        ...base,
        startDate: "2026-10-23",
        startTime: "22:00",
        endUnknown: true,
      }),
    ).toBe("Fr., 23.10.2026, 22:00 Uhr");
  });

  it("describes the place in one line", () => {
    expect(placeText(base)).toBeNull();
    expect(
      placeText({
        ...base,
        placeName: "Nebenraum",
        addressLine: "Beispielstraße 12",
        postalCode: "10999",
        city: "Berlin",
      }),
    ).toBe("Nebenraum · Beispielstraße 12, 10999 Berlin");
  });
});

describe("English summary texts", () => {
  it("names price and access in English", () => {
    expect(priceText("en", { ...base, priceModel: "unknown" })).toBe(
      "Price not known yet",
    );
    expect(
      priceAccessSummary("en", {
        ...base,
        priceModel: "free",
        accessKinds: ["walk_in"],
      }),
    ).toBe("Free · No registration");
    expect(
      accessText("en", { ...base, accessKinds: ["online_ticket", "door"] }),
    ).toBe("Online ticket · At the door");
  });
});
