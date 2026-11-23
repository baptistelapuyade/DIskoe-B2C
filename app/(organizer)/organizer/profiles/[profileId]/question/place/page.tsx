import { redirect } from "next/navigation";

import { EventStepScreen } from "@/components/event/step-screen";
import { QuestionCard } from "@/components/question/question-card";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerEventView } from "@/lib/event/load";
import { loadSubmitData } from "@/lib/submit/load";
import { describeQuestion } from "@/lib/submit/question";

export const dynamic = "force-dynamic";

// The answer to a question about the place of the first event (Figma RFG-02a,
// 02b): the place step of the event with the question card above the fields.
// "Continue" saves and leads to the new submission (RFG-03a).
export default async function QuestionPlacePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const data = await loadSubmitData(profileId, `${base}/question/place`);
  const asked = data.profile.openQuestion;

  if (data.profile.live || !asked || !data.event) {
    redirect(`${base}/status`);
  }

  const eventId = data.event.event.id;
  const view = await loadOwnerEventView(eventId, `${base}/question/place`);
  const { form } = view;

  return (
    <EventStepScreen
      lang={lang}
      step="place"
      eventId={eventId}
      profileId={profileId}
      backHref={`${base}/question`}
      initial={{
        placeName: form.placeName,
        addressLine: form.addressLine,
        postalCode: form.postalCode,
        city: form.city,
      }}
      correction={{
        eyebrow: t(lang, "Z28.fix.eyebrow"),
        title: t(lang, "Z28.fix.place.title"),
        lead: t(lang, "Z28.fix.place.lead"),
        nextLabel: t(lang, "Z28.fix.next"),
        backLabel: t(lang, "Z28.fix.back"),
        nextHref: `${base}/submit/confirm`,
        card: (
          <QuestionCard
            lang={lang}
            question={describeQuestion(lang, asked)}
            stacked
          />
        ),
      }}
    />
  );
}
