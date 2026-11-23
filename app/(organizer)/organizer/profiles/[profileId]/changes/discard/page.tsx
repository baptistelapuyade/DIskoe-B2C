import { redirect } from "next/navigation";

import { DiscardChangesScreen } from "@/components/profile/live-screens";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerProfileView } from "@/lib/profile/load";

import { discardChanges } from "../actions";

export const dynamic = "force-dynamic";

// Discard the private draft of a live profile (Figma LPA-06a). `?d=` is the
// draft the owner reviewed; the database deletes exactly that one.
export default async function DiscardChangesPage({
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
  const view = await loadOwnerProfileView(profileId, `${base}/changes/discard`);
  const draftId = view.profile.draftRevisionId;

  if (!view.live) redirect(`${base}/edit`);
  if (!view.hasChanges || draftId === null) redirect(`${base}/changes`);
  if (d !== draftId) redirect(`${base}/changes?stale=1`);

  return (
    <DiscardChangesScreen
      lang={lang}
      base={base}
      action={discardChanges.bind(null, profileId, draftId)}
    />
  );
}
