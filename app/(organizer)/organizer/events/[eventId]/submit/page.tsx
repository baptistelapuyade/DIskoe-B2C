import { redirect } from "next/navigation";

import { ConfirmForm } from "@/components/event/confirm-form";
import { ContextCard, MutedText, PageShell, Workspace } from "@/components/ui/page-shell";
import { loadPublicationView } from "@/lib/event/publication";
import { placeText, whenText } from "@/lib/event/summary";

import { submitFirstPublication } from "../../actions";

export const dynamic = "force-dynamic";

// Figma Kernflow ORG-34 to ORG-37 / Flow 01 04c (2859:40161): the two
// confirmations before profile and first event go to the founder together.
export default async function SubmitFirstPublicationPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const view = await loadPublicationView(eventId, `${base}/submit`);

  if (view.mode === "later") redirect(`${base}/publish`);
  if (view.mode === "approved") redirect(`${base}/manage`);
  if (view.status === "published") redirect(`${base}/published`);
  if (view.status === "in_review") redirect(`${base}/review`);
  if (view.status === "incomplete") redirect(`${base}/preview`);

  const name = view.event.profileName;
  const title = view.event.form.title || "Event ohne Titel";

  return (
    <PageShell
      context={`DISKOE / ${name}`}
      title="Profil und Event zur Prüfung einreichen"
      subtitle="Erste Veröffentlichung · Zustimmung zum geprüften Stand"
    >
      <Workspace
        main={
          <>
            {view.latestQuestion ? (
              <ContextCard title="Frage von DISKOE zum vorherigen Stand">
                <p className="text-base leading-6">
                  „{view.latestQuestion.message}“
                </p>
                <MutedText>
                  Ihr habt den Stand seitdem geändert. Mit dem Einreichen
                  beginnt die Prüfung mit dem neuen Stand.
                </MutedText>
              </ContextCard>
            ) : null}
            <ContextCard title="Ihr reicht diesen Stand ein">
              <p className="text-base leading-6 font-medium">
                {name} + {title}
              </p>
              <MutedText>
                Die Prüfung betrifft die Zuordnung zum Projekt und den
                eingereichten Inhalt. Bei unverändertem Stand veröffentlicht
                die Freigabe beide Seiten.
              </MutedText>
              <p className="text-sm leading-5">
                {[whenText(view.event.form), placeText(view.event.form)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </ContextCard>
            <ContextCard title="Wo eure Inhalte erscheinen">
              <MutedText>
                Auf eurer Organizerseite und Eventseite sowie im
                DISKOE-Katalog für die spätere Discovery-Webapp. Freigegebene
                Medien können für die erläuterten Sharing- und
                Darstellungszwecke angepasst werden. Keine garantierte
                zusätzliche Reichweite.
              </MutedText>
            </ContextCard>
            <ConfirmForm
              action={submitFirstPublication.bind(null, eventId)}
              submitLabel="Zur Prüfung einreichen"
              pendingLabel="Reicht ein …"
              backHref={`${base}/preview`}
            />
            <MutedText>
              Bitte bestätigt beide Punkte ausdrücklich. Ihr könnt vorher zur
              Vorschau zurückgehen.
            </MutedText>
            <p className="text-muted-foreground text-xs leading-4">
              Textentwurf: Die endgültigen Nutzungs- und Einwilligungstexte
              werden vor dem Produktstart geprüft. Keine rechtliche Freigabe.
            </p>
          </>
        }
      />
    </PageShell>
  );
}
