import type {
  ChangeField,
  FieldChange,
  UnchangedField,
} from "@/lib/domain/profile-changes";
import { t, type Lang, type MessageId } from "@/lib/i18n";

const HEADING: Record<ChangeField, MessageId> = {
  name: "Z29.changes.field.name",
  intro: "Z29.changes.field.intro",
  links: "Z29.changes.field.links",
};

// Where "Change" leads: the field of the edit form (anchor = field id).
const ANCHOR: Record<ChangeField, string> = {
  name: "name",
  intro: "shortIntro",
  links: "officialUrl",
};

const UNCHANGED: Record<UnchangedField, MessageId> = {
  name: "Z29.changes.unchanged.name",
  intro: "Z29.changes.unchanged.intro",
  links: "Z29.changes.unchanged.links",
  slug: "Z29.changes.unchanged.slug",
  image: "Z29.changes.unchanged.image",
};

export function changeHeading(lang: Lang, field: ChangeField): string {
  return t(lang, HEADING[field]);
}

export function changeAnchor(field: ChangeField): string {
  return ANCHOR[field];
}

// "Unchanged: name, profile address and profile image." Only fields that are
// really unchanged are named.
export function unchangedText(
  lang: Lang,
  fields: readonly UnchangedField[],
): string | null {
  if (fields.length === 0) return null;

  const list = new Intl.ListFormat(lang === "de" ? "de" : "en-GB", {
    style: "long",
    type: "conjunction",
  }).format(fields.map((field) => t(lang, UNCHANGED[field])));

  return t(lang, "Z29.changes.unchanged", { fields: list });
}

// "Public so far" shows "Nothing entered" for a value that did not exist;
// "New" shows "Removed" for a value that is gone now.
export function changeRows(lang: Lang, change: FieldChange) {
  return [
    {
      key: "before",
      label: t(lang, "Z29.changes.before"),
      text: change.before ?? t(lang, "Z29.changes.empty"),
    },
    {
      key: "after",
      label: t(lang, "Z29.changes.after"),
      text: change.after ?? t(lang, "Z29.changes.removed"),
    },
  ];
}
