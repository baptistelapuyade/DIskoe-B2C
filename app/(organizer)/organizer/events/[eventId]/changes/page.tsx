import {
  ChangesReviewScreen,
  NoChangesScreen,
} from "@/components/event/live-edit-screens";
import { changeRows } from "@/lib/event/changes-text";
import { loadLiveEventView } from "@/lib/event/live-edit";
import { getLang } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// What changes against the public page (Figma EVB-03b), or that nothing does
// (03c). `?stale=1` comes from a publish or discard that found another draft
// than the one the owner had reviewed (another tab or device): the screen is
// shown again with a hint. EVB-03a (hint to followers) is not built: there is
// no follower hint for these changes yet (Welle 3).
export default async function EventChangesPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ stale?: string }>;
}) {
  const { eventId } = await params;
  const { stale } = await searchParams;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const view = await loadLiveEventView(eventId, `${base}/changes`);

  if (view.changes.length === 0 || view.draftRevisionId === null) {
    return <NoChangesScreen lang={lang} base={base} />;
  }

  return (
    <ChangesReviewScreen
      lang={lang}
      base={base}
      rows={changeRows(lang, view.changes)}
      draftId={view.draftRevisionId}
      stale={stale === "1"}
    />
  );
}
