import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, TablesInsert } from "@/lib/db/types";

type Client = SupabaseClient<Database>;

export type ProfileState = {
  id: string;
  slug: string;
  draftRevisionId: string | null;
  firstApprovedRevisionId: string | null;
  publishedRevisionId: string | null;
};

export type RevisionFields = {
  id: string;
  name: string | null;
  shortIntro: string | null;
  officialUrl: string | null;
  publicContact: string | null;
  profileImageUseId: string | null;
  confirmedAt: string | null;
};

const REVISION_COLUMNS =
  "id, name, short_intro, official_url, public_contact, profile_image_use_id, confirmed_at";

export function toRevisionFields(row: {
  id: string;
  name: string | null;
  short_intro: string | null;
  official_url: string | null;
  public_contact: string | null;
  profile_image_use_id: string | null;
  confirmed_at: string | null;
}): RevisionFields {
  return {
    id: row.id,
    name: row.name,
    shortIntro: row.short_intro,
    officialUrl: row.official_url,
    publicContact: row.public_contact,
    profileImageUseId: row.profile_image_use_id,
    confirmedAt: row.confirmed_at,
  };
}

export async function loadProfileState(
  supabase: Client,
  profileId: string,
): Promise<ProfileState | null> {
  const { data, error } = await supabase
    .from("my_profiles")
    .select(
      "id, slug, draft_revision_id, first_approved_revision_id, published_revision_id",
    )
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error("Profile lookup failed");
  }

  if (!data || !data.id || !data.slug) {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    draftRevisionId: data.draft_revision_id,
    firstApprovedRevisionId: data.first_approved_revision_id,
    publishedRevisionId: data.published_revision_id,
  };
}

export async function loadRevision(
  supabase: Client,
  revisionId: string,
): Promise<RevisionFields | null> {
  const { data, error } = await supabase
    .from("profile_revisions")
    .select(REVISION_COLUMNS)
    .eq("id", revisionId)
    .maybeSingle();

  if (error) {
    throw new Error("Revision lookup failed");
  }

  return data ? toRevisionFields(data) : null;
}

// The audit trail is the only record that a draft was handed in for review.
export async function wasSubmitted(
  supabase: Client,
  profileId: string,
  revisionId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("publication_audit")
    .select("id")
    .eq("entity_type", "profile")
    .eq("entity_id", profileId)
    .eq("revision_id", revisionId)
    .eq("action", "submit_for_review")
    .limit(1);

  if (error) {
    throw new Error("Audit lookup failed");
  }

  return (data ?? []).length > 0;
}

export type ReviewQuestion = { message: string; createdAt: string };

// The founder's question about one revision, if there is one. The owner reads
// the text but never learns who wrote it (the column is not granted).
export async function loadQuestionForRevision(
  supabase: Client,
  revisionId: string,
): Promise<ReviewQuestion | null> {
  const { data, error } = await supabase
    .from("review_requests")
    .select("message, created_at")
    .eq("revision_id", revisionId)
    .limit(1);

  if (error) {
    throw new Error("Question lookup failed");
  }

  const row = data?.[0];
  return row ? { message: row.message, createdAt: row.created_at } : null;
}

// The most recent question about any revision of the profile. After the owner
// changed the draft the question no longer belongs to the draft, but it is
// still what the owner is working on.
export async function loadLatestQuestion(
  supabase: Client,
  profileId: string,
): Promise<ReviewQuestion | null> {
  const { data, error } = await supabase
    .from("review_requests")
    .select("message, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error("Question lookup failed");
  }

  const row = data?.[0];
  return row ? { message: row.message, createdAt: row.created_at } : null;
}

// Returns the revision that may be edited. A draft that is confirmed,
// first-approved or already handed in for review is frozen: editing it would
// change what the founder was shown. In that case a new revision is created as
// a copy and becomes the draft; the old one stays untouched.
export async function ensureEditableDraft(
  supabase: Client,
  userId: string,
  profile: ProfileState,
): Promise<{ revisionId: string; created: boolean }> {
  const current = profile.draftRevisionId
    ? await loadRevision(supabase, profile.draftRevisionId)
    : null;

  const frozen =
    current !== null &&
    (current.confirmedAt !== null ||
      current.id === profile.firstApprovedRevisionId ||
      (await wasSubmitted(supabase, profile.id, current.id)));

  if (current && !frozen) {
    return { revisionId: current.id, created: false };
  }

  // revision_no is assigned by a database trigger and is deliberately not
  // grantable to clients; the generated type still lists it as required.
  const row: Omit<TablesInsert<"profile_revisions">, "revision_no"> = {
    profile_id: profile.id,
    created_by: userId,
    name: current?.name ?? null,
    short_intro: current?.shortIntro ?? null,
    official_url: current?.officialUrl ?? null,
    public_contact: current?.publicContact ?? null,
    profile_image_use_id: current?.profileImageUseId ?? null,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("profile_revisions")
    .insert(row as TablesInsert<"profile_revisions">)
    .select("id")
    .single();

  if (insertError || !inserted) {
    throw new Error("Could not create a new draft revision");
  }

  const { data: switched, error: switchError } = await supabase
    .from("profiles")
    .update({ draft_revision_id: inserted.id })
    .eq("id", profile.id)
    .select("id");

  if (switchError || !switched || switched.length !== 1) {
    throw new Error("Could not switch to the new draft revision");
  }

  return { revisionId: inserted.id, created: true };
}
