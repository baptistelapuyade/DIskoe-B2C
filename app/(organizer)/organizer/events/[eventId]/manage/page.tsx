import { LinkButton } from "@/components/ui/button";
import { Badge, ContextCard, MutedText, PageShell, Workspace } from "@/components/ui/page-shell";
import { loadPublicationView } from "@/lib/event/publication";
import { canCancel, canReschedule, STATUS_LABEL } from "@/lib/event/status";
import { placeText, whenText } from "@/lib/event/summary";

export const dynamic = "force-dynamic";

// Figma "Eventverwaltung, veröffentlicht und privater Entwurf" (2859:40259),
// reduced to what exists: the live state, the private draft and the way on.
// Cancelling and rescheduling (NACH-11, 12, 15, 16) start here; the state after
// a cancellation is NACH-16. Not built: changing a live event (NACH-09, 10) and
// publishing other changes to it.
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
  const status = e.publicStatus;
  const cancelled = live && status === "cancelled";
  const postponed = live && status === "postponed_undated";

  return (
    <PageShell
      context={`DISKOE / ${view.event.profileName}${live ? " · Veröffentlicht" : ""} · Eventverwaltung`}
      badge={live ? (cancelled ? "Abgesagt" : postponed ? "Termin folgt" : "Öffentlich") : "Privater Entwurf"}
      title={cancelled ? "Event abgesagt" : title}
      subtitle={
        cancelled
          ? "Der öffentliche Stand des Events ist „abgesagt“."
          : live
          ? "Verwaltet die öffentliche Fassung und bearbeitet weitere Änderungen zunächst privat."
          : "Dieses Event ist noch nicht öffentlich."
      }
    >
      <Workspace
        main={
          <>
            {live ? (
              <ContextCard title={cancelled ? "Bestätigter Stand" : "Öffentlich"}>
                <p className="text-base leading-6">
                  {cancelled ? `${title} wurde abgesagt.` : null}
                  {cancelled ? null : (
                    <>
                      {postponed ? <>Neuer Termin folgt<br />Bisher: </> : null}
                      {whenText(view.event.form)}
                      <br />
                      {placeText(view.event.form)}
                    </>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge>{STATUS_LABEL[status]}</Badge>
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
              <ContextCard
                title={cancelled ? "Privater Entwurf bleibt getrennt" : "Privater Entwurf vorhanden"}
                tone="warning"
              >
                <MutedText>
                  {cancelled
                    ? "Änderungen aus eurem privaten Entwurf wurden nicht veröffentlicht."
                    : "Eine überarbeitete Fassung ist noch nicht veröffentlicht. Die öffentliche Seite zeigt weiterhin den bestätigten Live-Stand. Das Veröffentlichen von Änderungen folgt in einem späteren Schritt."}
                </MutedText>
              </ContextCard>
            ) : null}
            {live && (canReschedule(status) || canCancel(status)) ? (
              <div className="flex flex-wrap gap-4">
                {canReschedule(status) ? (
                  <LinkButton href={`${base}/reschedule`} variant="primary">
                    {postponed ? "Ersatztermin eintragen" : "Event verschieben"}
                  </LinkButton>
                ) : null}
                {canCancel(status) ? (
                  <LinkButton href={`${base}/cancel`}>Event absagen</LinkButton>
                ) : null}
              </div>
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
