import { redirect } from "next/navigation";

import { PublishChangesScreen } from "@/components/profile/live-screens";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerProfileView } from "@/lib/profile/load";

import { publishChanges } from "../actions";

export const dynamic = "force-dynamic";

// Publish the changes of a live profile (Figma LPA-04a to 04c). `?d=` is the
// draft the owner reviewed on the previous screen. If it is not the current
// draft any more (another tab or device), nothing is published and the review
// screen opens again with a hint (LPA-03c).
export default async function PublishChangesPage({
  params,
  searchParams,
}: {
  params: Promise<{ profileId: string }>;
  searchParams: Promise<{ d?: string }>;
}) {
  const { profileId } = await params;
  const { d } = await searchParams;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const view = await loadOwnerProfileView(profileId, `${base}/changes/publish`);
  const { publishedRevisionId, draftRevisionId } = view.profile;

  if (!view.live || publishedRevisionId === null) redirect(`${base}/edit`);
  if (!view.hasChanges || draftRevisionId === null) redirect(`${base}/changes`);
  if (d !== draftRevisionId) redirect(`${base}/changes?stale=1`);

  return (
    <PublishChangesScreen
      lang={lang}
      base={base}
      action={publishChanges.bind(
        null,
        profileId,
        draftRevisionId,
        publishedRevisionId,
      )}
    />
  );
}
