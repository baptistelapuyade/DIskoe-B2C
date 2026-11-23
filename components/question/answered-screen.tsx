import Link from "next/link";

import { StepShell } from "@/components/profile/step-shell";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { t, type Lang } from "@/lib/i18n";

// After the answer to a question was submitted again (Figma RFG-04).
export function AnsweredScreen({
  lang,
  viewHref,
}: {
  lang: Lang;
  viewHref: string;
}) {
  return (
    <StepShell
      lang={lang}
      backHref="/organizer"
      eyebrow={t(lang, "Z28.answered.eyebrow")}
      title={t(lang, "Z28.answered.title")}
      lead={t(lang, "Z28.answered.lead")}
      current={3}
    >
      <Notice tone="success" title={t(lang, "Z28.answered.notice.title")}>
        {t(lang, "Z28.answered.notice.line")}
      </Notice>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Link
          href={viewHref}
          className={buttonClass("primaryLg", "w-full md:w-auto")}
        >
          {t(lang, "Z28.answered.view")}
        </Link>
      </div>
    </StepShell>
  );
}
