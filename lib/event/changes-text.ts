import type { ChangeField, EventChange } from "@/lib/domain/event-changes";
import { t, type Lang, type MessageId } from "@/lib/i18n";

import { listWhen } from "./list-format";

const FIELD_LABEL: Record<ChangeField, MessageId> = {
  title: "Z30.change.field.title",
  description: "Z30.change.field.description",
  format: "Z30.change.field.format",
  start: "Z30.change.field.start",
  end: "Z30.change.field.end",
  place: "Z30.change.field.place",
  address: "Z30.change.field.address",
  price: "Z30.change.field.price",
  access: "Z30.change.field.access",
  atmosphere: "Z30.change.field.atmosphere",
  image: "Z30.change.field.image",
  modules: "Z30.change.field.modules",
};

export type ChangeRow = {
  field: ChangeField;
  label: string;
  value: string;
};

// "2026-11-14T20:00" -> "20:00 Uhr" when the day is the same as the other
// side's, else "Sa, 14.11.2026, 20:00 Uhr". A start without time shows the day.
function moment(lang: Lang, value: string, otherDay: string | null): string {
  const [day, time = ""] = value.split("T");
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(day)
    ? listWhen(lang, `${day}T12:00:00Z`)
    : null;

  if (day === otherDay && time !== "") {
    return t(lang, "Z30.change.time", { time });
  }

  const dayText = parsed ? `${parsed.weekday}, ${parsed.date}` : day;

  return time === ""
    ? dayText
    : t(lang, "Z30.change.dateTime", { date: dayText, time });
}

function side(
  lang: Lang,
  field: ChangeField,
  value: string | null,
  other: string | null,
): string {
  if (value === null) return t(lang, "Z30.change.nothing");

  if (field === "start" || field === "end") {
    return moment(lang, value, other ? other.split("T")[0] : null);
  }

  return value;
}

// The rows of the card "Deine Änderungen" / "Das wird öffentlich": a label and
// "Bisher … · Neu …", or only "Geändert" for long content (Figma EVM-01b).
export function changeRows(
  lang: Lang,
  changes: readonly EventChange[],
): ChangeRow[] {
  return changes.map((change): ChangeRow => {
    const label = t(lang, FIELD_LABEL[change.field]);

    switch (change.kind) {
      case "values":
        return {
          field: change.field,
          label,
          value: t(lang, "Z30.change.values", {
            before: side(lang, change.field, change.before, change.after),
            after: side(lang, change.field, change.after, change.before),
          }),
        };
      case "changed":
        return {
          field: change.field,
          label,
          value: t(lang, "Z30.change.changed"),
        };
      case "added":
        return {
          field: change.field,
          label,
          value: t(lang, "Z30.change.added"),
        };
      case "removed":
        return {
          field: change.field,
          label,
          value: t(lang, "Z30.change.removed"),
        };
    }
  });
}
