import { EventMoreScreen } from "@/components/event/more-screen";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerEventView } from "@/lib/event/load";
import { redirectLiveEvent } from "@/lib/event/live-edit";

export const dynamic = "force-dynamic";

// Step 7 of the first event, "Mehr zum Abend" (Figma EVT-07, EVT-07m-a to
// 07m-k): optional blocks that tell guests more.
export default async function EditEventMorePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const view = await loadOwnerEventView(eventId, `${base}/edit/more`);

  redirectLiveEvent(view.event, eventId);

  return (
    <EventMoreScreen
      lang={lang}
      eventId={eventId}
      format={view.form.format}
      stored={view.modules}
      backHref={`${base}/edit/atmosphere`}
    />
  );
}
