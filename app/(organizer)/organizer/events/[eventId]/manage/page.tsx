import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ManageScreen } from "@/components/event/manage-screen";
import { loadManageView } from "@/lib/event/manage";
import { toManageDisplay } from "@/lib/event/manage-display";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { siteUrl } from "@/lib/public/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();

  return {
    title: `${t(lang, "Z30.manage.eyebrow")} – DISKOE`,
    robots: { index: false, follow: false },
  };
}

// Event management (Figma EVM-01a to 01f). Interim until the next slices:
// "Bearbeiten" and "Änderungen prüfen und veröffentlichen" lead to the existing
// editor and publish page; "Verschieben" and "Absagen" to their existing
// pages. Not built: "Von DISKOE ausgeblendet" (EVM-01e, with the founder's
// blocks), "Hinweise an Follower" (wave 3).
export default async function EventManagePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const view = await loadManageView(eventId, `${base}/manage`, lang);

  // View-only while the profile is in review.
  if (view.review) redirect(`${base}/review`);

  return (
    <ManageScreen lang={lang} data={toManageDisplay(lang, view, siteUrl())} />
  );
}
