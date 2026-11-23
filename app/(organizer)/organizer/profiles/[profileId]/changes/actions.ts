"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { localGapCodes, parseProfileInput } from "@/lib/domain/profile-publication";
import {
  ensureEditableDraft,
  loadProfileState,
  toExtraLinksJson,
} from "@/lib/profile/draft";
import { requireOwnedProfileId } from "@/lib/profile/load";
import { copyPublishedImage } from "@/lib/profile/publish";
import { createClient } from "@/lib/supabase/server";

import type {
  DetailsErrors,
  DetailsState,
} from "../actions";

function basePath(profileId: string) {
  return `/organizer/profiles/${profileId}`;
}

function revalidateProfile(profileId: string) {
  const base = basePath(profileId);

  revalidatePath(`${base}/changes`);
  revalidatePath(`${base}/changes/edit`);
  revalidatePath("/organizer");
}

// ---------------------------------------------------------------------------
// LPA-01a to 01c: save the changes of a live profile into the private draft.
// ---------------------------------------------------------------------------
// Unlike the first draft, a live profile must stay complete: name, short
// introduction and at least one link or contact are required (the address and
// the picture do not change here). The public page is not touched.
export async function saveLiveChanges(
  profileId: string,
  _previous: DetailsState,
  formData: FormData,
): Promise<DetailsState> {
  const base = basePath(profileId);

  await requireOwnedProfileId(profileId, `${base}/changes/edit`);

  const parsed = parseProfileInput({
    name: formData.get("name"),
    shortIntro: formData.get("shortIntro"),
    officialUrl: formData.get("officialUrl"),
    instagram: formData.get("instagram"),
    extraLinks: formData.getAll("extraLinks"),
    publicContact: formData.get("publicContact"),
  });
  const errors: DetailsErrors = parsed.ok ? {} : { ...parsed.errors };

  // The completeness rules are the database's (profile_gaps); the picture is
  // not part of this form.
  for (const gap of localGapCodes(parsed.value, true)) {
    if (gap === "name" && !errors.name) errors.name = "required";
    if (gap === "short_intro" && !errors.shortIntro) {
      errors.shortIntro = "required";
    }
    if (gap === "link_or_contact" && !errors.officialUrl) {
      errors.officialUrl = "required";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { status: "invalid", errors };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  const profile = userId ? await loadProfileState(supabase, profileId) : null;

  if (!userId || !profile) {
    return { status: "failed" };
  }

  // Only a live profile is edited here; before that the profile steps apply.
  if (profile.publishedRevisionId === null) {
    redirect(`${base}/edit`);
  }

  try {
    const { revisionId } = await ensureEditableDraft(supabase, userId, profile);

    // Row Level Security filters silently: an update that touches no row is a
    // failure, not a success.
    const { data, error } = await supabase
      .from("profile_revisions")
      .update({
        name: parsed.value.name,
        short_intro: parsed.value.shortIntro,
        official_url: parsed.value.officialUrl || null,
        instagram_handle: parsed.value.instagram || null,
        extra_links: toExtraLinksJson(parsed.value.extraLinks),
        public_contact: parsed.value.publicContact || null,
      })
      .eq("id", revisionId)
      .select("id");

    if (error || !data || data.length !== 1) {
      return { status: "failed" };
    }
  } catch {
    return { status: "failed" };
  }

  revalidateProfile(profileId);
  redirect(`${base}/changes/saved`);
}

// ---------------------------------------------------------------------------
// LPA-04a to 04c: publish the draft. Both declarations are checked here and
// again by the database. The ids are the ones the owner saw on the review
// screen: if the draft or the public page changed meanwhile (another tab or
// device), nothing is published and the review screen opens again (LPA-03c).
// ---------------------------------------------------------------------------
export type PublishState =
  | { status: "idle" }
  // One or both ticks are missing (LPA-04b).
  | { status: "missing"; rights: boolean; usage: boolean }
  // The call did not go through (LPA-04c).
  | { status: "failed" };

export async function publishChanges(
  profileId: string,
  expectedDraftId: string,
  expectedPublishedId: string,
  _previous: PublishState,
  formData: FormData,
): Promise<PublishState> {
  const base = basePath(profileId);

  await requireOwnedProfileId(profileId, `${base}/changes/publish`);

  const rights = formData.get("rights") === "on";
  const usage = formData.get("usage") === "on";

  if (!rights || !usage) {
    return { status: "missing", rights, usage };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("publish_profile", {
    p_profile_id: profileId,
    p_expected_draft_revision_id: expectedDraftId,
    p_expected_published_revision_id: expectedPublishedId,
    p_confirmed_rights: rights,
    p_confirmed_usage: usage,
  });

  if (error) {
    switch (error.code) {
      // The draft or the public page is not the one that was reviewed.
      case "DK001":
        redirect(`${base}/changes?stale=1`);
      // Required details are missing: back to the editor, which names them.
      case "DK002":
        redirect(`${base}/changes/edit`);
      // Nothing new to publish (or not allowed): the review screen says so.
      case "DK003":
        redirect(`${base}/changes`);
      default:
        return { status: "failed" };
    }
  }

  // The picture is not part of these changes and is public already; copying
  // is safe to repeat and only matters for drafts that carry a new picture.
  await copyPublishedImage(supabase, profileId);

  revalidateProfile(profileId);
  revalidatePath(`${base}/status`);
  redirect(`${base}/changes/published`);
}

// ---------------------------------------------------------------------------
// LPA-06a: really delete the private draft. The public page stays as it is.
// ---------------------------------------------------------------------------
export async function discardChanges(
  profileId: string,
  expectedDraftId: string,
): Promise<void> {
  const base = basePath(profileId);

  await requireOwnedProfileId(profileId, `${base}/changes/discard`);

  const supabase = await createClient();
  const { error } = await supabase.rpc("discard_profile_draft", {
    p_profile_id: profileId,
    p_expected_draft_revision_id: expectedDraftId,
  });

  if (error) {
    // The draft is not the one that was shown.
    if (error.code === "DK001") {
      redirect(`${base}/changes?stale=1`);
    }

    // Nothing left to discard (second click, other tab): same result.
    if (error.code !== "DK003") {
      throw new Error("Discarding the draft failed");
    }
  }

  revalidateProfile(profileId);
  redirect(`${base}/changes/discarded`);
}
