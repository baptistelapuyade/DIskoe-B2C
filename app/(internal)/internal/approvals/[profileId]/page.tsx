import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ApproveForm,
  QuestionForm,
  ResendMailForm,
  RetryImageFounderForm,
} from "@/components/profile/approve-form";
import { GapList } from "@/components/profile/status";
import { requireFounder } from "@/lib/auth/server";
import { loadFounderProfileView, mailText } from "@/lib/profile/founder";
import { createClient } from "@/lib/supabase/server";

import { approveFirst, requestChanges, resendMail, retryImage } from "../actions";

export const dynamic = "force-dynamic";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  const { revision, image } = view;
  const canDecide =
    revision !== null &&
    view.submittedAt !== null &&
    !view.alreadyApproved &&
    !view.questionIsOnDraft &&
    view.gaps.length === 0;
  // Offered while the mail was not accepted yet (failed, never sent, or stuck).
  const canResend =
    view.mailTarget !== null && view.mail?.status !== "sent";
  const imageMissingPublicly =
    view.alreadyApproved && view.publishedImagePublic === false;

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <header className="space-y-2">
        <Link href="/internal/approvals" className="text-muted-foreground text-sm">
          ← Zur Liste
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          Erstprüfung: {revision?.name || view.profile.slug}
        </h1>
        <p className="text-muted-foreground">
          /{view.profile.slug} ·{" "}
          {view.alreadyApproved
            ? "freigegeben und veröffentlicht"
            : view.questionIsOnDraft
              ? "Rückfrage gestellt"
              : view.submittedAt
                ? `eingereicht ${new Date(view.submittedAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`
                : "nicht eingereicht"}
          {view.submittedAt && !view.alreadyApproved
            ? " · du siehst genau den eingereichten Stand"
            : ""}
        </p>
      </header>

      <GapList gaps={view.gaps} />

      <article className="border-border space-y-4 rounded-lg border p-6">
        {image?.signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.signedUrl}
            alt={image.altText ?? ""}
            className="max-h-64 rounded-md"
          />
        ) : null}
        <h2 className="text-2xl font-bold">{revision?.name || "Name fehlt"}</h2>
        <p className="leading-7 whitespace-pre-line">
          {revision?.shortIntro || "Kurzvorstellung fehlt."}
        </p>
        <ul className="text-sm">
          {revision?.officialUrl ? <li>Link: {revision.officialUrl}</li> : null}
          {revision?.publicContact ? (
            <li>Kontakt: {revision.publicContact}</li>
          ) : null}
          {image?.altText ? <li>Bildbeschreibung: {image.altText}</li> : null}
        </ul>
      </article>

      {view.question ? (
        <section aria-labelledby="asked-heading" className="bg-muted space-y-2 rounded-lg p-4">
          <h2 id="asked-heading" className="font-medium">
            Gestellte Rückfrage
            {view.questionIsOnDraft ? "" : " (zu einem früheren Stand)"}
          </h2>
          <p className="whitespace-pre-line">„{view.question.message}“</p>
          <p className="text-muted-foreground text-sm">
            {new Date(view.question.createdAt).toLocaleString("de-DE", {
              timeZone: "Europe/Berlin",
            })}
            {view.mail ? ` · ${mailText(view.mail)}` : ""}
          </p>
        </section>
      ) : null}

      {canResend && view.mailTarget ? (
        <section aria-labelledby="mail-heading" className="border-border space-y-3 rounded-lg border p-4">
          <h2 id="mail-heading" className="font-medium">
            Mail an den Organizer
          </h2>
          <p className="text-sm">
            {view.mail
              ? `${mailText(view.mail)}.`
              : "Noch keine Mail gesendet."}
          </p>
          <ResendMailForm
            action={resendMail}
            profileId={profileId}
            revisionId={view.mailTarget.revisionId}
            kind={view.mailTarget.kind}
            label={view.mail?.status === "failed" ? "Mail erneut senden" : "Mail senden"}
          />
        </section>
      ) : null}

      {view.alreadyApproved ? (
        <section className="space-y-3">
          <p role="note">
            Freigegeben und veröffentlicht.
            {view.mail ? ` ${mailText(view.mail)}.` : ""}
          </p>
          {imageMissingPublicly ? (
            <>
              <p role="alert">Das Bild ist noch nicht öffentlich.</p>
              <RetryImageFounderForm action={retryImage} profileId={profileId} />
            </>
          ) : null}
        </section>
      ) : canDecide && revision ? (
        <div className="grid gap-6 md:grid-cols-2">
          <section aria-labelledby="approve-heading" className="bg-muted space-y-3 rounded-lg p-5">
            <h2 id="approve-heading" className="text-lg font-semibold">
              Freigeben
            </h2>
            <p className="text-sm leading-6">
              Das Profil wird sofort öffentlich. Der Organizer bekommt eine
              E-Mail.
            </p>
            <ApproveForm
              action={approveFirst}
              profileId={profileId}
              revisionId={revision.id}
            />
          </section>
          <section aria-labelledby="question-heading" className="border-border space-y-3 rounded-lg border p-5">
            <h2 id="question-heading" className="text-lg font-semibold">
              Rückfrage stellen
            </h2>
            <QuestionForm
              action={requestChanges}
              profileId={profileId}
              revisionId={revision.id}
            />
          </section>
        </div>
      ) : (
        <p role="note">
          {view.questionIsOnDraft
            ? "Zu diesem Stand ist eine Rückfrage gestellt. Der Organizer muss zuerst etwas ändern und erneut einreichen."
            : "Dieser Stand kann nicht freigegeben werden: Er wurde nicht eingereicht oder ist unvollständig."}
        </p>
      )}
    </main>
  );
}
