import { describe, expect, it } from "vitest";

import { canCopyEvent, copyRevisionFields } from "../../lib/event/copy";
import { type EventRevisionRow } from "../../lib/event/values";

const source: EventRevisionRow = {
  id: "00000000-0000-4000-8000-000000000001",
  title_state: "provided",
  title: "Sommerfest im Hof",
  description_state: "provided",
  description: "Draußen, mit Musik.",
  format_state: "provided",
  primary_format: "club_night",
  start_state: "provided",
  start_at: "2026-06-06T20:00:00Z",
  end_state: "provided",
  end_at: "2026-06-07T02:00:00Z",
  place_state: "provided",
  place_name: "Hof am Kanal",
  address_line: "Kanalstraße 1",
  postal_code: "10115",
  city: "Berlin",
  price_state: "provided",
  price_model: "fixed",
  price_amount_minor: 1200,
  price_max_amount_minor: null,
  price_fee_model: "included",
  currency: "EUR",
  access_state: "provided",
  access_routes: [
    {
      kind: "online_ticket",
      url: "https://tickets.example.org/sommerfest-2026",
      availability: "sold_out",
    },
    { kind: "door" },
  ],
  atmosphere_state: "provided",
  atmosphere_tags: ["Gemütlich"],
  atmosphere_description: "Leise.",
  modules: { music: { genres: ["Techno"] } },
  event_image_use_id: "00000000-0000-4000-8000-0000000000aa",
  confirmed_at: "2026-05-01T10:00:00Z",
};

describe("copyRevisionFields (EVM-02)", () => {
  const copy = copyRevisionFields(source);

  it("carries over title, description, format, place, price and atmosphere", () => {
    expect(copy.title).toBe("Sommerfest im Hof");
    expect(copy.description).toBe("Draußen, mit Musik.");
    expect(copy.primary_format).toBe("club_night");
    expect(copy.place_name).toBe("Hof am Kanal");
    expect(copy.address_line).toBe("Kanalstraße 1");
    expect(copy.postal_code).toBe("10115");
    expect(copy.city).toBe("Berlin");
    expect(copy.price_model).toBe("fixed");
    expect(copy.price_amount_minor).toBe(1200);
    expect(copy.price_fee_model).toBe("included");
    expect(copy.atmosphere_tags).toEqual(["Gemütlich"]);
    expect(copy.atmosphere_description).toBe("Leise.");
  });

  it("carries over the 'Mehr zum Abend' blocks", () => {
    expect(copy.modules).toEqual({ music: { genres: ["Techno"] } });
  });

  it("leaves date and time unanswered, never as a value", () => {
    expect(copy.start_state).toBe("unanswered");
    expect(copy.start_at).toBeNull();
    expect(copy.end_state).toBe("unanswered");
    expect(copy.end_at).toBeNull();
  });

  it("keeps the access kinds but not the ticket link nor 'sold out'", () => {
    expect(copy.access_state).toBe("provided");
    expect(copy.access_routes).toEqual([
      { kind: "online_ticket" },
      { kind: "door" },
    ]);
  });

  it("does not carry over the picture, the confirmation or the old ids", () => {
    expect(copy).not.toHaveProperty("event_image_use_id");
    expect(copy).not.toHaveProperty("confirmed_at");
    expect(copy).not.toHaveProperty("id");
    expect(copy).not.toHaveProperty("event_id");
  });

  it("copies an answer that is not a value as it was (unknown price stays unknown)", () => {
    const unknown = copyRevisionFields({
      ...source,
      price_state: "unknown",
      price_model: "unknown",
      price_amount_minor: null,
      access_state: "skipped",
      access_routes: [],
    });

    expect(unknown.price_state).toBe("unknown");
    expect(unknown.price_amount_minor).toBeNull();
    expect(unknown.access_state).toBe("skipped");
  });
});

describe("canCopyEvent", () => {
  it("allows a live and a past event only", () => {
    expect(canCopyEvent("live")).toBe(true);
    expect(canCopyEvent("past")).toBe(true);
    for (const state of [
      "changes",
      "private",
      "inReview",
      "question",
      "postponed",
      "cancelled",
    ] as const) {
      expect(canCopyEvent(state)).toBe(false);
    }
  });
});
