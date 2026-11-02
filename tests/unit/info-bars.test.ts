import { describe, expect, it } from "vitest";

import { PUBLIC_FORMAT_LABEL, type PublicProfile } from "../../lib/public/dto";
import { PRIMARY_FORMATS } from "../../lib/domain/event-publication";
import { contactHref, infoBars } from "../../lib/public/info-bars";

function organizer(publicContact: string | null): PublicProfile {
  return {
    id: "p1",
    slug: "nebenraum",
    name: "Nebenraum Kollektiv",
    shortIntro: null,
    officialUrl: null,
    publicContact,
    imageUrl: null,
  };
}

const access = [
  { kind: "online_ticket" as const, label: "Online-Ticket", url: null },
  { kind: "door" as const, label: "Abendkasse", url: null },
];

describe("Gut zu wissen bars", () => {
  it("shows the entry bar with the price and the access routes as pills", () => {
    const bars = infoBars({ priceText: "12,00 €", access, organizer: organizer(null) });

    expect(bars.map((bar) => bar.key)).toEqual(["entry", "accessibility"]);
    expect(bars[0]).toMatchObject({
      label: "Eintritt",
      value: "12,00 €",
      pills: ["Online-Ticket", "Abendkasse"],
    });
  });

  it("shows a confirmed unknown price as open, not as free", () => {
    const [entry] = infoBars({
      priceText: "Preis noch offen",
      access: [],
      organizer: organizer(null),
    });

    expect(entry.value).toBe("Preis noch offen");
  });

  it("leaves the entry bar out when the cost was not answered", () => {
    const bars = infoBars({ priceText: null, access, organizer: organizer(null) });

    expect(bars.map((bar) => bar.key)).toEqual(["accessibility"]);
  });

  it("always shows accessibility, neutral and never as 'not accessible'", () => {
    const [bar] = infoBars({ priceText: null, access: [], organizer: organizer(null) });

    expect(bar.label).toBe("Zugänglichkeit");
    expect(bar.value).toBe("Noch keine Angaben");
    expect(bar.detail).toContain("Das heißt nicht, dass der Ort nicht zugänglich ist");
    expect(bar.action).toBeNull();
  });

  it("offers 'Veranstalter fragen' only with a usable public contact", () => {
    const action = (contact: string | null) =>
      infoBars({ priceText: null, access: [], organizer: organizer(contact) })[0].action;

    expect(action("hallo@nebenraum.example")).toEqual({
      label: "Veranstalter fragen",
      href: "mailto:hallo@nebenraum.example",
    });
    expect(action("https://nebenraum.example/kontakt")?.href).toBe(
      "https://nebenraum.example/kontakt",
    );
    expect(action("Instagram @nebenraum")).toBeNull();
    expect(action("javascript:alert(1)")).toBeNull();
    expect(action("  ")).toBeNull();
    expect(action(null)).toBeNull();
  });
});

describe("contactHref", () => {
  it("turns only an e-mail address or an http(s) link into an address", () => {
    expect(contactHref("a@b.example")).toBe("mailto:a@b.example");
    expect(contactHref("http://b.example")).toBe("http://b.example/");
    expect(contactHref("ftp://b.example")).toBeNull();
    expect(contactHref("a b@c.example")).toBeNull();
  });
});

describe("public format tag names", () => {
  it("names every main format as the design does", () => {
    expect(Object.keys(PUBLIC_FORMAT_LABEL).sort()).toEqual([...PRIMARY_FORMATS].sort());
    expect(PUBLIC_FORMAT_LABEL.club_night).toBe("Party / Clubabend");
    expect(PUBLIC_FORMAT_LABEL.screening).toBe("Filmabend / Screening");
    expect(PUBLIC_FORMAT_LABEL.exhibition).toBe("Ausstellungsabend / Offspace");
    expect(PUBLIC_FORMAT_LABEL.concert).toBe("Konzert / Live-Musik");
  });
});
