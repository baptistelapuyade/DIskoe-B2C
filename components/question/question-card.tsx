import { SummaryCard } from "@/components/submit/summary-card";
import { t, type Lang } from "@/lib/i18n";
import type { QuestionView } from "@/lib/submit/question";

// The founder's question as a card (Figma RFG-01a/b, RFG-02a/b): heading with
// the affected spot, then "Our question" and "Sent on". The question stays
// exactly as written.
export function QuestionCard({
  lang,
  question,
  stacked = false,
}: {
  lang: Lang;
  question: QuestionView;
  // RFG-02 shows label above value in the narrow column.
  stacked?: boolean;
}) {
  return (
    <SummaryCard
      heading={question.title}
      stacked={stacked}
      rows={[
        { key: "asked", label: t(lang, "Z28.q.asked"), text: question.text },
        { key: "sent", label: t(lang, "Z28.q.sent"), text: question.sent },
      ]}
      missingLabel=""
      fixLabel=""
    />
  );
}
