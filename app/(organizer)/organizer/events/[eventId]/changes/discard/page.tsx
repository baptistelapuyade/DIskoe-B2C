import { redirect } from "next/navigation";

import { DiscardChangesScreen } from "@/components/event/live-edit-screens";
import { loadLiveEventView } from "@/lib/event/live-edit";
import { getLang } from "@/lib/i18n/server";

import { discardEventChanges } from "../actions";

export const dynamic = "force-dynamic";

// Discard the private changes of a live event (Figma EVB-06a). `?d=` is the
// draft the owner saw; the database deletes exactly that one. `?failed=1`
// comes back from a discard that did not go through.
export default async function DiscardEventChangesPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ d?: string; failed?: string }>;
}) {
  const { eventId } = await params;
  const { d, failed } = await searchParams;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const view = await loadLiveEventView(eventId, `${base}/changes/discard`);
  const draftId = view.draftRevisionId;

  if (view.changes.length === 0 || draftId === null) {
    redirect(`${base}/changes`);
  }

  if (d !== draftId) redirect(`${base}/changes?stale=1`);

  return (
    <DiscardChangesScreen
      lang={lang}
      base={base}
      failed={failed === "1"}
      action={discardEventChanges.bind(null, eventId, draftId)}
    />
  );
}
