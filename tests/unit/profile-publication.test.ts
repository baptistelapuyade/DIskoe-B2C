import { describe, expect, it } from "vitest";

import {
  LIMITS,
  checkImage,
  describeGaps,
  localGapCodes,
  normalizeUrl,
  parseAltText,
  parseGapDetail,
  parseProfileInput,
  parseQuestion,
  progressStage,
  QUESTION_MAX_LENGTH,
  reviewStatus,
  sniffImageType,
} from "../../lib/domain/profile-publication";

const complete = {
  name: "Alpha Events",
  shortIntro: "Nights in Berlin.",
  officialUrl: "https://alpha.example",
  publicContact: "",
};

describe("normalizeUrl", () => {
  it("completes a missing scheme with https", () => {
    expect(normalizeUrl("example.org")).toBe("https://example.org/");
  });

  it("keeps http and https", () => {
    expect(normalizeUrl("http://example.org/a")).toBe("http://example.org/a");
    expect(normalizeUrl("https://example.org")).toBe("https://example.org/");
  });

  it("allows an empty value (the draft is incomplete, not invalid)", () => {
    expect(normalizeUrl("   ")).toBe("");
  });

  it.each([
    "javascript:alert(1)",
    "ftp://example.org",
    "mailto:a@b.de",
    "data:text/html,x",
    "not a url",
    "localhost",
    "https://",
  ])("rejects %j", (value) => {
    expect(normalizeUrl(value)).toBeNull();
  });
});

describe("parseProfileInput", () => {
  it("accepts an incomplete draft", () => {
    const result = parseProfileInput({ name: "", shortIntro: "" });
    expect(result.ok).toBe(true);
  });

  it("trims values and normalises the link", () => {
    const result = parseProfileInput({
      name: "  Alpha  ",
      officialUrl: "alpha.example",
    });
    expect(result).toEqual({
      ok: true,
      value: {
        name: "Alpha",
        shortIntro: "",
        officialUrl: "https://alpha.example/",
        publicContact: "",
      },
    });
  });

  it("reports an invalid link and over-long fields by field", () => {
    const result = parseProfileInput({
      name: "x".repeat(LIMITS.name + 1),
      shortIntro: "y".repeat(LIMITS.shortIntro + 1),
      officialUrl: "javascript:alert(1)",
      publicContact: "z".repeat(LIMITS.publicContact + 1),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        "name",
        "officialUrl",
        "publicContact",
        "shortIntro",
      ]);
    }
  });

  it("treats non-string input as empty", () => {
    const result = parseProfileInput({ name: 42, shortIntro: null });
    expect(result).toEqual({
      ok: true,
      value: { name: "", shortIntro: "", officialUrl: "", publicContact: "" },
    });
  });
});

describe("localGapCodes", () => {
  it("is complete with name, intro, a link and a confirmed image", () => {
    expect(localGapCodes(complete, true)).toEqual([]);
  });

  it("accepts a public contact instead of a link", () => {
    expect(
      localGapCodes({ ...complete, officialUrl: "", publicContact: "a@b.de" }, true),
    ).toEqual([]);
  });

  it("lists every missing piece", () => {
    expect(
      localGapCodes(
        { name: " ", shortIntro: "", officialUrl: "", publicContact: " " },
        false,
      ),
    ).toEqual(["name", "short_intro", "link_or_contact", "profile_image"]);
  });

  it("does not count an unconfirmed image", () => {
    expect(localGapCodes(complete, false)).toEqual(["profile_image"]);
  });
});

describe("gaps from the database", () => {
  it("parses the DETAIL of a DK002 error", () => {
    expect(parseGapDetail("name, profile_image")).toEqual([
      "name",
      "profile_image",
    ]);
    expect(parseGapDetail(null)).toEqual([]);
  });

  it("describes known codes in German and drops unknown ones", () => {
    const gaps = describeGaps(["profile_image", "mystery"]);
    expect(gaps).toHaveLength(1);
    expect(gaps[0].message).toBe("Ein bestätigtes Profilbild fehlt.");
  });
});

