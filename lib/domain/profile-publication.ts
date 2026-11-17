// Pure rules for the organizer profile: input checks, completeness, status and
// image validation. No framework or database imports, so the rules can be
// unit-tested. The database stays the authority (profile_gaps, approval and
// publish functions); this module only produces the user-facing side and
// rejects obviously bad input early.

// TODO(spec): the length limits are proposals, not product decisions.
export const LIMITS = {
  name: 80,
  shortIntro: 280,
  officialUrl: 300,
  publicContact: 200,
  extraLinks: 5,
  imageMinSide: 400,
  altText: 200,
  imageBytes: 5 * 1024 * 1024,
} as const;

export type ProfileFields = {
  name: string;
  shortIntro: string;
  officialUrl: string;
  // The handle without "@", or "".
  instagram: string;
  // Up to LIMITS.extraLinks complete https/http addresses.
  extraLinks: string[];
  publicContact: string;
};

// Errors are codes, not texts: the screen turns them into catalog texts in
// the language of the page.
export type FieldErrorCode = "tooLong" | "invalidLink" | "invalidInstagram";

export type FieldErrors = {
  name?: FieldErrorCode;
  shortIntro?: FieldErrorCode;
  officialUrl?: FieldErrorCode;
  instagram?: FieldErrorCode;
  publicContact?: FieldErrorCode;
  // One entry per submitted further link (same index), null where it is fine.
  extraLinks?: (FieldErrorCode | null)[];
};

export type ParsedProfileInput =
  | { ok: true; value: ProfileFields }
  | { ok: false; errors: FieldErrors; value: ProfileFields };

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// An address without a scheme ("example.org") is completed to https. Only
// http(s) addresses are accepted.
export function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();

  if (trimmed === "") {
    return "";
  }

  if (/\s/.test(trimmed)) {
    return null;
  }

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    if (!url.hostname.includes(".")) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

// "@name", "name" and a pasted profile link (instagram.com/name/) all give the
// plain handle. "" means empty, null means not a handle.
export function normalizeInstagram(raw: string): string | null {
  let value = raw.trim();

  if (value === "") {
    return "";
  }

  const pasted = value.match(
    /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#\s]+)\/?(?:[?#].*)?$/i,
  );

  if (pasted) {
    value = pasted[1];
  }

  value = value.replace(/^@/, "");

  return /^[A-Za-z0-9._]{1,30}$/.test(value) ? value : null;
}

// Display name of a further link: the domain without "www.".
export function linkLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

// Drafts may be incomplete: empty fields are allowed here and reported as
// gaps. Only values that are present and invalid are errors.
export function parseProfileInput(input: {
  name?: unknown;
  shortIntro?: unknown;
  officialUrl?: unknown;
  instagram?: unknown;
  extraLinks?: unknown;
  publicContact?: unknown;
}): ParsedProfileInput {
  const value: ProfileFields = {
    name: text(input.name),
    shortIntro: text(input.shortIntro),
    officialUrl: text(input.officialUrl),
    instagram: text(input.instagram),
    extraLinks: [],
    publicContact: text(input.publicContact),
  };
  const errors: FieldErrors = {};

  if (value.name.length > LIMITS.name) {
    errors.name = "tooLong";
  }

  if (value.shortIntro.length > LIMITS.shortIntro) {
    errors.shortIntro = "tooLong";
  }

  if (value.publicContact.length > LIMITS.publicContact) {
    errors.publicContact = "tooLong";
  }

  if (value.officialUrl !== "") {
    const normalized = normalizeUrl(value.officialUrl);

    if (normalized === null || normalized.length > LIMITS.officialUrl) {
      errors.officialUrl = "invalidLink";
    } else {
      value.officialUrl = normalized;
    }
  }

  if (value.instagram !== "") {
    const handle = normalizeInstagram(value.instagram);

    if (handle === null) {
      errors.instagram = "invalidInstagram";
    } else {
      value.instagram = handle;
    }
  }

  // Empty rows are dropped. Rows beyond the limit are ignored here; the form
  // does not offer more than the limit and the database refuses them.
  const rows = (Array.isArray(input.extraLinks) ? input.extraLinks : [])
    .map(text)
    .filter((row) => row !== "")
    .slice(0, LIMITS.extraLinks);
  const linkErrors: (FieldErrorCode | null)[] = [];

  for (const row of rows) {
    const normalized = normalizeUrl(row);

    if (normalized === null || normalized === "" || normalized.length > LIMITS.officialUrl) {
      linkErrors.push("invalidLink");
      value.extraLinks.push(row);
    } else {
      linkErrors.push(null);
      value.extraLinks.push(normalized);
    }
  }

  if (linkErrors.some((code) => code !== null)) {
    errors.extraLinks = linkErrors;
  }

  return Object.keys(errors).length === 0
    ? { ok: true, value }
    : { ok: false, errors, value };
}

