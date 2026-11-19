// "Mehr zum Abend" (Figma EVT-07, EVT-07m-a to 07m-k): optional blocks that tell
// guests more about the evening. Pure rules, no framework or database imports.
//
// Storage: event_revisions.modules (jsonb), one key per block that is on the
// page of the draft. NULL means the step was never saved: the suggestions of
// the format apply. An object lists exactly the blocks that are there, empty
// or not; a block that was removed has no key. The field names are a proposal
// (the contract leaves them open, docs/startpaket/10-flow-karte.md), the
// database only checks the shape and the size.
//
// Answer states: unknown is never an empty field. A required block
// (opening: visit mode, screening: language and subtitles) is answered when
// every one of its required questions has a value; "unknown" is a value.
//
// Built blocks: six of eleven. The five that have no expanded frame yet
// (Programm und Ablauf, Dauer, Eingang finden, Zugänglichkeit, Drinnen oder
// draußen) are added one by one when their frames exist.

import type { PrimaryFormat } from "./event-publication";

export const MODULE_KEYS = [
  "entry_age",
  "visit_mode",
  "language",
  "music",
  "participants",
  "bring_participation",
] as const;
export type ModuleKey = (typeof MODULE_KEYS)[number];

export const AGE_RULES = ["minimum", "all_ages", "unknown"] as const;
export type AgeRule = (typeof AGE_RULES)[number];

export const VISIT_MODES = [
  "fixed_start",
  "drop_in",
  "both",
  "unknown",
] as const;
export type VisitMode = (typeof VISIT_MODES)[number];

export const SHORT_VISITS = ["short_ok", "longer", "unknown"] as const;
export type ShortVisit = (typeof SHORT_VISITS)[number];

export const PROGRAM_LANGUAGES = [
  "de",
  "en",
  "original_subtitled",
  "unknown",
] as const;
export type ProgramLanguage = (typeof PROGRAM_LANGUAGES)[number];

export const SUBTITLES = ["yes", "partial", "no", "unknown"] as const;
export type Subtitles = (typeof SUBTITLES)[number];

// The broad music directions of the data contract v0.3 (decided).
export const MUSIC_GENRES = [
  "electronic",
  "hiphop_rap",
  "jazz",
  "soul_funk_rnb",
  "rock_punk",
  "pop",
  "classical_new",
  "folk_acoustic",
  "experimental",
] as const;
export type MusicGenre = (typeof MUSIC_GENRES)[number];

export const MAX_GENRES = 3;

// TODO(spec): the limits are proposals, like EVENT_LIMITS.
export const MODULE_LIMITS = {
  precision: 120,
  participants: 600,
  bring: 300,
  subtitleLanguage: 60,
  minAge: 99,
} as const;

// What is stored. Every field is null while it is not answered.
export type StoredModules = {
  entry_age?: {
    doors_at: string | null;
    age_rule: AgeRule | null;
    min_age: number | null;
  };
  visit_mode?: {
    mode: VisitMode | null;
    window_from: string | null;
    window_to: string | null;
    short_visit: ShortVisit | null;
  };
  language?: {
    program: ProgramLanguage | null;
    subtitles: Subtitles | null;
    subtitle_language: string | null;
  };
  music?: { precision: string | null; genres: MusicGenre[] };
  participants?: { text: string | null };
  bring_participation?: { text: string | null };
};

// What the screen shows: text and lists only.
export type ModuleForm = {
  doorsAt: string;
  ageRule: string;
  minAge: string;
  visitMode: string;
  windowFrom: string;
  windowTo: string;
  shortVisit: string;
  program: string;
  subtitles: string;
  subtitleLanguage: string;
  musicPrecision: string;
  musicGenres: string[];
  participants: string;
  bringText: string;
};

export const EMPTY_MODULE_FORM: ModuleForm = {
  doorsAt: "",
  ageRule: "",
  minAge: "",
  visitMode: "",
  windowFrom: "",
  windowTo: "",
  shortVisit: "",
  program: "",
  subtitles: "",
  subtitleLanguage: "",
  musicPrecision: "",
  musicGenres: [],
  participants: "",
  bringText: "",
};

// What the screen sends: the blocks that are on the page, in order, and the
// values of the fields. Values of a block that is not in `blocks` are ignored.
export type ModulesInput = {
  blocks: string[];
  form: ModuleForm;
};

// ---------------------------------------------------------------------------
// Suggestions and required blocks per format
// ---------------------------------------------------------------------------

