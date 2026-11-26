// The bars of "Gut zu wissen" (Delta v0.5 §9): one bar per piece of
// information, a missing piece has no bar. Exceptions: "Zugänglichkeit" is
// always there, and missing data is never shown as "not accessible". Pure.
// Texts come from the catalog (Z34, Z26) in the language of the reader.

import { AGE_RULE_ID, PROGRAM_ID, SUBTITLES_ID } from "../event/module-summary";
import { t, type Lang } from "../i18n";
import { safeUrl, type PublicEvent } from "./dto";

export type InfoBar = {
  key: "doors" | "window" | "entry" | "age" | "language" | "accessibility";
  label: string;
  value: string;
  pills: string[];
  detail: string | null;
  action: { label: string; href: string } | null;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The public contact is free text. Only an e-mail address or an http(s) link
// can be opened; anything else gives no button.
export function contactHref(contact: string | null): string | null {
  const text = contact?.trim() ?? "";

  if (text === "") return null;
  if (EMAIL.test(text)) return `mailto:${text}`;
  if (/^https?:\/\//i.test(text)) return safeUrl(text);

  return null;
}

type BarEvent = Pick<
  PublicEvent,
  "priceText" | "access" | "organizer" | "modules" | "startTime" | "status"
>;

function doorsBar(lang: Lang, event: BarEvent): InfoBar | null {
  const doors = event.modules.entry_age?.doors_at;

  if (!doors) return null;

  return {
    key: "doors",
    label: t(lang, "Z34.bar.doors"),
    value: doors,
    pills: [],
    detail: event.startTime
      ? t(lang, "Z34.bar.doors.start", { time: event.startTime })
      : null,
    action: null,
  };
}

// A flexible visit (drop in, or both) shows its window. "Beginn und Ende
// offen" is not invented: without an end the window reads "from 18:00".
function windowBar(lang: Lang, event: BarEvent): InfoBar | null {
  const visit = event.modules.visit_mode;

  if (!visit?.window_from) return null;
  if (visit.mode !== "drop_in" && visit.mode !== "both") return null;

  const short =
    visit.short_visit === "short_ok"
      ? t(lang, "Z34.bar.window.short.ok")
      : visit.short_visit === "longer"
        ? t(lang, "Z34.bar.window.short.longer")
        : null;
  const lead = t(
    lang,
    visit.mode === "both" ? "Z34.bar.window.both" : "Z34.bar.window.dropIn",
  );

  return {
    key: "window",
    label: t(lang, "Z34.bar.window"),
    value: visit.window_to
      ? t(lang, "Z34.bar.window.range", {
          from: visit.window_from,
          to: visit.window_to,
        })
      : t(lang, "Z34.bar.window.from", { from: visit.window_from }),
    pills: [],
    detail: [lead, short].filter(Boolean).join(" "),
    action: null,
  };
}

function ageBar(lang: Lang, event: BarEvent): InfoBar | null {
  const entry = event.modules.entry_age;

  if (!entry) return null;

  if (entry.age_rule === "minimum" && entry.min_age !== null) {
    return {
      key: "age",
      label: t(lang, "Z34.bar.age"),
      value: t(lang, "Z34.bar.age.min", { n: entry.min_age }),
      pills: [],
      detail: t(lang, "Z34.bar.age.minDetail", { n: entry.min_age }),
      action: null,
    };
  }

  // "Unknown" shows no bar: not knowing is not "all ages".
  if (entry.age_rule === "all_ages") {
    return {
      key: "age",
      label: t(lang, "Z34.bar.age"),
      value: t(lang, AGE_RULE_ID.all_ages),
      pills: [],
      detail: null,
      action: null,
    };
  }

  return null;
}

function languageBar(lang: Lang, event: BarEvent): InfoBar | null {
  const language = event.modules.language;

  if (!language) return null;

  const subtitlesKnown =
    language.subtitles === "yes" ||
    language.subtitles === "partial" ||
    language.subtitles === "no";
  const subtitles = subtitlesKnown
    ? language.subtitle_language &&
      (language.subtitles === "yes" || language.subtitles === "partial")
      ? t(lang, "Z26.sum.subtitlesIn", {
          value: t(lang, SUBTITLES_ID[language.subtitles as string]),
          language: language.subtitle_language,
        })
      : t(lang, "Z26.sum.subtitles", {
          value: t(lang, SUBTITLES_ID[language.subtitles as string]),
        })
    : null;
  const programKnown =
    language.program !== null && language.program !== "unknown";

  if (!programKnown && !subtitles) return null;

  return {
    key: "language",
    label: t(lang, "Z34.bar.language"),
    value: programKnown
      ? t(lang, PROGRAM_ID[language.program as string])
      : (subtitles as string),
    pills: [],
    // The original version with subtitles already says it in the value.
    detail:
      programKnown && language.program !== "original_subtitled"
        ? subtitles
        : null,
    action: null,
  };
}

export function infoBars(lang: Lang, event: BarEvent): InfoBar[] {
  const bars: InfoBar[] = [];
  // Times of the visit make no sense for a cancelled event or one without a
  // new date.
  const timed =
    event.status !== "cancelled" && event.status !== "postponed_undated";

  if (timed) {
    for (const bar of [doorsBar(lang, event), windowBar(lang, event)]) {
      if (bar) bars.push(bar);
    }
  }

  // "Eintritt" needs an answer about the cost. A confirmed "unknown" is an
  // answer ("Preis noch offen"); no answer at all leaves the bar out.
  // A cancelled event has no cost to show (the head hides it as well).
  if (event.priceText !== null && event.status !== "cancelled") {
    bars.push({
      key: "entry",
      label: t(lang, "Z34.bar.entry"),
      value: event.priceText,
      pills: event.access.map((route) => route.label),
      detail: null,
      action: null,
    });
  }

  for (const bar of [ageBar(lang, event), languageBar(lang, event)]) {
    if (bar) bars.push(bar);
  }

  // The alpha collects no accessibility details yet, so the neutral state is
  // the only one. "Veranstalter fragen" only when a public contact exists.
  const href = contactHref(event.organizer.publicContact);

  bars.push({
    key: "accessibility",
    label: t(lang, "Z34.bar.accessibility"),
    value: t(lang, "Z34.bar.accessibility.value"),
    pills: [],
    detail: t(lang, "Z34.bar.accessibility.detail"),
    action: href ? { label: t(lang, "Z34.bar.accessibility.ask"), href } : null,
  });

  return bars;
}
