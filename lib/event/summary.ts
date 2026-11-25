// Short texts for the summary cards of the event editor. Pure: built from the
// saved form values, never from guesses. An unanswered price is not "Frei".

import type { AccessKind } from "../domain/event-publication";
import { parseAmount, priceLabel } from "../domain/money";
import { formatLocalDate } from "../domain/time";
import { t, type Lang } from "../i18n";
import { ACCESS_ID } from "./labels";
import type { EventFormValues } from "./values";

export function priceText(lang: Lang, v: EventFormValues): string | null {
  if (v.priceModel === "free")
    return priceLabel(lang, { state: "provided", model: "free" });
  if (v.priceModel === "donation") {
    return priceLabel(lang, { state: "provided", model: "donation" });
  }
  if (v.priceModel === "unknown") return priceLabel(lang, { state: "unknown" });

  const fees = v.priceFees === "included" ? "included" : null;
  const low = parseAmount(v.priceAmount);

  if (!low.ok) return null;

  if (v.priceModel === "range") {
    const high = parseAmount(v.priceAmountMax);

    return high.ok
      ? priceLabel(lang, {
          state: "provided",
          model: "range",
          amountMinor: low.amountMinor,
          maxAmountMinor: high.amountMinor,
          fees,
        })
      : null;
  }

  if (
    v.priceModel === "fixed" ||
    v.priceModel === "from_price" ||
    v.priceModel === "min_donation"
  ) {
    return priceLabel(lang, {
      state: "provided",
      model: v.priceModel,
      amountMinor: low.amountMinor,
      fees,
    });
  }

  return null;
}

export function accessText(lang: Lang, v: EventFormValues): string | null {
  const labels = v.accessKinds
    .filter((kind): kind is AccessKind => kind in ACCESS_ID)
    .map((kind) => t(lang, ACCESS_ID[kind]));

  return labels.length > 0 ? labels.join(" · ") : null;
}

// "Preis und Zugang" summary line, or null while nothing is answered.
export function priceAccessSummary(
  lang: Lang,
  v: EventFormValues,
): string | null {
  const parts = [priceText(lang, v), accessText(lang, v)].filter(
    (part): part is string => part !== null,
  );

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function atmosphereSummary(v: EventFormValues): string | null {
  const parts = [...v.atmosphereTags];

  if (v.atmosphereDescription.trim() !== "") {
    parts.push(v.atmosphereDescription.trim());
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

// "Sa., 31.10.2026, 23:00 Uhr bis So., 01.11.2026, 04:00 Uhr" from the form
// values (local wall-clock time in Europe/Berlin). Null while no start exists.
export function whenText(v: EventFormValues): string | null {
  if (v.startDate === "") return null;

  const start = `${formatLocalDate(v.startDate)}${
    v.startTime ? `, ${v.startTime} Uhr` : ""
  }`;

  if (v.endUnknown || v.endDate === "") return start;

  const end =
    v.endDate === v.startDate
      ? `${v.endTime} Uhr`
      : `${formatLocalDate(v.endDate)}${v.endTime ? `, ${v.endTime} Uhr` : ""}`;

  return `${start} bis ${end}`;
}

export function placeText(v: EventFormValues): string | null {
  if (v.placeName === "" && v.addressLine === "") return null;

  const town = [v.postalCode, v.city].filter((part) => part !== "").join(" ");
  const address = [v.addressLine, town]
    .filter((part) => part !== "")
    .join(", ");

  return [v.placeName, address].filter((part) => part !== "").join(" · ");
}
