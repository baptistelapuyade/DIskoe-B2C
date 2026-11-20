import Link from "next/link";

import { StepShell } from "@/components/profile/step-shell";
import { buttonClass } from "@/components/ui/button";
import { t, type Lang } from "@/lib/i18n";
import { formatStamp } from "@/lib/submit/format";
import type { SubmitData } from "@/lib/submit/load";

// "We're reviewing your version" (Figma PRF-01a, 01b): the profile, with or
// without its first event, is with DISKOE. Nothing here can be edited: the
// owner looks at what was submitted, or withdraws it first.
export function ReviewStatus({
  lang,
  profileId,
  data,
}: {
  lang: Lang;
  profileId: string;
  data: SubmitData;
}) {
  const base = `/organizer/profiles/${profileId}`;
  const withEvent = data.eventSubmitted;
  const event = data.event;
  const white = buttonClass("secondary", "w-full shadow-sm md:w-auto");
  const ghost = buttonClass("ghostLg", "w-full md:w-auto");
  const primary = buttonClass("primaryLg", "w-full md:w-auto");

  return (
    <StepShell
      lang={lang}
      backHref="/organizer"
      eyebrow={t(lang, "Z27.review.eyebrow")}
      title={t(
        lang,
        withEvent ? "Z27.review.title" : "Z27.review.titleProfile",
      )}
      lead={t(lang, withEvent ? "Z27.review.lead" : "Z27.review.leadProfile", {
        email: data.loginEmail ?? "",
      })}
      current={3}
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        <div className="flex flex-col gap-6">
          {data.submittedAt ? (
            <p className="bg-brand-blue text-foreground w-fit rounded-full px-4 py-2 text-base leading-6">
              {t(lang, "Z27.review.pill", {
                date: formatStamp(lang, data.submittedAt),
              })}
            </p>
          ) : null}
          {withEvent ? null : (
            <section className="flex flex-col gap-1">
              <h2 className="text-2xl leading-[30px] font-medium tracking-[-0.4px]">
                {t(lang, "Z27.review.firstEvent")}
              </h2>
              <p className="text-muted-foreground text-sm leading-5">
                {t(lang, "Z27.review.firstEventText")}
              </p>
            </section>
          )}
          <section className="flex flex-col gap-1">
            <h2 className="text-2xl leading-[30px] font-medium tracking-[-0.4px]">
              {t(lang, "Z27.review.until")}
            </h2>
            <p className="text-muted-foreground text-sm leading-5">
              {t(lang, "Z27.review.untilText")}
            </p>
          </section>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {withEvent ? (
            <>
              <Link href={`${base}/submitted`} className={primary}>
                {t(lang, "Z27.review.viewSubmitted")}
              </Link>
              <Link href={`${base}/withdraw`} className={white}>
                {t(lang, "Z27.review.withdraw")}
              </Link>
            </>
          ) : (
            <>
              <Link
                href={
                  event
                    ? `/organizer/events/${event.event.id}/edit`
                    : `/organizer/events/new?profile=${profileId}`
                }
                className={primary}
              >
                {t(lang, event ? "Z27.withdrawn.editEvent" : "Z27.only.create")}
              </Link>
              <Link href={`${base}/submitted`} className={white}>
                {t(lang, "Z27.review.viewSubmitted")}
              </Link>
              <Link href={`${base}/withdraw`} className={ghost}>
                {t(lang, "Z27.review.withdraw")}
              </Link>
            </>
          )}
        </div>
      </div>
    </StepShell>
  );
}
