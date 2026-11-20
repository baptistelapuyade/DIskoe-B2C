import { redirect } from "next/navigation";

import { StepShell } from "@/components/profile/step-shell";
import { ConfirmForm } from "@/components/submit/confirm-form";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { loadSubmitData } from "@/lib/submit/load";

import { submitAction } from "../actions";

export const dynamic = "force-dynamic";

// The two confirmations before the first submission (Figma EIN-02a to 02e).
// `?event=none` is the choice "only the profile" of the checklist. The server
// repeats the check of the state, so a stale link cannot submit anything the
// owner did not see.
export default async function ConfirmSubmitPage({
  params,
  searchParams,
}: {
  params: Promise<{ profileId: string }>;
  searchParams: Promise<{ event?: string }>;
}) {
  const { profileId } = await params;
  const { event: eventChoice } = await searchParams;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const data = await loadSubmitData(profileId, `${base}/submit/confirm`);
  const { profile } = data;

  if (profile.live) redirect("/organizer");
  if (profile.status === "in_review" || profile.status === "question") {
    redirect(`${base}/status`);
  }
  if (profile.status !== "ready") redirect(`${base}/preview`);

  // The event goes with the profile unless the owner left it out. A missing
  // detail in it sends the owner back to the checklist.
  const withEvent = data.event !== null && eventChoice !== "none";

  if (withEvent && data.eventGapCodes.length > 0) {
    redirect(`${base}/submit`);
  }

  return (
    <StepShell
      lang={lang}
      backHref={`${base}/submit`}
      eyebrow={t(lang, "Z27.confirm.eyebrow")}
      title={t(lang, "Z27.confirm.title")}
      lead={t(
        lang,
        withEvent ? "Z27.confirm.lead" : "Z27.confirm.leadProfile",
      )}
      current={2}
    >
      <ConfirmForm
        lang={lang}
        action={submitAction.bind(null, profileId, withEvent)}
        backHref={`${base}/submit`}
        profileOnly={!withEvent}
      />
    </StepShell>
  );
}
