import { redirect } from "next/navigation";

import {
  ChangesReviewScreen,
  NoChangesScreen,
} from "@/components/profile/live-screens";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerProfileView } from "@/lib/profile/load";

export const dynamic = "force-dynamic";

// What changes against the public page (Figma LPA-03a), or that nothing does
// (03b). `?stale=1` comes from a publish or discard that found another draft
// than the one the owner had reviewed (another tab or device): the screen is
// shown again with a hint (03c).
export default async function ChangesPage({
  params,
  searchParams,
}: {
  params: Promise<{ profileId: string }>;
  searchParams: Promise<{ stale?: string }>;
}) {
  const { profileId } = await params;
  const { stale } = await searchParams;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const view = await loadOwnerProfileView(profileId, `${base}/changes`);

  if (!view.live) redirect(`${base}/edit`);

  const { changes } = view;
  const draftId = view.profile.draftRevisionId;

  if (!view.hasChanges || changes === null || draftId === null) {
    return <NoChangesScreen lang={lang} base={base} />;
  }

  return (
    <ChangesReviewScreen
      lang={lang}
      base={base}
      changes={changes}
      draftId={draftId}
      stale={stale === "1"}
    />
  );
}