export type SlugCheck = { ok: true; value: string } | { ok: false };

// Same format as the database constraint on profiles.slug. Reserved names and
// uniqueness are decided by the database (change_profile_slug).
export function parseSlug(raw: unknown): SlugCheck {
  const value = text(raw).toLowerCase();

  return /^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$/.test(value)
    ? { ok: true, value }
    : { ok: false };
}

export type GapCode =
  | "name"
  | "short_intro"
  | "link_or_contact"
  | "profile_image"
  | "revision_missing";

export type Gap = { code: GapCode; field: string; message: string };

const GAP_TEXT: Record<GapCode, { field: string; message: string }> = {
  name: { field: "name", message: "Der Name fehlt." },
  short_intro: {
    field: "shortIntro",
    message: "Die Kurzvorstellung fehlt.",
  },
  link_or_contact: {
    field: "officialUrl",
    message: "Ein Link oder ein öffentlicher Kontakt fehlt.",
  },
  profile_image: {
    field: "image",
    message: "Ein bestätigtes Profilbild fehlt.",
  },
  revision_missing: {
    field: "revision",
    message: "Es gibt noch keinen Entwurf.",
  },
};

export function isGapCode(value: string): value is GapCode {
  return value in GAP_TEXT;
}

export function describeGaps(codes: readonly string[]): Gap[] {
  return codes.filter(isGapCode).map((code) => ({ code, ...GAP_TEXT[code] }));
}

// Same minimum as app_private.profile_gaps in the database.
export function localGapCodes(
  fields: Pick<ProfileFields, "name" | "shortIntro" | "officialUrl" | "publicContact"> &
    Partial<Pick<ProfileFields, "instagram" | "extraLinks">>,
  hasConfirmedImage: boolean,
): GapCode[] {
  const gaps: GapCode[] = [];

  if (fields.name.trim() === "") gaps.push("name");
  if (fields.shortIntro.trim() === "") gaps.push("short_intro");
  if (
    fields.officialUrl.trim() === "" &&
    (fields.instagram ?? "").trim() === "" &&
    (fields.extraLinks ?? []).length === 0 &&
    fields.publicContact.trim() === ""
  ) {
    gaps.push("link_or_contact");
  }
  if (!hasConfirmedImage) gaps.push("profile_image");

  return gaps;
}

// DETAIL of a DK002 error lists the gap codes separated by commas.
export function parseGapDetail(detail: string | null | undefined): string[] {
  return (detail ?? "")
    .split(",")
    .map((code) => code.trim())
    .filter((code) => code !== "");
}

export type ReviewStatus =
  | "incomplete"
  | "ready"
  | "in_review"
  | "question"
  | "update_ready"
  | "published";

// Status of the current draft revision.
//
// Before the first publication the path is incomplete -> ready -> in_review
// (-> question, then a changed draft starts again) -> published; the founder's
// approval publishes the submitted revision. After the first publication a
// draft is either incomplete, update_ready (complete, differs from the
// published revision and needs the owner's confirmation) or published.
export function reviewStatus(input: {
  gapCount: number;
  draftRevisionId: string | null;
  firstApprovedRevisionId: string | null;
  publishedRevisionId: string | null;
  submittedRevisionId: string | null;
  questionRevisionId: string | null;
}): ReviewStatus {
  if (
    input.publishedRevisionId !== null &&
    input.publishedRevisionId === input.draftRevisionId
  ) {
    return "published";
  }

  if (input.gapCount > 0) {
    return "incomplete";
  }

  if (input.firstApprovedRevisionId !== null) {
    return "update_ready";
  }

  if (
    input.questionRevisionId !== null &&
    input.questionRevisionId === input.draftRevisionId
  ) {
    return "question";
  }

  if (
    input.submittedRevisionId !== null &&
    input.submittedRevisionId === input.draftRevisionId
  ) {
    return "in_review";
  }

  return "ready";
}

