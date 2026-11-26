import { describe, expect, it } from "vitest";

import { PUBLIC_FORMAT_ID, type PublicProfile } from "../../lib/public/dto";
import { PRIMARY_FORMATS } from "../../lib/domain/event-publication";
import { t } from "../../lib/i18n";
import { contactHref, infoBars } from "../../lib/public/info-bars";

function organizer(publicContact: string | null): PublicProfile {
  return {
    id: "p1",
    slug: "nebenraum",
    name: "Nebenraum Kollektiv",
    shortIntro: null,
    officialUrl: null,
    publicContact,
    instagram: null,
    extraLinks: [],
    imageUrl: null,
    imageCrop: null,
  };
}

// The parts of an event that the bars read, without any block of "Mehr zum Abend".
const plain = { modules: {}, startTime: "22:00", status: "scheduled" as const };

const access = [
  {
    kind: "online_ticket" as const,
    label: "Online-Ticket",
    url: null,
    soldOut: false,
  },
  { kind: "door" as const, label: "Abendkasse", url: null, soldOut: false },
];

describe("Gut zu wissen bars", () => {
  it("shows the entry bar with the price and the access routes as pills", () => {
    const bars = infoBars("de", {
      ...plain,
      priceText: "12,00 €",
      access,
      organizer: organizer(null),
    });

    expect(bars.map((bar) => bar.key)).toEqual(["entry", "accessibility"]);
    expect(bars[0]).toMatchObject({
      label: "Eintritt",
      value: "12,00 €",
      pills: ["Online-Ticket", "Abendkasse"],
    });
  });

  it("shows a confirmed unknown price as open, not as free", () => {
    const [entry] = infoBars("de", {
      ...plain,
      priceText: "Preis noch offen",
      access: [],
      organizer: organizer(null),
    });

    expect(entry.value).toBe("Preis noch offen");
  });

  it("leaves the entry bar out when the cost was not answered", () => {
    const bars = infoBars("de", {
      ...plain,
      priceText: null,
      access,
      organizer: organizer(null),
    });

    expect(bars.map((bar) => bar.key)).toEqual(["accessibility"]);
  });

  it("always shows accessibility, neutral and never as 'not accessible'", () => {
    const [bar] = infoBars("de", {
      ...plain,
      priceText: null,
      access: [],
      organizer: organizer(null),
    });

    expect(bar.label).toBe("Zugänglichkeit");
    expect(bar.value).toBe("Noch keine Angaben");
    expect(bar.detail).toContain(
      "Das heißt nicht, dass der Ort nicht zugänglich ist",
    );
    expect(bar.action).toBeNull();
  });

  it("offers 'Veranstalter fragen' only with a usable public contact", () => {
    const action = (contact: string | null) =>
      infoBars("de", {
        ...plain,
        priceText: null,
        access: [],
        organizer: organizer(contact),
      })[0].action;

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
  it("names every main format as the design does, in both languages", () => {
    expect(Object.keys(PUBLIC_FORMAT_ID).sort()).toEqual(
      [...PRIMARY_FORMATS].sort(),
    );
    expect(t("de", PUBLIC_FORMAT_ID.club_night)).toBe("Party / Clubabend");
    expect(t("de", PUBLIC_FORMAT_ID.screening)).toBe("Filmabend / Screening");
    expect(t("de", PUBLIC_FORMAT_ID.exhibition)).toBe(
      "Ausstellungsabend / Offspace",
    );
    expect(t("de", PUBLIC_FORMAT_ID.concert)).toBe("Konzert / Live-Musik");
    expect(t("en", PUBLIC_FORMAT_ID.club_night)).toBe("Party / club night");
  });
});

describe("bars from the blocks of Mehr zum Abend", () => {
  const bars = (
    modules: Parameters<typeof infoBars>[1]["modules"],
    over: Partial<Parameters<typeof infoBars>[1]> = {},
    lang: "de" | "en" = "de",
  ) =>
    infoBars(lang, {
      ...plain,
      priceText: "6,00 €",
      access: [],
      organizer: organizer(null),
      modules,
      ...over,
    });

  it("shows doors with the start as the detail, before the entry bar", () => {
    const list = bars({
      entry_age: { doors_at: "19:30", age_rule: null, min_age: null },
    });

    expect(list.map((bar) => bar.key)).toEqual([
      "doors",
      "entry",
      "accessibility",
    ]);
    expect(list[0]).toMatchObject({
      label: "Einlass",
      value: "19:30",
      detail: "Beginn um 22:00 Uhr",
    });
  });

  it("words the bars in English", () => {
    const [doors] = bars(
      { entry_age: { doors_at: "19:30", age_rule: null, min_age: null } },
      {},
      "en",
    );

    expect(doors).toMatchObject({ label: "Doors", detail: "Starts at 22:00" });
  });

  it("shows the age as a number, or for all ages, and nothing when it is not known", () => {
    const age = (
      age_rule: "minimum" | "all_ages" | "unknown",
      min_age: number | null,
    ) =>
      bars({ entry_age: { doors_at: null, age_rule, min_age } }).find(
        (bar) => bar.key === "age",
      );

    expect(age("minimum", 16)).toMatchObject({
      value: "Ab 16",
      detail: "Zutritt ab 16 Jahren.",
    });
    expect(age("all_ages", null)?.value).toBe("Für alle Altersgruppen");
    expect(age("unknown", null)).toBeUndefined();
  });

  it("shows a time window only for a flexible visit", () => {
    const visit = (
      mode: "fixed_start" | "drop_in" | "both",
      to: string | null,
    ) =>
      bars({
        visit_mode: {
          mode,
          window_from: "18:00",
          window_to: to,
          short_visit: "short_ok",
        },
      }).find((bar) => bar.key === "window");

    expect(visit("fixed_start", "22:00")).toBeUndefined();
    expect(visit("drop_in", "22:00")).toMatchObject({
      label: "Zeitfenster",
      value: "18:00–22:00 Uhr",
      detail: "Kommt, wann ihr wollt. Ein kurzer Besuch genügt.",
    });
    expect(visit("drop_in", null)?.value).toBe("ab 18:00 Uhr");
  });

  it("leaves out the times of a cancelled event or one without a new date", () => {
    const modules = {
      entry_age: { doors_at: "19:30", age_rule: null, min_age: null },
      visit_mode: {
        mode: "drop_in" as const,
        window_from: "18:00",
        window_to: null,
        short_visit: null,
      },
    };

    for (const status of ["cancelled", "postponed_undated"] as const) {
      expect(bars(modules, { status }).map((bar) => bar.key)).toEqual(
        // A cancelled event shows no cost either.
        status === "cancelled" ? ["accessibility"] : ["entry", "accessibility"],
      );
    }
  });

  it("shows the language, with the subtitles as detail", () => {
    const language = bars({
      language: {
        program: "de",
        subtitles: "partial",
        subtitle_language: "Englisch",
      },
    }).find((bar) => bar.key === "language");

    expect(language).toMatchObject({
      label: "Sprache",
      value: "Deutsch",
      detail: "Untertitel: Teilweise (Englisch)",
    });
  });

  it("shows no language bar when nothing is known", () => {
    const list = bars({
      language: {
        program: "unknown",
        subtitles: "unknown",
        subtitle_language: null,
      },
    });

    expect(list.some((bar) => bar.key === "language")).toBe(false);
  });
});
