import { describe, expect, it } from "vitest";

import {
  blocksOnPage,
  EMPTY_MODULE_FORM,
  formToStored,
  parseStored,
  requiredAnswered,
  requiredBlock,
  storedToForm,
  suggestedBlocks,
  validateModules,
  type ModuleForm,
  type ModuleKey,
} from "../../lib/domain/event-modules";
import { moduleSummary } from "../../lib/event/module-summary";

const form = (patch: Partial<ModuleForm> = {}): ModuleForm => ({
  ...EMPTY_MODULE_FORM,
  ...patch,
});
const input = (blocks: ModuleKey[], patch: Partial<ModuleForm> = {}) => ({
  blocks,
  form: form(patch),
});

describe("suggestions and required blocks", () => {
  it("suggests blocks per format and nothing for the others", () => {
    expect(suggestedBlocks("club_night")).toEqual(["entry_age", "music"]);
    expect(suggestedBlocks("opening")).toEqual(["visit_mode", "participants"]);
    expect(suggestedBlocks("screening")).toEqual(["language"]);
    expect(suggestedBlocks("concert")).toEqual([]);
    expect(suggestedBlocks("")).toEqual([]);
  });

  it("requires the visit mode for an opening and language for a film", () => {
    expect(requiredBlock("opening")).toBe("visit_mode");
    expect(requiredBlock("screening")).toBe("language");
    expect(requiredBlock("club_night")).toBeNull();
  });

  it("shows the suggestions while nothing is stored", () => {
    expect(blocksOnPage(null, "club_night")).toEqual(["entry_age", "music"]);
    expect(blocksOnPage(null, "concert")).toEqual([]);
  });

  it("shows exactly the stored blocks once the step was saved", () => {
    expect(
      blocksOnPage({ music: { precision: null, genres: [] } }, "club_night"),
    ).toEqual(["music"]);
    expect(blocksOnPage({}, "club_night")).toEqual([]);
  });

  it("keeps the required block even when it was not stored", () => {
    expect(blocksOnPage({}, "opening")).toEqual(["visit_mode"]);
    expect(blocksOnPage({ participants: { text: null } }, "screening")).toEqual(
      ["language", "participants"],
    );
  });
});

describe("validateModules", () => {
  it("accepts an empty page", () => {
    expect(validateModules(input([]), "club_night", "next")).toEqual({});
  });

  it("ignores the fields of blocks that are not on the page", () => {
    expect(
      validateModules(
        input([], { doorsAt: "halb zehn" }),
        "club_night",
        "next",
      ),
    ).toEqual({});
  });

  it("checks the door time", () => {
    expect(
      validateModules(input(["entry_age"], { doorsAt: "21:30" }), "", "next"),
    ).toEqual({});
    expect(
      validateModules(
        input(["entry_age"], { doorsAt: "halb zehn" }),
        "",
        "next",
      ),
    ).toEqual({ doorsAt: "doorsInvalid" });
    expect(
      validateModules(input(["entry_age"], { doorsAt: "25:00" }), "", "later"),
    ).toEqual({ doorsAt: "doorsInvalid" });
  });

  it("needs a minimum age with the rule minimum, from 1 to 99", () => {
    const check = (minAge: string) =>
      validateModules(
        input(["entry_age"], { ageRule: "minimum", minAge }),
        "",
        "later",
      );

    expect(check("")).toEqual({ minAge: "ageMissing" });
    expect(check("0")).toEqual({ minAge: "ageInvalid" });
    expect(check("100")).toEqual({ minAge: "ageInvalid" });
    expect(check("abc")).toEqual({ minAge: "ageInvalid" });
    expect(check("18")).toEqual({});
  });

  it("does not ask for an age with another rule", () => {
    expect(
      validateModules(
        input(["entry_age"], { ageRule: "all_ages", minAge: "abc" }),
        "",
        "next",
      ),
    ).toEqual({});
    expect(
      validateModules(input(["entry_age"], { ageRule: "x" }), "", "next"),
    ).toEqual({ ageRule: "ageRuleInvalid" });
  });

  it("asks for the visit mode of an opening only with intent next", () => {
    expect(validateModules(input(["visit_mode"]), "opening", "next")).toEqual({
      visitMode: "requiredMissing",
    });
    expect(validateModules(input(["visit_mode"]), "opening", "later")).toEqual(
      {},
    );
    expect(
      validateModules(
        input(["visit_mode"], { visitMode: "unknown" }),
        "opening",
        "next",
      ),
    ).toEqual({});
  });

  it("needs the start of the visiting window for a flexible visit", () => {
    const check = (patch: Partial<ModuleForm>) =>
      validateModules(
        input(["visit_mode"], { visitMode: "drop_in", ...patch }),
        "opening",
        "next",
      );

    expect(check({})).toEqual({ windowFrom: "windowFromMissing" });
    expect(check({ windowFrom: "7pm" })).toEqual({
      windowFrom: "windowFromInvalid",
    });
    expect(check({ windowFrom: "19:00", windowTo: "ende" })).toEqual({
      windowTo: "windowToInvalid",
    });
    expect(check({ windowFrom: "19:00" })).toEqual({});
    expect(check({ windowFrom: "19:00", shortVisit: "x" })).toEqual({
      shortVisit: "shortVisitInvalid",
    });
  });

  it("does not ask for a window with a shared start", () => {
    expect(
      validateModules(
        input(["visit_mode"], { visitMode: "fixed_start" }),
        "opening",
        "next",
      ),
    ).toEqual({});
  });

  it("asks for program language and subtitles of a film, unknown counts", () => {
    expect(validateModules(input(["language"]), "screening", "next")).toEqual({
      program: "requiredMissing",
      subtitles: "requiredMissing",
    });
    expect(
      validateModules(
        input(["language"], { program: "unknown", subtitles: "unknown" }),
        "screening",
        "next",
      ),
    ).toEqual({});
    expect(
      validateModules(
        input(["language"], { program: "de" }),
        "screening",
        "next",
      ),
    ).toEqual({ subtitles: "requiredMissing" });
  });

  it("does not require language and subtitles for another format", () => {
    expect(validateModules(input(["language"]), "concert", "next")).toEqual({});
  });

  it("limits the subtitle language only where it is shown", () => {
    const long = "x".repeat(61);

    expect(
      validateModules(
        input(["language"], {
          program: "de",
          subtitles: "yes",
          subtitleLanguage: long,
        }),
        "screening",
        "next",
      ),
    ).toEqual({ subtitleLanguage: "subtitleLanguageTooLong" });
    expect(
      validateModules(
        input(["language"], {
          program: "de",
          subtitles: "no",
          subtitleLanguage: long,
        }),
        "screening",
        "next",
      ),
    ).toEqual({});
  });

  it("allows at most three known music directions", () => {
    const check = (musicGenres: string[]) =>
      validateModules(input(["music"], { musicGenres }), "club_night", "next");

    expect(check(["electronic", "jazz", "pop"])).toEqual({});
    expect(check(["electronic", "jazz", "pop", "folk_acoustic"])).toEqual({
      musicGenres: "genresTooMany",
    });
    expect(check(["techno"])).toEqual({ musicGenres: "genresInvalid" });
    // The same direction twice counts once.
    expect(check(["jazz", "jazz", "pop", "electronic"])).toEqual({});
  });

  it("limits the free texts", () => {
    expect(
      validateModules(
        input(["music", "participants", "bring_participation"], {
          musicPrecision: "x".repeat(121),
          participants: "x".repeat(601),
          bringText: "x".repeat(301),
        }),
        "",
        "later",
      ),
    ).toEqual({
      musicPrecision: "precisionTooLong",
      participants: "participantsTooLong",
      bringText: "bringTooLong",
    });
  });
});

