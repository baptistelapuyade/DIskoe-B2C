import { LiveEditScreen } from "@/components/event/live-edit-screens";
import { formatAddress } from "@/lib/domain/event-live-edit";
import { eventHead, loadLiveEventView } from "@/lib/event/live-edit";
import { getLang } from "@/lib/i18n/server";

import { saveLiveEventChanges } from "../actions";

export const dynamic = "force-dynamic";

// Change a live event (Figma EVB-01a to 01c). Changes go into the private
// draft; the public page stays as it is until the owner publishes. Price,
// access, image and atmosphere are not changed here (decision 23.11.2026).
export default async function EditLiveEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const view = await loadLiveEventView(eventId, `${base}/changes/edit`);
  const form = view.draftForm;

  return (
    <LiveEditScreen
      lang={lang}
      base={base}
      head={eventHead(lang, view)}
      action={saveLiveEventChanges.bind(null, eventId)}
      initial={{
        title: form.title,
        description: form.description,
        startDate: form.startDate,
        startTime: form.startTime,
        placeName: form.placeName,
        address: formatAddress(form),
      }}
    />
  );
}
