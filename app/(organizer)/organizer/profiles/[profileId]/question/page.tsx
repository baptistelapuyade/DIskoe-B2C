import { redirect } from "next/navigation";

import { QuestionScreen } from "@/components/question/question-screen";
import { correctionHref } from "@/lib/domain/question-area";
import { getLang } from "@/lib/i18n/server";
import { loadSubmitData } from "@/lib/submit/load";
import { describeQuestion } from "@/lib/submit/question";

export const dynamic = "force-dynamic";

// The founder's question (Figma RFG-01a, 01b). Profile and event stay private
// until it is answered. Linked from the start page card (103e) and from the
// question mail (MAIL-03).
export default async function QuestionPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const data = await loadSubmitData(profileId, `${base}/question`);
  const { profile } = data;
  const asked = profile.openQuestion;

  // Nothing to answer: the owner is somewhere else on the way.
  if (profile.live || !asked) redirect(`${base}/status`);

  const question = describeQuestion(lang, asked);

  return (
    <QuestionScreen
      lang={lang}
      question={question}
      fixHref={correctionHref(
        question.area,
        base,
        data.event?.event.id ?? null,
      )}
      // The submitted version can be shown while it is still the current one.
      viewHref={profile.status === "question" ? `${base}/submitted` : null}
    />
  );
}
