import { redirect } from "next/navigation";

import { ScheduleScreen } from "@/components/event/status-screens";
import { expectedState } from "@/lib/event/expected";
import { loadLiveEvent } from "@/lib/event/live";
import { getLang } from "@/lib/i18n/server";

import { rescheduleEvent } from "../../status-actions";

export const dynamic = "force-dynamic";

// Enter the replacement date of an event that waits for one (Figma EVV-05a).
// Only a postponed event without a date has this page.
export default async function ScheduleEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const { view } = await loadLiveEvent(eventId, `${base}/schedule`);

  if (view.event.publicStatus !== "postponed_undated") {
    redirect(`${base}/manage`);
  }

  return (
    <ScheduleScreen
      lang={lang}
      base={base}
      action={rescheduleEvent.bind(
        null,
        eventId,
        "schedule",
        expectedState(view.event),
      )}
    />
  );
}
