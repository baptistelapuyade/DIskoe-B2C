import { notFound, redirect } from "next/navigation";

import { QuestionForm } from "@/components/profile/approve-form";
import { PageShell } from "@/components/ui/page-shell";
import { requireFounder } from "@/lib/auth/server";
import { questionAreas } from "@/lib/domain/question-area";
import { loadFounderProfileView } from "@/lib/profile/founder";
import { createClient } from "@/lib/supabase/server";

import { requestChanges } from "../../actions";

export const dynamic = "force-dynamic";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Figma S5-D "Rückfrage an den Organizer stellen" (2894:1019).
export default async function QuestionPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const back = `/internal/approvals/${profileId}`;
  await requireFounder(`${back}/question`);

  if (!UUID.test(profileId)) {
    notFound();
  }

  const supabase = await createClient();
  const view = await loadFounderProfileView(supabase, profileId);

  if (!view) {
    notFound();
  }

  const { revision, event } = view;
  const canAsk =
    revision !== null &&
    view.submittedAt !== null &&
    !view.alreadyApproved &&
    !view.questionIsOnDraft;

  // A question about a stand that cannot get one leads back to the facts.
  if (!canAsk || !revision) {
    redirect(back);
  }

  return (
    <PageShell
      context="DISKOE INTERN · ERSTPRÜFUNG · RÜCKFRAGE"
      title="Rückfrage an den Organizer stellen"
      subtitle="Das Profil bleibt privat, bis der Organizer geantwortet hat. Stelle eine konkrete Frage zu einer Stelle, keinen Ablehnungstext."
    >
      <QuestionForm
        action={requestChanges}
        profileId={profileId}
        revisionId={revision.id}
        event={event ? { eventId: event.eventId, revisionId: event.revisionId } : null}
        areas={questionAreas(event !== null)}
        backHref={back}
      />
    </PageShell>
  );
}
