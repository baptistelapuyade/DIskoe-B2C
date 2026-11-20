import { describe, expect, it } from "vitest";

import {
  ATMOSPHERE_TERMS,
  describeEventGaps,
  eventGapCodes,
  parseEventInput,
  PRIMARY_FORMATS,
  type EventDraftValues,
  type EventFormInput,
} from "../../lib/domain/event-publication";

const complete: EventFormInput = {
  title: "Nacht der Klänge",
  description: "Live-Musik im Keller.",
  format: "concert",
  startDate: "2026-10-31",
  startTime: "21:00",
  endDate: "2026-11-01",
  endTime: "02:00",
  placeName: "Keller",
  addressLine: "Musterstraße 1",
  postalCode: "10115",
  city: "Berlin",
  priceModel: "fixed",
  priceAmount: "12,50",
  accessKinds: ["door"],
  atmosphereTags: ["Gemütlich", "Intim/persönlich"],
  atmosphereDescription: "",
};

function parse(overrides: EventFormInput = {}): EventDraftValues {
  const result = parseEventInput({ ...complete, ...overrides });

  if (!result.ok) {
    throw new Error(`unexpected errors: ${JSON.stringify(result.errors)}`);
  }

  return result.value;
}

function errorsOf(overrides: EventFormInput) {
  const result = parseEventInput({ ...complete, ...overrides });

  return result.ok ? {} : result.errors;
}

describe("P01: title, start and address are guided; a gap blocks only publication", () => {
  it("accepts an empty draft and reports every required field", () => {
    const result = parseEventInput({});

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(eventGapCodes(result.value, false)).toEqual([
        "title",
        "description",
        "primary_format",
        "start",
        "place",
        "price",
        "access",
        "atmosphere",
        "event_image",
      ]);
    }
  });

  it("reports a missing title as a concrete gap with field and reason", () => {
    const values = parse({ title: "" });
    const gaps = describeEventGaps(eventGapCodes(values, true));

    expect(gaps).toEqual([
      { code: "title", field: "title", message: "Der Titel fehlt." },
    ]);
  });

  it("is complete when every required field and the image are there", () => {
    expect(eventGapCodes(parse(), true)).toEqual([]);
  });

  it("keeps a half-filled place as typed, but not as an answer", () => {
    const values = parse({ placeName: "Keller", addressLine: "", city: "" });

    expect(values.place.state).toBe("unanswered");
    expect(values.placePartial).toEqual({
      name: "Keller",
      addressLine: "",
      postalCode: "10115",
      city: "",
    });
    expect(eventGapCodes(values, true)).toContain("place");
  });

  it("needs the city for a place to count as answered", () => {
    expect(parse({ city: "" }).place.state).toBe("unanswered");
    expect(eventGapCodes(parse({ city: "" }), true)).toContain("place");
    expect(parse().placePartial).toBeNull();
  });

  it("refuses a place part that is too long", () => {
    expect(errorsOf({ city: "x".repeat(81) }).place).toBeDefined();
  });

  it("treats an untouched place as not answered", () => {
    const values = parse({
      placeName: "",
      addressLine: "",
      postalCode: "",
      city: "",
    });

    expect(values.place.state).toBe("unanswered");
  });
});

describe("P05 (Durchstich deviation): the image gates publication, not the draft", () => {
  it("lets a draft without image be saved", () => {
    expect(parseEventInput(complete).ok).toBe(true);
  });

  it("names the missing image as the only gap", () => {
    expect(eventGapCodes(parse(), false)).toEqual(["event_image"]);
  });
});

describe("P03 and P04: atmosphere", () => {
  it("P03: an own sentence satisfies the requirement without tags", () => {
    const values = parse({
      atmosphereTags: [],
      atmosphereDescription: "Leise, nah, mit Kerzenlicht.",
    });

    expect(values.atmosphere.state).toBe("provided");
    expect(eventGapCodes(values, true)).not.toContain("atmosphere");
  });

  it("is a gap when neither tags nor a sentence are given", () => {
    const values = parse({ atmosphereTags: [], atmosphereDescription: "" });

    expect(eventGapCodes(values, true)).toEqual(["atmosphere"]);
  });

  it("P04: more than three tags is an error and nothing is cut off", () => {
    const result = parseEventInput({
      ...complete,
      atmosphereTags: ATMOSPHERE_TERMS.slice(0, 4),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.atmosphere).toMatch(/höchstens 3/);
    }
  });

  it("accepts exactly three tags", () => {
    const values = parse({ atmosphereTags: ATMOSPHERE_TERMS.slice(0, 3) });

    expect(values.atmosphere.state === "provided" && values.atmosphere.value.tags)
      .toEqual(ATMOSPHERE_TERMS.slice(0, 3));
  });

  it("counts a repeated tag once", () => {
    const values = parse({
      atmosphereTags: ["Lebhaft", "Lebhaft", "Immersiv", "Entspannt"],
    });

    expect(values.atmosphere.state).toBe("provided");
  });

  it("rejects a term that is not on the list", () => {
    expect(errorsOf({ atmosphereTags: ["Mega"] }).atmosphere).toBeDefined();
  });
});

