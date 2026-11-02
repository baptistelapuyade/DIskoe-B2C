import { QUESTION_MAX_LENGTH } from "./profile-publication";

// The affected spot of a founder question (Figma S5-D 2894:1019, examples
// "Profilbild, Profiltext, Eventtitel, Termin, Ort, Eventbild"). The database
// has no column for it: it is stored as the first line of the message and
// shown to the organizer exactly as written. Organizers have no cover image.
export const PROFILE_AREAS = ["Profilbild", "Profiltext"] as const;
export const EVENT_AREAS = [
  "Eventtitel",
  "Termin",
  "Ort",
  "Kosten und Zugang",
  "Eventbild",
] as const;

export function questionAreas(withEvent: boolean): readonly string[] {
  return withEvent ? [...PROFILE_AREAS, ...EVENT_AREAS] : [...PROFILE_AREAS];
}

export const AREA_PREFIX = "Betroffen: ";

export function questionWithArea(
  area: string,
  message: string,
): { ok: true; value: string } | { ok: false; message: string } {
  const value = area === "" ? message : `${AREA_PREFIX}${area}\n${message}`;

  if (value.length > QUESTION_MAX_LENGTH) {
    return {
      ok: false,
      message: `Die Frage darf mit der betroffenen Stelle höchstens ${QUESTION_MAX_LENGTH} Zeichen lang sein.`,
    };
  }

  return { ok: true, value };
}
