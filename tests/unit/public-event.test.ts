import { describe, expect, it } from "vitest";

import {
  isUpcoming,
  publicImageUrl,
  toPublicEvent,
  toPublicProfile,
  type PublicEventRow,
  type PublicProfileRow,
} from "../../lib/public/dto";
import { eventJsonLd, serializeJsonLd } from "../../lib/public/json-ld";

const MEDIA = "https://media.example.test";

const profileRow: PublicProfileRow = {
  id: "p1",
  slug: "nebenraum",
  name: "Nebenraum Kollektiv",
  short_intro: "Kleine Nächte",
  official_url: "https://nebenraum.example.test",
  public_contact: null,
  profile_image_path: "profiles/p1/a.png",
  published_at: "2026-10-20T10:00:00Z",
};

const eventRow: PublicEventRow = {
  id: "e1",
  slug: "zwischen-den-boxen",
  organizer_id: "p1",
  public_status: "scheduled",
  title: "Zwischen den Boxen",
  description: "Ein Abend.",
  primary_format: "club_night",
  // 31.10.2026 23:00 Berlin (CET after the clock change on 25.10: UTC+1)
  start_at: "2026-10-31T22:00:00Z",
  timezone: "Europe/Berlin",
  end_state: "provided",
  end_at: "2026-11-01T03:00:00Z",
  place_name: "Nebenraum",
  address_line: "Beispielstraße 12",
  postal_code: "10999",
  city: "Berlin",
  country_code: "DE",
  price_state: "provided",
  price_model: "fixed",
  price_amount_minor: 1200,
  currency: "EUR",
  access_routes: [
    { kind: "online_ticket", url: "https://tickets.example.test/x" },
    { kind: "door", url: null },
  ],
  atmosphere_tags: ["Lebhaft"],
  atmosphere_description: null,
  event_image_path: "events/e1/u1.png",
  published_at: "2026-10-20T10:00:00Z",
};

const organizer = toPublicProfile(profileRow, MEDIA)!;

function build(overrides: Partial<PublicEventRow>) {
  const event = toPublicEvent({ ...eventRow, ...overrides }, organizer, MEDIA);

  if (!event) throw new Error("event expected");

  return event;
}

describe("public event shape", () => {
  it("shows a night over midnight with both days in Berlin time", () => {
    const event = build({});

    expect(event.dateLine).toBe("Sa., 31.10.2026");
    expect(event.timeLine).toBe("23:00 → 04:00");
    expect(event.untilLine).toBe("Bis So., 01.11.2026");
  });

  it("shows only the start when the end is not known, and invents no end", () => {
    const event = build({ end_state: "unknown", end_at: null });

    expect(event.timeLine).toBe("23:00 Uhr");
    expect(event.untilLine).toBeNull();
    expect(event.endInstant).toBeNull();
  });

  it("shows an unknown price as open, never as free or zero", () => {
    const event = build({
      price_state: "unknown",
      price_model: null,
      price_amount_minor: null,
    });

    expect(event.priceText).toBe("Preis noch offen");
    expect(event.offer).toBeNull();
  });

  it("shows nothing for a price that was not asked", () => {
    const event = build({
      price_state: "unanswered",
      price_model: null,
      price_amount_minor: null,
    });

    expect(event.priceText).toBeNull();
    expect(event.offer).toBeNull();
  });

  it("shows 'Frei' only for a provided free price", () => {
    expect(build({ price_model: "free", price_amount_minor: null }).priceText).toBe(
      "Frei",
    );
    expect(build({ price_model: "fixed", price_amount_minor: 1200 }).priceText).toBe(
      "12,00 €",
    );
  });

  it("drops a cancelled event's ticket link and keeps its status", () => {
    const event = build({ public_status: "cancelled" });

    expect(event.status).toBe("cancelled");
    expect(event.ticketUrl).toBeNull();
  });

  it("shows no date for an event postponed without a new date", () => {
    const event = build({ public_status: "postponed_undated" });

    expect(event.dateLine).toBeNull();
    expect(event.timeLine).toBeNull();
  });

  it("rejects links that are not http or https", () => {
    const event = build({
      access_routes: [{ kind: "online_ticket", url: "javascript:alert(1)" }],
    });

    expect(event.ticketUrl).toBeNull();
  });

  it("needs an image and a known status", () => {
    expect(toPublicEvent({ ...eventRow, event_image_path: null }, organizer, MEDIA)).toBeNull();
    expect(
      toPublicEvent({ ...eventRow, public_status: null }, organizer, MEDIA),
    ).toBeNull();
  });

  it("builds image addresses from the public bucket", () => {
    expect(publicImageUrl(`${MEDIA}/`, "events/e1/u 1.png")).toBe(
      `${MEDIA}/storage/v1/object/public/public-media/events/e1/u%201.png`,
    );
    expect(publicImageUrl(MEDIA, null)).toBeNull();
  });

  it("counts an event as upcoming until its known end", () => {
    const event = build({});

    expect(isUpcoming(event, new Date("2026-11-01T02:00:00Z"))).toBe(true);
    expect(isUpcoming(event, new Date("2026-11-01T04:00:00Z"))).toBe(false);
  });
});

describe("event JSON-LD", () => {
  const SITE = "https://diskoe.example.test";

  it("describes a scheduled event with a fixed price", () => {
    const data = eventJsonLd(build({}), SITE);

    expect(data["@type"]).toBe("Event");
    expect(data.url).toBe(`${SITE}/e/zwischen-den-boxen`);
    expect(data.startDate).toBe("2026-10-31T22:00:00.000Z");
    expect(data.endDate).toBe("2026-11-01T03:00:00.000Z");
    expect(data.eventStatus).toBe("https://schema.org/EventScheduled");
    expect(data.offers).toEqual({
      "@type": "Offer",
      price: "12.00",
      priceCurrency: "EUR",
      url: "https://tickets.example.test/x",
    });
  });

  it("leaves out the offer for an unknown price", () => {
    const data = eventJsonLd(
      build({ price_state: "unknown", price_model: null, price_amount_minor: null }),
      SITE,
    );

    expect(data).not.toHaveProperty("offers");
  });

  it("leaves out the end date when the end is not known", () => {
    const data = eventJsonLd(build({ end_state: "unknown", end_at: null }), SITE);

    expect(data).not.toHaveProperty("endDate");
  });

  it("marks a cancelled event and offers no tickets", () => {
    const data = eventJsonLd(build({ public_status: "cancelled" }), SITE);

    expect(data.eventStatus).toBe("https://schema.org/EventCancelled");
    expect(data).not.toHaveProperty("offers");
  });

  it("gives a postponed event no start date", () => {
    const data = eventJsonLd(build({ public_status: "postponed_undated" }), SITE);

    expect(data.eventStatus).toBe("https://schema.org/EventPostponed");
    expect(data).not.toHaveProperty("startDate");
  });

  it("marks a rescheduled event", () => {
    const data = eventJsonLd(build({ public_status: "rescheduled" }), SITE);

    expect(data.eventStatus).toBe("https://schema.org/EventRescheduled");
  });

  it("can not close the script tag", () => {
    const data = eventJsonLd(build({ title: "</script><b>x" }), SITE);

    expect(serializeJsonLd(data)).not.toContain("</script>");
  });
});
