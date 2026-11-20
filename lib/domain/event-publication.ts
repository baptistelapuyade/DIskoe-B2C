// Pure rules for the manual event draft: input checks, answer states and the
// concrete gap list. No framework or database imports, so the rules can be
// unit-tested. The database stays the authority (app_private.event_gaps and the
// CHECK constraints on event_revisions); this module produces the user-facing
// side and rejects bad input early.
//
// Scope (docs/startpaket/02-durchstich.md, point 3): title, main format,
// description, start, place and address, price, access route, event image and
// atmosphere. Optional end. Not covered here (TODO(spec), PUBLISH-02 rest):
// listening-session concept and visit mode, film language and subtitles,
// entrance and accessibility details, last entry, fee models.

import { normalizeUrl } from "./profile-publication";
import { noValue, provided, unanswered, type Answer } from "./answers";
import { parsePriceInput, type PriceFees } from "./money";
import {
  requiredAnswered,
  requiredBlock,
  type StoredModules,
} from "./event-modules";
import {
  isEndAfterStart,
  LOCAL_TIME_MESSAGE,
  localToInstant,
} from "./time";

// TODO(spec): the length limits are proposals, not product decisions.
export const EVENT_LIMITS = {
  title: 120,
  description: 2000,
  placeName: 120,
  addressLine: 200,
  postalCode: 10,
  city: 80,
  atmosphereDescription: 200,
  url: 300,
  altText: 200,
} as const;

// The seven main formats. There is deliberately no universal "Sonstiges"
// (P50): a format that fits none of them (a workshop, say) cannot be
// published and needs a conversation first.
export const PRIMARY_FORMATS = [
  "concert",
  "dj_set",
  "club_night",
  "listening_session",
  "opening",
  "exhibition",
  "screening",
] as const;

export type PrimaryFormat = (typeof PRIMARY_FORMATS)[number];

export const FORMAT_LABEL: Record<PrimaryFormat, string> = {
  concert: "Konzert",
  dj_set: "DJ-Set",
  club_night: "Party/Club",
  listening_session: "Listening-Session",
  opening: "Vernissage",
  exhibition: "Ausstellung",
  screening: "Film",
};

// B13: the ten atmosphere terms. 1 to 3 of them, or an own short sentence.
export const ATMOSPHERE_TERMS = [
  "Gemütlich",
  "Intim/persönlich",
  "Entspannt",
  "Lebhaft",
  "Ungezwungen",
  "Experimentell",
  "Underground/DIY",
  "Alternativ/unabhängig",
  "Community-geprägt",
  "Immersiv",
] as const;

export const MAX_ATMOSPHERE_TAGS = 3;

export const ACCESS_KINDS = [
  "walk_in",
  "door",
  "online_ticket",
  "online_registration",
] as const;

export type AccessKind = (typeof ACCESS_KINDS)[number];

export const ACCESS_LABEL: Record<AccessKind, string> = {
  walk_in: "Ohne Anmeldung",
  door: "Abendkasse",
  online_ticket: "Online-Ticket",
  online_registration: "Online-Anmeldung",
};

// Only an online ticket can be sold out (Figma EVT-04k). Not stated is not
// "available": the page then says nothing about it.
export type TicketAvailability = "available" | "sold_out";

export const TICKET_AVAILABILITY: readonly TicketAvailability[] = [
  "available",
  "sold_out",
];

export type AccessRoute = {
  kind: AccessKind;
  url: string | null;
  availability?: TicketAvailability;
};

export function isOnlineAccess(kind: AccessKind): boolean {
  return kind === "online_ticket" || kind === "online_registration";
}

export const PRICE_MODELS = [
  "fixed",
  "range",
  "from_price",
  "free",
  "donation",
  "min_donation",
  "unknown",
] as const;

export type PriceModel = (typeof PRICE_MODELS)[number];

export type PriceValue =
  | { model: "free" }
  | { model: "donation" }
  | { model: "fixed" | "from_price" | "min_donation"; amountMinor: number }
  | { model: "range"; amountMinor: number; maxAmountMinor: number };

