// Mapping between event_revisions rows, the pure domain values and the text
// values of the form. No database access here.

import {
  isProvided,
  noValue,
  provided,
  unanswered,
  valueOrNull,
  type Answer,
  type AnswerState,
} from "../domain/answers";
import type { Json, Tables, TablesUpdate } from "../db/types";
import {
  ACCESS_KINDS,
  PRIMARY_FORMATS,
  type AccessKind,
  type AccessRoute,
  type EventDraftValues,
  type PrimaryFormat,
  type PriceValue,
} from "../domain/event-publication";
import { formatAmountInput } from "../domain/money";
import { instantToLocal } from "../domain/time";

export type EventRevisionRow = Pick<
  Tables<"event_revisions">,
  | "id"
  | "title_state"
  | "title"
  | "description_state"
  | "description"
  | "format_state"
  | "primary_format"
  | "start_state"
  | "start_at"
  | "end_state"
  | "end_at"
  | "place_state"
  | "place_name"
  | "address_line"
  | "postal_code"
  | "city"
  | "price_state"
  | "price_model"
  | "price_amount_minor"
  | "currency"
  | "access_state"
  | "access_routes"
  | "atmosphere_state"
  | "atmosphere_tags"
  | "atmosphere_description"
  | "event_image_use_id"
  | "confirmed_at"
>;

export const EVENT_REVISION_COLUMNS =
  "id, title_state, title, description_state, description, format_state, primary_format, start_state, start_at, end_state, end_at, place_state, place_name, address_line, postal_code, city, price_state, price_model, price_amount_minor, currency, access_state, access_routes, atmosphere_state, atmosphere_tags, atmosphere_description, event_image_use_id, confirmed_at";

// What the form shows: text and lists only.
export type EventFormValues = {
  title: string;
  description: string;
  format: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  endUnknown: boolean;
  placeName: string;
  addressLine: string;
  postalCode: string;
  city: string;
  priceModel: string;
  priceAmount: string;
  accessKinds: string[];
  onlineTicketUrl: string;
  onlineRegistrationUrl: string;
  atmosphereTags: string[];
  atmosphereDescription: string;
};

export const EMPTY_FORM_VALUES: EventFormValues = {
  title: "",
  description: "",
  format: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  endUnknown: false,
  placeName: "",
  addressLine: "",
  postalCode: "",
  city: "",
  priceModel: "",
  priceAmount: "",
  accessKinds: [],
  onlineTicketUrl: "",
  onlineRegistrationUrl: "",
  atmosphereTags: [],
  atmosphereDescription: "",
};

function routesFromJson(json: Json): AccessRoute[] {
  if (!Array.isArray(json)) {
    return [];
  }

  const routes: AccessRoute[] = [];

  for (const item of json) {
    if (
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      typeof item.kind === "string" &&
      (ACCESS_KINDS as readonly string[]).includes(item.kind)
    ) {
      routes.push({
        kind: item.kind as AccessKind,
        url: typeof item.url === "string" && item.url !== "" ? item.url : null,
      });
    }
  }

  return routes;
}

function answerOf<T>(
  state: AnswerState,
  value: T | null | undefined,
): Answer<T> {
  if (state === "provided") {
    return value === null || value === undefined
      ? unanswered<T>()
      : provided(value);
  }

  return noValue<T>(state);
}

export function rowToValues(row: EventRevisionRow): EventDraftValues {
  const format =
    row.primary_format &&
    (PRIMARY_FORMATS as readonly string[]).includes(row.primary_format)
      ? (row.primary_format as PrimaryFormat)
      : null;

  let price: Answer<PriceValue>;

  if (row.price_state === "provided") {
    if (row.price_model === "free") {
      price = provided({ model: "free" });
    } else if (row.price_model === "fixed" && row.price_amount_minor) {
      price = provided({ model: "fixed", amountMinor: row.price_amount_minor });
    } else {
      price = unanswered();
    }
  } else {
    price = noValue(row.price_state);
  }

  return {
    title: answerOf(row.title_state, row.title),
    description: answerOf(row.description_state, row.description),
    format: answerOf(row.format_state, format),
    start: answerOf(row.start_state, row.start_at),
    end: answerOf(row.end_state, row.end_at),
    place: answerOf(
      row.place_state,
      row.place_name && row.address_line
        ? {
            name: row.place_name,
            addressLine: row.address_line,
            postalCode: row.postal_code,
            city: row.city,
          }
        : null,
    ),
    // Only while the place is not answered: what was typed so far.
    placePartial:
      row.place_state === "unanswered" &&
      (row.place_name || row.address_line || row.postal_code || row.city)
        ? {
            name: row.place_name ?? "",
            addressLine: row.address_line ?? "",
            postalCode: row.postal_code ?? "",
            city: row.city ?? "",
          }
        : null,
    price,
    access: answerOf(
      row.access_state,
      routesFromJson(row.access_routes).length > 0
        ? routesFromJson(row.access_routes)
        : null,
    ),
    atmosphere: answerOf(
      row.atmosphere_state,
      row.atmosphere_tags.length > 0 || row.atmosphere_description
        ? {
            tags: row.atmosphere_tags,
            description: row.atmosphere_description,
          }
        : null,
    ),
  };
}

