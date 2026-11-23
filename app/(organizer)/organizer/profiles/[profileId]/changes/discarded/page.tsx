import { redirect } from "next/navigation";

import { ChangesDiscardedScreen } from "@/components/profile/live-screens";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerProfileView } from "@/lib/profile/load";

export const dynamic = "force-dynamic";

// After discarding (Figma LPA-06b): the profile is the public one again.
export default async function ChangesDiscardedPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const view = await loadOwnerProfileView(profileId, `${base}/changes/discarded`);

  if (!view.live) redirect(`${base}/edit`);
  // A draft exists again (the owner changed something since): not the result
  // of a discard.
  if (view.profile.draftRevisionId !== view.profile.publishedRevisionId) {
    redirect(`${base}/changes`);
  }

  return <ChangesDiscardedScreen lang={lang} />;
}