// The models that carry an amount (and so can carry the answer to fees).
export function hasAmount(model: string): boolean {
  return (
    model === "fixed" ||
    model === "range" ||
    model === "from_price" ||
    model === "min_donation"
  );
}

export type PlaceValue = {
  name: string;
  addressLine: string;
  postalCode: string | null;
  city: string | null;
};

// What was typed for a place that is not complete yet ("Später weitermachen"
// in the place step). It is kept in the draft so that nothing typed is lost,
// but it is not an answer: the place stays a gap until name, street and city
// are there.
export type PlaceDraft = {
  name: string;
  addressLine: string;
  postalCode: string;
  city: string;
};

export type AtmosphereValue = {
  tags: string[];
  description: string | null;
};

// What the form sends. Everything is text; empty means "not answered".
export type EventFormInput = {
  title?: unknown;
  description?: unknown;
  format?: unknown;
  startDate?: unknown;
  startTime?: unknown;
  endDate?: unknown;
  endTime?: unknown;
  // Checkbox "Das Ende steht noch nicht fest": a deliberate "unknown".
  endUnknown?: unknown;
  placeName?: unknown;
  addressLine?: unknown;
  postalCode?: unknown;
  city?: unknown;
  // "", "free", "fixed" or "unknown". "unknown" is the deliberate
  // "Preis noch nicht bekannt" (P07); an empty choice is not an answer.
  priceModel?: unknown;
  priceAmount?: unknown;
  // Upper end of a price range.
  priceAmountMax?: unknown;
  // "", "included" or "unknown" (Pflichtgebühren).
  priceFees?: unknown;
  accessKinds?: unknown;
  onlineTicketUrl?: unknown;
  onlineRegistrationUrl?: unknown;
  // "", "available" or "sold_out".
  onlineTicketAvailability?: unknown;
  atmosphereTags?: unknown;
  atmosphereDescription?: unknown;
};

export type EventDraftValues = {
  title: Answer<string>;
  description: Answer<string>;
  format: Answer<PrimaryFormat>;
  start: Answer<string>;
  end: Answer<string>;
  place: Answer<PlaceValue>;
  // Set only while the place is not answered and something was typed.
  placePartial: PlaceDraft | null;
  price: Answer<PriceValue>;
  // Only for a price with an amount; null = not answered.
  priceFees: PriceFees | null;
  access: Answer<AccessRoute[]>;
  atmosphere: Answer<AtmosphereValue>;
};

export type EventFieldKey =
  | "title"
  | "description"
  | "format"
  | "start"
  | "end"
  | "place"
  | "price"
  | "access"
  | "atmosphere";

export type EventFieldErrors = Partial<Record<EventFieldKey, string>>;

export type ParsedEventInput =
  | { ok: true; value: EventDraftValues }
  | { ok: false; errors: EventFieldErrors };

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return typeof value === "string" && value !== "" ? [value] : [];
}

function isChecked(value: unknown): boolean {
  return value === true || value === "on" || value === "true" || value === "1";
}

function textAnswer(
  raw: unknown,
  max: number,
  tooLong: string,
  errors: EventFieldErrors,
  key: EventFieldKey,
): Answer<string> {
  const value = text(raw);

  if (value === "") {
    return unanswered();
  }

  if (value.length > max) {
    errors[key] = tooLong;
    return unanswered();
  }

  return provided(value);
}

function parseWhen(
  dateRaw: unknown,
  timeRaw: unknown,
  label: string,
  errors: EventFieldErrors,
  key: "start" | "end",
): Answer<string> {
  const date = text(dateRaw);
  const time = text(timeRaw);

  if (date === "" && time === "") {
    return unanswered();
  }

  if (date === "" || time === "") {
    errors[key] = `Bitte gib für ${label} Datum und Uhrzeit an.`;
    return unanswered();
  }

  const result = localToInstant(date, time);

  if (!result.ok) {
    errors[key] = LOCAL_TIME_MESSAGE[result.reason];
    return unanswered();
  }

  return provided(result.instant);
}