describe("formToStored", () => {
  it("stores only the blocks on the page, every unanswered field as null", () => {
    expect(formToStored(input(["entry_age", "participants"]))).toEqual({
      entry_age: { doors_at: null, age_rule: null, min_age: null },
      participants: { text: null },
    });
    expect(formToStored(input([]))).toEqual({});
  });

  it("stores the minimum age only with the rule minimum", () => {
    expect(
      formToStored(
        input(["entry_age"], {
          doorsAt: " 21:30 ",
          ageRule: "minimum",
          minAge: "18",
        }),
      ).entry_age,
    ).toEqual({ doors_at: "21:30", age_rule: "minimum", min_age: 18 });
    expect(
      formToStored(input(["entry_age"], { ageRule: "all_ages", minAge: "18" }))
        .entry_age,
    ).toEqual({ doors_at: null, age_rule: "all_ages", min_age: null });
  });

  it("keeps unknown as an answer, never as an empty field", () => {
    expect(
      formToStored(input(["visit_mode"], { visitMode: "unknown" })).visit_mode,
    ).toEqual({
      mode: "unknown",
      window_from: null,
      window_to: null,
      short_visit: null,
    });
  });

  it("stores the window and the short visit only for a flexible visit", () => {
    const patch = {
      windowFrom: "19:00",
      windowTo: "22:00",
      shortVisit: "short_ok",
    };

    expect(
      formToStored(input(["visit_mode"], { visitMode: "both", ...patch }))
        .visit_mode,
    ).toEqual({
      mode: "both",
      window_from: "19:00",
      window_to: "22:00",
      short_visit: "short_ok",
    });
    expect(
      formToStored(
        input(["visit_mode"], { visitMode: "fixed_start", ...patch }),
      ).visit_mode,
    ).toEqual({
      mode: "fixed_start",
      window_from: null,
      window_to: null,
      short_visit: null,
    });
  });

  it("stores the subtitle language only when there are subtitles", () => {
    expect(
      formToStored(
        input(["language"], {
          program: "original_subtitled",
          subtitles: "partial",
          subtitleLanguage: "Deutsch",
        }),
      ).language,
    ).toEqual({
      program: "original_subtitled",
      subtitles: "partial",
      subtitle_language: "Deutsch",
    });
    expect(
      formToStored(
        input(["language"], {
          program: "de",
          subtitles: "no",
          subtitleLanguage: "Deutsch",
        }),
      ).language?.subtitle_language,
    ).toBeNull();
  });

  it("keeps the directions in catalog order and drops duplicates", () => {
    expect(
      formToStored(
        input(["music"], {
          musicPrecision: "  Dub Techno ",
          musicGenres: ["jazz", "electronic", "jazz"],
        }),
      ).music,
    ).toEqual({ precision: "Dub Techno", genres: ["electronic", "jazz"] });
  });

  it("round-trips through the form", () => {
    const stored = formToStored(
      input(["entry_age", "music", "participants"], {
        doorsAt: "21:30",
        ageRule: "minimum",
        minAge: "18",
        musicGenres: ["pop"],
        participants: "Mara — DJ-Set\nKaro — DJ-Set",
      }),
    );
    const again = formToStored({
      blocks: Object.keys(stored) as ModuleKey[],
      form: storedToForm(stored),
    });

    expect(again).toEqual(stored);
  });
});

