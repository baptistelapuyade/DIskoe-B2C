import { ChangesPublishedScreen } from "@/components/event/live-edit-screens";
import { eventHead, loadLiveEventView } from "@/lib/event/live-edit";
import { getLang } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// After publishing the changes (Figma EVB-05). EVB-05 mentions the hint to
// followers; that sentence is not built (Welle 3).
export default async function ChangesPublishedPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const view = await loadLiveEventView(
    eventId,
    `${base}/changes/published`,
    lang,
    "settled",
  );

  return (
    <ChangesPublishedScreen
      lang={lang}
      base={base}
      head={eventHead(lang, view)}
      publicPath={`/e/${view.slug}`}
    />
  );
}