function parsePlace(
  input: EventFormInput,
  errors: EventFieldErrors,
): { place: Answer<PlaceValue>; partial: PlaceDraft | null } {
  const name = text(input.placeName);
  const addressLine = text(input.addressLine);
  const postalCode = text(input.postalCode);
  const city = text(input.city);
  const none = { place: unanswered<PlaceValue>(), partial: null };

  if (name === "" && addressLine === "" && postalCode === "" && city === "") {
    return none;
  }

  if (
    name.length > EVENT_LIMITS.placeName ||
    addressLine.length > EVENT_LIMITS.addressLine ||
    postalCode.length > EVENT_LIMITS.postalCode ||
    city.length > EVENT_LIMITS.city
  ) {
    errors.place = "Eine der Ortsangaben ist zu lang.";
    return none;
  }

  // A place is an answer only with name, street and city. What is typed
  // before that is kept as it is, and the place stays a gap.
  if (name === "" || addressLine === "" || city === "") {
    return {
      place: unanswered<PlaceValue>(),
      partial: { name, addressLine, postalCode, city },
    };
  }

  return {
    place: provided({
      name,
      addressLine,
      postalCode: postalCode === "" ? null : postalCode,
      city,
    }),
    partial: null,
  };
}

function parsePrice(
  input: EventFormInput,
  errors: EventFieldErrors,
): Answer<PriceValue> {
  const model = text(input.priceModel);

  if (model === "") {
    return unanswered();
  }

  if (model === "unknown") {
    return noValue("unknown");
  }

  if (model === "free" || model === "donation") {
    return provided({ model });
  }

  if (model === "fixed" || model === "from_price" || model === "min_donation") {
    const amount = parsePriceInput(input.priceAmount);

    if (!amount.ok) {
      errors.price = amount.message;
      return unanswered();
    }

    return provided({ model, amountMinor: amount.amountMinor });
  }

  if (model === "range") {
    const low = parsePriceInput(input.priceAmount);
    const high = parsePriceInput(input.priceAmountMax);

    if (!low.ok || !high.ok) {
      errors.price = !low.ok ? low.message : !high.ok ? high.message : "";
      return unanswered();
    }

    if (high.amountMinor <= low.amountMinor) {
      errors.price = "Das Ende der Spanne muss höher sein als der Anfang.";
      return unanswered();
    }

    return provided({
      model: "range",
      amountMinor: low.amountMinor,
      maxAmountMinor: high.amountMinor,
    });
  }

  errors.price = "Bitte wähle eine der angebotenen Preisangaben.";
  return unanswered();
}

// The fee answer belongs to a price with an amount. For every other price it
// is dropped, so that nothing stale stays behind a changed price form.
function parsePriceFees(
  input: EventFormInput,
  price: Answer<PriceValue>,
): PriceFees | null {
  const fees = text(input.priceFees);

  if (price.state !== "provided" || !hasAmount(price.value.model)) {
    return null;
  }

  return fees === "included" || fees === "unknown" ? fees : null;
}

function parseAccess(
  input: EventFormInput,
  errors: EventFieldErrors,
): Answer<AccessRoute[]> {
  const kinds = [...new Set(list(input.accessKinds))];

  if (kinds.length === 0) {
    return unanswered();
  }

  const routes: AccessRoute[] = [];

  for (const kind of kinds) {
    if (!(ACCESS_KINDS as readonly string[]).includes(kind)) {
      errors.access = "Bitte wähle nur die angebotenen Zugangswege.";
      return unanswered();
    }

    const accessKind = kind as AccessKind;

    if (!isOnlineAccess(accessKind)) {
      routes.push({ kind: accessKind, url: null });
      continue;
    }

    const availability =
      accessKind === "online_ticket"
        ? text(input.onlineTicketAvailability)
        : "";
    const extra: Pick<AccessRoute, "availability"> =
      availability === "available" || availability === "sold_out"
        ? { availability }
        : {};

    const raw =
      accessKind === "online_ticket"
        ? text(input.onlineTicketUrl)
        : text(input.onlineRegistrationUrl);

    // An empty link is kept as a draft and shows up as a gap (P08). A link
    // that is present but invalid is an error.
    if (raw === "") {
      routes.push({ kind: accessKind, url: null, ...extra });
      continue;
    }

    const url = normalizeUrl(raw);

    if (url === null || url.length > EVENT_LIMITS.url) {
      errors.access =
        "Bitte gib einen gültigen Link ein, zum Beispiel https://example.org/tickets.";
      return unanswered();
    }

    routes.push({ kind: accessKind, url, ...extra });
  }

  return provided(routes);
}