// Four steps shown to the owner: Angaben, Eingereicht, Geprüft, Live. The
// returned number is the step that is "now"; steps before it are done and 4
// means all four are done.
export const PROGRESS_STEPS = ["Angaben", "Eingereicht", "Geprüft", "Live"] as const;

export function progressStage(status: ReviewStatus, live: boolean): number {
  if (live) return PROGRESS_STEPS.length;

  switch (status) {
    case "incomplete":
      return 0;
    case "ready":
      return 1;
    case "in_review":
    case "question":
      return 2;
    default:
      return PROGRESS_STEPS.length;
  }
}

export const QUESTION_MAX_LENGTH = 500;

export function parseQuestion(
  raw: unknown,
): { ok: true; value: string } | { ok: false; message: string } {
  const value = text(raw);

  if (value === "") {
    return { ok: false, message: "Bitte schreibe deine Frage an den Organizer." };
  }

  if (value.length > QUESTION_MAX_LENGTH) {
    return {
      ok: false,
      message: `Die Frage darf höchstens ${QUESTION_MAX_LENGTH} Zeichen lang sein.`,
    };
  }

  return { ok: true, value };
}

export type ImageType = "image/jpeg" | "image/png" | "image/webp";

const EXTENSION: Record<ImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function extensionFor(type: ImageType): string {
  return EXTENSION[type];
}

// The type is decided by the file content, never by the name or the type the
// browser reports.
export function sniffImageType(bytes: Uint8Array): ImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((byte, index) => bytes[index] === byte)) {
    return "image/png";
  }

  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.slice(start, start + length));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    return "image/webp";
  }

  return null;
}

export type ImageCheck =
  | { ok: true; type: ImageType }
  | { ok: false; message: string };

export function checkImage(bytes: Uint8Array): ImageCheck {
  if (bytes.length === 0) {
    return { ok: false, message: "Bitte wähle eine Bilddatei aus." };
  }

  if (bytes.length > LIMITS.imageBytes) {
    return {
      ok: false,
      message: "Das Bild ist größer als 5 MB. Bitte wähle eine kleinere Datei.",
    };
  }

  const type = sniffImageType(bytes);

  if (!type) {
    return {
      ok: false,
      message: "Bitte lade ein Bild als JPEG, PNG oder WebP hoch.",
    };
  }

  return { ok: true, type };
}

export function parseAltText(
  raw: unknown,
): { ok: true; value: string | null } | { ok: false; message: string } {
  const value = text(raw);

  // Optional: without a description the image counts as pure decoration.
  if (value === "") return { ok: true, value: null };

  if (value.length > LIMITS.altText) {
    return {
      ok: false,
      message: `Die Bildbeschreibung darf höchstens ${LIMITS.altText} Zeichen lang sein.`,
    };
  }

  return { ok: true, value };
}


