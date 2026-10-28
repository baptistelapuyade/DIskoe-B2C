import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/types";
import {
  localGapCodes,
  type GapCode,
} from "@/lib/domain/profile-publication";
import {
  loadLatestQuestion,
  loadQuestionForRevision,
  loadRevision,
  type ProfileState,
  type ReviewQuestion,
  type RevisionFields,
} from "@/lib/profile/draft";
import { loadImage, type ProfileImage } from "@/lib/profile/image";
import { isPublishedImagePublic } from "@/lib/profile/publish";

type Client = SupabaseClient<Database>;

export type MailKind = "profile_live" | "profile_question";
export type MailState = {
  kind: MailKind;
  status: "pending" | "sent" | "failed";
  attempts: number;
};

// open: waiting for the founder. question: waiting for the organizer.
// done: approved and published.
export type QueueState = "open" | "question" | "done";

export type QueueItem = {
  profileId: string;
  slug: string;
  name: string | null;
  state: QueueState;
  // Submission, question or approval time, depending on the state.
  at: string;
  mail: MailState | null;
};

function toMailState(row: {
  kind: string;
  status: string;
  attempts: number;
}): MailState | null {
  if (
    (row.kind !== "profile_live" && row.kind !== "profile_question") ||
    (row.status !== "pending" &&
      row.status !== "sent" &&
      row.status !== "failed")
  ) {
    return null;
  }

  return { kind: row.kind, status: row.status, attempts: row.attempts };
}

// "Accepted by the provider" is not "delivered"; the text says so.
export function mailText(mail: MailState | null): string {
  if (!mail) return "";
  if (mail.status === "sent") return "Mail vom Anbieter angenommen";
  if (mail.status === "failed") return "Mail fehlgeschlagen";
  return "Mail wird gesendet";
}

export async function loadMailState(
  supabase: Client,
  profileId: string,
  revisionId: string,
  kind: MailKind,
): Promise<MailState | null> {
  const { data, error } = await supabase
    .from("profile_mails")
    .select("kind, status, attempts")
    .eq("profile_id", profileId)
    .eq("revision_id", revisionId)
    .eq("kind", kind)
    .maybeSingle();

  if (error) {
    throw new Error("Mail lookup failed");
  }

  return data ? toMailState(data) : null;
}