describe("P07: price", () => {
  it("keeps unknown as its own state", () => {
    const values = parse({ priceModel: "unknown", priceAmount: "" });

    expect(values.price.state).toBe("unknown");
    expect(values.price.value).toBeUndefined();
  });

  it("does not count a deliberate unknown as a gap", () => {
    const values = parse({ priceModel: "unknown" });

    expect(eventGapCodes(values, true)).toEqual([]);
  });

  it("counts an untouched price as a gap with a hint to the unknown option", () => {
    const values = parse({ priceModel: "" });
    const gaps = describeEventGaps(eventGapCodes(values, true));

    expect(values.price.state).toBe("unanswered");
    expect(gaps[0].code).toBe("price");
    expect(gaps[0].message).toMatch(/noch nicht bekannt/);
  });

  it("stores a fixed price in cents", () => {
    const values = parse({ priceModel: "fixed", priceAmount: "12,50" });

    expect(values.price).toEqual({
      state: "provided",
      value: { model: "fixed", amountMinor: 1250 },
    });
  });

  it("rejects a fixed price of 0 and a missing amount", () => {
    expect(errorsOf({ priceModel: "fixed", priceAmount: "0" }).price)
      .toBeDefined();
    expect(errorsOf({ priceModel: "fixed", priceAmount: "" }).price)
      .toBeDefined();
  });

  it("stores a free price only when chosen", () => {
    expect(parse({ priceModel: "free" }).price).toEqual({
      state: "provided",
      value: { model: "free" },
    });
  });

  it("rejects an unknown price model", () => {
    expect(errorsOf({ priceModel: "pay_what_you_want" }).price).toBeDefined();
  });

  it("stores the price forms of EVT-04 without inventing an amount", () => {
    expect(parse({ priceModel: "donation" }).price).toEqual({
      state: "provided",
      value: { model: "donation" },
    });
    expect(parse({ priceModel: "from_price", priceAmount: "10" }).price).toEqual({
      state: "provided",
      value: { model: "from_price", amountMinor: 1000 },
    });
    expect(parse({ priceModel: "min_donation", priceAmount: "5" }).price).toEqual({
      state: "provided",
      value: { model: "min_donation", amountMinor: 500 },
    });
  });

  it("stores a range as two amounts in cents, the end above the start", () => {
    expect(
      parse({ priceModel: "range", priceAmount: "8", priceAmountMax: "15,50" }).price,
    ).toEqual({
      state: "provided",
      value: { model: "range", amountMinor: 800, maxAmountMinor: 1550 },
    });
    expect(
      errorsOf({ priceModel: "range", priceAmount: "15", priceAmountMax: "15" }).price,
    ).toBeDefined();
    expect(
      errorsOf({ priceModel: "range", priceAmount: "8", priceAmountMax: "" }).price,
    ).toBeDefined();
  });

  it("keeps the fee answer only with a price that has an amount", () => {
    expect(
      parse({ priceModel: "fixed", priceAmount: "12", priceFees: "included" }).priceFees,
    ).toBe("included");
    expect(
      parse({ priceModel: "fixed", priceAmount: "12", priceFees: "unknown" }).priceFees,
    ).toBe("unknown");
    expect(parse({ priceModel: "free", priceFees: "included" }).priceFees).toBeNull();
    expect(parse({ priceModel: "unknown", priceFees: "included" }).priceFees).toBeNull();
    expect(parse({ priceModel: "fixed", priceAmount: "12" }).priceFees).toBeNull();
  });
});

describe("P08: online access needs a valid link", () => {
  it("keeps a draft with an online route but no link, and reports it", () => {
    const values = parse({
      accessKinds: ["online_ticket"],
      onlineTicketUrl: "",
    });

    expect(eventGapCodes(values, true)).toEqual(["access_url"]);
    expect(describeEventGaps(["access_url"])[0].message).toMatch(/Link/);
  });

  it("is complete with a valid link, completed to https", () => {
    const values = parse({
      accessKinds: ["online_ticket"],
      onlineTicketUrl: "tickets.example.org/abend",
    });

    expect(eventGapCodes(values, true)).toEqual([]);
    expect(
      values.access.state === "provided" && values.access.value[0].url,
    ).toBe("https://tickets.example.org/abend");
  });

  it("rejects a link that is present but invalid", () => {
    expect(
      errorsOf({
        accessKinds: ["online_registration"],
        onlineRegistrationUrl: "javascript:alert(1)",
      }).access,
    ).toBeDefined();
    expect(
      errorsOf({
        accessKinds: ["online_ticket"],
        onlineTicketUrl: "kein link",
      }).access,
    ).toBeDefined();
  });

  it("needs no link for door or walk-in access", () => {
    const values = parse({ accessKinds: ["walk_in", "door"] });

    expect(eventGapCodes(values, true)).toEqual([]);
  });

  it("keeps several routes apart", () => {
    const values = parse({
      accessKinds: ["door", "online_ticket"],
      onlineTicketUrl: "https://tickets.example.org/",
    });

    expect(values.access.state === "provided" && values.access.value).toEqual([
      { kind: "door", url: null },
      { kind: "online_ticket", url: "https://tickets.example.org/" },
    ]);
  });

  it("rejects an access route that is not offered", () => {
    expect(errorsOf({ accessKinds: ["teleport"] }).access).toBeDefined();
  });
});

