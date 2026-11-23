import { redirect } from "next/navigation";

import { ChangesSavedScreen } from "@/components/profile/live-screens";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerProfileView } from "@/lib/profile/load";

export const dynamic = "force-dynamic";

// After saving the changes of a live profile (Figma LPA-02): saved, still
// private. The public page shows the previous version.
export default async function ChangesSavedPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const view = await loadOwnerProfileView(profileId, `${base}/changes/saved`);

  if (!view.live) redirect(`${base}/edit`);

  return <ChangesSavedScreen lang={lang} base={base} />;
}
