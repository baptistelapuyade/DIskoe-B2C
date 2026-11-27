import { redirect } from "next/navigation";

import { PreviewFrame } from "@/components/public/preview-frame";
import { ProfileView } from "@/components/public/profile-view";
import { getLang } from "@/lib/i18n/server";
import { loadProfilePreview } from "@/lib/public/preview-load";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Search = { from?: string; event?: string };

// Figma VOR-01a "Vorschau Profil (privat)": the real profile page (PUB-06a)
// with the draft, inside the preview frame. The way back depends on where the
// owner came from: the profile step ORG-06 (?from=step), the publish screen of
// a further event (?from=publish&event=<id>, NACH-17) or the checklist.
export default async function ProfilePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ profileId: string }>;
  searchParams: Promise<Search>;
}) {
  const { profileId } = await params;
  const { from, event } = await searchParams;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const publishEvent =
    from === "publish" && event && UUID.test(event) ? event : null;
  const back = publishEvent
    ? {
        href: `/organizer/events/${publishEvent}/publish`,
        label: "Z35.back.publish" as const,
      }
    : from === "step"
      ? { href: `${base}/preview`, label: "Z35.back.step" as const }
      : { href: `${base}/submit`, label: "Z35.back.checklist" as const };
  const preview = await loadProfilePreview(
    lang,
    profileId,
    `${base}/preview/full`,
  );

  if (!preview) redirect(back.href);

  // The tab "Event" belongs to the event the owner is working on, else to the
  // first event of the profile. Without an event the tab is left out.
  const eventId = publishEvent ?? preview.eventId;

  return (
    <PreviewFrame
      lang={lang}
      active="profile"
      backHref={back.href}
      backLabel={back.label}
      notice="Z35.notice.profile"
      profileHref={`${base}/preview/full`}
      eventHref={eventId ? `/organizer/events/${eventId}/preview` : null}
    >
      <ProfileView
        lang={lang}
        profile={preview.profile}
        events={preview.events}
      />
    </PreviewFrame>
  );
}