describe("reviewStatus", () => {
  const base = {
    gapCount: 0,
    draftRevisionId: "r2",
    firstApprovedRevisionId: null,
    publishedRevisionId: null,
    submittedRevisionId: null,
    questionRevisionId: null,
  };

  it("is incomplete while gaps remain", () => {
    expect(reviewStatus({ ...base, gapCount: 1 })).toBe("incomplete");
  });

  it("is ready when complete but not submitted", () => {
    expect(reviewStatus(base)).toBe("ready");
  });

  it("is in review when exactly this draft was submitted", () => {
    expect(reviewStatus({ ...base, submittedRevisionId: "r2" })).toBe("in_review");
  });

  it("does not stay in review after the draft changed", () => {
    expect(reviewStatus({ ...base, submittedRevisionId: "r1" })).toBe("ready");
  });

  it("shows the founder's question for exactly this draft", () => {
    expect(
      reviewStatus({
        ...base,
        submittedRevisionId: "r2",
        questionRevisionId: "r2",
      }),
    ).toBe("question");
  });

  it("is ready again after the owner changed a draft that had a question", () => {
    expect(
      reviewStatus({
        ...base,
        draftRevisionId: "r3",
        submittedRevisionId: "r2",
        questionRevisionId: "r2",
      }),
    ).toBe("ready");
  });

  it("needs the owner's confirmation for changes after the first publication", () => {
    expect(
      reviewStatus({
        ...base,
        firstApprovedRevisionId: "r1",
        publishedRevisionId: "r1",
      }),
    ).toBe("update_ready");
  });

  it("is published when the draft is the published revision", () => {
    expect(
      reviewStatus({
        ...base,
        firstApprovedRevisionId: "r2",
        publishedRevisionId: "r2",
      }),
    ).toBe("published");
  });

  it("never shows update_ready or ready for an incomplete new draft", () => {
    expect(
      reviewStatus({
        ...base,
        gapCount: 2,
        firstApprovedRevisionId: "r1",
        publishedRevisionId: "r1",
      }),
    ).toBe("incomplete");
  });
});

describe("progressStage", () => {
  it("moves along the four steps before the first publication", () => {
    expect(progressStage("incomplete", false)).toBe(0);
    expect(progressStage("ready", false)).toBe(1);
    expect(progressStage("in_review", false)).toBe(2);
    expect(progressStage("question", false)).toBe(2);
  });

  it("is complete once the profile is live, whatever the new draft looks like", () => {
    expect(progressStage("published", true)).toBe(4);
    expect(progressStage("incomplete", true)).toBe(4);
    expect(progressStage("update_ready", true)).toBe(4);
  });
});

describe("parseQuestion", () => {
  it("trims and accepts a normal question", () => {
    expect(parseQuestion("  Funktioniert der Link?  ")).toEqual({
      ok: true,
      value: "Funktioniert der Link?",
    });
  });

  it("rejects an empty question", () => {
    expect(parseQuestion("   ").ok).toBe(false);
    expect(parseQuestion(null).ok).toBe(false);
  });

  it("rejects a question over the limit", () => {
    expect(parseQuestion("x".repeat(QUESTION_MAX_LENGTH)).ok).toBe(true);
    expect(parseQuestion("x".repeat(QUESTION_MAX_LENGTH + 1)).ok).toBe(false);
  });
});

describe("image checks", () => {
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);
  const webp = Uint8Array.from([
    0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
  ]);

  it("recognises the type from the content", () => {
    expect(sniffImageType(jpeg)).toBe("image/jpeg");
    expect(sniffImageType(png)).toBe("image/png");
    expect(sniffImageType(webp)).toBe("image/webp");
  });

  it("rejects text, html and svg regardless of the file name", () => {
    const encoder = new TextEncoder();
    expect(checkImage(encoder.encode("hello.png")).ok).toBe(false);
    expect(checkImage(encoder.encode("<html></html>")).ok).toBe(false);
    expect(checkImage(encoder.encode("<svg xmlns='x'/>")).ok).toBe(false);
  });

  it("rejects empty and oversized files", () => {
    expect(checkImage(new Uint8Array()).ok).toBe(false);
    const big = new Uint8Array(LIMITS.imageBytes + 1);
    big.set(jpeg);
    expect(checkImage(big).ok).toBe(false);
  });

  it("accepts a file exactly at the limit", () => {
    const edge = new Uint8Array(LIMITS.imageBytes);
    edge.set(jpeg);
    expect(checkImage(edge)).toEqual({ ok: true, type: "image/jpeg" });
  });

  it("treats the alt text as optional and limits its length", () => {
    expect(parseAltText("  ")).toEqual({ ok: true, value: null });
    expect(parseAltText(undefined)).toEqual({ ok: true, value: null });
    expect(parseAltText("x".repeat(LIMITS.altText + 1)).ok).toBe(false);
    expect(parseAltText(" Bühne bei Nacht ")).toEqual({
      ok: true,
      value: "Bühne bei Nacht",
    });
  });
});
