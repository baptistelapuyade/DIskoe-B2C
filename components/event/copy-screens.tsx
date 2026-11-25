import Link from "next/link";

import { DiscardForm } from "@/components/profile/discard-form";
import { StepShell } from "@/components/profile/step-shell";
import { SummaryCard } from "@/components/submit/summary-card";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { t, type Lang } from "@/lib/i18n";

// The screens of "copy as a new event" (Figma EVM-02a, 02b). The pages guard
// and load; what is drawn lives here. Back goes to the event management page.

// EVM-02a (and its failed state, which has no frame: Z03 pattern, M9)
export function CopyEventScreen({
  lang,
  base,
  sourceTitle,
  failed,
  action,
}: {
  lang: Lang;
  base: string;
  sourceTitle: string;
  failed: boolean;
  action: () => Promise<void>;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/manage`}
      progress={false}
      wide
      eyebrow={t(lang, "Z30.manage.eyebrow")}
      title={t(lang, "Z32.copy.title")}
      lead={t(lang, "Z32.copy.lead")}
    >
      <div className="flex flex-col gap-10">
        {failed ? (
          <div className="max-w-[560px]">
            <Notice tone="error" title={t(lang, "Z32.copy.fail.title")}>
              {t(lang, "Z32.copy.fail.line")}
            </Notice>
          </div>
        ) : null}
        <SummaryCard
          heading={t(lang, "Z32.copy.card.title")}
          rows={[
            {
              key: "from",
              label: t(lang, "Z32.copy.row.from"),
              text: sourceTitle,
            },
            {
              key: "kept",
              label: t(lang, "Z32.copy.row.kept"),
              text: t(lang, "Z32.copy.kept.value"),
            },
            {
              key: "new",
              label: t(lang, "Z32.copy.row.new"),
              text: t(lang, "Z32.copy.new.value"),
            },
          ]}
        />
        <DiscardForm
          lang={lang}
          action={action}
          keepHref={`${base}/manage`}
          texts={{
            yes: "Z32.copy.yes",
            pending: "Z32.copy.pending",
            no: "Z32.copy.no",
          }}
          yesFirst
        />
      </div>
    </StepShell>
  );
}

// EVM-02b
export function CopiedEventScreen({
  lang,
  base,
}: {
  lang: Lang;
  base: string;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/manage`}
      progress={false}
      eyebrow={t(lang, "Z30.manage.eyebrow")}
      title={t(lang, "Z32.copied.title")}
      lead={t(lang, "Z32.copied.lead")}
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="success" title={t(lang, "Z32.copied.notice.title")}>
          {t(lang, "Z32.copied.notice.line")}
        </Notice>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Link
            href={`${base}/edit/time`}
            className={buttonClass("primaryLg", "w-full md:w-auto")}
          >
            {t(lang, "Z32.copied.date")}
          </Link>
          <Link
            href="/organizer/events"
            className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
          >
            {t(lang, "Z32.copied.list")}
          </Link>
        </div>
      </div>
    </StepShell>
  );
}
