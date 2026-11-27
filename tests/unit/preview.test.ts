import { describe, expect, it } from "vitest";

import type { EventRevisionRow } from "../../lib/event/values";
import { previewEvent, previewProfile } from "../../lib/public/preview";

const SIGNED = "https://project.example.test/storage/v1/object/sign/x?token=t";

const draft = {
  id: "p1",
  slug: "nebenraum",
  name: "Nebenraum Kollektiv",
  shortIntro: "Kleine Nächte",
  officialUrl: "https://nebenraum.example.test",
  publicContact: null,
  instagramHandle: "nebenraum",
  extraLinks: ["https://example.test/a"],
  imageUrl: SIGNED,
  imageCrop: null,
};

const revision = {
  id: "r1",
  title_state: "provided",
  title: "Zwischen den Boxen",
  description_state: "provided",
  description: "Ein Abend.",
  format_state: "provided",
  primary_format: "club_night",
  start_state: "provided",
  start_at: "2027-03-06T22:00:00Z",
  end_state: "provided",
  end_at: "2027-03-07T03:00:00Z",
  place_state: "provided",
  place_name: "Nebenraum",
  address_line: "Beispielstraße 12",
  postal_code: "10999",
  city: "Berlin",
  price_state: "provided",
  price_model: "fixed",
  price_amount_minor: 1200,
  price_max_amount_minor: null,
  price_fee_model: null,
  currency: "EUR",
  access_state: "provided",
  access_routes: [
    { kind: "online_ticket", url: "https://tickets.example.test/x" },
  ],
  atmosphere_state: "provided",
  atmosphere_tags: ["Lebhaft"],
  atmosphere_description: null,
  modules: null,
  event_image_use_id: "u1",
  confirmed_at: null,
  timezone: "Europe/Berlin",
} as unknown as EventRevisionRow & { timezone: string };

const NOW = new Date("2027-01-01T00:00:00Z");

function build(
  overrides: Partial<typeof revision> = {},
  imageUrl: string | null = SIGNED,
) {
  const organizer = previewProfile(draft)!;

  return previewEvent(
    "de",
    {
      revision: { ...revision, ...overrides },
      eventId: "e1",
      slug: "zwischen-den-boxen",
      organizer,
      imageUrl,
    },
    NOW,
  );
}

describe("previewProfile", () => {
  it("shows the draft, with the owner's signed image and no public path", () => {
    const profile = previewProfile(draft)!;

    expect(profile.name).toBe("Nebenraum Kollektiv");
    expect(profile.imageUrl).toBe(SIGNED);
    expect(profile.instagram).toBe("nebenraum");
    expect(profile.extraLinks.map((link) => link.url)).toEqual([
      "https://example.test/a",
    ]);
  });

  it("has no image address without a draft image", () => {
    expect(previewProfile({ ...draft, imageUrl: null })!.imageUrl).toBeNull();
  });

  it("is null while the name is missing", () => {
    expect(previewProfile({ ...draft, name: null })).toBeNull();
    expect(previewProfile({ ...draft, name: "" })).toBeNull();
  });
});

describe("previewEvent", () => {
  it("is the same event the public page would build, as a scheduled one", () => {
    const event = build()!;

    expect(event.status).toBe("scheduled");
    expect(event.title).toBe("Zwischen den Boxen");
    expect(event.dateLine).toBe("Sa, 6. März");
    expect(event.priceText).toBe("12,00 €");
    expect(event.ticketUrl).toBe("https://tickets.example.test/x");
    expect(event.earlier).toBeNull();
    expect(event.publishedAt).toBeNull();
    expect(event.organizer.name).toBe("Nebenraum Kollektiv");
  });

  it("carries the owner's signed flyer address, never a public storage path", () => {
    expect(build()!.imageUrl).toBe(SIGNED);
  });

  it("is null without a flyer (the checklist names the gap)", () => {
    expect(build({}, null)).toBeNull();
  });

  it("is null while a required detail is missing", () => {
    expect(build({ title: null })).toBeNull();
    expect(build({ start_at: null })).toBeNull();
    expect(build({ primary_format: null })).toBeNull();
  });

  it("shows an unknown price as unknown, never as free", () => {
    const event = build({
      price_state: "unknown",
      price_model: null,
      price_amount_minor: null,
    })!;

    expect(event.priceText).not.toBe("Frei");
    expect(event.priceText).not.toBe("Free");
  });
});
