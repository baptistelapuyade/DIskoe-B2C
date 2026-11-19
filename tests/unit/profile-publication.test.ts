import { describe, expect, it } from "vitest";

import {
  LIMITS,
  checkImage,
  describeGaps,
  localGapCodes,
  linkLabel,
  normalizeInstagram,
  normalizeUrl,
  parseSlug,
  parseAltText,
  parseGapDetail,
  parseProfileInput,
  inspectProfileImage,
  safeFileName,
  parseCrop,
  parseQuestion,
  readImageSize,
  progressStage,
  QUESTION_MAX_LENGTH,
  reviewStatus,
  sniffImageType,
} from "../../lib/domain/profile-publication";

const complete = {
  name: "Alpha Events",
  shortIntro: "Nights in Berlin.",
  officialUrl: "https://alpha.example",
  instagram: "",
  extraLinks: [] as string[],
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
        instagram: "",
        extraLinks: [],
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
      value: {
        name: "",
        shortIntro: "",
        officialUrl: "",
        instagram: "",
        extraLinks: [],
        publicContact: "",
      },
    });
  });

  it("returns error codes, not texts", () => {
    const result = parseProfileInput({
      name: "x".repeat(LIMITS.name + 1),
      officialUrl: "nope nope",
      instagram: "not valid!",
      extraLinks: ["https://ok.example", "nope nope"],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual({
        name: "tooLong",
        officialUrl: "invalidLink",
        instagram: "invalidInstagram",
        extraLinks: [null, "invalidLink"],
      });
    }
  });

  it("keeps up to five further links, drops empty rows and normalises", () => {
    const result = parseProfileInput({
      extraLinks: ["", "a.example", "  ", "https://b.example/x", "c.example", "d.example", "e.example", "f.example", "g.example"],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.extraLinks).toEqual([
        "https://a.example/",
        "https://b.example/x",
        "https://c.example/",
        "https://d.example/",
        "https://e.example/",
      ]);
    }
  });
});

describe("normalizeInstagram", () => {
  it.each([
    ["@nebenraum", "nebenraum"],
    ["nebenraum", "nebenraum"],
    ["  @neben.raum_1 ", "neben.raum_1"],
    ["https://www.instagram.com/nebenraum/", "nebenraum"],
    ["instagram.com/nebenraum?hl=de", "nebenraum"],
    ["", ""],
  ])("turns %j into %j", (input, expected) => {
    expect(normalizeInstagram(input)).toBe(expected);
  });

  it.each(["@", "neben raum", "@@x", "a".repeat(31), "https://example.org/nebenraum", "x!"])(
    "rejects %j",
    (input) => {
      expect(normalizeInstagram(input)).toBeNull();
    },
  );
});

describe("linkLabel", () => {
  it("shows the domain without www", () => {
    expect(linkLabel("https://www.example.org/a/b")).toBe("example.org");
    expect(linkLabel("http://soundcloud.com/x")).toBe("soundcloud.com");
  });
});

