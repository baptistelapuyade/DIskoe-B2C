// Pure access decisions for the organizer area. No framework imports, so the
// rules can be unit-tested without a Next.js runtime or a database.
//
// Authentication (a valid session) never implies authorization. Organizer
// access exists only when the founder has provisioned a profile for the user
// (public.my_profiles lists it). Nothing here looks at e-mail domains or at
// whether two e-mail addresses are equal.

export type PublicationState = "private" | "published" | "withdrawn";

export type AssignedProfile = {
  id: string;
  slug: string;
  publicationState: PublicationState;
  draftName: string | null;
};

export type AccessState =
  | { kind: "anonymous" }
  | { kind: "no_assignment"; isFounder: boolean }
  | { kind: "owner"; isFounder: boolean; profiles: AssignedProfile[] };

export type AccessInput = {
  userId: string | null;
  isFounder: boolean;
  profiles: AssignedProfile[];
};

export function resolveAccess(input: AccessInput): AccessState {
  if (!input.userId) {
    return { kind: "anonymous" };
  }

  if (input.profiles.length === 0) {
    return { kind: "no_assignment", isFounder: input.isFounder };
  }

  return {
    kind: "owner",
    isFounder: input.isFounder,
    profiles: input.profiles,
  };
}

export const ORGANIZER_HOME = "/organizer";

const PLACEHOLDER_ORIGIN = "http://placeholder.invalid";

// Only same-site paths inside the organizer area may be used as a login
// redirect target. Everything else falls back to the organizer home. This
// keeps the "next" parameter from becoming an open redirect.
export function safeNextPath(
  raw: string | null | undefined,
  fallback: string = ORGANIZER_HOME,
): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 512) {
    return fallback;
  }

  // Backslashes, control characters and anything that is not a plain path.
  // eslint-disable-next-line no-control-regex
  if (/[\\\u0000-\u001f\u007f]/.test(raw) || !raw.startsWith("/")) {
    return fallback;
  }

  let url: URL;
  try {
    url = new URL(raw, PLACEHOLDER_ORIGIN);
  } catch {
    return fallback;
  }

  if (url.origin !== PLACEHOLDER_ORIGIN) {
    return fallback;
  }

  const inOrganizerArea =
    url.pathname === ORGANIZER_HOME ||
    url.pathname.startsWith(`${ORGANIZER_HOME}/`);

  if (!inOrganizerArea) {
    return fallback;
  }

  return `${url.pathname}${url.search}`;
}
