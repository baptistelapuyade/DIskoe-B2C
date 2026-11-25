// Changing a live event (Figma EVB-01a to 01c). Six details can be changed:
// title, description, date, start, place name and address. Everything else
// stays as it is. The checks return codes, not texts; the screen looks the
// text up in the catalog (Z31.*), in the language of the organizer.
//
// Unlike a first draft, a live event must stay complete: nothing that is
// required for the public page may be emptied here. The address is one field
// ("Straße Nr., PLZ Ort", decided with the founder, 24.11.2026); it is split
// into the three stored parts on saving. The end moves with the start: it keeps
// the duration, and shows up as its own row in the review ("Ende").

import { EVENT_LIMITS } from "./event-publication";
import { validateStep } from "./event-steps";
import { instantToLocal, localToInstant } from "./time";

export type LiveEditField =
  "title" | "description" | "startDate" | "startTime" | "placeName" | "address";

export type LiveEditCode =
  | "titleMissing"
  | "titleTooLong"
  | "descriptionMissing"
  | "descriptionTooLong"
  | "dateMissing"
  | "dateInvalid"
  | "timeMissing"
  | "timeInvalid"
  | "timeNonexistent"
  | "timeAmbiguous"
  | "placeNameMissing"
  | "placeNameTooLong"
  | "addressMissing"
  | "addressInvalid"
  | "addressTooLong";

export type LiveEditErrors = Partial<Record<LiveEditField, LiveEditCode>>;

// What the form sends: text only. The date is ISO "YYYY-MM-DD" when it could
// be read, otherwise the raw text so that the check can name it.
export type LiveEditInput = {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  placeName: string;
  address: string;
};

// The part of the stored event the live form works on.
export type LiveEditBase = {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  endUnknown: boolean;
  placeName: string;
  addressLine: string;
  postalCode: string;
  city: string;
};

export type AddressParts = {
  addressLine: string;
  postalCode: string;
  city: string;
};

// "Kanalstraße 12, 10999 Berlin". Without a postal code: "Kanalstraße 12,
// Berlin". Empty parts are left out.
export function formatAddress(parts: AddressParts): string {
  const street = parts.addressLine.trim();
  const place = [parts.postalCode.trim(), parts.city.trim()]
    .filter((part) => part !== "")
    .join(" ");

  return [street, place].filter((part) => part !== "").join(", ");
}

const POSTAL_AND_CITY = /^(\d{4,5})\s+(.+)$/;

export type ParsedAddress = { ok: true; parts: AddressParts } | { ok: false };

// "Straße Nr., PLZ Ort" into its parts. The split is at the last comma; the
// street may contain commas itself. The postal code is optional (4 or 5
// digits), the city is not and has no digits.
export function parseAddress(raw: string): ParsedAddress {
  const text = raw.trim();
  const comma = text.lastIndexOf(",");

  if (comma < 0) {
    return { ok: false };
  }

  const street = text.slice(0, comma).trim();
  const rest = text.slice(comma + 1).trim();

  if (street === "" || rest === "") {
    return { ok: false };
  }

  const match = POSTAL_AND_CITY.exec(rest);
  const postalCode = match ? match[1] : "";
  const city = (match ? match[2] : rest).trim();

  if (city === "" || /\d/.test(city)) {
    return { ok: false };
  }

  return { ok: true, parts: { addressLine: street, postalCode, city } };
}

// What the end becomes when the start moves: the same duration after the new
// start. The end stays as it is when it is unknown or not set, when the start
// did not change, or when one of the instants cannot be read.
export function shiftedEnd(
  before: Pick<
    LiveEditBase,
    "startDate" | "startTime" | "endDate" | "endTime" | "endUnknown"
  >,
  after: { startDate: string; startTime: string },
): { endDate: string; endTime: string } {
  const keep = { endDate: before.endDate, endTime: before.endTime };

  if (
    before.endUnknown ||
    before.endDate === "" ||
    before.endTime === "" ||
    (before.startDate === after.startDate &&
      before.startTime === after.startTime)
  ) {
    return keep;
  }

  const oldStart = localToInstant(before.startDate, before.startTime);
  const oldEnd = localToInstant(before.endDate, before.endTime);
  const newStart = localToInstant(after.startDate, after.startTime);

  if (!oldStart.ok || !oldEnd.ok || !newStart.ok) {
    return keep;
  }

  const duration = Date.parse(oldEnd.instant) - Date.parse(oldStart.instant);

  if (!Number.isFinite(duration) || duration <= 0) {
    return keep;
  }

  const local = instantToLocal(
    new Date(Date.parse(newStart.instant) + duration).toISOString(),
  );

  return local ? { endDate: local.date, endTime: local.time } : keep;
}