function parseAtmosphere(
  input: EventFormInput,
  errors: EventFieldErrors,
): Answer<AtmosphereValue> {
  const raw = [...new Set(list(input.atmosphereTags).map((tag) => tag.trim()))]
    .filter((tag) => tag !== "");
  const description = text(input.atmosphereDescription);

  if (raw.some((tag) => !(ATMOSPHERE_TERMS as readonly string[]).includes(tag))) {
    errors.atmosphere = "Bitte wähle nur die angebotenen Begriffe.";
    return unanswered();
  }

  // P04: more than three is an error. Nothing is cut off silently.
  if (raw.length > MAX_ATMOSPHERE_TAGS) {
    errors.atmosphere = `Bitte wähle höchstens ${MAX_ATMOSPHERE_TAGS} Begriffe.`;
    return unanswered();
  }

  if (description.length > EVENT_LIMITS.atmosphereDescription) {
    errors.atmosphere = `Die Beschreibung der Atmosphäre darf höchstens ${EVENT_LIMITS.atmosphereDescription} Zeichen lang sein.`;
    return unanswered();
  }

  if (raw.length === 0 && description === "") {
    return unanswered();
  }

  return provided({
    tags: raw,
    description: description === "" ? null : description,
  });
}

// Drafts may be incomplete: empty fields are allowed here and reported as
// gaps. Only values that are present and invalid are errors.
export function parseEventInput(input: EventFormInput): ParsedEventInput {
  const errors: EventFieldErrors = {};

  const title = textAnswer(
    input.title,
    EVENT_LIMITS.title,
    `Der Titel darf höchstens ${EVENT_LIMITS.title} Zeichen lang sein.`,
    errors,
    "title",
  );
  const description = textAnswer(
    input.description,
    EVENT_LIMITS.description,
    `Die Beschreibung darf höchstens ${EVENT_LIMITS.description} Zeichen lang sein.`,
    errors,
    "description",
  );

  const formatRaw = text(input.format);
  let format: Answer<PrimaryFormat> = unanswered();

  if (formatRaw !== "") {
    if ((PRIMARY_FORMATS as readonly string[]).includes(formatRaw)) {
      format = provided(formatRaw as PrimaryFormat);
    } else {
      errors.format = "Bitte wähle eines der angebotenen Formate.";
    }
  }

  const start = parseWhen(
    input.startDate,
    input.startTime,
    "den Beginn",
    errors,
    "start",
  );
  const endUnknown = isChecked(input.endUnknown);
  let end: Answer<string>;

  if (endUnknown) {
    end = noValue("unknown");
  } else {
    end = parseWhen(input.endDate, input.endTime, "das Ende", errors, "end");
  }

  if (
    start.state === "provided" &&
    end.state === "provided" &&
    !isEndAfterStart(start.value, end.value)
  ) {
    errors.end = "Das Ende muss nach dem Beginn liegen.";
  }

  const place = parsePlace(input, errors);
  const price = parsePrice(input, errors);
  const value: EventDraftValues = {
    title,
    description,
    format,
    start,
    end,
    place: place.place,
    placePartial: place.partial,
    price,
    priceFees: parsePriceFees(input, price),
    access: parseAccess(input, errors),
    atmosphere: parseAtmosphere(input, errors),
  };

  return Object.keys(errors).length === 0
    ? { ok: true, value }
    : { ok: false, errors };
}

