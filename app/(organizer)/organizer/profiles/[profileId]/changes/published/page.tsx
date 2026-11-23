import { redirect } from "next/navigation";

import { ChangesPublishedScreen } from "@/components/profile/live-screens";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerProfileView } from "@/lib/profile/load";

export const dynamic = "force-dynamic";

// After publishing the changes (Figma LPA-05). Link and address are the same
// as before.
export default async function ChangesPublishedPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const view = await loadOwnerProfileView(profileId, `${base}/changes/published`);

  if (!view.live) redirect(`${base}/edit`);
  // Something is still waiting: this is not the result of a publication.
  if (view.hasChanges) redirect(`${base}/changes`);

  return <ChangesPublishedScreen lang={lang} slug={view.profile.slug} />;
}
