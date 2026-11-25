import { redirect } from "next/navigation";

import { CopyEventScreen } from "@/components/event/copy-screens";
import { canCopyEvent } from "@/lib/event/copy";
import { requireOwnedEvent } from "@/lib/event/load";
import { loadManageView } from "@/lib/event/manage";
import { getLang } from "@/lib/i18n/server";

import { copyEventAsNew } from "./actions";

export const dynamic = "force-dynamic";

// Copy an event as a new private draft (Figma EVM-02a). `?failed=1` comes back
// from a copy that did not go through.
export default async function CopyEventPage({
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
  await requireOwnedEvent(eventId, `${base}/copy`);
  const view = await loadManageView(eventId, `${base}/copy`, lang);

  if (!canCopyEvent(view.row.state)) redirect(`${base}/manage`);

  return (
    <CopyEventScreen
      lang={lang}
      base={base}
      sourceTitle={view.row.title ?? ""}
      failed={failed === "1"}
      action={copyEventAsNew.bind(null, eventId)}
    />
  );
}
