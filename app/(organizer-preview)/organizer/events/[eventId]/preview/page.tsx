import { redirect } from "next/navigation";

import { EventView } from "@/components/public/event-view";
import { PreviewFrame } from "@/components/public/preview-frame";
import { getLang } from "@/lib/i18n/server";
import { loadEventPreview } from "@/lib/public/preview-load";

export const dynamic = "force-dynamic";

// Figma VOR-01b "Vorschau Event (privat)": the real event page (PUB-01a) with
// the draft, inside the preview frame. Where the owner came from decides the
// way back: the checklist of the first submission (EIN-01) or, for a further
// event of an approved profile, the publish screen (NACH-17). A live event has
// its own screens; incomplete details go back to where they are named.
export default async function EventPreviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const { event, organizerId, mode } = await loadEventPreview(
    lang,
    eventId,
    `${base}/preview`,
  );

  if (mode === "approved") redirect(`${base}/manage`);

  const later = mode === "later";
  const profile = `/organizer/profiles/${organizerId}`;
  const backHref = later ? `${base}/publish` : `${profile}/submit`;

  if (!event) redirect(backHref);

  return (
    <PreviewFrame
      lang={lang}
      active="event"
      backHref={backHref}
      backLabel={later ? "Z35.back.publish" : "Z35.back.checklist"}
      notice={later ? "Z35.notice.eventLater" : "Z35.notice.event"}
      profileHref={
        later
          ? `${profile}/preview/full?from=publish&event=${eventId}`
          : `${profile}/preview/full`
      }
      eventHref={`${base}/preview`}
    >
      <EventView lang={lang} event={event} preview />
    </PreviewFrame>
  );
}
