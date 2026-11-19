import { LinkButton } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { StepShell } from "@/components/profile/step-shell";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { requireOwnedEvent } from "@/lib/event/load";

export const dynamic = "force-dynamic";

// "Draft saved" (Figma EVT-08): after "Später weitermachen". "To the draft"
// goes to the first of the three steps that is not complete yet (the edit page
// decides).
export default async function EventSavedPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const lang = await getLang();

  await requireOwnedEvent(eventId, `/organizer/events/${eventId}/saved`);

  return (
    <StepShell
      lang={lang}
      backHref="/organizer"
      eyebrow={t(lang, "Z24.saved.eyebrow")}
      title={t(lang, "Z24.saved.title")}
      lead={t(lang, "Z24.saved.lead")}
      current={1}
    >
      <div className="flex flex-col gap-10">
        <Notice tone="success" title={t(lang, "Z24.saved.notice.title")}>
          {t(lang, "Z24.saved.notice.line")}
        </Notice>
        <div className="flex flex-col gap-3 sm:flex-row">
          <LinkButton
            href={`/organizer/events/${eventId}/edit`}
            variant="primaryLg"
          >
            {t(lang, "Z24.saved.toDraft")}
          </LinkButton>
          <LinkButton href="/organizer" variant="ghostLg">
            {t(lang, "Z24.saved.toHome")}
          </LinkButton>
        </div>
      </div>
    </StepShell>
  );
}
