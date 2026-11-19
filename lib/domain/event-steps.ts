// Checks of the event steps (Figma EVT-01 to EVT-06): Basics, Date and time,
// Place, Price and access, Event image (description only), Atmosphere. The checks return codes, not texts: the screen looks the
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

import {
  ACCESS_KINDS,
  ATMOSPHERE_TERMS,
  EVENT_LIMITS,
  hasAmount,
  MAX_ATMOSPHERE_TAGS,
  PRICE_MODELS,
  PRIMARY_FORMATS,
  TICKET_AVAILABILITY,
} from "./event-publication";
import { parseAmount } from "./money";
import { isEndAfterStart, localToInstant } from "./time";

export const EVENT_STEPS = [
  "basics",
  "time",
  "place",
  "price",
  "image",
  "atmosphere",
] as const;
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
  | "cityTooLong"
  | "priceModelInvalid"
  | "amountMissing"
  | "amountInvalid"
  | "amountTooHigh"
  | "amountZero"
  | "rangeOrder"
  | "feesInvalid"
  | "availabilityInvalid"
  | "accessInvalid"
  | "urlNoScheme"
  | "urlInvalid"
  | "urlTooLong"
  | "altTooLong"
  | "atmosphereInvalid"
  | "atmosphereTooMany"
  | "atmosphereTextTooLong";

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
  | "city"
  | "priceModel"
  | "priceAmount"
  | "priceAmountMax"
  | "priceFees"
  | "accessKinds"
  | "onlineTicketAvailability"
  | "onlineTicketUrl"
  | "onlineRegistrationUrl"
  | "altText"
  | "atmosphereTags"
  | "atmosphereDescription";

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
  priceModel?: string;
  priceAmount?: string;
  priceAmountMax?: string;
  priceFees?: string;
  accessKinds?: string[];
  onlineTicketUrl?: string;
  onlineRegistrationUrl?: string;
  onlineTicketAvailability?: string;
  altText?: string;
  atmosphereTags?: string[];
  atmosphereDescription?: string;
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

// A link of an online access route (Figma EVT-04d, 04n). It must start with
// https:// so that what is shown is what is opened; the check is not "was
// completed for you".
export function checkLink(raw: string): "ok" | "noScheme" | "invalid" | "tooLong" {
  const value = raw.trim();

  if (value.length > EVENT_LIMITS.url) return "tooLong";
  if (/\s/.test(value)) return "invalid";

  if (!/^https:\/\//i.test(value)) {
    // "tickets.example/zwischen-den-boxen": a web address without https://.
    return /^(http:\/\/)?[^\s/]+\.[^\s/]+/i.test(value) ? "noScheme" : "invalid";
  }

  try {
    const url = new URL(value);

    return url.hostname.includes(".") ? "ok" : "invalid";
  } catch {
    return "invalid";
  }
}

const AMOUNT_CODE = {
  missing: "amountMissing",
  format: "amountInvalid",
  tooHigh: "amountTooHigh",
  zero: "amountZero",
} as const;

function price(input: StepInput): StepErrors {
  const errors: StepErrors = {};
  const model = trimmed(input.priceModel);
  const kinds = input.accessKinds ?? [];

  if (kinds.some((kind) => !(ACCESS_KINDS as readonly string[]).includes(kind))) {
    errors.accessKinds = "accessInvalid";
  }

  if (model !== "" && !(PRICE_MODELS as readonly string[]).includes(model)) {
    errors.priceModel = "priceModelInvalid";
  } else if (hasAmount(model)) {
    const low = parseAmount(input.priceAmount);
    const high =
      model === "range" ? parseAmount(input.priceAmountMax) : null;

    if (!low.ok) errors.priceAmount = AMOUNT_CODE[low.code];
    if (high && !high.ok) errors.priceAmountMax = AMOUNT_CODE[high.code];

    if (low.ok && high?.ok && high.amountMinor <= low.amountMinor) {
      errors.priceAmountMax = "rangeOrder";
    }
  }

  const fees = trimmed(input.priceFees);

  if (fees !== "" && fees !== "included" && fees !== "unknown") {
    errors.priceFees = "feesInvalid";
  }

  const availability = trimmed(input.onlineTicketAvailability);

  if (
    availability !== "" &&
    !(TICKET_AVAILABILITY as readonly string[]).includes(availability)
  ) {
    errors.onlineTicketAvailability = "availabilityInvalid";
  }

  // An empty link is allowed (it stays a gap until submission); a link that is
  // there must be one. Only the links of the ways that are chosen count.
  const links: Array<[StepField, string, string]> = [
    ["onlineTicketUrl", "online_ticket", trimmed(input.onlineTicketUrl)],
    ["onlineRegistrationUrl", "online_registration", trimmed(input.onlineRegistrationUrl)],
  ];

  for (const [field, kind, value] of links) {
    if (!kinds.includes(kind) || value === "") continue;

    const result = checkLink(value);

    if (result === "noScheme") errors[field] = "urlNoScheme";
    else if (result === "tooLong") errors[field] = "urlTooLong";
    else if (result === "invalid") errors[field] = "urlInvalid";
  }

  return errors;
}

function image(input: StepInput): StepErrors {
  return trimmed(input.altText).length > EVENT_LIMITS.altText
    ? { altText: "altTooLong" }
    : {};
}

function atmosphere(input: StepInput): StepErrors {
  const errors: StepErrors = {};
  const tags = [...new Set((input.atmosphereTags ?? []).map((tag) => tag.trim()))].filter(
    (tag) => tag !== "",
  );

  if (tags.some((tag) => !(ATMOSPHERE_TERMS as readonly string[]).includes(tag))) {
    errors.atmosphereTags = "atmosphereInvalid";
  } else if (tags.length > MAX_ATMOSPHERE_TAGS) {
    errors.atmosphereTags = "atmosphereTooMany";
  }

  if (trimmed(input.atmosphereDescription).length > EVENT_LIMITS.atmosphereDescription) {
    errors.atmosphereDescription = "atmosphereTextTooLong";
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
  if (step === "place") return place(input, intent);
  if (step === "price") return price(input);
  if (step === "image") return image(input);

  return atmosphere(input);
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

// The step that follows. After the atmosphere comes the optional step 7
// (EVT-07, a later slice); until then the old overview is shown.
export function nextStepPath(step: EventStep): EventStep | "more" {
  if (step === "basics") return "time";
  if (step === "time") return "place";
  if (step === "place") return "price";
  if (step === "price") return "image";
  if (step === "image") return "atmosphere";

  return "more";
}

// The step an organizer goes back to: the first one that is not complete.
// Complete means: everything this step asks for is stored. The optional
// answers of the later steps do not count, so that a person who comes back is
// taken to the first step with a real gap.
export type StepProgress = {
  title: boolean;
  format: boolean;
  start: boolean;
  place: boolean;
  price: boolean;
  access: boolean;
  image: boolean;
  atmosphere: boolean;
};

export function firstOpenStep(progress: StepProgress): EventStep | null {
  if (!progress.title || !progress.format) return "basics";
  if (!progress.start) return "time";
  if (!progress.place) return "place";
  if (!progress.price || !progress.access) return "price";
  if (!progress.image) return "image";
  if (!progress.atmosphere) return "atmosphere";

  // Everything the six steps ask for is there.
  return null;
}