// ---------------------------------------------------------------------------
// Image inspection for the profile image: type, pixel size and the limits of
// Z05 to Z07. The size is read from the file header; nothing is decoded.
// ---------------------------------------------------------------------------
export function readImageSize(
  bytes: Uint8Array,
  type: ImageType,
): { width: number; height: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.slice(start, start + length));

  if (type === "image/png") {
    if (bytes.length < 24 || ascii(12, 4) !== "IHDR") return null;
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }

  if (type === "image/jpeg") {
    let offset = 2;

    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = bytes[offset + 1];

      if (marker === 0xff) {
        offset += 1;
        continue;
      }

      // Markers without a length: standalone and restart markers.
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
        offset += 2;
        continue;
      }

      const length = view.getUint16(offset + 2);
      const isFrame =
        marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);

      if (isFrame) {
        return {
          height: view.getUint16(offset + 5),
          width: view.getUint16(offset + 7),
        };
      }

      offset += 2 + length;
    }

    return null;
  }

  // WebP: lossy (VP8 ), lossless (VP8L) or extended (VP8X).
  if (bytes.length < 30) return null;
  const chunk = ascii(12, 4);

  if (chunk === "VP8 ") {
    return {
      width: view.getUint16(26, true) & 0x3fff,
      height: view.getUint16(28, true) & 0x3fff,
    };
  }

  if (chunk === "VP8L") {
    const bits = view.getUint32(21, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }

  if (chunk === "VP8X") {
    const w = bytes[24] | (bytes[25] << 8) | (bytes[26] << 16);
    const h = bytes[27] | (bytes[28] << 8) | (bytes[29] << 16);
    return { width: w + 1, height: h + 1 };
  }

  return null;
}

export type ImageInspection =
  | { ok: true; type: ImageType; width: number; height: number }
  | { ok: false; code: "empty" }
  | { ok: false; code: "format" }
  | { ok: false; code: "tooBig"; bytes: number }
  | { ok: false; code: "tooSmall"; width: number; height: number };

export function inspectProfileImage(bytes: Uint8Array): ImageInspection {
  if (bytes.length === 0) return { ok: false, code: "empty" };

  const type = sniffImageType(bytes);

  if (!type) return { ok: false, code: "format" };

  if (bytes.length > LIMITS.imageBytes) {
    return { ok: false, code: "tooBig", bytes: bytes.length };
  }

  const size = readImageSize(bytes, type);

  // A file whose size cannot be read is not a usable image.
  if (!size || size.width < 1 || size.height < 1) {
    return { ok: false, code: "format" };
  }

  if (
    size.width < LIMITS.imageMinSide ||
    size.height < LIMITS.imageMinSide
  ) {
    return { ok: false, code: "tooSmall", ...size };
  }

  return { ok: true, type, ...size };
}

// The visible square of an image as fractions of its width and height:
// x and y are the left and top edge, w and h the size. Stored in
// media_uses.crop; see migration 20261117130000.
export type Crop = { x: number; y: number; w: number; h: number };

export function parseCrop(
  raw: unknown,
  image: { width: number; height: number },
): Crop | null {
  if (typeof raw !== "object" || raw === null) return null;

  const { x, y, w, h } = raw as Record<string, unknown>;

  if (![x, y, w, h].every((n) => typeof n === "number" && Number.isFinite(n))) {
    return null;
  }

  const crop = { x, y, w, h } as Crop;
  const eps = 1e-6;

  if (
    crop.w <= 0 ||
    crop.h <= 0 ||
    crop.x < -eps ||
    crop.y < -eps ||
    crop.x + crop.w > 1 + eps ||
    crop.y + crop.h > 1 + eps
  ) {
    return null;
  }

  // Square in pixels, within one pixel.
  if (Math.abs(crop.w * image.width - crop.h * image.height) > 1) return null;

  return {
    x: Math.max(0, crop.x),
    y: Math.max(0, crop.y),
    w: crop.w,
    h: crop.h,
  };
}

export function readCrop(raw: unknown): Crop | null {
  if (typeof raw !== "object" || raw === null) return null;

  const { x, y, w, h } = raw as Record<string, unknown>;

  return [x, y, w, h].every((n) => typeof n === "number" && Number.isFinite(n)) &&
    (w as number) > 0 &&
    (h as number) > 0
    ? ({ x, y, w, h } as Crop)
    : null;
}

// The original file name of an upload, for the uploader's own display only.
// Only the last path segment is kept; control characters are removed and the
// length is capped. An empty result means "no name".
export function safeFileName(name: string): string | null {
  const last = name.split(/[\\/]/).pop() ?? "";
  const cleaned = last.replace(/[\u0000-\u001f\u007f]/g, "").trim();

  return cleaned ? cleaned.slice(0, 120) : null;
}
