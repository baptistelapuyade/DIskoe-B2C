import Link from "next/link";

import { DiscardEventForm } from "@/components/event/discard-event-form";
import { StepShell } from "@/components/profile/step-shell";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { t, type Lang } from "@/lib/i18n";

// "Discard the draft?" and its result (Figma EVB-07a and 07b): an event that
// was never published is deleted with its images.

// EVB-07a
export function DiscardEventScreen({
  lang,
  title,
  base,
  failed,
  action,
}: {
  lang: Lang;
  title: string | null;
  base: string;
  failed: boolean;
  action: () => Promise<void>;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/manage`}
      progress={false}
      eyebrow={t(lang, "Z30.discard.eyebrow")}
      title={t(lang, "Z30.discard.title")}
      lead={
        title
          ? t(lang, "Z30.discard.lead", { title })
          : t(lang, "Z30.discard.leadUntitled")
      }
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        {failed ? (
          <Notice tone="error" title={t(lang, "Z30.discard.fail")} />
        ) : null}
        <Notice tone="warning" title={t(lang, "Z30.discard.notice.title")}>
          {t(lang, "Z30.discard.notice.line")}
        </Notice>
        <DiscardEventForm
          lang={lang}
          action={action}
          cancelHref={`${base}/manage`}
        />
      </div>
    </StepShell>
  );
}

// EVB-07b
export function EventDiscardedScreen({
  lang,
  title,
}: {
  lang: Lang;
  title: string | null;
}) {
  return (
    <StepShell
      lang={lang}
      backHref="/organizer/events"
      progress={false}
      eyebrow={t(lang, "Z30.discard.eyebrow")}
      title={t(lang, "Z30.discarded.title")}
      lead={
        title
          ? t(lang, "Z30.discarded.lead", { title })
          : t(lang, "Z30.discarded.leadUntitled")
      }
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="success" title={t(lang, "Z30.discarded.notice.title")}>
          {t(lang, "Z30.discarded.notice.line")}
        </Notice>
        <Link
          href="/organizer/events"
          className={buttonClass("primaryLg", "w-full md:w-fit")}
        >
          {t(lang, "Z30.discarded.toList")}
        </Link>
      </div>
    </StepShell>
  );
}