describe("parseStored", () => {
  it("returns null for anything that is not an object", () => {
    expect(parseStored(null)).toBeNull();
    expect(parseStored("x")).toBeNull();
    expect(parseStored([1])).toBeNull();
  });

  it("drops what does not fit instead of failing", () => {
    expect(
      parseStored({
        entry_age: { doors_at: "21:30", age_rule: "bogus", min_age: "18" },
        music: { precision: 5, genres: ["jazz", "techno"] },
        unknown_block: {},
      }),
    ).toEqual({
      entry_age: { doors_at: "21:30", age_rule: null, min_age: null },
      music: { precision: null, genres: ["jazz"] },
    });
  });

  it("keeps an empty object as 'every block removed'", () => {
    expect(parseStored({})).toEqual({});
  });
});

describe("requiredAnswered", () => {
  it("is true for a format without a required block", () => {
    expect(requiredAnswered(null, "club_night")).toBe(true);
  });

  it("needs a mode for an opening; unknown counts", () => {
    expect(requiredAnswered(null, "opening")).toBe(false);
    expect(
      requiredAnswered(
        {
          visit_mode: {
            mode: null,
            window_from: null,
            window_to: null,
            short_visit: null,
          },
        },
        "opening",
      ),
    ).toBe(false);
    expect(
      requiredAnswered(
        {
          visit_mode: {
            mode: "unknown",
            window_from: null,
            window_to: null,
            short_visit: null,
          },
        },
        "opening",
      ),
    ).toBe(true);
  });

  it("needs program and subtitles for a film", () => {
    expect(
      requiredAnswered(
        {
          language: { program: "de", subtitles: null, subtitle_language: null },
        },
        "screening",
      ),
    ).toBe(false);
    expect(
      requiredAnswered(
        {
          language: {
            program: "de",
            subtitles: "unknown",
            subtitle_language: null,
          },
        },
        "screening",
      ),
    ).toBe(true);
  });
});

describe("moduleSummary", () => {
  it("has no summary for an empty block", () => {
    for (const key of [
      "entry_age",
      "visit_mode",
      "language",
      "music",
      "participants",
      "bring_participation",
    ] as const) {
      expect(moduleSummary("de", key, form())).toBeNull();
    }
  });

  it("summarizes entry and age in both languages", () => {
    const f = form({ doorsAt: "21:30", ageRule: "minimum", minAge: "18" });

    expect(moduleSummary("de", "entry_age", f)).toBe(
      "Einlass ab 21:30, ab 18 Jahren",
    );
    expect(moduleSummary("en", "entry_age", f)).toBe(
      "Doors open 21:30, ages 18+",
    );
  });

  it("does not show an unknown age as a number", () => {
    expect(moduleSummary("de", "entry_age", form({ ageRule: "unknown" }))).toBe(
      "Alter noch unbekannt",
    );
  });

  it("summarizes the visit mode with its window", () => {
    expect(
      moduleSummary(
        "de",
        "visit_mode",
        form({ visitMode: "drop_in", windowFrom: "19:00" }),
      ),
    ).toBe("Flexibel vorbeikommen, ab 19:00");
    expect(
      moduleSummary(
        "de",
        "visit_mode",
        form({ visitMode: "drop_in", windowFrom: "19:00", windowTo: "22:00" }),
      ),
    ).toBe("Flexibel vorbeikommen, 19:00 bis 22:00");
  });

  it("summarizes music from the text and the directions", () => {
    expect(
      moduleSummary(
        "de",
        "music",
        form({
          musicPrecision: "Dub Techno",
          musicGenres: ["electronic", "jazz"],
        }),
      ),
    ).toBe("Dub Techno · Elektronisch, Jazz");
  });

  it("lists the people on one line", () => {
    expect(
      moduleSummary(
        "de",
        "participants",
        form({ participants: "Mara — DJ-Set\n\nKaro — DJ-Set\n" }),
      ),
    ).toBe("Mara — DJ-Set, Karo — DJ-Set");
  });
});
