import { redirect } from "next/navigation";

import { PublishEventScreen } from "@/components/event/publish-screens";
import { loadEventRevisionVersion } from "@/lib/event/draft";
import { loadPublicationView } from "@/lib/event/publication";
import { getLang } from "@/lib/i18n/server";
import { eventRowsOf, gapHref } from "@/lib/submit/rows";
import { createClient } from "@/lib/supabase/server";

import { publishLaterEvent } from "../../actions";

export const dynamic = "force-dynamic";

// Figma NACH-17 "Weiteres Event — selbst veröffentlichen" (2855:38933, the
// old S5-C frame), built in the v2 pattern. The profile is approved, so the
// owner publishes this event himself with the same two confirmations as at the
// first submission, without a review. `?stale=1`: the draft changed on the way
// here (the action refused to publish it).
export default async function PublishLaterEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ stale?: string }>;
}) {
  const { eventId } = await params;
  const { stale } = await searchParams;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const view = await loadPublicationView(eventId, `${base}/publish`);
  const { event } = view;

  if (view.mode === "first") {
    redirect(`/organizer/profiles/${event.event.organizerId}/submit`);
  }
  if (view.mode === "approved") redirect(`${base}/manage`);
  if (view.status === "published") redirect(`${base}/published`);

  // Missing details: the step that names the first of them.
  if (view.status !== "ready") {
    const gap = event.gaps[0];

    redirect(gap ? gapHref(eventId, gap.code) : `${base}/edit`);
  }

  const draftId = event.event.draftRevisionId;

  if (!draftId) redirect(`${base}/edit`);

  const supabase = await createClient();
  const draftVersion = await loadEventRevisionVersion(supabase, draftId);

  return (
    <PublishEventScreen
      lang={lang}
      base={base}
      rows={eventRowsOf(lang, event, [])}
      stale={stale === "1"}
      action={publishLaterEvent.bind(null, eventId, {
        draftId,
        draftVersion,
        stateVersion: event.event.stateVersion,
        status: event.event.publicStatus,
      })}
    />
  );
}
