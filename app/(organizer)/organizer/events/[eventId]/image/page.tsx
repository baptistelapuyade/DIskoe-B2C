import { redirect } from "next/navigation";

// The step has its own screen since Slice 6 (Figma EVT-04 to EVT-06). Links
// and bookmarks to the old page lead there.
export default async function LegacyImagePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  redirect(`/organizer/events/${eventId}/edit/image`);
}
