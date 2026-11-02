import { redirect } from "next/navigation";

import { ConfirmStatusForm } from "@/components/event/status-forms";
import {
  ContextCard,
  MutedText,
  PageShell,
  TintedBlock,
  Workspace,
} from "@/components/ui/page-shell";
import { loadLiveEvent } from "@/lib/event/live";
import { placeText, whenText } from "@/lib/event/summary";
import { canCancel } from "@/lib/event/status";

import { cancelEvent } from "../../status-actions";

export const dynamic = "force-dynamic";

// Figma NACH-15 "Absage, gesondert bestätigen" (2700:12554). Left out on
// purpose: the free text "Grund für die Absage" (decided 2026-11-02, comes with
// the public pages) and the sentences about subscribers (not part of the Alpha).
export default async function CancelEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const { view, live } = await loadLiveEvent(eventId, `${base}/cancel`);

  if (!canCancel(view.event.publicStatus)) redirect(`${base}/manage`);

  return (
    <PageShell
      context={`DISKOE / ${view.profileName} · Absage vorbereiten`}
      title="Event wirklich absagen?"
      subtitle="Nach der Bestätigung ist die Absage sofort öffentlich."
    >
      <Workspace
        main={
          <>
            <TintedBlock title="Ihr sagt dieses Event ab">
              <p className="text-base leading-6">
                {live.title}
                <br />
                {whenText(live)}
                <br />
                {placeText(live)}
              </p>
            </TintedBlock>
            <ConfirmStatusForm
              action={cancelEvent.bind(null, eventId)}
              label="Event verbindlich absagen"
              pendingLabel="Sagt ab …"
              backHref={`${base}/manage`}
            />
          </>
        }
        side={
          <ContextCard title="Folgen der Absage">
            <MutedText>
              Die Eventseite zeigt die Absage. Andere private Änderungen werden
              nicht mitveröffentlicht. Ticket-Erstattungen erfolgen nicht
              automatisch über DISKOE.
            </MutedText>
          </ContextCard>
        }
      />
    </PageShell>
  );
}