// The list is derived from the audit trail and the profile rows, not stored:
// - open: the current draft was submitted and has no question yet
// - question: the founder asked and the organizer has not submitted again
// - done: the first approval exists
export async function loadQueue(supabase: Client): Promise<QueueItem[]> {
  const { data: audit, error } = await supabase
    .from("publication_audit")
    .select("entity_id, revision_id, action, created_at")
    .eq("entity_type", "profile")
    .in("action", ["submit_for_review", "request_changes"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Queue lookup failed");
  }

  const rows = audit ?? [];
  const ids = [...new Set(rows.map((row) => row.entity_id))];
  if (ids.length === 0) {
    return [];
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select(
      "id, slug, draft_revision_id, first_approved_revision_id, published_revision_id, approved_at",
    )
    .in("id", ids);

  if (profilesError) {
    throw new Error("Queue lookup failed");
  }

  const { data: mails, error: mailsError } = await supabase
    .from("profile_mails")
    .select("profile_id, revision_id, kind, status, attempts")
    .in("profile_id", ids);

  if (mailsError) {
    throw new Error("Queue lookup failed");
  }

  const mailFor = (profileId: string, revisionId: string, kind: MailKind) => {
    const row = (mails ?? []).find(
      (entry) =>
        entry.profile_id === profileId &&
        entry.revision_id === revisionId &&
        entry.kind === kind,
    );
    return row ? toMailState(row) : null;
  };

  const items: QueueItem[] = [];

  for (const profile of profiles ?? []) {
    const own = rows.filter((row) => row.entity_id === profile.id);

    if (profile.first_approved_revision_id !== null) {
      const revision = await loadRevision(
        supabase,
        profile.first_approved_revision_id,
      );
      items.push({
        profileId: profile.id,
        slug: profile.slug,
        name: revision?.name ?? null,
        state: "done",
        at: profile.approved_at ?? own[0]?.created_at ?? "",
        mail: mailFor(
          profile.id,
          profile.first_approved_revision_id,
          "profile_live",
        ),
      });
      continue;
    }

    const draftId = profile.draft_revision_id;
    const submission = own.find(
      (row) =>
        row.action === "submit_for_review" && row.revision_id === draftId,
    );
    const questionOnDraft = own.find(
      (row) => row.action === "request_changes" && row.revision_id === draftId,
    );
    const latestQuestion = own.find((row) => row.action === "request_changes");
    const revision = draftId ? await loadRevision(supabase, draftId) : null;

    if (submission && !questionOnDraft) {
      items.push({
        profileId: profile.id,
        slug: profile.slug,
        name: revision?.name ?? null,
        state: "open",
        at: submission.created_at,
        mail: null,
      });
    } else if (latestQuestion?.revision_id) {
      items.push({
        profileId: profile.id,
        slug: profile.slug,
        name: revision?.name ?? null,
        state: "question",
        at: latestQuestion.created_at,
        mail: mailFor(
          profile.id,
          latestQuestion.revision_id,
          "profile_question",
        ),
      });
    }
  }

  return items.sort((a, b) => b.at.localeCompare(a.at));
}

export type FounderProfileView = {
  profile: ProfileState;
  revision: RevisionFields | null;
  image: ProfileImage | null;
  gaps: GapCode[];
  submittedAt: string | null;
  alreadyApproved: boolean;
  // The question about the shown draft, or the latest one while the organizer
  // is still correcting.
  question: ReviewQuestion | null;
  questionIsOnDraft: boolean;
  // Mail that belongs to the current state (live mail after approval,
  // question mail after a question).
  mail: MailState | null;
  // The mail this page may send (again): kind and revision it belongs to.
  mailTarget: { kind: MailKind; revisionId: string } | null;
  // null = nothing published yet.
  publishedImagePublic: boolean | null;
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

  // After approval the approved revision is what counts, not a later draft.
  const shownRevisionId =
    profile.firstApprovedRevisionId ?? profile.draftRevisionId;
  const revision = shownRevisionId
    ? await loadRevision(supabase, shownRevisionId)
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

  const alreadyApproved = profile.firstApprovedRevisionId !== null;

  const questionOnDraft =
    !alreadyApproved && revision
      ? await loadQuestionForRevision(supabase, revision.id)
      : null;
  const latest =
    !alreadyApproved && !questionOnDraft
      ? await loadLatestQuestion(supabase, profileId)
      : null;
  const question = questionOnDraft ?? latest;

  let mail: MailState | null = null;
  let mailTarget: FounderProfileView["mailTarget"] = null;
  if (alreadyApproved && profile.firstApprovedRevisionId) {
    mailTarget = {
      kind: "profile_live",
      revisionId: profile.firstApprovedRevisionId,
    };
    mail = await loadMailState(
      supabase,
      profileId,
      profile.firstApprovedRevisionId,
      "profile_live",
    );
  } else if (question) {
    const { data: asked } = await supabase
      .from("review_requests")
      .select("revision_id")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1);
    const askedRevision = asked?.[0]?.revision_id;
    mail = askedRevision
      ? await loadMailState(supabase, profileId, askedRevision, "profile_question")
      : null;
    // Only the question that belongs to the current draft can be mailed: the
    // database refuses a mail for an older one.
    if (askedRevision && questionOnDraft) {
      mailTarget = { kind: "profile_question", revisionId: askedRevision };
    }
  }

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
    alreadyApproved,
    question,
    questionIsOnDraft: questionOnDraft !== null,
    mail,
    mailTarget,
    publishedImagePublic: profile.publishedRevisionId
      ? await isPublishedImagePublic(supabase, profileId)
      : null,
  };
}
