import Link from "next/link";
import { redirect } from "next/navigation";

import { StepShell } from "@/components/profile/step-shell";
import { WithdrawForm } from "@/components/submit/withdraw-form";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { loadSubmitData } from "@/lib/submit/load";

import { withdrawAction } from "./actions";

export const dynamic = "force-dynamic";

// "Withdraw the submission?" (Figma PRF-03a), its failed state (03c) and the
// case that DISKOE decided in the meantime (03d). The result of the action
// comes back as `?result=`; anything else shows the question.
export default async function WithdrawPage({
  params,
  searchParams,
}: {
  params: Promise<{ profileId: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const { profileId } = await params;
  const { result } = await searchParams;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const data = await loadSubmitData(profileId, `${base}/withdraw`);
  const { profile } = data;

  if (result === "decided") {
    return (
      <StepShell
        lang={lang}
        backHref="/organizer"
        eyebrow={t(lang, "Z27.review.eyebrow")}
        title={t(lang, "Z27.decided.title")}
        lead={t(lang, "Z27.decided.lead")}
        current={3}
      >
        <div className="flex max-w-[560px] flex-col gap-6">
          <Notice tone="info" title={t(lang, "Z27.decided.notice.title")}>
            {t(lang, "Z27.decided.notice.line")}
          </Notice>
          <Link
            href="/organizer"
            className={buttonClass("primaryLg", "w-full md:w-fit")}
          >
            {t(lang, "Z27.decided.overview")}
          </Link>
        </div>
      </StepShell>
    );
  }

  // Nothing to withdraw: not in review (or already live) goes to its own page.
  if (profile.live) redirect("/organizer");
  if (profile.status !== "in_review") redirect(`${base}/status`);

  const failed = result === "failed";

  return (
    <StepShell
      lang={lang}
      backHref={`${base}/status`}
      eyebrow={t(lang, "Z27.review.eyebrow")}
      title={t(lang, "Z27.withdraw.title")}
      lead={t(
        lang,
        failed ? "Z27.withdrawFailed.lead" : "Z27.withdraw.lead",
      )}
      current={3}
    >
      <div className="flex max-w-[560px] flex-col gap-6">
        {failed ? (
          <Notice tone="error" title={t(lang, "Z27.withdrawFailed.title")}>
            {t(lang, "Z27.withdrawFailed.line")}
          </Notice>
        ) : (
          <Notice tone="warning" title={t(lang, "Z27.withdraw.notice.title")}>
            {t(lang, "Z27.withdraw.notice.line")}
          </Notice>
        )}
        <WithdrawForm
          lang={lang}
          action={withdrawAction.bind(null, profileId)}
          keepHref={`${base}/status`}
          failed={failed}
        />
      </div>
    </StepShell>
  );
}
