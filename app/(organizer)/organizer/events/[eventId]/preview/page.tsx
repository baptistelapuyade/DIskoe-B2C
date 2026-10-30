import Link from "next/link";

import { Badge, ContextCard, MutedText, PageShell, Workspace } from "@/components/ui/page-shell";
import { Button, LinkButton } from "@/components/ui/button";
import { FORMAT_LABEL } from "@/lib/domain/event-publication";
import { loadPublicationView } from "@/lib/event/publication";
import {
  accessText,
  placeText,
  priceText,
  whenText,
} from "@/lib/event/summary";

export const dynamic = "force-dynamic";

// Figma 03a/03b "Veröffentlichungscheck" and "Vorschau" (2496:1925, 2496:2079,
// 2533:4219, mobile 2496:2837). The way on depends on where the owner stands:
// first publication (profile and event go to the founder together), a later
// event (the owner publishes it himself) or an event that is live already.
// Not built: "Mobile Vorschau" and the ticket-provider button (prototype only).
export default async function EventPreviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const path = `/organizer/events/${eventId}/preview`;
  const publication = await loadPublicationView(eventId, path);
  const view = publication.event;
  const profile = publication.profile;
  const base = `/organizer/events/${eventId}`;
  const v = view.form;

  const imageMissing = view.gaps.some((gap) => gap.code === "event_image");
  const openGaps = view.gaps.filter((gap) => gap.code !== "event_image");
  const complete = view.gaps.length === 0;
  const profileReady = profile.gaps.length === 0;
  const { mode, status } = publication;

  const when = whenText(v);
  const place = placeText(v);
  const price = priceText(v);
  const access = accessText(v);
  const format = (FORMAT_LABEL as Record<string, string>)[v.format];

  return (
    <PageShell
      context={`DISKOE / ${view.profileName}`}
      badge="Entwurf · gespeichert"
      title={
        openGaps.length > 0
          ? "Noch Angaben offen"
          : "Prüft euren öffentlichen Auftritt"
      }
      subtitle={
        openGaps.length > 0
          ? "Vorschau · Vor dem Einreichen prüfen"
          : imageMissing
            ? "Private Vorschau · Eventbild vor Einreichung ergänzen"
            : "Vorschau · Profil und Event sind bereit zur Bestätigung"
      }
    >
      <Workspace
        main={
          <>
            <article className="border-border bg-background flex flex-col gap-4 border p-6">
              <div>
                <Badge>Private Vorschau</Badge>
              </div>
              {view.image?.signedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={view.image.signedUrl}
                  alt={view.image.altText ?? ""}
                  className="bg-muted max-h-72 w-full object-cover"
                />
              ) : null}
              <h2 className="text-[32px] leading-[38px] font-bold tracking-[-0.8px]">
                {v.title || "Titel fehlt noch"}
              </h2>
              <MutedText>
                {[format, view.profileName].filter(Boolean).join(" · ")}
              </MutedText>
              <p className="text-base leading-6">
                {when ?? "Beginn fehlt noch"}
                <br />
                {place ?? "Ort fehlt noch"}
              </p>
              {v.description ? (
                <p className="text-base leading-6">{v.description}</p>
              ) : null}
              {v.atmosphereTags.length > 0 ? (
                <ul className="flex flex-wrap gap-3" aria-label="Atmosphäre">
                  {v.atmosphereTags.map((tag) => (
                    <li
                      key={tag}
                      className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
              {v.atmosphereDescription ? (
                <p className="text-base leading-6">{v.atmosphereDescription}</p>
              ) : null}
              {v.atmosphereTags.length === 0 && !v.atmosphereDescription ? (
                <p className="text-base leading-6 font-medium">
                  Atmosphäre: noch nicht bestätigt
                </p>
              ) : null}
              <p className="text-base leading-6">
                Eintritt: {price ?? "noch nicht angegeben"}
                <br />
                Zugang: {access ?? "noch nicht angegeben"}
              </p>
              {openGaps.length > 0 ? (
                <div>
                  <LinkButton href={`${base}/edit`}>Angabe ergänzen</LinkButton>
                </div>
              ) : null}
            </article>

            <div className="mt-2 flex flex-wrap items-start gap-4">
              <LinkButton href={`${base}/edit`}>
                {openGaps.length > 0 ? "Zurück zum Editor" : "Weiter bearbeiten"}
              </LinkButton>
              {openGaps.length === 0 && imageMissing ? (
                <LinkButton href={`${base}/image`} variant="primary">
                  Eventbild ergänzen
                </LinkButton>
              ) : status === "ready" && mode === "first" && profileReady ? (
                <LinkButton href={`${base}/submit`} variant="primary">
                  Weiter zur Bestätigung
                </LinkButton>
              ) : status === "question" ? (
                <LinkButton href={`${base}/review`} variant="primary">
                  Frage von DISKOE ansehen
                </LinkButton>
              ) : status === "ready" && mode === "later" ? (
                <LinkButton href={`${base}/publish`} variant="primary">
                  Weiter zur Bestätigung
                </LinkButton>
              ) : status === "in_review" ? (
                <LinkButton href={`${base}/review`} variant="primary">
                  Stand der Prüfung ansehen
                </LinkButton>
              ) : status === "published" ? (
                <LinkButton href={`${base}/manage`} variant="primary">
                  Eventverwaltung
                </LinkButton>
              ) : (
                <Button disabled>Zur Prüfung einreichen</Button>
              )}
            </div>
            {mode === "first" && complete && !profileReady ? (
              <MutedText>
                Das Event ist vollständig. Zum Einreichen fehlen noch Angaben
                am Profil.
              </MutedText>
            ) : status === "update" ? (
              <MutedText>
                Das Veröffentlichen von Änderungen an einem live
                veröffentlichten Event folgt in einem späteren Schritt. Der
                Entwurf bleibt gespeichert und privat.
              </MutedText>
            ) : null}
          </>
        }
        side={
          <>
            {openGaps.length > 0 ? (
              <ContextCard
                title={
                  openGaps.length === 1
                    ? "1 Pflichtlücke"
                    : `${openGaps.length + (imageMissing ? 1 : 0)} Pflichtlücken`
                }
              >
                <ul className="text-muted-foreground list-disc pl-5 text-sm leading-5">
                  {openGaps.map((gap) => (
                    <li key={gap.code}>{gap.message}</li>
                  ))}
                </ul>
              </ContextCard>
            ) : null}
            {imageMissing ? (
              <ContextCard
                title={openGaps.length > 0 ? "Weitere Pflichtlücke" : "Eventbild fehlt"}
              >
                <MutedText>
                  {openGaps.length > 0
                    ? "Eventbild fehlt. Speichern und private Vorschau sind möglich; zur Einreichung ist ein öffentliches Eventbild erforderlich."
                    : "Wählt ein öffentliches Eventbild, bevor ihr das Event zur Prüfung einreicht. Der private Entwurf bleibt erhalten."}
                </MutedText>
              </ContextCard>
            ) : null}
            {complete ? (
              <ContextCard title="Pflichtangaben vollständig">
                <MutedText>
                  Eventbild, Titel, Hauptformat, Beschreibung, Termin, Ort,
                  Kosten/Zugang und Atmosphäre sind vorhanden.
                </MutedText>
              </ContextCard>
            ) : null}
            {mode === "first" ? (
              <ContextCard
                title={profileReady ? "Profil bereit zur Prüfung" : "Profil noch unvollständig"}
              >
                <MutedText>
                  {profileReady
                    ? `${view.profileName}: Kurzvorstellung, Profiladresse, offizieller Link oder Kontakt und Bild vorhanden.`
                    : "Am Profil fehlen noch Angaben. Ergänzt sie vor der Einreichung."}
                </MutedText>
                <div>
                  <Link
                    href={`/organizer/profiles/${view.event.organizerId}/${
                      profileReady ? "preview" : "edit"
                    }`}
                    className="border-border bg-background inline-flex min-h-10 items-center rounded-lg border px-4 text-sm font-medium shadow-sm"
                  >
                    {profileReady ? "Profilvorschau öffnen" : "Profil ergänzen"}
                  </Link>
                </div>
              </ContextCard>
            ) : (
              <ContextCard title="Profil freigegeben">
                <MutedText>
                  {view.profileName} ist von DISKOE freigegeben. Weitere Events
                  veröffentlicht ihr selbst.
                </MutedText>
              </ContextCard>
            )}
            {!imageMissing || openGaps.length === 0 ? (
              <ContextCard title="Was passiert als Nächstes?">
                <MutedText>
                  {complete
                    ? mode === "first"
                      ? "Ihr bestätigt den Stand und reicht Profil und erstes Event gemeinsam ein. Bis zur Freigabe bleibt beides privat."
                      : "Ihr bestätigt zwei Punkte und veröffentlicht das Event selbst, ohne zusätzliche Prüfung."
                    : "Euer Entwurf bleibt privat. Mit einem Eventbild könnt ihr im nächsten Schritt die Verwendung bestätigen und einreichen."}
                </MutedText>
              </ContextCard>
            ) : null}
          </>
        }
      />
    </PageShell>
  );
}
