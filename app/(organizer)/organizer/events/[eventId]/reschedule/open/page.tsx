import { redirect } from "next/navigation";

import { PostponeScreen } from "@/components/event/status-screens";
import { loadLiveEvent } from "@/lib/event/live";
import { canPostpone } from "@/lib/event/status";
import { getLang } from "@/lib/i18n/server";

import { postponeEvent } from "../../../status-actions";

export const dynamic = "force-dynamic";

// Postpone without a new date (Figma EVV-02a, 02b). The published text stays
// as it was; "New date to follow" replaces the date for guests.
export default async function PostponeEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const { view, live } = await loadLiveEvent(
    eventId,
    `${base}/reschedule/open`,
  );

  if (!canPostpone(view.event.publicStatus)) redirect(`${base}/manage`);

  return (
    <PostponeScreen
      lang={lang}
      base={base}
      live={live}
      action={postponeEvent.bind(null, eventId)}
    />
  );
}
