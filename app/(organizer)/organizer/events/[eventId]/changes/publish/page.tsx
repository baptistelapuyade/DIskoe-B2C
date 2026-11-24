import { redirect } from "next/navigation";

import { PublishChangesScreen } from "@/components/event/live-edit-screens";
import { changeRows } from "@/lib/event/changes-text";
import { loadLiveEventView } from "@/lib/event/live-edit";
import { getLang } from "@/lib/i18n/server";

import { publishEventChanges } from "../actions";

export const dynamic = "force-dynamic";

// Publish the changes of a live event (Figma EVB-04a to 04c). `?d=` is the
// draft the owner reviewed on the previous screen. If it is not the current
// draft any more (another tab or device), nothing is published and the review
// screen opens again with a hint.
export default async function PublishEventChangesPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ d?: string }>;
}) {
  const { eventId } = await params;
  const { d } = await searchParams;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const view = await loadLiveEventView(eventId, `${base}/changes/publish`);
  const { draftRevisionId, publishedRevisionId } = view;

  if (
    view.changes.length === 0 ||
    draftRevisionId === null ||
    publishedRevisionId === null
  ) {
    redirect(`${base}/changes`);
  }

  if (d !== draftRevisionId) redirect(`${base}/changes?stale=1`);

  return (
    <PublishChangesScreen
      lang={lang}
      base={base}
      rows={changeRows(lang, view.changes)}
      action={publishEventChanges.bind(null, eventId, {
        draftId: draftRevisionId,
        publishedId: publishedRevisionId,
        stateVersion: view.stateVersion,
        status: view.publicStatus,
      })}
    />
  );
}
