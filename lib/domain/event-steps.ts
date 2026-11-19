// Checks of the first three event steps (Figma EVT-01 to EVT-03): Basics, Date
// and time, Place. The checks return codes, not texts: the screen looks the
// text up in the catalog (Z24.*), in the language of the organizer.
//
// Two intents (docs/startpaket/10-flow-karte.md, F3):
// - "next" ("Weiter ..."): the step must be complete enough to go on. Missing
//   fields are named (title and format; street and city; ...).
// - "later" ("Später weitermachen"): saves what can be saved. Only values that
//   cannot be stored are refused: a text that is too long, an invalid date, or
//   half of a date and time (the database holds a start only as a whole).
//
// What the later steps need is not checked here; the submit check (EIN-01)
// names every remaining gap.

import { EVENT_LIMITS, PRIMARY_FORMATS } from "./event-publication";
import { isEndAfterStart, localToInstant } from "./time";

export const EVENT_STEPS = ["basics", "time", "place"] as const;
export type EventStep = (typeof EVENT_STEPS)[number];
export type StepIntent = "next" | "later";

export type StepCode =
  | "titleMissing"
  | "titleTooLong"
  | "formatMissing"
  | "formatInvalid"
  | "descriptionTooLong"
  | "dateInvalid"
  | "dateMissing"
  | "timeInvalid"
  | "timeMissing"
  | "timeNonexistent"
  | "timeAmbiguous"
  | "endBeforeStart"
  | "placeNameMissing"
  | "placeNameTooLong"
  | "streetMissing"
  | "streetTooLong"
  | "postalCodeTooLong"
  | "cityMissing"
  | "cityTooLong";

// The codes that mean "this field is empty" (the notice says "still missing").
const MISSING: ReadonlySet<StepCode> = new Set<StepCode>([
  "titleMissing",
  "formatMissing",
  "placeNameMissing",
  "streetMissing",
  "cityMissing",
]);

export function isMissingCode(code: StepCode): boolean {
  return MISSING.has(code);
}

export type StepField =
  | "title"
  | "format"
  | "description"
  | "startDate"
  | "startTime"
  | "endDate"
  | "endTime"
  | "placeName"
  | "addressLine"
  | "postalCode"
  | "city";

export type StepErrors = Partial<Record<StepField, StepCode>>;

// What the step forms send (all text; the date as ISO "YYYY-MM-DD" when it
// could be read, otherwise the raw text so that the check can name it).
export type StepInput = {
  title?: string;
  format?: string;
  description?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  endUnknown?: boolean;
  placeName?: string;
  addressLine?: string;
  postalCode?: string;
  city?: string;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

function trimmed(value: string | undefined): string {
  return (value ?? "").trim();
}

function basics(input: StepInput, intent: StepIntent): StepErrors {
  const errors: StepErrors = {};
  const title = trimmed(input.title);
  const format = trimmed(input.format);
  const description = trimmed(input.description);

  if (title.length > EVENT_LIMITS.title) {
    errors.title = "titleTooLong";
  } else if (title === "" && intent === "next") {
    errors.title = "titleMissing";
  }

  if (format !== "" && !(PRIMARY_FORMATS as readonly string[]).includes(format)) {
    errors.format = "formatInvalid";
  } else if (format === "" && intent === "next") {
    errors.format = "formatMissing";
  }

  if (description.length > EVENT_LIMITS.description) {
    errors.description = "descriptionTooLong";
  }

  return errors;
}

// One date and time pair. Returns the instant when both parts are fine.
function pair(
  date: string,
  time: string,
  dateKey: "startDate" | "endDate",
  timeKey: "startTime" | "endTime",
  errors: StepErrors,
): string | null {
  if (date === "" && time === "") {
    return null;
  }

  if (date !== "" && !ISO_DATE.test(date)) {
    errors[dateKey] = "dateInvalid";
  } else if (date === "") {
    errors[dateKey] = "dateMissing";
  }

  if (time !== "" && !TIME.test(time)) {
    errors[timeKey] = "timeInvalid";
  } else if (time === "") {
    errors[timeKey] = "timeMissing";
  }

  if (errors[dateKey] || errors[timeKey]) {
    return null;
  }

  const result = localToInstant(date, time);

  if (!result.ok) {
    if (result.reason === "invalid") {
      errors[dateKey] = "dateInvalid";
    } else {
      errors[timeKey] =
        result.reason === "nonexistent" ? "timeNonexistent" : "timeAmbiguous";
    }

    return null;
  }

  return result.instant;
}

function time(input: StepInput): StepErrors {
  const errors: StepErrors = {};
  const start = pair(
    trimmed(input.startDate),
    trimmed(input.startTime),
    "startDate",
    "startTime",
    errors,
  );

  // "The end isn't fixed yet" is a deliberate answer: typed end values are not
  // used (the form empties and locks them).
  if (input.endUnknown) {
    return errors;
  }

  const end = pair(
    trimmed(input.endDate),
    trimmed(input.endTime),
    "endDate",
    "endTime",
    errors,
  );

  if (start && end && !isEndAfterStart(start, end)) {
    errors.endDate = "endBeforeStart";
  }

  return errors;
}

function place(input: StepInput, intent: StepIntent): StepErrors {
  const errors: StepErrors = {};
  const name = trimmed(input.placeName);
  const street = trimmed(input.addressLine);
  const postalCode = trimmed(input.postalCode);
  const city = trimmed(input.city);

  if (name.length > EVENT_LIMITS.placeName) {
    errors.placeName = "placeNameTooLong";
  } else if (name === "" && intent === "next") {
    errors.placeName = "placeNameMissing";
  }

  if (street.length > EVENT_LIMITS.addressLine) {
    errors.addressLine = "streetTooLong";
  } else if (street === "" && intent === "next") {
    errors.addressLine = "streetMissing";
  }

  if (postalCode.length > EVENT_LIMITS.postalCode) {
    errors.postalCode = "postalCodeTooLong";
  }

  if (city.length > EVENT_LIMITS.city) {
    errors.city = "cityTooLong";
  } else if (city === "" && intent === "next") {
    errors.city = "cityMissing";
  }

  return errors;
}

export function validateStep(
  step: EventStep,
  input: StepInput,
  intent: StepIntent,
): StepErrors {
  if (step === "basics") return basics(input, intent);
  if (step === "time") return time(input);

  return place(input, intent);
}

// Which text the notice at the top uses: the fields are missing, or one
// specific problem is named in full, or something does not fit.
export type NoticeKind = "missing" | "endBeforeStart" | "invalid";

export function noticeKind(errors: StepErrors): NoticeKind {
  const codes = Object.values(errors);

  if (codes.length > 0 && codes.every(isMissingCode)) {
    return "missing";
  }

  if (codes.length === 1 && codes[0] === "endBeforeStart") {
    return "endBeforeStart";
  }

  return "invalid";
}

export function nextStepPath(step: EventStep): EventStep | "price" {
  if (step === "basics") return "time";
  if (step === "time") return "place";

  return "price";
}

// The step an organizer goes back to: the first of the three that is not
// complete. Complete means: everything this step asks for is stored.
export type StepProgress = {
  title: boolean;
  format: boolean;
  start: boolean;
  place: boolean;
};

export function firstOpenStep(progress: StepProgress): EventStep {
  if (!progress.title || !progress.format) return "basics";
  if (!progress.start) return "time";

  return "place";
}