// The blocks suggested for a format (Figma 07m-a, c, d, e). Formats without
// an entry have no suggestions (07m-e). Only built blocks are listed.
const SUGGESTED: Partial<Record<PrimaryFormat, readonly ModuleKey[]>> = {
  club_night: ["entry_age", "music"],
  opening: ["visit_mode", "participants"],
  screening: ["language"],
};

// Required blocks (contract: formatabhängige Mindestregeln). They cannot be
// removed; "unknown" counts as an answer.
const REQUIRED: Partial<Record<PrimaryFormat, ModuleKey>> = {
  opening: "visit_mode",
  screening: "language",
};

export function suggestedBlocks(format: string): readonly ModuleKey[] {
  return SUGGESTED[format as PrimaryFormat] ?? [];
}

export function requiredBlock(format: string): ModuleKey | null {
  return REQUIRED[format as PrimaryFormat] ?? null;
}

// The blocks that are on the page: the stored ones (or the suggestions while
// nothing was saved), plus the required block of the format. In the fixed
// order of MODULE_KEYS so that the page does not jump around.
export function blocksOnPage(
  stored: StoredModules | null,
  format: string,
): ModuleKey[] {
  const base: readonly string[] =
    stored === null ? suggestedBlocks(format) : Object.keys(stored);
  const required = requiredBlock(format);

  return MODULE_KEYS.filter((key) => base.includes(key) || key === required);
}

// ---------------------------------------------------------------------------
// Stored shape <-> form
// ---------------------------------------------------------------------------