describe("P11, P12, P13: time", () => {
  it("P11: stores a night event as UTC instants in Europe/Berlin", () => {
    const values = parse();

    expect(values.start).toEqual({
      state: "provided",
      value: "2026-10-31T20:00:00.000Z",
    });
    expect(values.end).toEqual({
      state: "provided",
      value: "2026-11-01T01:00:00.000Z",
    });
  });

  it("P11: rejects an end before or at the start", () => {
    expect(
      errorsOf({ endDate: "2026-10-31", endTime: "20:00" }).end,
    ).toMatch(/nach dem Beginn/);
    expect(
      errorsOf({ endDate: "2026-10-31", endTime: "21:00" }).end,
    ).toBeDefined();
  });

  it("P12: an unanswered end stays unanswered, no end is invented", () => {
    const values = parse({ endDate: "", endTime: "" });

    expect(values.end.state).toBe("unanswered");
    expect(values.end.value).toBeUndefined();
  });

  it("P12: a deliberate unknown end is its own state", () => {
    const values = parse({ endDate: "", endTime: "", endUnknown: "on" });

    expect(values.end.state).toBe("unknown");
  });

  it("P12: the end is no required field", () => {
    expect(eventGapCodes(parse({ endDate: "", endTime: "" }), true)).toEqual([]);
  });

  it("P13: blocks a start that does not exist on the spring change day", () => {
    const errors = errorsOf({
      startDate: "2026-03-29",
      startTime: "02:30",
      endDate: "",
      endTime: "",
    });

    expect(errors.start).toMatch(/Zeitumstellung nicht/);
  });

  it("P13: blocks a start that exists twice on the autumn change day", () => {
    const errors = errorsOf({
      startDate: "2026-10-25",
      startTime: "02:30",
      endDate: "",
      endTime: "",
    });

    expect(errors.start).toMatch(/zweimal/);
  });

  it("asks for date and time together", () => {
    expect(errorsOf({ startDate: "2026-10-31", startTime: "" }).start)
      .toMatch(/Datum und Uhrzeit/);
  });

  it("treats an empty start as a gap, not an error", () => {
    const values = parse({
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    });

    expect(eventGapCodes(values, true)).toEqual(["start"]);
  });
});

describe("P50: formats", () => {
  it("offers exactly the seven main formats, without a catch-all", () => {
    expect(PRIMARY_FORMATS).toHaveLength(7);
    expect(PRIMARY_FORMATS as readonly string[]).not.toContain("other");
    expect(PRIMARY_FORMATS as readonly string[]).not.toContain("workshop");
  });

  it("rejects a workshop and an other-format instead of guessing", () => {
    expect(errorsOf({ format: "workshop" }).format).toBeDefined();
    expect(errorsOf({ format: "other" }).format).toBeDefined();
  });

  it("accepts every main format", () => {
    for (const format of PRIMARY_FORMATS) {
      expect(parse({ format }).format).toEqual({
        state: "provided",
        value: format,
      });
    }
  });
});

describe("limits", () => {
  it("rejects over-long text", () => {
    expect(errorsOf({ title: "x".repeat(121) }).title).toBeDefined();
    expect(errorsOf({ description: "x".repeat(2001) }).description)
      .toBeDefined();
  });
});

describe("describeEventGaps", () => {
  it("ignores unknown codes", () => {
    expect(describeEventGaps(["nope"])).toEqual([]);
  });
});

describe("Required block of the format is a publication gap (EIN-01e)", () => {
  it("opening without visit mode is a gap, 'unknown' is an answer", () => {
    const values = parse({ format: "opening" });

    expect(eventGapCodes(values, true)).toEqual(["visit_mode"]);
    expect(eventGapCodes(values, true, {})).toEqual(["visit_mode"]);
    expect(
      eventGapCodes(values, true, {
        visit_mode: {
          mode: "unknown",
          window_from: null,
          window_to: null,
          short_visit: null,
        },
      }),
    ).toEqual([]);
  });

  it("screening needs program language and subtitles", () => {
    const values = parse({ format: "screening" });

    expect(eventGapCodes(values, true)).toEqual(["language"]);
    expect(
      eventGapCodes(values, true, {
        language: {
          program: "unknown",
          subtitles: null,
          subtitle_language: null,
        },
      }),
    ).toEqual(["language"]);
    expect(
      eventGapCodes(values, true, {
        language: {
          program: "unknown",
          subtitles: "unknown",
          subtitle_language: null,
        },
      }),
    ).toEqual([]);
  });

  it("other formats have no required block", () => {
    expect(eventGapCodes(parse({ format: "concert" }), true)).toEqual([]);
  });

  it("describes both gaps in plain German with the module field", () => {
    const gaps = describeEventGaps(["visit_mode", "language"]);

    expect(gaps.map((gap) => gap.field)).toEqual(["modules", "modules"]);
  });
});
