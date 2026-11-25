import { redirect } from "next/navigation";

import { StatusResultScreen } from "@/components/event/status-screens";
import { loadLiveEvent } from "@/lib/event/live";
import { getLang } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// The new date is public (Figma EVV-04a). For any other state the page has nothing to say and the management page
// takes over.
export default async function EventRescheduledPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const { view, live } = await loadLiveEvent(eventId, `${base}/rescheduled`);

  if (view.event.publicStatus !== "rescheduled") redirect(`${base}/manage`);

  return (
    <StatusResultScreen
      lang={await getLang()}
      base={base}
      result="moved"
      live={live}
      publicPath={`/e/${view.event.slug}`}
    />
  );
}