function isOneOf<T extends string>(
  list: readonly T[],
  value: unknown,
): value is T {
  return (
    typeof value === "string" && (list as readonly string[]).includes(value)
  );
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Reads what the database holds. Anything that does not fit is dropped (a
// row from an older build must not break the page).
export function parseStored(json: unknown): StoredModules | null {
  if (!isRecord(json)) {
    return null;
  }

  const out: StoredModules = {};
  const entry = json.entry_age;
  const visit = json.visit_mode;
  const language = json.language;
  const music = json.music;
  const participants = json.participants;
  const bring = json.bring_participation;

  if (isRecord(entry)) {
    out.entry_age = {
      doors_at: str(entry.doors_at),
      age_rule: isOneOf(AGE_RULES, entry.age_rule) ? entry.age_rule : null,
      min_age:
        typeof entry.min_age === "number" && Number.isInteger(entry.min_age)
          ? entry.min_age
          : null,
    };
  }

  if (isRecord(visit)) {
    out.visit_mode = {
      mode: isOneOf(VISIT_MODES, visit.mode) ? visit.mode : null,
      window_from: str(visit.window_from),
      window_to: str(visit.window_to),
      short_visit: isOneOf(SHORT_VISITS, visit.short_visit)
        ? visit.short_visit
        : null,
    };
  }

  if (isRecord(language)) {
    out.language = {
      program: isOneOf(PROGRAM_LANGUAGES, language.program)
        ? language.program
        : null,
      subtitles: isOneOf(SUBTITLES, language.subtitles)
        ? language.subtitles
        : null,
      subtitle_language: str(language.subtitle_language),
    };
  }

  if (isRecord(music)) {
    out.music = {
      precision: str(music.precision),
      genres: Array.isArray(music.genres)
        ? music.genres.filter((g): g is MusicGenre => isOneOf(MUSIC_GENRES, g))
        : [],
    };
  }

  if (isRecord(participants)) {
    out.participants = { text: str(participants.text) };
  }

  if (isRecord(bring)) {
    out.bring_participation = { text: str(bring.text) };
  }

  return out;
}

export function storedToForm(stored: StoredModules | null): ModuleForm {
  return {
    doorsAt: stored?.entry_age?.doors_at ?? "",
    ageRule: stored?.entry_age?.age_rule ?? "",
    minAge:
      stored?.entry_age?.min_age != null
        ? String(stored.entry_age.min_age)
        : "",
    visitMode: stored?.visit_mode?.mode ?? "",
    windowFrom: stored?.visit_mode?.window_from ?? "",
    windowTo: stored?.visit_mode?.window_to ?? "",
    shortVisit: stored?.visit_mode?.short_visit ?? "",
    program: stored?.language?.program ?? "",
    subtitles: stored?.language?.subtitles ?? "",
    subtitleLanguage: stored?.language?.subtitle_language ?? "",
    musicPrecision: stored?.music?.precision ?? "",
    musicGenres: stored?.music?.genres ?? [],
    participants: stored?.participants?.text ?? "",
    bringText: stored?.bring_participation?.text ?? "",
  };
}

// What a block shows depends on other answers: a window only for a flexible
// visit, a minimum age only for the rule "minimum". Fields that are not
// visible are not stored.
export function showsWindow(mode: string): boolean {
  return mode === "drop_in" || mode === "both";
}

export function showsMinAge(rule: string): boolean {
  return rule === "minimum";
}

export function showsSubtitleLanguage(subtitles: string): boolean {
  return subtitles === "yes" || subtitles === "partial";
}

function trimmed(value: string): string {
  return value.trim();
}

function orNull(value: string): string | null {
  const v = value.trim();
  return v === "" ? null : v;
}

// The stored shape for the blocks that are on the page. Call it with input
// that passed validateModules.
export function formToStored(input: ModulesInput): StoredModules {
  const { form } = input;
  const out: StoredModules = {};

  for (const key of MODULE_KEYS) {
    if (!input.blocks.includes(key)) continue;

    if (key === "entry_age") {
      const rule = isOneOf(AGE_RULES, form.ageRule) ? form.ageRule : null;
      out.entry_age = {
        doors_at: orNull(form.doorsAt),
        age_rule: rule,
        min_age:
          rule === "minimum" && /^\d{1,2}$/.test(trimmed(form.minAge))
            ? Number(trimmed(form.minAge))
            : null,
      };
    } else if (key === "visit_mode") {
      const mode = isOneOf(VISIT_MODES, form.visitMode) ? form.visitMode : null;
      const flexible = mode !== null && showsWindow(mode);
      out.visit_mode = {
        mode,
        window_from: flexible ? orNull(form.windowFrom) : null,
        window_to: flexible ? orNull(form.windowTo) : null,
        short_visit:
          flexible && isOneOf(SHORT_VISITS, form.shortVisit)
            ? form.shortVisit
            : null,
      };
    } else if (key === "language") {
      const subtitles = isOneOf(SUBTITLES, form.subtitles)
        ? form.subtitles
        : null;
      out.language = {
        program: isOneOf(PROGRAM_LANGUAGES, form.program) ? form.program : null,
        subtitles,
        subtitle_language:
          subtitles !== null && showsSubtitleLanguage(subtitles)
            ? orNull(form.subtitleLanguage)
            : null,
      };
    } else if (key === "music") {
      out.music = {
        precision: orNull(form.musicPrecision),
        genres: MUSIC_GENRES.filter((g) => form.musicGenres.includes(g)),
      };
    } else if (key === "participants") {
      out.participants = { text: orNull(form.participants) };
    } else {
      out.bring_participation = { text: orNull(form.bringText) };
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Checks (codes, not texts; the screen looks them up in the catalog)
// ---------------------------------------------------------------------------

export type ModuleCode =
  | "doorsInvalid"
  | "ageRuleInvalid"
  | "ageMissing"
  | "ageInvalid"
  | "visitModeInvalid"
  | "windowFromMissing"
  | "windowFromInvalid"
  | "windowToInvalid"
  | "shortVisitInvalid"
  | "programInvalid"
  | "subtitlesInvalid"
  | "subtitleLanguageTooLong"
  | "precisionTooLong"
  | "genresInvalid"
  | "genresTooMany"
  | "participantsTooLong"
  | "bringTooLong"
  // A required block that is not answered yet (only with intent "next").
  | "requiredMissing";

export type ModuleField =
  | "doorsAt"
  | "ageRule"
  | "minAge"
  | "visitMode"
  | "windowFrom"
  | "windowTo"
  | "shortVisit"
  | "program"
  | "subtitles"
  | "subtitleLanguage"
  | "musicPrecision"
  | "musicGenres"
  | "participants"
  | "bringText";

export type ModuleErrors = Partial<Record<ModuleField, ModuleCode>>;

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type ModuleIntent = "next" | "later";

// The block each field belongs to (the card that shows the error).
export const FIELD_BLOCK: Record<ModuleField, ModuleKey> = {
  doorsAt: "entry_age",
  ageRule: "entry_age",
  minAge: "entry_age",
  visitMode: "visit_mode",
  windowFrom: "visit_mode",
  windowTo: "visit_mode",
  shortVisit: "visit_mode",
  program: "language",
  subtitles: "language",
  subtitleLanguage: "language",
  musicPrecision: "music",
  musicGenres: "music",
  participants: "participants",
  bringText: "bring_participation",
};

// "next" ("Weiter zur Vorschau") also asks for the required block of the
// format; "later" ("Überspringen") only refuses what cannot be stored.
export function validateModules(
  input: ModulesInput,
  format: string,
  intent: ModuleIntent,
): ModuleErrors {
  const { form } = input;
  const on = (key: ModuleKey) => input.blocks.includes(key);
  const errors: ModuleErrors = {};

  if (on("entry_age")) {
    const doors = trimmed(form.doorsAt);

    if (doors !== "" && !TIME.test(doors)) errors.doorsAt = "doorsInvalid";

    const rule = trimmed(form.ageRule);

    if (rule !== "" && !isOneOf(AGE_RULES, rule)) {
      errors.ageRule = "ageRuleInvalid";
    } else if (showsMinAge(rule)) {
      const age = trimmed(form.minAge);

      if (age === "") {
        errors.minAge = "ageMissing";
      } else if (
        !/^\d{1,2}$/.test(age) ||
        Number(age) < 1 ||
        Number(age) > MODULE_LIMITS.minAge
      ) {
        errors.minAge = "ageInvalid";
      }
    }
  }

  if (on("visit_mode")) {
    const mode = trimmed(form.visitMode);

    if (mode !== "" && !isOneOf(VISIT_MODES, mode)) {
      errors.visitMode = "visitModeInvalid";
    } else if (showsWindow(mode)) {
      const from = trimmed(form.windowFrom);
      const to = trimmed(form.windowTo);

      if (from === "") errors.windowFrom = "windowFromMissing";
      else if (!TIME.test(from)) errors.windowFrom = "windowFromInvalid";

      if (to !== "" && !TIME.test(to)) errors.windowTo = "windowToInvalid";

      const short = trimmed(form.shortVisit);

      if (short !== "" && !isOneOf(SHORT_VISITS, short)) {
        errors.shortVisit = "shortVisitInvalid";
      }
    }
  }

  if (on("language")) {
    const program = trimmed(form.program);
    const subtitles = trimmed(form.subtitles);

    if (program !== "" && !isOneOf(PROGRAM_LANGUAGES, program)) {
      errors.program = "programInvalid";
    }

    if (subtitles !== "" && !isOneOf(SUBTITLES, subtitles)) {
      errors.subtitles = "subtitlesInvalid";
    } else if (
      showsSubtitleLanguage(subtitles) &&
      trimmed(form.subtitleLanguage).length > MODULE_LIMITS.subtitleLanguage
    ) {
      errors.subtitleLanguage = "subtitleLanguageTooLong";
    }
  }

  if (on("music")) {
    const genres = [...new Set(form.musicGenres)];

    if (trimmed(form.musicPrecision).length > MODULE_LIMITS.precision) {
      errors.musicPrecision = "precisionTooLong";
    }

    if (genres.some((g) => !isOneOf(MUSIC_GENRES, g))) {
      errors.musicGenres = "genresInvalid";
    } else if (genres.length > MAX_GENRES) {
      errors.musicGenres = "genresTooMany";
    }
  }

  if (
    on("participants") &&
    trimmed(form.participants).length > MODULE_LIMITS.participants
  ) {
    errors.participants = "participantsTooLong";
  }

  if (
    on("bring_participation") &&
    trimmed(form.bringText).length > MODULE_LIMITS.bring
  ) {
    errors.bringText = "bringTooLong";
  }

  if (intent === "next") {
    const required = requiredBlock(format);

    if (required === "visit_mode" && on("visit_mode") && !errors.visitMode) {
      if (trimmed(form.visitMode) === "") errors.visitMode = "requiredMissing";
    }

    if (required === "language" && on("language")) {
      if (!errors.program && trimmed(form.program) === "") {
        errors.program = "requiredMissing";
      }

      if (!errors.subtitles && trimmed(form.subtitles) === "") {
        errors.subtitles = "requiredMissing";
      }
    }
  }

  return errors;
}

// Is the required block of this format answered? (Used by the submit check,
// EIN-01, and by the card.) A format without a required block is always
// answered.
export function requiredAnswered(
  stored: StoredModules | null,
  format: string,
): boolean {
  const required = requiredBlock(format);

  if (required === "visit_mode") {
    return stored?.visit_mode?.mode != null;
  }

  if (required === "language") {
    return (
      stored?.language?.program != null && stored?.language?.subtitles != null
    );
  }

  return true;
}
