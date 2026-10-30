import { QUESTION_MAX_LENGTH } from "@/lib/domain/profile-publication";

// The affected spot of a founder question (Figma S5-D "Betroffen: Ort"). The
// database has no column for it: it is stored as the first line of the message
// and shown to the organizer exactly as written.
export const QUESTION_AREAS = [
  "Profil",
  "Event",
  "Ort",
  "Termin",
  "Bild",
  "Kosten und Zugang",
] as const;

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
