import { redirect } from "next/navigation";

import { RescheduleScreen } from "@/components/event/status-screens";
import { loadLiveEvent } from "@/lib/event/live";
import { canReschedule } from "@/lib/event/status";
import { getLang } from "@/lib/i18n/server";

import { rescheduleEvent } from "../../status-actions";

export const dynamic = "force-dynamic";

// Reschedule a live event to a new date (Figma EVV-01a, 01b). A replacement
// date changes only the date of the public version (reschedule_event_date);
// private draft changes stay private. An event that already waits for a date
// gets it on its own page (EVV-05a); a cancelled one is reopened (PR B).
export default async function RescheduleEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const { view, live } = await loadLiveEvent(eventId, `${base}/reschedule`);
  const status = view.event.publicStatus;

  if (!canReschedule(status)) redirect(`${base}/manage`);
  if (status === "postponed_undated") redirect(`${base}/schedule`);

  return (
    <RescheduleScreen
      lang={lang}
      base={base}
      live={live}
      action={rescheduleEvent.bind(null, eventId, "reschedule")}
    />
  );
}
