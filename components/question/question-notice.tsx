import { Notice } from "@/components/ui/notice";
import type { QuestionView } from "@/lib/submit/question";

// The open question as a hint on the editing steps, so the owner sees what
// is asked while correcting (founder, 20.11.2026).
export function QuestionNotice({ question }: { question: QuestionView }) {
  return (
    <Notice tone="info" title={question.title}>
      <span className="whitespace-pre-line">{question.text}</span>
    </Notice>
  );
}
