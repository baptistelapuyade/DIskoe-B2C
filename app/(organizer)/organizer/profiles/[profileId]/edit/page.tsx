import { QuestionNotice } from "@/components/question/question-notice";
import { DetailsForm } from "@/components/profile/details-form";
import { StepShell } from "@/components/profile/step-shell";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerProfileView } from "@/lib/profile/load";
import { describeQuestion } from "@/lib/submit/question";

import { saveDetails } from "../actions";

export const dynamic = "force-dynamic";

// Step 1 of the profile: details (Figma ORG-03a to ORG-04).
export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const lang = await getLang();
  const view = await loadOwnerProfileView(
    profileId,
    `/organizer/profiles/${profileId}/edit`,
  );
  const { revision } = view;
  const asked =
    !view.live && view.openQuestion
      ? describeQuestion(lang, view.openQuestion)
      : null;

  return (
    <StepShell
      lang={lang}
      backHref="/organizer"
      eyebrow={t(lang, "Z23.details.eyebrow")}
      title={t(lang, "Z23.details.title")}
      lead={t(lang, "Z23.details.lead")}
      notice={asked ? <QuestionNotice question={asked} /> : null}
    >
      <DetailsForm
        lang={lang}
        action={saveDetails.bind(null, profileId)}
        slugFixed={view.profile.firstApprovedRevisionId !== null}
        initial={{
          name: revision?.name ?? "",
          shortIntro: revision?.shortIntro ?? "",
          slug: view.profile.slug,
          officialUrl: revision?.officialUrl ?? "",
          instagram: revision?.instagramHandle
            ? `@${revision.instagramHandle}`
            : "",
          extraLinks: revision?.extraLinks ?? [],
          publicContact: revision?.publicContact ?? "",
        }}
      />
    </StepShell>
  );
}
