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
  altText: 200,
  imageBytes: 5 * 1024 * 1024,
} as const;

export type ProfileFields = {
  name: string;
  shortIntro: string;
  officialUrl: string;
  publicContact: string;
};

export type FieldErrors = Partial<Record<keyof ProfileFields, string>>;

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

// Drafts may be incomplete: empty fields are allowed here and reported as
// gaps. Only values that are present and invalid are errors.
export function parseProfileInput(input: {
  name?: unknown;
  shortIntro?: unknown;
  officialUrl?: unknown;
  publicContact?: unknown;
}): ParsedProfileInput {
  const value: ProfileFields = {
    name: text(input.name),
    shortIntro: text(input.shortIntro),
    officialUrl: text(input.officialUrl),
    publicContact: text(input.publicContact),
  };
  const errors: FieldErrors = {};

  if (value.name.length > LIMITS.name) {
    errors.name = `Der Name darf höchstens ${LIMITS.name} Zeichen lang sein.`;
  }

  if (value.shortIntro.length > LIMITS.shortIntro) {
    errors.shortIntro = `Die Kurzvorstellung darf höchstens ${LIMITS.shortIntro} Zeichen lang sein.`;
  }

  if (value.publicContact.length > LIMITS.publicContact) {
    errors.publicContact = `Der Kontakt darf höchstens ${LIMITS.publicContact} Zeichen lang sein.`;
  }

  if (value.officialUrl !== "") {
    const normalized = normalizeUrl(value.officialUrl);

    if (normalized === null || normalized.length > LIMITS.officialUrl) {
      errors.officialUrl =
        "Bitte gib einen gültigen Link ein, zum Beispiel https://example.org.";
    } else {
      value.officialUrl = normalized;
    }
  }

  return Object.keys(errors).length === 0
    ? { ok: true, value }
    : { ok: false, errors, value };
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
    message: "Ein offizieller Link oder ein öffentlicher Kontakt fehlt.",
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
  fields: ProfileFields,
  hasConfirmedImage: boolean,
): GapCode[] {
  const gaps: GapCode[] = [];

  if (fields.name.trim() === "") gaps.push("name");
  if (fields.shortIntro.trim() === "") gaps.push("short_intro");
  if (fields.officialUrl.trim() === "" && fields.publicContact.trim() === "") {
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
): { ok: true; value: string } | { ok: false; message: string } {
  const value = text(raw);

  if (value === "") {
    return {
      ok: false,
      message: "Bitte beschreibe das Bild kurz (Alternativtext).",
    };
  }

  if (value.length > LIMITS.altText) {
    return {
      ok: false,
      message: `Der Alternativtext darf höchstens ${LIMITS.altText} Zeichen lang sein.`,
    };
  }

  return { ok: true, value };
}
