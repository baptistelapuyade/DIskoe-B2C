import { redirect } from "next/navigation";

import { ReopenScreen } from "@/components/event/status-screens";
import { loadLiveEvent } from "@/lib/event/live";
import { canReopen } from "@/lib/event/status";
import { getLang } from "@/lib/i18n/server";

import { reopenEvent } from "../../status-actions";

export const dynamic = "force-dynamic";

// Reopen a cancelled event with a new date (Figma EVV-06a). Only a cancelled
// event has this page; for any other state the management page takes over.
export default async function ReopenEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const { view, live } = await loadLiveEvent(eventId, `${base}/reopen`);

  if (!canReopen(view.event.publicStatus)) redirect(`${base}/manage`);

  return (
    <ReopenScreen
      lang={lang}
      base={base}
      live={live}
      action={reopenEvent.bind(null, eventId)}
    />
  );
}
