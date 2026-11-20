import Link from "next/link";
import { redirect } from "next/navigation";

import { StepShell } from "@/components/profile/step-shell";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { loadSubmitData } from "@/lib/submit/load";

export const dynamic = "force-dynamic";

// After withdrawing (Figma PRF-03b): everything is a private draft again.
export default async function WithdrawnPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const data = await loadSubmitData(profileId, `${base}/withdrawn`);
  const { profile, event } = data;

  if (profile.live) redirect("/organizer");
  if (profile.status === "in_review" || profile.status === "question") {
    redirect(`${base}/status`);
  }

  return (
    <StepShell
      lang={lang}
      backHref="/organizer"
      eyebrow={t(lang, "Z27.withdrawn.eyebrow")}
      title={t(lang, "Z27.withdrawn.title")}
      lead={t(lang, "Z27.withdrawn.lead")}
      current={2}
    >
      <div className="flex max-w-[560px] flex-col gap-6">
        <Notice tone="success" title={t(lang, "Z27.withdrawn.notice.title")}>
          {t(lang, "Z27.withdrawn.notice.line")}
        </Notice>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Link
            href={`${base}/submit`}
            className={buttonClass("primaryLg", "w-full md:w-auto")}
          >
            {t(lang, "Z27.withdrawn.checklist")}
          </Link>
          <Link
            href={`${base}/edit`}
            className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
          >
            {t(lang, "Z27.withdrawn.editProfile")}
          </Link>
          {event ? (
            <Link
              href={`/organizer/events/${event.event.id}/edit`}
              className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
            >
              {t(lang, "Z27.withdrawn.editEvent")}
            </Link>
          ) : null}
        </div>
      </div>
    </StepShell>
  );
}
