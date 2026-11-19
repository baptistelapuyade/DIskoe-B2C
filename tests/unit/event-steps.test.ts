import { describe, expect, it } from "vitest";

import {
  checkLink,
  firstOpenStep,
  isMissingCode,
  nextStepPath,
  noticeKind,
  validateStep,
  type StepProgress,
} from "../../lib/domain/event-steps";

describe("step 1: basics (EVT-01)", () => {
  it("names a missing title and format on 'next' (EVT-01b)", () => {
    expect(validateStep("basics", { description: "Ein Abend." }, "next")).toEqual({
      title: "titleMissing",
      format: "formatMissing",
    });
  });

  it("saves an empty step on 'later'", () => {
    expect(validateStep("basics", {}, "later")).toEqual({});
  });

  it("refuses text that is too long and a format that is not offered", () => {
    expect(
      validateStep(
        "basics",
        { title: "x".repeat(121), format: "workshop", description: "y".repeat(2001) },
        "later",
      ),
    ).toEqual({
      title: "titleTooLong",
      format: "formatInvalid",
      description: "descriptionTooLong",
    });
  });

  it("is complete with title and format; the description is checked at submit", () => {
    expect(validateStep("basics", { title: "Nacht", format: "club_night" }, "next")).toEqual({});
  });
});

describe("step 2: date and time (EVT-02)", () => {
  it("accepts a start and an optional end", () => {
    expect(
      validateStep(
        "time",
        { startDate: "2026-11-20", startTime: "22:00", endDate: "2026-11-21", endTime: "04:00" },
        "next",
      ),
    ).toEqual({});
  });

  it("does not require a start on 'next' (the submit check names it)", () => {
    expect(validateStep("time", {}, "next")).toEqual({});
  });

  it("marks the end date when the end is before the start (EVT-02b)", () => {
    expect(
      validateStep(
        "time",
        { startDate: "2026-11-20", startTime: "22:00", endDate: "2026-11-19", endTime: "04:00" },
        "next",
      ),
    ).toEqual({ endDate: "endBeforeStart" });
  });

  it("names the half that is missing, also on 'later'", () => {
    expect(validateStep("time", { startDate: "2026-11-20" }, "later")).toEqual({
      startTime: "timeMissing",
    });
    expect(validateStep("time", { startTime: "22:00" }, "later")).toEqual({
      startDate: "dateMissing",
    });
  });

  it("refuses an invalid date and an invalid time", () => {
    expect(
      validateStep("time", { startDate: "31.02.2026", startTime: "25:00" }, "later"),
    ).toEqual({ startDate: "dateInvalid", startTime: "timeInvalid" });
    expect(
      validateStep("time", { startDate: "2026-02-31", startTime: "20:00" }, "later"),
    ).toEqual({ startDate: "dateInvalid" });
  });

  it("reports a time that does not exist at the daylight saving change", () => {
    expect(
      validateStep("time", { startDate: "2027-03-28", startTime: "02:30" }, "later"),
    ).toEqual({ startTime: "timeNonexistent" });
  });

  it("ignores a typed end when the end is deliberately unknown", () => {
    expect(
      validateStep(
        "time",
        {
          startDate: "2026-11-20",
          startTime: "22:00",
          endDate: "2026-11-19",
          endTime: "04:00",
          endUnknown: true,
        },
        "next",
      ),
    ).toEqual({});
  });
});

describe("step 3: place (EVT-03)", () => {
  it("names street and city when they are missing (EVT-03b)", () => {
    expect(
      validateStep("place", { placeName: "Nebenraum", postalCode: "10997" }, "next"),
    ).toEqual({ addressLine: "streetMissing", city: "cityMissing" });
  });

  it("keeps a half-filled place on 'later'", () => {
    expect(validateStep("place", { placeName: "Nebenraum" }, "later")).toEqual({});
  });

  it("does not need a postal code", () => {
    expect(
      validateStep(
        "place",
        { placeName: "Nebenraum", addressLine: "Hinterhof 4", city: "Berlin" },
        "next",
      ),
    ).toEqual({});
  });

  it("refuses a part that is too long", () => {
    expect(validateStep("place", { city: "x".repeat(81) }, "later")).toEqual({
      city: "cityTooLong",
    });
  });
});

describe("notice text and progress", () => {
  it("says 'missing' only when every error is a missing field", () => {
    expect(noticeKind({ title: "titleMissing", format: "formatMissing" })).toBe("missing");
    expect(noticeKind({ title: "titleMissing", description: "descriptionTooLong" })).toBe(
      "invalid",
    );
  });

  it("names the end-before-start problem in full (EVT-02b)", () => {
    expect(noticeKind({ endDate: "endBeforeStart" })).toBe("endBeforeStart");
    expect(isMissingCode("endBeforeStart")).toBe(false);
  });

  it("goes back to the first step that is not complete", () => {
    const done: StepProgress = {
      title: true,
      format: true,
      start: true,
      place: true,
      price: true,
      access: true,
      image: true,
      atmosphere: true,
    };

    expect(firstOpenStep({ ...done, format: false })).toBe("basics");
    expect(firstOpenStep({ ...done, start: false, place: false })).toBe("time");
    expect(firstOpenStep({ ...done, place: false })).toBe("place");
    expect(firstOpenStep({ ...done, access: false })).toBe("price");
    expect(firstOpenStep({ ...done, price: false })).toBe("price");
    expect(firstOpenStep({ ...done, image: false })).toBe("image");
    expect(firstOpenStep({ ...done, atmosphere: false })).toBe("atmosphere");
    expect(firstOpenStep(done)).toBeNull();
  });

  it("walks the six steps in order, then on to the optional details", () => {
    expect(nextStepPath("place")).toBe("price");
    expect(nextStepPath("price")).toBe("image");
    expect(nextStepPath("image")).toBe("atmosphere");
    expect(nextStepPath("atmosphere")).toBe("more");
  });
});

