import { redirect } from "next/navigation";

import { loadPublicationView } from "@/lib/event/publication";

export const dynamic = "force-dynamic";

// The first submission lives at the profile now (Figma EIN-01, EIN-02). This
// address stays for old links and mails: it sends the owner to the checklist.
// Later events and approved profiles keep their own screens.
export default async function SubmitFirstPublicationPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const view = await loadPublicationView(eventId, `${base}/submit`);

  if (view.mode === "later") redirect(`${base}/publish`);
  if (view.mode === "approved") redirect(`${base}/manage`);
  if (view.status === "published") redirect(`${base}/published`);

  redirect(`/organizer/profiles/${view.event.event.organizerId}/submit`);
}
