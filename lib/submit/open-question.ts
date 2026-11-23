import type { Lang } from "@/lib/i18n";
import { loadOwnerProfileView } from "@/lib/profile/load";

import { describeQuestion, type QuestionView } from "./question";

// The question the owner is answering, for the notice on the normal editing
// steps. Null once the profile is live or nothing is open.
export async function loadOpenQuestionView(
  lang: Lang,
  profileId: string,
  currentPath: string,
): Promise<QuestionView | null> {
  const view = await loadOwnerProfileView(profileId, currentPath);

  return !view.live && view.openQuestion
    ? describeQuestion(lang, view.openQuestion)
    : null;
}
