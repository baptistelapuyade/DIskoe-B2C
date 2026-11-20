import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/types";
import { readCrop, type Crop } from "@/lib/domain/profile-publication";
import type { EventGapCode } from "@/lib/domain/event-publication";
import { wasEventSubmitted } from "@/lib/event/draft";
import {
  loadOwnerEvents,
  loadOwnerEventView,
  type OwnerEventView,
} from "@/lib/event/load";
import { loadOwnerProfileView, type OwnerProfileView } from "@/lib/profile/load";
import { createClient } from "@/lib/supabase/server";

type Client = SupabaseClient<Database>;

// Everything the submit screens need about one profile and its first event
// (Figma EIN-01, EIN-02, PRF-01 to PRF-03).
export type SubmitData = {
  profile: OwnerProfileView;
  // The oldest event of the profile, or null.
  event: OwnerEventView | null;
  // The codes behind event.gaps (the screens need them for the rows).
  eventGapCodes: EventGapCode[];
  // Is the first event part of the current submission? (PRF-01a or 01b)
  eventSubmitted: boolean;
  // The crop of the profile picture (square window onto the original).
  profileCrop: Crop | null;
  // When the current draft was handed in; null while it is not in review.
  submittedAt: string | null;
  // The login address, the address the mails go to. It is shown to the owner
  // on the review page and never written to a log or an address.
  loginEmail: string | null;
};

// The audit row is the only record of a hand-in. The latest of "submit" and
// "withdraw" decides, as in the database (app_private.is_submitted).
async function loadSubmittedAt(
  supabase: Client,
  profileId: string,
  revisionId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("publication_audit")
    .select("action, created_at")
    .eq("entity_type", "profile")
    .eq("entity_id", profileId)
    .eq("revision_id", revisionId)
    .in("action", ["submit_for_review", "withdraw"])
    .order("id", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error("Audit lookup failed");
  }

  return data?.[0]?.action === "submit_for_review" ? data[0].created_at : null;
}

export async function loadSubmitData(
  profileId: string,
  currentPath: string,
): Promise<SubmitData> {
  const profile = await loadOwnerProfileView(profileId, currentPath);
  const supabase = await createClient();

  // The list is newest first; the first event of a profile is its oldest.
  const events = await loadOwnerEvents([profileId]);
  const first = events.at(-1) ?? null;
  const event = first ? await loadOwnerEventView(first.id, currentPath) : null;

  const [{ data: userData }, crop, submittedAt, eventSubmitted] =
    await Promise.all([
      supabase.auth.getUser(),
      profile.image
        ? supabase
            .from("media_uses")
            .select("crop")
            .eq("id", profile.image.useId)
            .maybeSingle()
            .then(({ data }) => readCrop(data?.crop))
        : Promise.resolve(null),
      profile.revision
        ? loadSubmittedAt(supabase, profileId, profile.revision.id)
        : Promise.resolve(null),
      event?.event.draftRevisionId
        ? wasEventSubmitted(supabase, event.event.id, event.event.draftRevisionId)
        : Promise.resolve(false),
    ]);

  return {
    profile,
    event,
    eventGapCodes: event ? event.gaps.map((gap) => gap.code) : [],
    eventSubmitted,
    profileCrop: crop,
    submittedAt,
    loginEmail: userData.user?.email ?? null,
  };
}