export function validateLiveEdit(
  input: LiveEditInput,
  // The stored address: shown unchanged, it is not checked again.
  stored?: AddressParts,
): LiveEditErrors {
  const errors: LiveEditErrors = {};
  const title = input.title.trim();
  const description = input.description.trim();
  const placeName = input.placeName.trim();
  const address = input.address.trim();

  if (title === "") errors.title = "titleMissing";
  else if (title.length > EVENT_LIMITS.title) errors.title = "titleTooLong";

  if (description === "") errors.description = "descriptionMissing";
  else if (description.length > EVENT_LIMITS.description) {
    errors.description = "descriptionTooLong";
  }

  // Date and start: a live event always has both. The time step's check names
  // what is wrong with a date or time that is there.
  const date = input.startDate.trim();
  const time = input.startTime.trim();
  const when = validateStep(
    "time",
    { startDate: date, startTime: time, endUnknown: true },
    "next",
  );

  if (date === "") errors.startDate = "dateMissing";
  else if (when.startDate) {
    errors.startDate = when.startDate as "dateInvalid";
  }

  if (time === "") errors.startTime = "timeMissing";
  else if (when.startTime) {
    errors.startTime = when.startTime as
      "timeInvalid" | "timeNonexistent" | "timeAmbiguous";
  }

  if (placeName === "") errors.placeName = "placeNameMissing";
  else if (placeName.length > EVENT_LIMITS.placeName) {
    errors.placeName = "placeNameTooLong";
  }

  if (address === "") {
    errors.address = "addressMissing";
  } else if (stored && address === formatAddress(stored)) {
    // Unchanged: whatever is stored stays valid.
  } else {
    const parsed = parseAddress(address);

    if (!parsed.ok) {
      errors.address = "addressInvalid";
    } else if (
      parsed.parts.addressLine.length > EVENT_LIMITS.addressLine ||
      parsed.parts.postalCode.length > EVENT_LIMITS.postalCode ||
      parsed.parts.city.length > EVENT_LIMITS.city
    ) {
      errors.address = "addressTooLong";
    }
  }

  return errors;
}

export type LiveEditResult =
  { ok: true; values: LiveEditBase } | { ok: false; errors: LiveEditErrors };

// The stored values after the change: what was typed, the address split into
// its parts, and the end moved by the same duration as the start.
export function applyLiveEdit(
  current: LiveEditBase,
  input: LiveEditInput,
): LiveEditResult {
  const errors = validateLiveEdit(input, current);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  // An address the form showed unchanged keeps its stored parts exactly (a
  // postal code the split would not recognise must not be lost).
  const parsed =
    input.address.trim() === formatAddress(current)
      ? { ok: true as const, parts: current }
      : parseAddress(input.address);

  if (!parsed.ok) {
    return { ok: false, errors: { address: "addressInvalid" } };
  }

  const startDate = input.startDate.trim();
  const startTime = input.startTime.trim();
  const end = shiftedEnd(current, { startDate, startTime });

  return {
    ok: true,
    values: {
      title: input.title.trim(),
      description: input.description.trim(),
      startDate,
      startTime,
      endDate: end.endDate,
      endTime: end.endTime,
      endUnknown: current.endUnknown,
      placeName: input.placeName.trim(),
      addressLine: parsed.parts.addressLine,
      postalCode: parsed.parts.postalCode,
      city: parsed.parts.city,
    },
  };
}
