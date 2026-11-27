import { redirect } from "next/navigation";

import { EventPublishedScreen } from "@/components/event/publish-screens";
import { wasEventApprovedByFounder } from "@/lib/event/draft";
import { isPublishedEventImagePublic } from "@/lib/event/publish";
import { loadPublicationView } from "@/lib/event/publication";
import { getLang } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

import { retryEventImagePublish } from "../../actions";

export const dynamic = "force-dynamic";

// Figma NACH-18 "Weiteres Event — veröffentlicht" (2896:735, the old S5-F
// frame), built in the v2 pattern. After the founder's first approval the
// screen belongs to the profile (LIV-01).
export default async function EventPublishedPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const view = await loadPublicationView(eventId, `${base}/published`);
  const { event } = view;

  if (event.event.publishedRevisionId === null) redirect(`${base}/publish`);

  const supabase = await createClient();

  if (await wasEventApprovedByFounder(supabase, eventId)) {
    redirect(`/organizer/profiles/${event.event.organizerId}/live`);
  }

  const imagePublic = await isPublishedEventImagePublic(supabase, eventId);

  return (
    <EventPublishedScreen
      lang={lang}
      base={base}
      title={event.form.title}
      publicPath={`/e/${event.event.slug}`}
      newEventHref={`/organizer/events/new?profile=${event.event.organizerId}`}
      retryImage={
        imagePublic === false
          ? retryEventImagePublish.bind(null, eventId)
          : null
      }
    />
  );
}
