import Link from "next/link";

import {
  CancelForm,
  PostponeForm,
  RescheduleForm,
} from "@/components/event/status-forms";
import { StepShell } from "@/components/profile/step-shell";
import { SummaryCard } from "@/components/submit/summary-card";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { statusPlace, statusWhen } from "@/lib/event/status-display";
import type { EventFormValues } from "@/lib/event/values";
import { t, type Lang } from "@/lib/i18n";
import type { StatusFormState } from "@/app/(organizer)/organizer/events/status-actions";

// The screens of "postpone, reschedule, cancel" (Figma EVV-01 to 05, EVA-01
// and 02). The pages guard and load; what is drawn lives here. Back goes to
// the event management page.

type Action = (
  previous: StatusFormState,
  formData: FormData,
) => Promise<StatusFormState>;

function Frame({
  lang,
  base,
  title,
  lead,
  children,
}: {
  lang: Lang;
  base: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/manage`}
      progress={false}
      eyebrow={t(lang, "Z30.manage.eyebrow")}
      title={title}
      lead={lead}
    >
      {children}
    </StepShell>
  );
}

function currentWhen(lang: Lang, live: EventFormValues): string {
  return statusWhen(lang, live) ?? "";
}

// EVV-01a, 01b and 02b (the failed call keeps the page)
export function RescheduleScreen({
  lang,
  base,
  live,
  action,
}: {
  lang: Lang;
  base: string;
  live: EventFormValues;
  action: Action;
}) {
  return (
    <Frame
      lang={lang}
      base={base}
      title={t(lang, "Z33.reschedule.title")}
      lead={t(lang, "Z33.reschedule.lead")}
    >
      <RescheduleForm
        lang={lang}
        action={action}
        mode="reschedule"
        openHref={`${base}/reschedule/open`}
        card={
          <SummaryCard
            stacked
            heading={t(lang, "Z33.card.before")}
            rows={[
              {
                key: "current",
                label: t(lang, "Z33.row.current"),
                text: currentWhen(lang, live),
              },
            ]}
          />
        }
      />
    </Frame>
  );
}

// EVV-02a
export function PostponeScreen({
  lang,
  base,
  live,
  action,
}: {
  lang: Lang;
  base: string;
  live: EventFormValues;
  action: (previous: StatusFormState) => Promise<StatusFormState>;
}) {
  return (
    <Frame
      lang={lang}
      base={base}
      title={t(lang, "Z33.open.title")}
      lead={t(lang, "Z33.open.lead")}
    >
      <PostponeForm
        lang={lang}
        action={action}
        dateHref={`${base}/reschedule`}
        card={
          <SummaryCard
            stacked
            heading={t(lang, "Z33.open.card")}
            rows={[
              {
                key: "current",
                label: t(lang, "Z33.row.current"),
                text: currentWhen(lang, live),
              },
            ]}
          />
        }
      />
    </Frame>
  );
}

// EVV-05a: the event waits for a date and only gets one.
export function ScheduleScreen({
  lang,
  base,
  action,
}: {
  lang: Lang;
  base: string;
  action: Action;
}) {
  return (
    <Frame
      lang={lang}
      base={base}
      title={t(lang, "Z33.schedule.title")}
      lead={t(lang, "Z33.schedule.lead")}
    >
      <RescheduleForm lang={lang} action={action} mode="schedule" card={null} />
    </Frame>
  );
}

// EVA-01a, 01b and 01c
export function CancelScreen({
  lang,
  base,
  live,
  action,
}: {
  lang: Lang;
  base: string;
  live: EventFormValues;
  action: Action;
}) {
  return (
    <Frame
      lang={lang}
      base={base}
      title={t(lang, "Z33.cancel.title")}
      lead={t(lang, "Z33.cancel.lead")}
    >
      <CancelForm
        lang={lang}
        action={action}
        keepHref={`${base}/manage`}
        card={
          <SummaryCard
            stacked
            heading={t(lang, "Z33.cancel.card")}
            rows={[
              {
                key: "event",
                label: t(lang, "Z33.cancel.row.event"),
                text: live.title,
              },
              {
                key: "date",
                label: t(lang, "Z33.cancel.row.date"),
                text: currentWhen(lang, live),
              },
              {
                key: "place",
                label: t(lang, "Z33.cancel.row.place"),
                text: statusPlace(live),
              },
            ]}
          />
        }
      />
    </Frame>
  );
}

type Result = "moved" | "scheduled" | "postponed" | "cancelled";

const RESULT = {
  moved: {
    title: "Z33.moved.title",
    notice: ["Z33.moved.notice.title", "Z33.moved.notice.line"],
  },
  scheduled: {
    title: "Z33.scheduled.title",
    notice: ["Z33.moved.notice.title", "Z33.moved.notice.line"],
  },
  postponed: {
    title: "Z33.postponed.title",
    notice: ["Z33.postponed.notice.title", "Z33.postponed.notice.line"],
  },
  cancelled: {
    title: "Z33.cancelled.title",
    notice: ["Z33.cancelled.notice.title", "Z33.cancelled.notice.line"],
  },
} as const;

// EVV-04a (moved), EVV-05b (scheduled), EVV-04b (postponed), EVA-02
// (cancelled): the change is public. The event page is a second button where
// there is a date to see; after a postponement the next step is the date.
export function StatusResultScreen({
  lang,
  base,
  result,
  live,
  publicPath,
  privateChanges = false,
}: {
  lang: Lang;
  base: string;
  result: Result;
  live: EventFormValues;
  publicPath: string;
  // A private draft that was not published with the cancellation (EVA-02).
  privateChanges?: boolean;
}) {
  const texts = RESULT[result];
  const lead =
    result === "cancelled"
      ? t(lang, "Z33.cancelled.lead", { title: live.title })
      : result === "postponed"
        ? t(lang, "Z33.postponed.lead", { title: live.title })
        : t(lang, "Z33.result.lead", {
            title: live.title,
            when: currentWhen(lang, live),
          });
  const toManage = (
    <Link
      href={`${base}/manage`}
      className={
        result === "postponed"
          ? buttonClass("secondary", "w-full shadow-sm md:w-auto")
          : buttonClass("primaryLg", "w-full md:w-auto")
      }
    >
      {t(lang, "Z31.toManage")}
    </Link>
  );

  return (
    <Frame lang={lang} base={base} title={t(lang, texts.title)} lead={lead}>
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="success" title={t(lang, texts.notice[0])}>
          {t(lang, texts.notice[1])}
        </Notice>
        {result === "cancelled" && privateChanges ? (
          <p className="text-muted-foreground text-sm leading-5">
            {t(lang, "Z33.cancelled.private")}
          </p>
        ) : null}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {result === "postponed" ? (
            <>
              <Link
                href={`${base}/schedule`}
                className={buttonClass("primaryLg", "w-full md:w-auto")}
              >
                {t(lang, "Z33.postponed.next")}
              </Link>
              {toManage}
            </>
          ) : (
            <>
              {toManage}
              {result === "cancelled" ? null : (
                <Link
                  href={publicPath}
                  className={buttonClass(
                    "secondary",
                    "w-full shadow-sm md:w-auto",
                  )}
                >
                  {t(lang, "Z30.manage.public.view")}
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </Frame>
  );
}
