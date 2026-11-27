import type { ReactNode } from "react";
import Link from "next/link";

import type { PublishEventState } from "@/app/(organizer)/organizer/events/[eventId]/changes/actions";
import { PublishChangesForm } from "@/components/profile/publish-changes-form";
import { StepShell } from "@/components/profile/step-shell";
import { SummaryCard } from "@/components/submit/summary-card";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { t, type Lang } from "@/lib/i18n";
import type { SummaryRow } from "@/lib/submit/rows";

import { RetryImageForm, type RetryImageState } from "./retry-image-form";

// The screens of "publish a further event" (Figma NACH-17 and NACH-18, the
// frames of S5-C and S5-F in the old style). The profile is approved, so the
// owner publishes the event himself with the two confirmations, without a
// review. Built in the pattern of the changes to a live event (Z31); the pages
// guard and load, what is drawn lives here.

function Actions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {children}
    </div>
  );
}

const primary = buttonClass("primaryLg", "w-full md:w-auto");
const secondary = buttonClass("secondary", "w-full shadow-sm md:w-auto");

// NACH-17
export function PublishEventScreen({
  lang,
  base,
  rows,
  stale,
  action,
}: {
  lang: Lang;
  base: string;
  rows: SummaryRow[];
  // The draft changed while the owner was on the way here.
  stale: boolean;
  action: (
    previous: PublishEventState,
    formData: FormData,
  ) => Promise<PublishEventState>;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/edit/more`}
      progress={false}
      wide
      eyebrow={t(lang, "Z36.publish.eyebrow")}
      title={t(lang, "Z36.publish.title")}
      lead={t(lang, "Z36.publish.lead")}
      notice={
        stale ? (
          <Notice tone="warning" title={t(lang, "Z36.stale.title")}>
            {t(lang, "Z36.stale.line")}
          </Notice>
        ) : undefined
      }
    >
      <PublishChangesForm
        lang={lang}
        dense
        summary={
          <SummaryCard heading={t(lang, "Z31.publish.card")} rows={rows} />
        }
        action={action}
        backHref={`${base}/preview`}
        texts={{ failLine: "Z36.publish.fail.line", back: "Z35.link.preview" }}
      />
    </StepShell>
  );
}

// NACH-18
export function EventPublishedScreen({
  lang,
  base,
  title,
  publicPath,
  newEventHref,
  retryImage,
}: {
  lang: Lang;
  base: string;
  title: string;
  publicPath: string;
  newEventHref: string;
  // Set while the public copy of the flyer is missing.
  retryImage: ((previous: RetryImageState) => Promise<RetryImageState>) | null;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/manage`}
      progress={false}
      eyebrow={t(lang, "Z36.done.eyebrow")}
      title={t(lang, "Z36.done.title")}
      lead={t(lang, "Z36.done.lead", { title })}
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="info" title={t(lang, "Z36.done.note.title")}>
          {t(lang, "Z36.done.note.line")}
        </Notice>
        {retryImage ? <RetryImageForm lang={lang} action={retryImage} /> : null}
        <Actions>
          <Link href={publicPath} className={primary}>
            {t(lang, "Z36.done.view")}
          </Link>
          <Link href={`${base}/manage`} className={secondary}>
            {t(lang, "Z31.toManage")}
          </Link>
          <Link href={newEventHref} className={secondary}>
            {t(lang, "Z36.done.another")}
          </Link>
        </Actions>
      </div>
    </StepShell>
  );
}
