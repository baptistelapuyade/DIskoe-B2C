import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/types";
import {
  localGapCodes,
  type GapCode,
} from "@/lib/domain/profile-publication";
import {
  loadRevision,
  type ProfileState,
  type RevisionFields,
} from "@/lib/profile/draft";
import { loadImage, type ProfileImage } from "@/lib/profile/image";

type Client = SupabaseClient<Database>;

export type QueueItem = {
  profileId: string;
  slug: string;
  name: string | null;
  submittedAt: string;
};

// The queue is derived, not stored: profiles whose *current* draft revision was
// submitted and that have no first approval yet.
export async function loadQueue(supabase: Client): Promise<QueueItem[]> {
  const { data: audit, error } = await supabase
    .from("publication_audit")
    .select("entity_id, revision_id, created_at")
    .eq("entity_type", "profile")
    .eq("action", "submit_for_review")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Queue lookup failed");
  }

  const ids = [...new Set((audit ?? []).map((row) => row.entity_id))];
  if (ids.length === 0) {
    return [];
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, slug, draft_revision_id, first_approved_revision_id")
    .in("id", ids);

  if (profilesError) {
    throw new Error("Queue lookup failed");
  }

  const items: QueueItem[] = [];

  for (const profile of profiles ?? []) {
    if (profile.first_approved_revision_id !== null) continue;

    const submission = (audit ?? []).find(
      (row) =>
        row.entity_id === profile.id &&
        row.revision_id === profile.draft_revision_id,
    );
    if (!submission || !profile.draft_revision_id) continue;

    const revision = await loadRevision(supabase, profile.draft_revision_id);
    items.push({
      profileId: profile.id,
      slug: profile.slug,
      name: revision?.name ?? null,
      submittedAt: submission.created_at,
    });
  }

  return items.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export type FounderProfileView = {
  profile: ProfileState;
  revision: RevisionFields | null;
  image: ProfileImage | null;
  gaps: GapCode[];
  submittedAt: string | null;
  alreadyApproved: boolean;
};

export async function loadFounderProfileView(
  supabase: Client,
  profileId: string,
): Promise<FounderProfileView | null> {
  // my_profiles lists only the caller's own profiles; the founder reads the
  // base table, which the founder policy opens.
  const { data: row, error } = await supabase
    .from("profiles")
    .select(
      "id, slug, draft_revision_id, first_approved_revision_id, published_revision_id",
    )
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error("Profile lookup failed");
  }

  if (!row) {
    return null;
  }

  const profile: ProfileState = {
    id: row.id,
    slug: row.slug,
    draftRevisionId: row.draft_revision_id,
    firstApprovedRevisionId: row.first_approved_revision_id,
    publishedRevisionId: row.published_revision_id,
  };

  const revision = profile.draftRevisionId
    ? await loadRevision(supabase, profile.draftRevisionId)
    : null;
  const image = revision?.profileImageUseId
    ? await loadImage(supabase, revision.profileImageUseId)
    : null;

  const { data: audit } = revision
    ? await supabase
        .from("publication_audit")
        .select("created_at")
        .eq("entity_type", "profile")
        .eq("entity_id", profileId)
        .eq("revision_id", revision.id)
        .eq("action", "submit_for_review")
        .order("created_at", { ascending: false })
        .limit(1)
    : { data: null };

  return {
    profile,
    revision,
    image,
    gaps: localGapCodes(
      {
        name: revision?.name ?? "",
        shortIntro: revision?.shortIntro ?? "",
        officialUrl: revision?.officialUrl ?? "",
        publicContact: revision?.publicContact ?? "",
      },
      image?.confirmed === true,
    ),
    submittedAt: audit?.[0]?.created_at ?? null,
    alreadyApproved: profile.firstApprovedRevisionId !== null,
  };
}
