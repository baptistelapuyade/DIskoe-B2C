import { ChangesSavedScreen } from "@/components/event/live-edit-screens";
import { loadLiveEventView } from "@/lib/event/live-edit";
import { getLang } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// After saving the changes of a live event (Figma EVB-02): saved, still
// private. The public page shows the previous version.
export default async function ChangesSavedPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();

  await loadLiveEventView(eventId, `${base}/changes/saved`);

  return <ChangesSavedScreen lang={lang} base={base} />;
}
