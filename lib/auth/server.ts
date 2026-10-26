import { cache } from "react";
import { redirect } from "next/navigation";

import {
  resolveAccess,
  safeNextPath,
  type AccessState,
  type AssignedProfile,
} from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

// Server-side access checks. Every page and action in the organizer area calls
// requireAccess itself: layouts are not re-rendered on client navigation, so a
// layout check alone is not a guard.

export type SignedInAccess = Exclude<AccessState, { kind: "anonymous" }>;

const loadAccess = cache(async (): Promise<AccessState> => {
  const supabase = await createClient();

  // getUser() validates the token with the auth server. getSession() would only
  // decode the cookie and must not be used for access decisions.
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return resolveAccess({ userId: null, isFounder: false, profiles: [] });
  }

  const userId = data.user.id;

  const [profilesResult, roleResult] = await Promise.all([
    supabase
      .from("my_profiles")
      .select("id, slug, publication_state, draft_name")
      .order("slug"),
    supabase
      .from("app_roles")
      .select("is_founder")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  // Fail closed: a failed lookup is an error, never "no assignment" and never
  // an implicit grant.
  if (profilesResult.error || roleResult.error) {
    throw new Error("Access check failed");
  }

  const profiles: AssignedProfile[] = [];
  for (const row of profilesResult.data ?? []) {
    if (row.id && row.slug && row.publication_state) {
      profiles.push({
        id: row.id,
        slug: row.slug,
        publicationState: row.publication_state,
        draftName: row.draft_name,
      });
    }
  }

  return resolveAccess({
    userId,
    isFounder: roleResult.data?.is_founder === true,
    profiles,
  });
});

export async function getAccess(): Promise<AccessState> {
  return loadAccess();
}

export async function requireAccess(
  currentPath: string = "/organizer",
): Promise<SignedInAccess> {
  const access = await loadAccess();

  if (access.kind === "anonymous") {
    redirect(`/login?next=${encodeURIComponent(safeNextPath(currentPath))}`);
  }

  return access;
}

// For actions and pages that act on a profile: the caller must be assigned to
// at least one profile. Being signed in or being the founder is not enough.
export async function requireOwner(
  currentPath: string = "/organizer",
): Promise<Extract<AccessState, { kind: "owner" }>> {
  const access = await requireAccess(currentPath);

  if (access.kind !== "owner") {
    redirect("/organizer");
  }

  return access;
}
