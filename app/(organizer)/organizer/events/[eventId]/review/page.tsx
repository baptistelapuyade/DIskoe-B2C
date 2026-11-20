import { redirect } from "next/navigation";

import { ContextCard, MutedText, PageShell, Workspace } from "@/components/ui/page-shell";
import { LinkButton } from "@/components/ui/button";
import { loadPublicationView } from "@/lib/event/publication";

export const dynamic = "force-dynamic";

// Figma Kernflow ORG-38 / Flow 01 05 (2859:40189): profile and first event are
// with the founder. A question (Figma 02, 2859:40217) is shown here as well.
export default async function EventReviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const view = await loadPublicationView(eventId, `${base}/review`);

  if (view.status === "published") redirect(`${base}/published`);
  if (view.mode !== "first") redirect(`${base}/manage`);
  if (view.status !== "in_review" && view.status !== "question") {
    redirect(`${base}/preview`);
  }
  // In review for the first time: the profile has the new screen (PRF-01).
  // The question keeps this older screen until its own slice.
  if (view.status === "in_review") {
    redirect(`/organizer/profiles/${view.event.event.organizerId}/status`);
  }

  const name = view.event.profileName;
  const title = view.event.form.title || "Event ohne Titel";
  const asked = view.status === "question";

  return (
    <PageShell
      context={`DISKOE / ${name}${asked ? " · Rückfrage zur Erstprüfung" : ""}`}
      badge="Noch nicht öffentlich"
      title={asked ? "Wir haben eine Frage zu eurem Stand" : "Eure Seiten sind in Prüfung"}
      subtitle={
        asked
          ? "Profil und erstes Event bleiben bis zur Freigabe privat."
          : "Profil und erstes Event · Noch nicht öffentlich"
      }
    >
      <Workspace
        main={
          <>
            {asked && view.question ? (
              <ContextCard title="Frage von DISKOE">
                <p className="text-base leading-6 whitespace-pre-line">
                  „{view.question.message}“
                </p>
                <MutedText>
                  Eine Rückfrage ist keine Absage. Korrigiert die Angabe, seht
                  euch die Vorschau an und reicht den aktualisierten Stand
                  erneut ein.
                </MutedText>
              </ContextCard>
            ) : (
              <ContextCard title="Danke! Wir schauen uns eure Seiten an.">
                <MutedText>
                  Wir prüfen eure Seiten so schnell wie möglich. Sobald Profil
                  und Event freigegeben sind, gehen sie online. Falls wir noch
                  etwas brauchen, findet ihr die Rückfrage hier.
                </MutedText>
              </ContextCard>
            )}
            <ContextCard title="Eingereichter Stand">
              <p className="text-base leading-6">
                Profil: {name}
                <br />
                Event: {title}
                <br />
                Öffentliche Sichtbarkeit: privat bis zur Freigabe
              </p>
            </ContextCard>
            <ContextCard title="Änderungen während der Prüfung">
              <MutedText>
                Neue Änderungen bleiben ein privater Entwurf. Erst erneute
                Bestätigung und Einreichung ersetzt den bisherigen Prüfstand.
                Ein überholter Stand wird nicht versehentlich veröffentlicht.
              </MutedText>
            </ContextCard>
            <div className="flex flex-wrap gap-4">
              {asked ? (
                <LinkButton href={`${base}/edit`} variant="primary">
                  Korrigieren und erneut einreichen
                </LinkButton>
              ) : (
                <LinkButton href={`${base}/edit`}>
                  Zurückziehen und bearbeiten
                </LinkButton>
              )}
              <LinkButton href={`${base}/preview`}>
                Eingereichten Stand ansehen
              </LinkButton>
            </div>
          </>
        }
      />
    </PageShell>
  );
}
