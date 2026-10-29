import { EventAtmosphereForm } from "@/components/event/atmosphere-form";
import {
  ContextCard,
  MutedText,
  PageShell,
  Workspace,
} from "@/components/ui/page-shell";
import { loadOwnerEventView } from "@/lib/event/load";

import { saveEventSection } from "../../actions";

export const dynamic = "force-dynamic";

// Figma 02a/02b "Atmosphäre" (2498:1534, 2496:1744, mobile 2496:2746).
// The wireframe's "Danach nur relevante Fragen" is shown as text only: the
// follow-up questions are not part of the Durchstich.
export default async function AtmospherePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const view = await loadOwnerEventView(
    eventId,
    `/organizer/events/${eventId}/atmosphere`,
  );
  const base = `/organizer/events/${eventId}`;

  return (
    <PageShell
      context={`DISKOE / ${view.profileName}`}
      badge="Entwurf · gespeichert"
      title="Wie fühlt sich der Abend an?"
      subtitle="Event bearbeiten · Atmosphäre ergänzen"
    >
      <Workspace
        main={
          <EventAtmosphereForm
            action={saveEventSection.bind(null, eventId, "atmosphere")}
            values={view.form}
            backHref={`${base}/edit`}
            previewHref={`${base}/preview`}
          />
        }
        side={
          <>
            <ContextCard title="Eine Pflichtangabe">
              <MutedText>
                Atmosphäre ist für die Veröffentlichung nötig. Ohne Begriff oder
                eigene Beschreibung bleibt diese Lücke offen.
              </MutedText>
            </ContextCard>
            <ContextCard title="Danach nur relevante Fragen">
              <MutedText>
                Weitere freiwillige Fragen hängen vom Material und Format ab.
                Bereits bestätigte Angaben fragen wir nicht erneut.
              </MutedText>
            </ContextCard>
          </>
        }
      />
    </PageShell>
  );
}