export function rowToFormValues(row: EventRevisionRow): EventFormValues {
  const values = rowToValues(row);
  const start = values.start.state === "provided"
    ? instantToLocal(values.start.value)
    : null;
  const end = values.end.state === "provided"
    ? instantToLocal(values.end.value)
    : null;
  const place = valueOrNull(values.place);
  const price = valueOrNull(values.price);
  const routes = valueOrNull(values.access) ?? [];
  const atmosphere = valueOrNull(values.atmosphere);

  return {
    title: valueOrNull(values.title) ?? "",
    description: valueOrNull(values.description) ?? "",
    format: valueOrNull(values.format) ?? "",
    startDate: start?.date ?? "",
    startTime: start?.time ?? "",
    endDate: end?.date ?? "",
    endTime: end?.time ?? "",
    endUnknown: values.end.state === "unknown",
    placeName: place?.name ?? values.placePartial?.name ?? "",
    addressLine: place?.addressLine ?? values.placePartial?.addressLine ?? "",
    postalCode: place?.postalCode ?? values.placePartial?.postalCode ?? "",
    city: place?.city ?? values.placePartial?.city ?? "",
    priceModel:
      values.price.state === "unknown"
        ? "unknown"
        : price
          ? price.model
          : "",
    priceAmount:
      price?.model === "fixed" ? formatAmountInput(price.amountMinor) : "",
    accessKinds: routes.map((route) => route.kind),
    onlineTicketUrl:
      routes.find((route) => route.kind === "online_ticket")?.url ?? "",
    onlineRegistrationUrl:
      routes.find((route) => route.kind === "online_registration")?.url ?? "",
    atmosphereTags: atmosphere?.tags ?? [],
    atmosphereDescription: atmosphere?.description ?? "",
  };
}

// A column of a place that is not complete yet: empty text is null.
function partialOrNull(value: string | undefined): string | null {
  return value ? value : null;
}

// The columns that a save writes. Every field gets its state; a value column
// is null unless the answer is provided (the database checks the same).
export function valuesToRow(
  values: EventDraftValues,
): Omit<TablesUpdate<"event_revisions">, "id" | "event_id"> {
  const place = valueOrNull(values.place);
  const price = values.price;
  const atmosphere = valueOrNull(values.atmosphere);
  const routes = valueOrNull(values.access) ?? [];

  return {
    title_state: values.title.state,
    title: valueOrNull(values.title),
    description_state: values.description.state,
    description: valueOrNull(values.description),
    format_state: values.format.state,
    primary_format: valueOrNull(values.format),
    start_state: values.start.state,
    start_at: valueOrNull(values.start),
    end_state: values.end.state,
    end_at: valueOrNull(values.end),
    place_state: values.place.state,
    place_name: place?.name ?? partialOrNull(values.placePartial?.name),
    address_line: place?.addressLine ?? partialOrNull(values.placePartial?.addressLine),
    postal_code: place?.postalCode ?? partialOrNull(values.placePartial?.postalCode),
    city: place?.city ?? partialOrNull(values.placePartial?.city),
    price_state: price.state,
    price_model: isProvided(price)
      ? price.value.model
      : price.state === "unknown"
        ? "unknown"
        : null,
    price_amount_minor:
      isProvided(price) && price.value.model === "fixed"
        ? price.value.amountMinor
        : null,
    access_state: values.access.state,
    access_routes: routes.map((route) =>
      route.url ? { kind: route.kind, url: route.url } : { kind: route.kind },
    ) as Json,
    atmosphere_state: values.atmosphere.state,
    atmosphere_tags: atmosphere?.tags ?? [],
    atmosphere_description: atmosphere?.description ?? null,
  };
}

// A copy of an existing revision for a new draft (frozen revisions stay as
// they are). Everything is carried over as saved.
export function rowToCopy(
  row: EventRevisionRow,
): Omit<TablesUpdate<"event_revisions">, "id" | "event_id"> {
  return {
    ...valuesToRow(rowToValues(row)),
    event_image_use_id: row.event_image_use_id,
  };
}
