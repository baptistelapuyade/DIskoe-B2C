import { describe, expect, it } from "vitest";

import {
  diffRevisions,
  hasChanges,
  linksSummary,
  type RevisionContent,
} from "@/lib/domain/profile-changes";

const base: RevisionContent = {
  name: "Nebenraum Kollektiv",
  shortIntro:
    "Unabhängige Nächte zwischen Dub Techno und experimenteller Elektronik.",
  officialUrl: "https://nebenraum.example",
  instagramHandle: null,
  extraLinks: [],
  publicContact: null,
};

describe("diffRevisions", () => {
  it("finds nothing when the content is the same", () => {
    const result = diffRevisions(base, { ...base });

    expect(hasChanges(result)).toBe(false);
    expect(result.unchanged).toEqual([
      "name",
      "intro",
      "links",
      "slug",
      "image",
    ]);
  });

  it("ignores surrounding whitespace and an empty string against null", () => {
    const result = diffRevisions(base, {
      ...base,
      name: "  Nebenraum Kollektiv ",
      instagramHandle: "",
      publicContact: " ",
    });

    expect(hasChanges(result)).toBe(false);
  });

  it("reports one card per changed field and keeps the rest unchanged", () => {
    const result = diffRevisions(base, {
      ...base,
      shortIntro: "Unabhängige Nächte in Berlin.",
      instagramHandle: "nebenraum",
    });

    expect(result.changes.map((change) => change.field)).toEqual([
      "intro",
      "links",
    ]);
    expect(result.unchanged).toEqual(["name", "slug", "image"]);
    expect(result.changes[1]).toEqual({
      field: "links",
      before: "nebenraum.example",
      after: "nebenraum.example · @nebenraum",
    });
  });

  it("reports a changed name as its own card", () => {
    const result = diffRevisions(base, { ...base, name: "Nebenraum" });

    expect(result.changes).toEqual([
      { field: "name", before: "Nebenraum Kollektiv", after: "Nebenraum" },
    ]);
    expect(result.unchanged).toEqual(["intro", "links", "slug", "image"]);
  });

  it("uses null for a value that was added or removed", () => {
    const added = diffRevisions(
      { ...base, shortIntro: null },
      { ...base, shortIntro: "Neu" },
    );
    const removed = diffRevisions(base, {
      ...base,
      publicContact: "a@b.example",
      officialUrl: null,
    });

    expect(added.changes[0]).toEqual({
      field: "intro",
      before: null,
      after: "Neu",
    });
    expect(removed.changes[0]).toEqual({
      field: "links",
      before: "nebenraum.example",
      after: "a@b.example",
    });

    const empty = diffRevisions(base, { ...base, officialUrl: null });

    expect(empty.changes[0]).toEqual({
      field: "links",
      before: "nebenraum.example",
      after: null,
    });
  });

  it("notices a change in the order or content of further links", () => {
    const first = {
      ...base,
      extraLinks: ["https://a.example", "https://b.example"],
    };
    const second = {
      ...base,
      extraLinks: ["https://b.example", "https://a.example"],
    };

    expect(hasChanges(diffRevisions(first, second))).toBe(true);
  });

  it("does not hide a changed scheme", () => {
    const result = diffRevisions(base, {
      ...base,
      officialUrl: "http://nebenraum.example",
    });

    expect(result.changes[0].after).toBe("http://nebenraum.example");
  });
});

describe("linksSummary", () => {
  it("joins website, Instagram, further links and contact", () => {
    expect(
      linksSummary({
        ...base,
        instagramHandle: "nebenraum",
        extraLinks: ["https://tickets.example/"],
        publicContact: "hallo@nebenraum.example",
      }),
    ).toBe(
      "nebenraum.example · @nebenraum · tickets.example · hallo@nebenraum.example",
    );
  });

  it("is null without any link or contact", () => {
    expect(linksSummary({ ...base, officialUrl: null })).toBeNull();
  });
});
