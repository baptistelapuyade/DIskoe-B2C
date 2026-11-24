// What differs between the public revision of an event and the owner's private
// draft (Figma EVM-01b, EVB-03a to 03c, EVB-04). Pure rules, no framework or
// database imports.
//
// The comparison is about content, not revision ids: a draft saved with the
// same values as the public page is not a change (EVB-03c).

// The values of one revision, already reduced to what is compared. The loader
// builds this from the revision row; empty text is null.
export type EventContent = {
  title: string | null;
  description: string | null;
  format: string | null;
  startDate: string | null;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  placeName: string | null;
  // Street, postcode and town as one line.
  address: string | null;
  // Short texts as the summary cards show them; null = not answered.
  price: string | null;
  access: string | null;
  atmosphere: string | null;
  // The image use of the revision; a new upload is a new use.
  imageUseId: string | null;
  // The blocks of "Mehr zum Abend" as stored (JSON text); null = never saved.
  modules: string | null;
};

// One row of the review each, in the order of the form.
export type ChangeField =
  | "title"
  | "description"
  | "format"
  | "start"
  | "end"
  | "place"
  | "address"
  | "price"
  | "access"
  | "atmosphere"
  | "image"
  | "modules";

// "values": short text with before and after ("Bisher … · Neu …"). For
//   "start" and "end" the values are "YYYY-MM-DDTHH:MM" (local time).
// "changed": long content, only the fact ("Geändert").
// "added": something new where nothing was ("Neu").
// "removed": something that is gone.
export type EventChange =
  | {
      field: ChangeField;
      kind: "values";
      before: string | null;
      after: string | null;
    }
  | { field: ChangeField; kind: "changed" | "added" | "removed" };

const clean = (value: string | null | undefined): string | null => {
  const trimmed = (value ?? "").trim();

  return trimmed === "" ? null : trimmed;
};

type Probe = {
  field: ChangeField;
  // The comparable value of one revision.
  read: (c: EventContent) => string | null;
  // How a change is reported.
  report: "values" | "changed";
};

const startOf = (c: EventContent): string | null =>
  clean(c.startDate) === null
    ? null
    : `${clean(c.startDate)}T${clean(c.startTime) ?? ""}`;

const endOf = (c: EventContent): string | null =>
  clean(c.endDate) === null
    ? null
    : `${clean(c.endDate)}T${clean(c.endTime) ?? ""}`;

const PROBES: Probe[] = [
  { field: "title", read: (c) => clean(c.title), report: "values" },
  {
    field: "description",
    read: (c) => clean(c.description),
    report: "changed",
  },
  { field: "format", read: (c) => clean(c.format), report: "changed" },
  { field: "start", read: startOf, report: "values" },
  { field: "end", read: endOf, report: "values" },
  { field: "place", read: (c) => clean(c.placeName), report: "values" },
  { field: "address", read: (c) => clean(c.address), report: "values" },
  { field: "price", read: (c) => clean(c.price), report: "values" },
  { field: "access", read: (c) => clean(c.access), report: "values" },
  { field: "atmosphere", read: (c) => clean(c.atmosphere), report: "changed" },
  { field: "image", read: (c) => clean(c.imageUseId), report: "changed" },
  { field: "modules", read: (c) => clean(c.modules), report: "changed" },
];

// Which of the changed fields tell followers (Welle 3): date, start, place and
// the cancellation. Text and image never do (matrix FOLLOW-02).
export const FOLLOWER_FIELDS: readonly ChangeField[] = [
  "start",
  "end",
  "place",
  "address",
];

export function diffEventContent(
  published: EventContent,
  draft: EventContent,
): EventChange[] {
  const changes: EventChange[] = [];

  for (const probe of PROBES) {
    const before = probe.read(published);
    const after = probe.read(draft);

    if (before === after) continue;

    if (probe.report === "values") {
      changes.push({ field: probe.field, kind: "values", before, after });
    } else if (before === null) {
      changes.push({ field: probe.field, kind: "added" });
    } else if (after === null) {
      changes.push({ field: probe.field, kind: "removed" });
    } else {
      changes.push({ field: probe.field, kind: "changed" });
    }
  }

  return changes;
}

export function hasEventChanges(
  published: EventContent,
  draft: EventContent,
): boolean {
  return diffEventContent(published, draft).length > 0;
}
