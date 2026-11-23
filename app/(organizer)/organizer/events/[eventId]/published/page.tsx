import { redirect } from "next/navigation";

import { RetryImageButton } from "@/components/event/confirm-form";
import { LinkButton } from "@/components/ui/button";
import {
  ContextCard,
  MutedText,
  PageShell,
  Workspace,
} from "@/components/ui/page-shell";
import { wasEventApprovedByFounder } from "@/lib/event/draft";
import { isPublishedEventImagePublic } from "@/lib/event/publish";
import { loadPublicationView } from "@/lib/event/publication";
import { placeText, whenText } from "@/lib/event/summary";
import { createClient } from "@/lib/supabase/server";

import { retryEventImagePublish } from "../../actions";

export const dynamic = "force-dynamic";

// Figma "Freigabe, Profil und erstes Event öffentlich" (2859:40238) after the
// founder's approval, and S5-F "Weiteres Event, veröffentlicht" (2896:735)
// after the owner published a later event himself.
export default async function EventPublishedPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const base = `/organizer/events/${eventId}`;
  const view = await loadPublicationView(eventId, `${base}/published`);

  if (view.event.event.publishedRevisionId === null)
    redirect(`${base}/preview`);

  const supabase = await createClient();
  const byFounder = await wasEventApprovedByFounder(supabase, eventId);
  // After the founder's first approval the screen belongs to the profile
  // (Figma LIV-01).
  if (byFounder) {
    redirect(`/organizer/profiles/${view.event.event.organizerId}/live`);
  }

  const imagePublic = await isPublishedEventImagePublic(supabase, eventId);
  const name = view.event.profileName;
  const title = view.event.form.title || "Event ohne Titel";
  const when = [whenText(view.event.form), placeText(view.event.form)]
    .filter(Boolean)
    .join(" · ");

  return (
    <PageShell
      context={`DISKOE / ${name} · ${byFounder ? "Veröffentlicht" : "Event veröffentlicht"}`}
      title={
        byFounder
          ? "Eure Seiten sind veröffentlicht"
          : "Euer Event ist veröffentlicht"
      }
      subtitle={
        byFounder
          ? "Profil und erstes Event sind freigegeben."
          : `„${title}“ ist jetzt öffentlich, ohne zusätzliche Prüfung.`
      }
    >
      <Workspace
        main={
          <>
            <ContextCard title={byFounder ? "Öffentlicher Stand" : title}>
              <p className="text-base leading-6">
                {byFounder ? (
                  <>
                    {name}
                    <br />
                    {title}
                    <br />
                  </>
                ) : null}
                {when}
              </p>
              {!byFounder ? (
                <MutedText>
                  Öffentlich auf der Eventseite und im Profil.
                </MutedText>
              ) : null}
            </ContextCard>
            <ContextCard
              title={
                byFounder
                  ? "Ihr behaltet die Kontrolle"
                  : "Euer Profil bleibt gleich"
              }
            >
              <MutedText>
                {byFounder
                  ? "Weitere Bearbeitungen bleiben zunächst privat. Erst eure Bestätigung ändert die öffentliche Fassung."
                  : "Spätere Änderungen an diesem Event bleiben zunächst privat. Erst eure Bestätigung ändert die öffentliche Fassung."}
              </MutedText>
            </ContextCard>
            {imagePublic === false ? (
              <ContextCard
                title="Eventbild noch nicht öffentlich"
                tone="warning"
              >
                <MutedText>
                  Das Event ist veröffentlicht, das Bild wird noch kopiert.
                  Versucht es erneut.
                </MutedText>
                <RetryImageButton
                  action={retryEventImagePublish.bind(null, eventId)}
                />
              </ContextCard>
            ) : null}
            <div className="flex flex-wrap gap-4">
              <LinkButton href={`${base}/manage`} variant="primary">
                Event verwalten
              </LinkButton>
              <LinkButton
                href={`/organizer/events/new?profile=${view.event.event.organizerId}`}
              >
                Weiteres Event anlegen
              </LinkButton>
            </div>
            <MutedText>
              Die öffentlichen Seiten selbst werden in einem späteren Schritt
              gebaut; einen Link zum Ansehen gibt es deshalb noch nicht.
            </MutedText>
          </>
        }
      />
    </PageShell>
  );
}
