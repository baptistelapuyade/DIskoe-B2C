import { QUESTION_MAX_LENGTH } from "./profile-publication";

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

// The areas as keys the owner screens understand (Figma RFG-01 to RFG-02).
export type QuestionAreaKey =
  "profile" | "event" | "place" | "time" | "image" | "price";

const AREA_KEY: Record<(typeof QUESTION_AREAS)[number], QuestionAreaKey> = {
  Profil: "profile",
  Event: "event",
  Ort: "place",
  Termin: "time",
  Bild: "image",
  "Kosten und Zugang": "price",
};

// Splits the stored message into the affected spot and the question itself.
// A message without the first line (or with a spot we do not know) is shown
// whole, so nothing the founder wrote is lost.
export function splitQuestion(raw: string): {
  area: QuestionAreaKey | null;
  text: string;
} {
  if (!raw.startsWith(AREA_PREFIX)) {
    return { area: null, text: raw };
  }

  const newline = raw.indexOf("\n");
  const name = raw.slice(
    AREA_PREFIX.length,
    newline === -1 ? undefined : newline,
  );
  const key = (AREA_KEY as Record<string, QuestionAreaKey | undefined>)[name];

  if (!key || newline === -1) {
    return { area: null, text: raw };
  }

  return { area: key, text: raw.slice(newline + 1).trim() };
}

// Where "Correct the detail" leads. "Ort" has its own screen (RFG-02a); the
// other spots lead to the normal editing step of that spot, and the question
// stays visible there as a notice (founder, 20.11.2026). Without a first event
// the event spots fall back to the profile.
export function correctionHref(
  area: QuestionAreaKey | null,
  profileBase: string,
  eventId: string | null,
): string {
  if (area === "place") {
    return eventId ? `${profileBase}/question/place` : `${profileBase}/edit`;
  }

  const step =
    area === "event"
      ? "basics"
      : area === "time"
        ? "time"
        : area === "image"
          ? "image"
          : area === "price"
            ? "price"
            : null;

  if (step && eventId) {
    return `/organizer/events/${eventId}/edit/${step}`;
  }

  return `${profileBase}/edit`;
}
