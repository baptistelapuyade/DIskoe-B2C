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
  if (profile.status === "question") redirect(`${base}/question`);
  if (profile.status === "in_review") redirect(`${base}/status`);
  if (profile.status !== "ready") redirect(`${base}/preview`);

  // An open question of the founder: this is the answer (Figma RFG-03a). It
  // goes back the way it was asked, with the event if the question was about
  // profile and event together.
  const asked = profile.openQuestion;
  const answering = asked !== null;

  // The event goes with the profile unless the owner left it out. A missing
  // detail in it sends the owner back to the checklist.
  const withEvent = answering
    ? data.event !== null && asked.withEvent
    : data.event !== null && eventChoice !== "none";

  if (withEvent && data.eventGapCodes.length > 0) {
    redirect(`${base}/submit`);
  }

  return (
    <StepShell
      lang={lang}
      backHref={answering ? `${base}/question` : `${base}/submit`}
      eyebrow={t(lang, answering ? "Z28.again.eyebrow" : "Z27.confirm.eyebrow")}
      title={t(lang, answering ? "Z28.again.title" : "Z27.confirm.title")}
      lead={t(
        lang,
        answering
          ? "Z28.again.lead"
          : withEvent
            ? "Z27.confirm.lead"
            : "Z27.confirm.leadProfile",
      )}
      current={2}
    >
      <ConfirmForm
        lang={lang}
        action={submitAction.bind(null, profileId, withEvent, answering)}
        backHref={answering ? `${base}/question` : `${base}/submit`}
        profileOnly={!withEvent}
        answering={answering}
      />
    </StepShell>
  );
}
