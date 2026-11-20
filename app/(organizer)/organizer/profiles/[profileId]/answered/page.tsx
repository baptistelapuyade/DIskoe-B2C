import { redirect } from "next/navigation";

import { AnsweredScreen } from "@/components/question/answered-screen";
import { getLang } from "@/lib/i18n/server";
import { loadSubmitData } from "@/lib/submit/load";

export const dynamic = "force-dynamic";

// After the answer to a question was submitted again (Figma RFG-04). Only
// while the new version is in review; later the status page shows the state.
export default async function AnsweredPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const data = await loadSubmitData(profileId, `${base}/answered`);

  if (data.profile.live || data.profile.status !== "in_review") {
    redirect(`${base}/status`);
  }

  return <AnsweredScreen lang={lang} viewHref={`${base}/submitted`} />;
}
