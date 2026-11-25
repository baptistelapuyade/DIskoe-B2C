"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canCopyEvent } from "@/lib/event/copy";
import { createEventCopy, loadEventRevision } from "@/lib/event/draft";
import { requireOwnedEvent } from "@/lib/event/load";
import { loadManageView } from "@/lib/event/manage";
import { getLang } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

// "Als neues Event kopieren" (Figma EVM-02a to 02b). The copy is a new private
// draft made from the public stand of the event; the original is not touched.
// Nothing a person typed is logged.
export async function copyEventAsNew(eventId: string): Promise<void> {
  const base = `/organizer/events/${eventId}`;
  const path = `${base}/copy`;
  const { userId, event } = await requireOwnedEvent(eventId, path);
  const view = await loadManageView(eventId, path, await getLang());

  // Only a live or a past event is copied; for any other state the way back is
  // the management page, which shows the real state.
  if (!canCopyEvent(view.row.state) || event.publishedRevisionId === null) {
    redirect(`${base}/manage`);
  }

  const supabase = await createClient();
  let newEventId: string | null = null;

  try {
    const source = await loadEventRevision(supabase, event.publishedRevisionId);

    if (source) {
      newEventId = await createEventCopy(
        supabase,
        userId,
        event.organizerId,
        source,
      );
    }
  } catch {
    newEventId = null;
  }

  // EVM-02a, failed: stays on the confirmation, nothing was created.
  if (newEventId === null) redirect(`${path}?failed=1`);

  revalidatePath("/organizer/events");
  revalidatePath("/organizer");
  redirect(`/organizer/events/${newEventId}/copied`);
}
