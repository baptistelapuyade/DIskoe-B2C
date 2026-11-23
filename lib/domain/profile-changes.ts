// What differs between the published profile and the owner's private draft
// (Figma LPA-03a). Pure rules: no framework or database imports.
//
// The comparison is about content, not about revision ids: a draft that was
// saved with the same values as the public page is not a change (LPA-03b), and
// the home card only shows "changes ready" (ORG-103g) when something really
// differs.
//
// The profile picture and the address do not change in a live profile in this
// slice, so they always count as unchanged.

export type RevisionContent = {
  name: string | null;
  shortIntro: string | null;
  officialUrl: string | null;
  instagramHandle: string | null;
  extraLinks: readonly string[];
  publicContact: string | null;
};

// One card of the review screen each. Links and contact are one card.
export type ChangeField = "name" | "intro" | "links";

export type FieldChange = {
  field: ChangeField;
  // null = empty: "Nothing entered" before, "Removed" after.
  before: string | null;
  after: string | null;
};

export type UnchangedField = ChangeField | "slug" | "image";

export type ProfileChanges = {
  changes: FieldChange[];
  unchanged: UnchangedField[];
};

const ORDER: UnchangedField[] = ["name", "intro", "links", "slug", "image"];

function clean(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();

  return trimmed === "" ? null : trimmed;
}

// "https://nebenraum.example/" is shown as "nebenraum.example". Other schemes
// stay visible.
function displayLink(url: string): string {
  return url
    .trim()
    .replace(/^https:\/\//i, "")
    .replace(/\/$/, "");
}

// The parts of the links card in the order of the form: website, Instagram,
// further links, public contact.
export function linkParts(content: RevisionContent): string[] {
  const parts: string[] = [];
  const website = clean(content.officialUrl);
  const instagram = clean(content.instagramHandle);
  const contact = clean(content.publicContact);

  if (website) parts.push(displayLink(website));
  if (instagram) parts.push(`@${instagram.replace(/^@/, "")}`);

  for (const link of content.extraLinks) {
    const value = clean(link);

    if (value) parts.push(displayLink(value));
  }

  if (contact) parts.push(contact);

  return parts;
}

export function linksSummary(content: RevisionContent): string | null {
  const parts = linkParts(content);

  return parts.length === 0 ? null : parts.join(" · ");
}

function linksKey(content: RevisionContent): string {
  return JSON.stringify([
    clean(content.officialUrl),
    clean(content.instagramHandle)?.replace(/^@/, "") ?? null,
    content.extraLinks
      .map((link) => clean(link))
      .filter((link) => link !== null),
    clean(content.publicContact),
  ]);
}

export function diffRevisions(
  published: RevisionContent,
  draft: RevisionContent,
): ProfileChanges {
  const changes: FieldChange[] = [];

  const before = {
    name: clean(published.name),
    intro: clean(published.shortIntro),
  };
  const after = {
    name: clean(draft.name),
    intro: clean(draft.shortIntro),
  };

  if (before.name !== after.name) {
    changes.push({ field: "name", before: before.name, after: after.name });
  }

  if (before.intro !== after.intro) {
    changes.push({ field: "intro", before: before.intro, after: after.intro });
  }

  if (linksKey(published) !== linksKey(draft)) {
    changes.push({
      field: "links",
      before: linksSummary(published),
      after: linksSummary(draft),
    });
  }

  const changed = new Set<UnchangedField>(
    changes.map((change) => change.field),
  );

  return {
    changes,
    unchanged: ORDER.filter((field) => !changed.has(field)),
  };
}

export function hasChanges(result: ProfileChanges): boolean {
  return result.changes.length > 0;
}
