import { redirect } from "next/navigation";

import { CopiedEventScreen } from "@/components/event/copy-screens";
import { requireOwnedEvent } from "@/lib/event/load";
import { getLang } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// The copy is made (Figma EVM-02b). The new event is a private draft; for any
// other state the page has nothing to say and the management page takes over.
export default async function EventCopiedPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const { event } = await requireOwnedEvent(eventId, `${base}/copied`);

  if (event.publishedRevisionId !== null || event.draftRevisionId === null) {
    redirect(`${base}/manage`);
  }

  return <CopiedEventScreen lang={await getLang()} base={base} />;
}
