import { notFound } from "next/navigation";

import {
  ApproveForm,
  ResendMailForm,
  RetryImageFounderForm,
} from "@/components/profile/approve-form";
import { ReviewImage, ReviewRows } from "@/components/profile/review-rows";
import { GapList } from "@/components/profile/status";
import { LinkButton } from "@/components/ui/button";
import {
  ContextCard,
  MutedText,
  PageShell,
  TintedBlock,
  Workspace,
} from "@/components/ui/page-shell";
import { requireFounder } from "@/lib/auth/server";
import { FORMAT_LABEL } from "@/lib/domain/event-publication";
import {
  accessText,
  atmosphereSummary,
  placeText,
  priceText,
  whenText,
} from "@/lib/event/summary";
import { loadFounderProfileView, mailText } from "@/lib/profile/founder";
import { createClient } from "@/lib/supabase/server";

import { approveFirst, resendMail, retryImage } from "../actions";

export const dynamic = "force-dynamic";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MISSING = "fehlt";

function when(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
}

// Figma S5-A "Profil und erstes Event prüfen" (2855:38880). Not built: the
// internal review note (no column), "Private Vorschau öffnen" (the owner's
// preview needs ownership) and the rows "Projektzuordnung" and "Gestaltung"
// (not part of the Durchstich).
export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  await requireFounder(`/internal/approvals/${profileId}`);

  if (!UUID.test(profileId)) {
    notFound();
  }

  const supabase = await createClient();
  const view = await loadFounderProfileView(supabase, profileId);

  if (!view) {
    notFound();
  }

  const { revision, image, event } = view;
  const form = event?.form;
  const canDecide =
    revision !== null &&
    view.submittedAt !== null &&
    !view.alreadyApproved &&
    !view.questionIsOnDraft &&
    view.gaps.length === 0 &&
    (event === null || event.gaps.length === 0);
  const eventTarget = event
    ? { eventId: event.eventId, revisionId: event.revisionId }
    : null;
  // Offered while the mail was not accepted yet (failed, never sent, or stuck).
  const canResend = view.mailTarget !== null && view.mail?.status !== "sent";
  const imageMissingPublicly =
    view.alreadyApproved &&
    (view.publishedImagePublic === false || view.eventImagePublic === false);

  const state = view.alreadyApproved
    ? "freigegeben und veröffentlicht"
    : view.questionIsOnDraft
      ? "Rückfrage gestellt"
      : view.submittedAt
        ? `eingereicht ${when(view.submittedAt)}`
        : "nicht eingereicht";

  return (
    <PageShell
      context="DISKOE INTERN · ERSTPRÜFUNG"
      badge={state}
      title={event ? "Profil und erstes Event prüfen" : "Profil prüfen"}
      subtitle={
        event
          ? "Eine Freigabe veröffentlicht beide Seiten. Sie gilt nur für genau den eingereichten Stand. Prüfe Angaben und Bilder, wie sie öffentlich erscheinen würden."
          : "Eine Freigabe veröffentlicht das Profil. Sie gilt nur für genau den eingereichten Stand. Prüfe Angaben und Bild, wie sie öffentlich erscheinen würden."
      }
      topAction={
        <LinkButton href="/internal/approvals" variant="ghost">
          ← Zur Liste
        </LinkButton>
      }
    >
      <Workspace
        main={
          <>
            <GapList gaps={view.gaps} />
            {event && event.gaps.length > 0 ? (
              <ContextCard title="Am Event fehlen Angaben" tone="warning">
                <ul className="list-disc pl-5 text-sm leading-5">
                  {event.gaps.map((gap) => (
                    <li key={gap.code}>{gap.message}</li>
                  ))}
                </ul>
              </ContextCard>
            ) : null}

            <TintedBlock title={`Profil: ${revision?.name || MISSING}`}>
              <ReviewRows
                rows={[
                  { label: "Profiltyp", value: "Organizer" },
                  { label: "Projektname", value: revision?.name || MISSING },
                  {
                    label: "Kurzvorstellung",
                    value: revision?.shortIntro || MISSING,
                  },
                  { label: "Profiladresse", value: `/${view.profile.slug}` },
                  {
                    label: "Offizieller Link",
                    value: revision?.officialUrl || "nicht angegeben",
                  },
                  {
                    label: "Öffentlicher Kontakt",
                    value: revision?.publicContact || "nicht angegeben",
                  },
                ]}
              />
              <ReviewImage
                src={image?.signedUrl}
                alt={image?.altText}
                label="Profilbild"
              />
            </TintedBlock>

            {event && form ? (
              <TintedBlock title={`Erstes Event: ${form.title || MISSING}`}>
                <ReviewRows
                  rows={[
                    { label: "Titel", value: form.title || MISSING },
                    {
                      label: "Hauptformat",
                      value:
                        (FORMAT_LABEL as Record<string, string>)[form.format] ??
                        MISSING,
                    },
                    {
                      label: "Beschreibung",
                      value: form.description || MISSING,
                    },
                    {
                      label: "Beginn und Ende",
                      value: whenText(form) ?? MISSING,
                    },
                    { label: "Ort", value: placeText(form) ?? MISSING },
                    {
                      label: "Atmosphäre",
                      value: atmosphereSummary(form) ?? "nicht bestätigt",
                    },
                    {
                      label: "Preis",
                      value: priceText(form) ?? "nicht angegeben",
                    },
                    {
                      label: "Zugangswege",
                      value: accessText(form) ?? "nicht angegeben",
                    },
                    {
                      label: "Ticketlink",
                      value:
                        form.onlineTicketUrl ||
                        form.onlineRegistrationUrl ||
                        "keiner",
                    },
                  ]}
                />
                <ReviewImage
                  src={event.image?.signedUrl}
                  alt={event.image?.altText}
                  label="Eventbild"
                />
              </TintedBlock>
            ) : view.submittedAt && !view.alreadyApproved ? (
              <MutedText>
                Zu diesem Profil wurde kein Event eingereicht.
              </MutedText>
            ) : null}

            {view.question ? (
              <ContextCard
                title={`Gestellte Rückfrage${view.questionIsOnDraft ? "" : " (zu einem früheren Stand)"}`}
              >
                <p className="text-base leading-6 whitespace-pre-line">
                  „{view.question.message}“
                </p>
                <MutedText>
                  {when(view.question.createdAt)}
                  {view.mail ? ` · ${mailText(view.mail)}` : ""}
                </MutedText>
              </ContextCard>
            ) : null}

            {canResend && view.mailTarget ? (
              <ContextCard title="Mail an den Organizer">
                <MutedText>
                  {view.mail
                    ? `${mailText(view.mail)}.`
                    : "Noch keine Mail gesendet."}
                </MutedText>
                <ResendMailForm
                  action={resendMail}
                  profileId={profileId}
                  revisionId={view.mailTarget.revisionId}
                  kind={view.mailTarget.kind}
                  label={
                    view.mail?.status === "failed"
                      ? "Mail erneut senden"
                      : "Mail senden"
                  }
                />
              </ContextCard>
            ) : null}

            {view.alreadyApproved ? (
              <ContextCard title="Freigegeben und veröffentlicht.">
                <MutedText>{view.mail ? `${mailText(view.mail)}.` : ""}</MutedText>
                {imageMissingPublicly ? (
                  <>
                    <p role="alert" className="text-error text-sm">
                      Mindestens ein Bild ist noch nicht öffentlich.
                    </p>
                    <RetryImageFounderForm
                      action={retryImage}
                      profileId={profileId}
                    />
                  </>
                ) : null}
              </ContextCard>
            ) : canDecide && revision ? (
              <div className="flex flex-wrap items-start gap-4">
                <ApproveForm
                  action={approveFirst}
                  profileId={profileId}
                  revisionId={revision.id}
                  event={eventTarget}
                />
                <LinkButton
                  href={`/internal/approvals/${profileId}/question`}
                  variant="outline"
                >
                  Rückfrage stellen
                </LinkButton>
              </div>
            ) : (
              <MutedText>
                {view.questionIsOnDraft
                  ? "Zu diesem Stand ist eine Rückfrage gestellt. Der Organizer muss zuerst etwas ändern und erneut einreichen."
                  : "Dieser Stand kann nicht freigegeben werden: Er wurde nicht eingereicht oder ist unvollständig."}
              </MutedText>
            )}
          </>
        }
        side={
          <ContextCard title="Was du prüfst">
            <MutedText>
              Prüfe alle Angaben und Bilder so, wie sie öffentlich erscheinen
              würden. Passt die Person zum Projekt? Stimmen Texte, Preis und
              Termin? Stimmt die Bildbeschreibung, falls eine eingetragen ist?
              Der Organizer hat bestätigt, dass er veröffentlichen darf.
            </MutedText>
          </ContextCard>
        }
      />
    </PageShell>
  );
}