describe("parseSlug", () => {
  it("lowercases and trims", () => {
    expect(parseSlug("  Nebenraum-Kollektiv ")).toEqual({ ok: true, value: "nebenraum-kollektiv" });
  });

  it.each(["ab", "-abc", "abc-", "Nebenraum Berlin!", "ü-test", "a".repeat(41), ""])(
    "rejects %j",
    (value) => {
      expect(parseSlug(value)).toEqual({ ok: false });
    },
  );
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

describe("link gap with Instagram and further links", () => {
  const base = { ...complete, officialUrl: "", publicContact: "" };

  it("is closed by an Instagram handle alone", () => {
    expect(localGapCodes({ ...base, instagram: "nebenraum" }, true)).toEqual([]);
  });

  it("is closed by one further link alone", () => {
    expect(localGapCodes({ ...base, extraLinks: ["https://a.example/"] }, true)).toEqual([]);
  });

  it("stays open without any link or contact", () => {
    expect(localGapCodes(base, true)).toEqual(["link_or_contact"]);
  });
});

// A minimal valid file header for each type, enough for the size reader.
function png(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(33);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const view = new DataView(bytes.buffer);
  view.setUint32(8, 13);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12); // IHDR
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

function jpeg(width: number, height: number): Uint8Array {
  // SOI, APP0 (length 16), SOF0.
  const bytes = new Uint8Array(2 + 18 + 19);
  bytes.set([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const view = new DataView(bytes.buffer);
  const sof = 2 + 18;
  bytes.set([0xff, 0xc0], sof);
  view.setUint16(sof + 2, 17);
  bytes[sof + 4] = 8;
  view.setUint16(sof + 5, height);
  view.setUint16(sof + 7, width);
  return bytes;
}

function webpLossless(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(40);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
  bytes.set([0x57, 0x45, 0x42, 0x50], 8); // WEBP
  bytes.set([0x56, 0x50, 0x38, 0x4c], 12); // VP8L
  bytes[20] = 0x2f;
  const view = new DataView(bytes.buffer);
  view.setUint32(21, (width - 1) | ((height - 1) << 14), true);
  return bytes;
}

function webpExtended(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(40);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  bytes.set([0x57, 0x45, 0x42, 0x50], 8);
  bytes.set([0x56, 0x50, 0x38, 0x58], 12); // VP8X
  const w = width - 1;
  const h = height - 1;
  bytes.set([w & 0xff, (w >> 8) & 0xff, (w >> 16) & 0xff], 24);
  bytes.set([h & 0xff, (h >> 8) & 0xff, (h >> 16) & 0xff], 27);
  return bytes;
}

describe("readImageSize and inspectProfileImage", () => {
  it("reads PNG, JPEG and WebP sizes", () => {
    expect(readImageSize(png(800, 600), "image/png")).toEqual({ width: 800, height: 600 });
    expect(readImageSize(jpeg(1200, 900), "image/jpeg")).toEqual({ width: 1200, height: 900 });
    expect(readImageSize(webpLossless(640, 480), "image/webp")).toEqual({ width: 640, height: 480 });
    expect(readImageSize(webpExtended(2000, 1000), "image/webp")).toEqual({ width: 2000, height: 1000 });
  });

  it("accepts an image of at least 400 x 400", () => {
    expect(inspectProfileImage(png(400, 400))).toEqual({
      ok: true,
      type: "image/png",
      width: 400,
      height: 400,
    });
  });

  it("names the size of a picture that is too small", () => {
    expect(inspectProfileImage(jpeg(320, 240))).toEqual({
      ok: false,
      code: "tooSmall",
      width: 320,
      height: 240,
    });
    expect(inspectProfileImage(png(399, 2000))).toMatchObject({ ok: false, code: "tooSmall" });
  });

  it("refuses an empty file, a wrong format and a file over the limit", () => {
    expect(inspectProfileImage(new Uint8Array())).toEqual({ ok: false, code: "empty" });
    expect(inspectProfileImage(new TextEncoder().encode("<svg xmlns='x'/>"))).toEqual({
      ok: false,
      code: "format",
    });
    const big = new Uint8Array(LIMITS.imageBytes + 1);
    big.set(png(800, 800));
    expect(inspectProfileImage(big)).toEqual({ ok: false, code: "tooBig", bytes: big.length });
  });

  it("does not trust a header it cannot read", () => {
    const broken = new Uint8Array(12);
    broken.set([0xff, 0xd8, 0xff]);
    expect(inspectProfileImage(broken)).toEqual({ ok: false, code: "format" });
  });
});

describe("parseCrop", () => {
  const image = { width: 1000, height: 500 };

  it("accepts a square inside the image", () => {
    expect(parseCrop({ x: 0.25, y: 0, w: 0.5, h: 1 }, image)).toEqual({ x: 0.25, y: 0, w: 0.5, h: 1 });
  });

  const bad: [unknown, string][] = [
    [{ x: 0.25, y: 0, w: 0.5, h: 0.5 }, "not square in pixels"],
    [{ x: 0.6, y: 0, w: 0.5, h: 1 }, "leaves the image"],
    [{ x: 0, y: 0, w: 0, h: 0 }, "empty"],
    [{ x: 0, y: 0, w: 0.5 }, "missing field"],
    [{ x: "0", y: 0, w: 0.5, h: 1 }, "wrong type"],
    [null, "null"],
  ];

  it.each(bad)("rejects %j (%s)", (value) => {
    expect(parseCrop(value, image)).toBeNull();
  });
});

describe("safeFileName", () => {
  it("keeps the last path segment and drops control characters", () => {
    expect(safeFileName("profilbild.jpg")).toBe("profilbild.jpg");
    expect(safeFileName("C:\\Users\\me\\logo.png")).toBe("logo.png");
    expect(safeFileName("../../etc/logo.png")).toBe("logo.png");
    expect(safeFileName("a\u0000b\nc.png")).toBe("abc.png");
  });

  it("caps the length and returns null for an empty name", () => {
    expect(safeFileName("x".repeat(300))).toHaveLength(120);
    expect(safeFileName("   ")).toBeNull();
    expect(safeFileName("folder/")).toBeNull();
  });
});