// Codes of app_private.event_gaps, plus "access_url" which only the
// application knows (P08: the database does not check the link of an online
// access route; the publish step must run this check too).
export type EventGapCode =
  | "title"
  | "description"
  | "primary_format"
  | "start"
  | "place"
  | "price"
  | "access"
  | "access_url"
  | "atmosphere"
  | "visit_mode"
  | "language"
  | "event_image"
  | "revision_missing";

export type EventGap = { code: EventGapCode; field: string; message: string };

const GAP_TEXT: Record<EventGapCode, { field: string; message: string }> = {
  title: { field: "title", message: "Der Titel fehlt." },
  description: { field: "description", message: "Die Beschreibung fehlt." },
  primary_format: { field: "format", message: "Das Format fehlt." },
  start: { field: "start", message: "Datum und Uhrzeit des Beginns fehlen." },
  place: {
    field: "place",
    message: "Der Ort mit Adresse und Stadt fehlt.",
  },
  price: {
    field: "price",
    message:
      "Der Preis fehlt. Wenn er noch nicht feststeht, wähle „Preis noch nicht bekannt“.",
  },
  access: {
    field: "access",
    message: "Es fehlt mindestens ein Zugangsweg.",
  },
  access_url: {
    field: "access",
    message: "Für den Online-Zugang fehlt ein gültiger Link.",
  },
  atmosphere: {
    field: "atmosphere",
    message:
      "Die Atmosphäre fehlt. Wähle bis zu drei Begriffe oder schreibe einen eigenen Satz.",
  },
  // Required block of the format (Mehr zum Abend). "Noch nicht bekannt" is an
  // answer; a block that was never answered is the gap.
  visit_mode: {
    field: "modules",
    message:
      "Die Besuchsart fehlt. Wähle sie oder „Noch nicht bekannt“ im Schritt „Mehr zum Abend“.",
  },
  language: {
    field: "modules",
    message:
      "Sprache und Untertitel fehlen. Wähle sie oder „Noch nicht bekannt“ im Schritt „Mehr zum Abend“.",
  },
  event_image: {
    field: "image",
    message: "Ein bestätigtes Eventbild fehlt.",
  },
  revision_missing: {
    field: "revision",
    message: "Es gibt noch keinen Entwurf.",
  },
};

export function isEventGapCode(value: string): value is EventGapCode {
  return value in GAP_TEXT;
}

export function describeEventGaps(codes: readonly string[]): EventGap[] {
  return codes
    .filter(isEventGapCode)
    .map((code) => ({ code, ...GAP_TEXT[code] }));
}

// Same minimum as app_private.event_gaps in the database, plus the link check
// of online access routes. The event image is a publication gate of the
// Durchstich (P05: a draft and a private preview work without an image).
//
// The required block of the format (opening: visit mode, screening: language
// and subtitles) is read from the stored "Mehr zum Abend" blocks. Without them
// (null) the block counts as not answered, like in the database.
export function eventGapCodes(
  values: EventDraftValues,
  hasConfirmedImage: boolean,
  modules: StoredModules | null = null,
): EventGapCode[] {
  const gaps: EventGapCode[] = [];

  if (values.title.state !== "provided") gaps.push("title");
  if (values.description.state !== "provided") gaps.push("description");
  if (values.format.state !== "provided") gaps.push("primary_format");
  if (values.start.state !== "provided") gaps.push("start");
  if (values.place.state !== "provided" || !values.place.value.city) {
    gaps.push("place");
  }
  // A deliberately confirmed "unknown" price is a valid answer (P07).
  if (values.price.state !== "provided" && values.price.state !== "unknown") {
    gaps.push("price");
  }
  if (values.access.state !== "provided") {
    gaps.push("access");
  } else if (
    values.access.value.some((route) => isOnlineAccess(route.kind) && !route.url)
  ) {
    gaps.push("access_url");
  }
  if (values.atmosphere.state !== "provided") gaps.push("atmosphere");
  if (values.format.state === "provided") {
    const required = requiredBlock(values.format.value);

    if (required !== null && !requiredAnswered(modules, values.format.value)) {
      gaps.push(required === "visit_mode" ? "visit_mode" : "language");
    }
  }
  if (!hasConfirmedImage) gaps.push("event_image");

  return gaps;
}
