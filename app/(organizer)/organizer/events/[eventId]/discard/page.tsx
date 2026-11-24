import { redirect } from "next/navigation";

import { DiscardEventScreen } from "@/components/event/discard-screens";
import { loadManageView } from "@/lib/event/manage";
import { getLang } from "@/lib/i18n/server";

import { discardEventDraft } from "../../actions";

export const dynamic = "force-dynamic";

// Discard the draft of an event that was never published (Figma EVB-07a).
// `canDiscard` is the same rule as in the database, which checks it again.
export default async function DiscardEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ failed?: string }>;
}) {
  const { eventId } = await params;
  const { failed } = await searchParams;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const view = await loadManageView(eventId, `${base}/discard`);

  if (!view.canDiscard || view.draftRevisionId === null) {
    redirect(`${base}/manage`);
  }

  return (
    <DiscardEventScreen
      lang={lang}
      title={view.row.title?.trim() || null}
      base={base}
      failed={failed === "1"}
      action={discardEventDraft.bind(null, eventId, view.draftRevisionId)}
    />
  );
}
