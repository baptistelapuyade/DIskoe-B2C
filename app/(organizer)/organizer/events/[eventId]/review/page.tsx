import { redirect } from "next/navigation";

import { loadPublicationView } from "@/lib/event/publication";

export const dynamic = "force-dynamic";

// Profile and first event are with the founder, or the founder asked a
// question. Both have their screens on the profile (PRF-01, RFG-01); this
// address stays valid for links in older mails.
export default async function EventReviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const view = await loadPublicationView(eventId, `${base}/review`);

  if (view.status === "published") redirect(`${base}/published`);
  if (view.mode !== "first") redirect(`${base}/manage`);
  if (view.status !== "in_review" && view.status !== "question") {
    redirect(`${base}/preview`);
  }

  redirect(
    `/organizer/profiles/${view.event.event.organizerId}/${view.status === "question" ? "question" : "status"}`,
  );
}
