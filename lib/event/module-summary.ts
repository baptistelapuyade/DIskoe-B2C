// Texts of the block cards of "Mehr zum Abend" (Figma EVT-07m-a): the title,
// the picker description and the one-line summary of what is filled in. Pure:
// built from the form values, in the language of the organizer. A block with
// nothing in it has no summary (the card says "Noch keine Angabe").

import {
  MUSIC_GENRES,
  showsMinAge,
  showsSubtitleLanguage,
  showsWindow,
  type ModuleForm,
  type ModuleKey,
  type MusicGenre,
} from "../domain/event-modules";
import { t, type Lang, type MessageId } from "../i18n";

export const BLOCK_ID: Record<ModuleKey, MessageId> = {
  entry_age: "Z26.block.entryAge",
  visit_mode: "Z26.block.visitMode",
  language: "Z26.block.language",
  music: "Z26.block.music",
  participants: "Z26.block.participants",
  bring_participation: "Z26.block.bring",
};

export const BLOCK_DESC_ID: Record<ModuleKey, MessageId> = {
  entry_age: "Z26.block.entryAge.desc",
  visit_mode: "Z26.block.visitMode.desc",
  language: "Z26.block.language.desc",
  music: "Z26.block.music.desc",
  participants: "Z26.block.participants.desc",
  bring_participation: "Z26.block.bring.desc",
};

export const GENRE_ID: Record<MusicGenre, MessageId> = {
  electronic: "Z26.genre.electronic",
  hiphop_rap: "Z26.genre.hiphop",
  jazz: "Z26.genre.jazz",
  soul_funk_rnb: "Z26.genre.soul",
  rock_punk: "Z26.genre.rock",
  pop: "Z26.genre.pop",
  classical_new: "Z26.genre.classical",
  folk_acoustic: "Z26.genre.folk",
  experimental: "Z26.genre.experimental",
};

export const AGE_RULE_ID: Record<string, MessageId> = {
  minimum: "Z26.entry.rule.minimum",
  all_ages: "Z26.entry.rule.allAges",
  unknown: "Z26.entry.rule.unknown",
};

export const VISIT_MODE_ID: Record<string, MessageId> = {
  fixed_start: "Z26.visit.mode.fixed",
  drop_in: "Z26.visit.mode.dropIn",
  both: "Z26.visit.mode.both",
  unknown: "Z26.visit.mode.unknown",
};

export const SHORT_VISIT_ID: Record<string, MessageId> = {
  short_ok: "Z26.visit.short.ok",
  longer: "Z26.visit.short.longer",
  unknown: "Z26.visit.short.unknown",
};

export const PROGRAM_ID: Record<string, MessageId> = {
  de: "Z26.lang.program.de",
  en: "Z26.lang.program.en",
  original_subtitled: "Z26.lang.program.original",
  unknown: "Z26.lang.program.unknown",
};

export const SUBTITLES_ID: Record<string, MessageId> = {
  yes: "Z26.lang.subtitles.yes",
  partial: "Z26.lang.subtitles.partial",
  no: "Z26.lang.subtitles.no",
  unknown: "Z26.lang.subtitles.unknown",
};

function lines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

export function moduleSummary(
  lang: Lang,
  key: ModuleKey,
  form: ModuleForm,
): string | null {
  const parts: string[] = [];

  if (key === "entry_age") {
    if (form.doorsAt.trim() !== "") {
      parts.push(t(lang, "Z26.sum.doors", { time: form.doorsAt.trim() }));
    }

    if (showsMinAge(form.ageRule) && form.minAge.trim() !== "") {
      parts.push(t(lang, "Z26.sum.minAge", { n: form.minAge.trim() }));
    } else if (form.ageRule === "all_ages") {
      parts.push(t(lang, "Z26.sum.allAges"));
    } else if (form.ageRule === "unknown") {
      parts.push(t(lang, "Z26.sum.ageUnknown"));
    }
  } else if (key === "visit_mode") {
    if (form.visitMode in VISIT_MODE_ID) {
      parts.push(t(lang, VISIT_MODE_ID[form.visitMode]));
    }

    const from = form.windowFrom.trim();
    const to = form.windowTo.trim();

    if (showsWindow(form.visitMode) && from !== "") {
      parts.push(
        to !== ""
          ? t(lang, "Z26.sum.windowTo", { from, to })
          : t(lang, "Z26.sum.window", { from }),
      );
    }
  } else if (key === "language") {
    if (form.program in PROGRAM_ID) {
      parts.push(t(lang, PROGRAM_ID[form.program]));
    }

    if (form.subtitles in SUBTITLES_ID) {
      const value = t(lang, SUBTITLES_ID[form.subtitles]);
      const language = form.subtitleLanguage.trim();

      parts.push(
        showsSubtitleLanguage(form.subtitles) && language !== ""
          ? t(lang, "Z26.sum.subtitlesIn", { value, language })
          : t(lang, "Z26.sum.subtitles", { value }),
      );
    }
  } else if (key === "music") {
    if (form.musicPrecision.trim() !== "")
      parts.push(form.musicPrecision.trim());

    const genres = MUSIC_GENRES.filter((genre) =>
      form.musicGenres.includes(genre),
    ).map((genre) => t(lang, GENRE_ID[genre]));

    if (genres.length > 0) parts.push(genres.join(", "));

    return parts.length > 0 ? parts.join(" · ") : null;
  } else if (key === "participants") {
    const people = lines(form.participants);

    return people.length > 0 ? people.join(", ") : null;
  } else {
    const text = form.bringText.trim();

    return text !== "" ? text : null;
  }

  return parts.length > 0 ? parts.join(", ") : null;
}
