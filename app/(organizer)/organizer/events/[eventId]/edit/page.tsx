import { EventBasicsForm } from "@/components/event/basics-form";
import { LinkButton } from "@/components/ui/button";
import {
  ContextCard,
  MutedText,
  PageShell,
  SectionHeading,
  Workspace,
} from "@/components/ui/page-shell";
import { loadOwnerEventView } from "@/lib/event/load";
import { atmosphereSummary, priceAccessSummary } from "@/lib/event/summary";

import { saveEventSection } from "../../actions";

export const dynamic = "force-dynamic";

// Figma 01 "Eventeditor — privater Entwurf" (2496:1261, mobile 2496:2540).
// Not built (not part of the Durchstich): "Programm und Besuch" and the
// design settings of "Eventbild & Gestaltung".
export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const view = await loadOwnerEventView(
    eventId,
    `/organizer/events/${eventId}/edit`,
  );
  const base = `/organizer/events/${eventId}`;
  const priceAccess = priceAccessSummary(view.form);
  const atmosphere = atmosphereSummary(view.form);

  return (
    <PageShell
      context={`DISKOE / ${view.profileName}`}
      badge="Entwurf · gespeichert"
      title={view.form.title || "Neues Event"}
      subtitle="Event bearbeiten · Basisangaben prüfen"
    >
      <Workspace
        main={
          <>
            <SectionHeading>Grundlagen</SectionHeading>
            <EventBasicsForm
              action={saveEventSection.bind(null, eventId, "basics")}
              values={view.form}
            />

            <div className="mt-4 flex flex-col gap-5">
              <SectionHeading>Preis und Zugang</SectionHeading>
              <p className="text-base leading-6">
                {priceAccess ?? "Preis und Zugang sind noch nicht angegeben."}
              </p>
              <LinkButton
                href={`${base}/access`}
                variant="secondary"
                className="w-full"
              >
                Preis und Zugang bearbeiten
              </LinkButton>
            </div>

            <ContextCard
              title={atmosphere ? "Atmosphäre" : "Atmosphäre noch offen"}
            >
              <MutedText>
                {atmosphere ??
                  "Wählt bestätigte Begriffe oder beschreibt den Abend in eigenen Worten."}
              </MutedText>
            </ContextCard>

            <div className="flex flex-wrap gap-4">
              <LinkButton href="/organizer">Zur Eventübersicht</LinkButton>
              <LinkButton href={`${base}/atmosphere`} variant="primary">
                {atmosphere ? "Atmosphäre bearbeiten" : "Atmosphäre ergänzen"}
              </LinkButton>
              <LinkButton href={`${base}/preview`}>Zur Vorschau</LinkButton>
            </div>
          </>
        }
        side={
          <>
            <ContextCard title="Privater Entwurf">
              <MutedText>
                Eure Änderungen sind noch nicht öffentlich. Ihr könnt jederzeit
                unterbrechen und später hier fortsetzen.
              </MutedText>
            </ContextCard>
            <ContextCard title="Profil vor Einreichung prüfen">
              <MutedText>
                Projektname, Vorstellung, Profiladresse, offizieller Link oder
                öffentlicher Kontakt und mindestens ein Cover oder Anzeigebild.
                Fehlendes könnt ihr vor der Einreichung ergänzen.
              </MutedText>
            </ContextCard>
            <ContextCard title="Bild und Material">
              <MutedText>
                Erfassungsmaterial und öffentliches Eventbild sind getrennt.
                Wählt unter Eventbild &amp; Gestaltung ein Bild. Ohne Bild
                bleibt das Event ein privater Entwurf.
              </MutedText>
              <div>
                <LinkButton href={`${base}/image`}>
                  Eventbild &amp; Gestaltung
                </LinkButton>
              </div>
            </ContextCard>
          </>
        }
      />
    </PageShell>
  );
}
