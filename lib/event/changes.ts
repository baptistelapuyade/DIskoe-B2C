import type { EventContent } from "@/lib/domain/event-changes";

import { accessText, atmosphereSummary, priceText } from "./summary";
import { rowToFormValues, type EventRevisionRow } from "./values";

const orNull = (value: string): string | null =>
  value.trim() === "" ? null : value;

// The values of a revision that the comparison of "public stand against
// private draft" looks at (EVM-01b, EVB-03). Built from the saved row only.
export function eventContentOf(row: EventRevisionRow): EventContent {
  const form = rowToFormValues(row);
  const town = [form.postalCode, form.city].filter((p) => p !== "").join(" ");
  const address = [form.addressLine, town].filter((p) => p !== "").join(", ");
  const modules =
    row.modules === null || row.modules === undefined
      ? null
      : JSON.stringify(row.modules);

  return {
    title: orNull(form.title),
    description: orNull(form.description),
    format: orNull(form.format),
    startDate: orNull(form.startDate),
    startTime: orNull(form.startTime),
    endDate: form.endUnknown ? null : orNull(form.endDate),
    endTime: form.endUnknown ? null : orNull(form.endTime),
    placeName: orNull(form.placeName),
    address: orNull(address),
    price: priceText(form),
    access: accessText(form),
    atmosphere: atmosphereSummary(form),
    imageUseId: row.event_image_use_id,
    modules: modules === "{}" || modules === "[]" ? null : modules,
  };
}
