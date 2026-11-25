import { redirect } from "next/navigation";

import { StatusResultScreen } from "@/components/event/status-screens";
import { loadLiveEvent } from "@/lib/event/live";
import { getLang } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// The cancellation is public (Figma EVA-02). For any other state the page has nothing to say and the management page
// takes over.
export default async function EventCancelledPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const { view, live, draftDiffers } = await loadLiveEvent(
    eventId,
    `${base}/cancelled`,
  );

  if (view.event.publicStatus !== "cancelled") redirect(`${base}/manage`);

  return (
    <StatusResultScreen
      lang={await getLang()}
      base={base}
      result="cancelled"
      live={live}
      publicPath={`/e/${view.event.slug}`}
      privateChanges={draftDiffers}
    />
  );
}
