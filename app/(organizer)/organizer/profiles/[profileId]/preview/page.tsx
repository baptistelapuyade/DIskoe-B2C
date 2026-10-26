import Link from "next/link";
import { SubmitForm } from "@/components/profile/forms";
import { GapList, ProfileNav, STATUS_LABEL } from "@/components/profile/status";
import { loadOwnerProfileView } from "@/lib/profile/load";

import { submitForReview } from "../actions";

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
      ) : view.status === "in_review" ? (
        <p role="status">
          Eingereicht. DISKOE prüft den Entwurf. Veröffentlicht wird erst nach
          der Freigabe und deiner Bestätigung.
        </p>
      ) : null}
    </main>
  );
}
