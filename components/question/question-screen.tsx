import Link from "next/link";

import { StepShell } from "@/components/profile/step-shell";
import { buttonClass } from "@/components/ui/button";
import { t, type Lang } from "@/lib/i18n";
import type { QuestionView } from "@/lib/submit/question";

import { QuestionCard } from "./question-card";

// The founder's question (Figma RFG-01a for the first event, 01b for the
// profile): the card, then "Correct the detail" and, while the submitted
// version is still the current one, a way to look at it.
export function QuestionScreen({
  lang,
  question,
  fixHref,
  viewHref,
}: {
  lang: Lang;
  question: QuestionView;
  fixHref: string;
  viewHref: string | null;
}) {
  return (
    <StepShell
      lang={lang}
      backHref="/organizer"
      eyebrow={t(lang, "Z28.q.eyebrow")}
      title={t(lang, "Z28.q.title")}
      lead={t(lang, "Z28.q.lead")}
      current={3}
      wide
      wideProgress
    >
      <QuestionCard lang={lang} question={question} />
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Link
          href={fixHref}
          className={buttonClass("primaryLg", "w-full md:w-auto")}
        >
          {t(lang, "Z28.q.fix")}
        </Link>
        {viewHref ? (
          <Link
            href={viewHref}
            className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
          >
            {t(lang, "Z28.q.view")}
          </Link>
        ) : null}
      </div>
    </StepShell>
  );
}
