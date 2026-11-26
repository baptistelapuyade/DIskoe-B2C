import { redirect } from "next/navigation";

import { CancelScreen } from "@/components/event/status-screens";
import { expectedState } from "@/lib/event/expected";
import { loadLiveEvent } from "@/lib/event/live";
import { canCancel } from "@/lib/event/status";
import { getLang } from "@/lib/i18n/server";

import { cancelEvent } from "../../status-actions";

export const dynamic = "force-dynamic";

// Cancel a live event (Figma EVA-01a to 01c). Left out on purpose: the free
// text "reason for the cancellation" (decided 2026-11-02, comes with the public
// pages) and every sentence about followers (not part of Welle 1).
export default async function CancelEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const { view, live } = await loadLiveEvent(eventId, `${base}/cancel`);

  if (!canCancel(view.event.publicStatus)) redirect(`${base}/manage`);

  return (
    <CancelScreen
      lang={lang}
      base={base}
      live={live}
      action={cancelEvent.bind(null, eventId, expectedState(view.event))}
    />
  );
}
