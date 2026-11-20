import Link from "next/link";
import { redirect } from "next/navigation";

import { StepShell } from "@/components/profile/step-shell";
import { SummaryCard } from "@/components/submit/summary-card";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { berlinClock } from "@/lib/submit/format";
import { loadSubmitData } from "@/lib/submit/load";
import { eventRows, profileRows } from "@/lib/submit/rows";

export const dynamic = "force-dynamic";

// The version that went to review, read-only (Figma PRF-02). No "change"
// buttons: changing means withdrawing first.
export default async function SubmittedVersionPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const data = await loadSubmitData(profileId, `${base}/submitted`);
  const { profile } = data;

  if (profile.live) redirect("/organizer");
  if (profile.status !== "in_review" || !data.submittedAt) {
    redirect(`${base}/status`);
  }

  const { date, time } = berlinClock(data.submittedAt);
  const missing = {
    missingLabel: t(lang, "Z27.row.missing"),
    fixLabel: t(lang, "Z27.row.fix"),
  };

  return (
    <StepShell
      lang={lang}
      backHref={`${base}/status`}
      eyebrow={t(lang, "Z27.review.eyebrow")}
      title={t(lang, "Z27.submitted.title")}
      lead={t(lang, "Z27.submitted.lead", { date, time })}
      current={3}
      wide
      wideProgress
    >
      <div className="flex flex-col gap-6">
        <Notice tone="info" title={t(lang, "Z27.submitted.notice.title")}>
          {t(lang, "Z27.submitted.notice.line")}
        </Notice>
        <SummaryCard
          heading={t(lang, "Z27.profile.heading")}
          rows={profileRows(lang, data)}
          {...missing}
        />
        {data.eventSubmitted && data.event ? (
          <SummaryCard
            heading={t(lang, "Z27.event.heading")}
            rows={eventRows(lang, data)}
            {...missing}
          />
        ) : null}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Link
            href={`${base}/status`}
            className={buttonClass("primaryLg", "w-full md:w-auto")}
          >
            {t(lang, "Z27.submitted.back")}
          </Link>
          <Link
            href={`${base}/withdraw`}
            className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
          >
            {t(lang, "Z27.review.withdraw")}
          </Link>
        </div>
      </div>
    </StepShell>
  );
}
