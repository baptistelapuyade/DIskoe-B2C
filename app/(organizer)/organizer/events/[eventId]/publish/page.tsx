import { redirect } from "next/navigation";

import { ConfirmForm } from "@/components/event/confirm-form";
import { ContextCard, MutedText, PageShell, Workspace } from "@/components/ui/page-shell";
import { loadPublicationView } from "@/lib/event/publication";
import { placeText, whenText } from "@/lib/event/summary";

import { publishLaterEvent } from "../../actions";

export const dynamic = "force-dynamic";

// Figma S5-C "Weiteres Event, selbst veröffentlichen" (2855:38933): the
// profile is approved, so the owner publishes this event himself with the same
// two confirmations as at the first submission, without a review.
export default async function PublishLaterEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const view = await loadPublicationView(eventId, `${base}/publish`);

  if (view.mode === "first") redirect(`${base}/preview`);
  if (view.mode === "approved") redirect(`${base}/manage`);
  if (view.status === "published") redirect(`${base}/published`);
  if (view.status !== "ready") redirect(`${base}/preview`);

  const name = view.event.profileName;

  return (
    <PageShell
      context={`DISKOE / ${name} · Neues Event`}
      title="Neues Event veröffentlichen?"
      subtitle="Euer Profil ist freigegeben. Dieses Event veröffentlicht ihr selbst, ohne zusätzliche Prüfung."
    >
      <Workspace
        main={
          <>
            <ContextCard
              title={`Euer Event: ${view.event.form.title || "Event ohne Titel"}`}
            >
              <p className="text-base leading-6">
                {whenText(view.event.form)}
                <br />
                {placeText(view.event.form)}
              </p>
            </ContextCard>
            <ContextCard title="Das wird öffentlich">
              <MutedText>
                Titel, Beschreibung, Termin, Ort, Atmosphäre, Eintritt, Zugang
                und Eventbild auf der Eventseite und im Profil.
              </MutedText>
            </ContextCard>
            <ContextCard title="Eure Bestätigung">
              <MutedText>
                Wie bei der ersten Einreichung bestätigt ihr zwei Punkte:
                Angaben geprüft und berechtigt zu veröffentlichen, und die
                nötigen Freigaben für Texte und Bilder vorhanden.
              </MutedText>
            </ContextCard>
            <ConfirmForm
              action={publishLaterEvent.bind(null, eventId)}
              submitLabel="Event veröffentlichen"
              pendingLabel="Veröffentlicht …"
              backHref={`${base}/preview`}
            />
          </>
        }
      />
    </PageShell>
  );
}
