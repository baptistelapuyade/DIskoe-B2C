// What the owner sees of the founder's question (Figma RFG-01 and RFG-02):
// the affected spot as a heading, the question itself and when it was sent.
// The spot is the first line of the stored message (lib/domain/question-area).
import { splitQuestion, type QuestionAreaKey } from "../domain/question-area";
import { t, type Lang, type MessageId } from "../i18n";
import type { ReviewQuestion } from "../profile/draft";
import { formatStamp } from "./format";

const AREA_ID: Record<QuestionAreaKey, MessageId> = {
  profile: "Z28.area.profile",
  event: "Z28.area.event",
  place: "Z28.area.place",
  time: "Z28.area.time",
  image: "Z28.area.image",
  price: "Z28.area.price",
};

export type QuestionView = {
  area: QuestionAreaKey | null;
  // "Rückfrage zu: Erstes Event · Ort"
  title: string;
  // The question as the founder wrote it, without the first line.
  text: string;
  // "Sa, 7.11.2026, 10:15" (Berlin time)
  sent: string;
};

export function describeQuestion(
  lang: Lang,
  question: ReviewQuestion,
): QuestionView {
  const { area, text } = splitQuestion(question.message);

  return {
    area,
    title: area
      ? t(lang, "Z28.q.card.title", { area: t(lang, AREA_ID[area]) })
      : t(lang, "Z28.q.card.titleNone"),
    text,
    sent: formatStamp(lang, question.createdAt),
  };
}
