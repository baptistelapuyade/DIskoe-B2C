import { LinkButton } from "@/components/ui/button";
import { Badge, ContextCard, MutedText, PageShell, Workspace } from "@/components/ui/page-shell";
import { loadPublicationView } from "@/lib/event/publication";
import { placeText, whenText } from "@/lib/event/summary";

export const dynamic = "force-dynamic";

// Figma "Eventverwaltung, veröffentlicht und privater Entwurf" (2859:40259),
// reduced to what exists: the live state, the private draft and the way on.
// Not built: cancelling and rescheduling (NACH-09 to NACH-16) and publishing
// changes to a live event.
export default async function EventManagePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const view = await loadPublicationView(eventId, `${base}/manage`);
  const e = view.event.event;
  const live = e.publishedRevisionId !== null;
  const draftDiffers = live && e.publishedRevisionId !== e.draftRevisionId;
  const title = view.event.form.title || "Event ohne Titel";

  return (
    <PageShell
      context={`DISKOE / ${view.event.profileName}${live ? " · Veröffentlicht" : ""} · Eventverwaltung`}
      badge={live ? "Öffentlich" : "Privater Entwurf"}
      title={title}
      subtitle={
        live
          ? "Verwaltet die öffentliche Fassung und bearbeitet weitere Änderungen zunächst privat."
          : "Dieses Event ist noch nicht öffentlich."
      }
    >
      <Workspace
        main={
          <>
            {live ? (
              <ContextCard title="Öffentlich">
                <p className="text-base leading-6">
                  {whenText(view.event.form)}
                  <br />
                  {placeText(view.event.form)}
                </p>
                <div>
                  <Badge>Stand der letzten Veröffentlichung</Badge>
                </div>
              </ContextCard>
            ) : (
              <ContextCard title="Noch nicht veröffentlicht">
                <MutedText>
                  {view.status === "in_review" || view.status === "question"
                    ? "Das Event ist mit eurem Profil in Prüfung."
                    : "Bearbeitet den Entwurf und reicht ihn über die Vorschau ein."}
                </MutedText>
              </ContextCard>
            )}
            {draftDiffers ? (
              <ContextCard title="Privater Entwurf vorhanden" tone="warning">
                <MutedText>
                  Eine überarbeitete Fassung ist noch nicht veröffentlicht. Die
                  öffentliche Seite zeigt weiterhin den bestätigten Live-Stand.
                  Das Veröffentlichen von Änderungen folgt in einem späteren
                  Schritt.
                </MutedText>
              </ContextCard>
            ) : null}
            <div className="flex flex-wrap gap-4">
              <LinkButton href={`${base}/edit`}>Entwurf bearbeiten</LinkButton>
              <LinkButton href={`${base}/preview`}>Vorschau</LinkButton>
              <LinkButton
                href={`/organizer/events/new?profile=${e.organizerId}`}
                variant="outline"
              >
                Weiteres Event anlegen
              </LinkButton>
            </div>
          </>
        }
      />
    </PageShell>
  );
}
