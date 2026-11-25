import { ChangesDiscardedScreen } from "@/components/event/live-edit-screens";
import { eventHead, loadLiveEventView } from "@/lib/event/live-edit";
import { getLang } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// After discarding (Figma EVB-06b): the event is the public one again.
export default async function ChangesDiscardedPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const view = await loadLiveEventView(
    eventId,
    `${base}/changes/discarded`,
    "settled",
  );

  return (
    <ChangesDiscardedScreen
      lang={lang}
      base={base}
      head={eventHead(lang, view)}
    />
  );
}
