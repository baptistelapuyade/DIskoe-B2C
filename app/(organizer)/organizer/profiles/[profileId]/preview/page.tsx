import Link from "next/link";
import { PublishForm, RetryImageForm, SubmitForm } from "@/components/profile/forms";
import { GapList, ProfileNav, STATUS_LABEL } from "@/components/profile/status";
import { loadOwnerProfileView } from "@/lib/profile/load";

import { publishProfile, retryImagePublish, submitForReview } from "../actions";

export const dynamic = "force-dynamic";

export default async function PreviewProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const view = await loadOwnerProfileView(
    profileId,
    `/organizer/profiles/${profileId}/preview`,
  );
  const { revision, image } = view;
  const canSubmit = view.status === "ready";
  const canPublish =
    view.status === "approved" &&
    view.profile.draftRevisionId !== view.profile.publishedRevisionId;
  const imageMissingPublicly =
    view.profile.publishedRevisionId !== null &&
    view.publishedImagePublic === false;

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
      <header className="space-y-3">
        <Link href="/organizer" className="text-muted-foreground text-sm">
          ← Deine Profile
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Vorschau</h1>
        <p className="text-muted-foreground">
          {STATUS_LABEL[view.status]} · Private Vorschau. Nur du und DISKOE
          können sie sehen.
        </p>
        <ProfileNav profileId={profileId} active="preview" />
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
        <h2 className="text-2xl font-bold">
          {revision?.name || "Name fehlt noch"}
        </h2>
        <p className="leading-7 whitespace-pre-line">
          {revision?.shortIntro || "Kurzvorstellung fehlt noch."}
        </p>
        <ul className="text-sm">
          {revision?.officialUrl ? <li>Link: {revision.officialUrl}</li> : null}
          {revision?.publicContact ? (
            <li>Kontakt: {revision.publicContact}</li>
          ) : null}
        </ul>
      </article>

      {canSubmit ? (
        <section aria-labelledby="submit-heading" className="space-y-4">
          <h2 id="submit-heading" className="text-xl font-semibold">
            Zur Prüfung einreichen
          </h2>
          <p className="text-muted-foreground">
            DISKOE prüft genau diesen Stand. Wenn du danach etwas änderst,
            entsteht ein neuer Entwurf, der erneut eingereicht werden muss.
          </p>
          <SubmitForm action={submitForReview.bind(null, profileId)} />
        </section>
      ) : canPublish ? (
        <section aria-labelledby="publish-heading" className="space-y-4">
          <h2 id="publish-heading" className="text-xl font-semibold">
            {view.profile.publishedRevisionId
              ? "Änderungen veröffentlichen"
              : "Veröffentlichen"}
          </h2>
          <p className="text-muted-foreground">
            {view.profile.publishedRevisionId
              ? "Bis du veröffentlichst, bleibt der bisherige öffentliche Stand sichtbar."
              : "DISKOE hat diesen Stand freigegeben. Öffentlich wird er erst, wenn du ihn selbst veröffentlichst."}
          </p>
          <PublishForm
            action={publishProfile.bind(null, profileId)}
            update={view.profile.publishedRevisionId !== null}
          />
        </section>
      ) : view.status === "published" && !imageMissingPublicly ? (
        <p role="status">Dein Profil ist veröffentlicht.</p>
      ) : view.status === "in_review" ? (
        <p role="status">
          Eingereicht. DISKOE prüft den Entwurf. Veröffentlicht wird erst nach
          der Freigabe und deiner Bestätigung.
        </p>
      ) : null}

      {imageMissingPublicly ? (
        <section aria-labelledby="retry-heading" className="space-y-3">
          <h2 id="retry-heading" className="text-xl font-semibold">
            Bild noch nicht öffentlich
          </h2>
          <RetryImageForm action={retryImagePublish.bind(null, profileId)} />
        </section>
      ) : null}
    </main>
  );
}