describe("step 4: price and access (EVT-04)", () => {
  it("accepts an empty step: nothing is a price, and nothing is stored as free", () => {
    expect(validateStep("price", {}, "next")).toEqual({});
    expect(validateStep("price", {}, "later")).toEqual({});
  });

  it("needs a readable amount once a price type with an amount is chosen (EVT-04d)", () => {
    expect(validateStep("price", { priceModel: "fixed" }, "next")).toEqual({
      priceAmount: "amountMissing",
    });
    expect(
      validateStep("price", { priceModel: "fixed", priceAmount: "zwölf" }, "later"),
    ).toEqual({ priceAmount: "amountInvalid" });
    expect(
      validateStep("price", { priceModel: "from_price", priceAmount: "0" }, "next"),
    ).toEqual({ priceAmount: "amountZero" });
    expect(
      validateStep("price", { priceModel: "min_donation", priceAmount: "5" }, "next"),
    ).toEqual({});
  });

  it("needs no amount for free, donation or an unknown price", () => {
    for (const priceModel of ["free", "donation", "unknown"]) {
      expect(validateStep("price", { priceModel }, "next")).toEqual({});
    }
  });

  it("checks a range as a whole: both ends, and the end above the start", () => {
    expect(
      validateStep("price", { priceModel: "range", priceAmount: "8" }, "next"),
    ).toEqual({ priceAmountMax: "amountMissing" });
    expect(
      validateStep(
        "price",
        { priceModel: "range", priceAmount: "15", priceAmountMax: "8" },
        "next",
      ),
    ).toEqual({ priceAmountMax: "rangeOrder" });
    expect(
      validateStep(
        "price",
        { priceModel: "range", priceAmount: "8", priceAmountMax: "15" },
        "next",
      ),
    ).toEqual({});
  });

  it("refuses a price type, fee answer, availability or way that is not offered", () => {
    expect(
      validateStep(
        "price",
        {
          priceModel: "pay_what_you_want",
          priceFees: "none",
          onlineTicketAvailability: "waitlist",
          accessKinds: ["telepathy"],
        },
        "next",
      ),
    ).toEqual({
      priceModel: "priceModelInvalid",
      priceFees: "feesInvalid",
      onlineTicketAvailability: "availabilityInvalid",
      accessKinds: "accessInvalid",
    });
  });

  it("checks the link of a chosen online way only (EVT-04n)", () => {
    expect(
      validateStep(
        "price",
        { accessKinds: ["online_ticket"], onlineTicketUrl: "tickets.example/x" },
        "next",
      ),
    ).toEqual({ onlineTicketUrl: "urlNoScheme" });
    expect(
      validateStep(
        "price",
        { accessKinds: ["door"], onlineTicketUrl: "tickets.example/x" },
        "next",
      ),
    ).toEqual({});
    expect(
      validateStep(
        "price",
        { accessKinds: ["online_registration"], onlineRegistrationUrl: "kein link" },
        "next",
      ),
    ).toEqual({ onlineRegistrationUrl: "urlInvalid" });
    // An empty link stays a gap for the submit check; it is not an error here.
    expect(
      validateStep("price", { accessKinds: ["online_ticket"], onlineTicketUrl: "" }, "next"),
    ).toEqual({});
  });
});

describe("checkLink", () => {
  it("wants https:// and a host with a dot", () => {
    expect(checkLink("https://tickets.example/zwischen-den-boxen")).toBe("ok");
    expect(checkLink("  https://tickets.example  ")).toBe("ok");
    expect(checkLink("http://tickets.example")).toBe("noScheme");
    expect(checkLink("tickets.example")).toBe("noScheme");
    expect(checkLink("https://localhost")).toBe("invalid");
    expect(checkLink("https://a b.example")).toBe("invalid");
    expect(checkLink("hallo")).toBe("invalid");
    expect(checkLink(`https://tickets.example/${"x".repeat(300)}`)).toBe("tooLong");
  });
});

describe("step 5: event image (EVT-05)", () => {
  it("checks only the length of the description", () => {
    expect(validateStep("image", {}, "next")).toEqual({});
    expect(validateStep("image", { altText: "x".repeat(200) }, "next")).toEqual({});
    expect(validateStep("image", { altText: "x".repeat(201) }, "later")).toEqual({
      altText: "altTooLong",
    });
  });
});

describe("step 6: atmosphere (EVT-06)", () => {
  it("accepts nothing, up to three terms, or an own sentence", () => {
    expect(validateStep("atmosphere", {}, "next")).toEqual({});
    expect(
      validateStep(
        "atmosphere",
        { atmosphereTags: ["Gemütlich", "Intim/persönlich", "Entspannt"] },
        "next",
      ),
    ).toEqual({});
    expect(
      validateStep("atmosphere", { atmosphereDescription: "Kleine Tanzfläche." }, "next"),
    ).toEqual({});
  });

  it("refuses a fourth term, an unknown term and a too long sentence", () => {
    expect(
      validateStep(
        "atmosphere",
        { atmosphereTags: ["Gemütlich", "Intim/persönlich", "Entspannt", "Lebhaft"] },
        "next",
      ),
    ).toEqual({ atmosphereTags: "atmosphereTooMany" });
    expect(
      validateStep("atmosphere", { atmosphereTags: ["Laut"] }, "next"),
    ).toEqual({ atmosphereTags: "atmosphereInvalid" });
    expect(
      validateStep("atmosphere", { atmosphereDescription: "x".repeat(201) }, "later"),
    ).toEqual({ atmosphereDescription: "atmosphereTextTooLong" });
  });
});
