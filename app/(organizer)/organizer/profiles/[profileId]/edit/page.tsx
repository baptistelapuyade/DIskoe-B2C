import Link from "next/link";
import { DetailsForm, ImageForm } from "@/components/profile/forms";
import { GapList, ProfileNav, stateLabel } from "@/components/profile/status";
import { loadOwnerProfileView } from "@/lib/profile/load";

import { saveDetails, uploadImage } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const view = await loadOwnerProfileView(
    profileId,
    `/organizer/profiles/${profileId}/edit`,
  );
  const { revision, image } = view;

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
      <header className="space-y-3">
        <Link href="/organizer" className="text-muted-foreground text-sm">
          ← Deine Profile
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Profil bearbeiten</h1>
        <p className="text-muted-foreground">
          {stateLabel(view.status, view.live)} ·{" "}
          {view.live
            ? "Änderungen bleiben privat, bis du sie selbst veröffentlichst."
            : "Alles hier bleibt privat, bis DISKOE dein Profil freigibt."}
        </p>
        <ProfileNav profileId={profileId} active="edit" />
      </header>

      {view.status === "in_review" ? (
        <p role="note" className="bg-[var(--warning-soft)] rounded-md p-4">
          Dein Profil ist in Prüfung. Wenn du jetzt etwas speicherst, ziehst du
          es zurück: Die Prüfung beginnt mit dem neuen Stand von vorn.
        </p>
      ) : null}

      {view.status === "question" ? (
        <p role="note" className="bg-[var(--warning-soft)] rounded-md p-4">
          Frage von DISKOE: „{view.question?.message}“ Korrigiere die Angabe
          und reiche das Profil danach erneut ein.
        </p>
      ) : view.latestQuestion ? (
        <p role="note" className="bg-[var(--warning-soft)] rounded-md p-4">
          Frage von DISKOE: „{view.latestQuestion.message}“ Wenn alles stimmt,
          reichst du das Profil auf der Vorschau-Seite erneut ein.
        </p>
      ) : null}

      <GapList gaps={view.gaps} />

      <section aria-labelledby="details-heading" className="space-y-4">
        <h2 id="details-heading" className="text-xl font-semibold">
          Angaben
        </h2>
        <DetailsForm
          action={saveDetails.bind(null, profileId)}
          slug={view.profile.slug}
          values={{
            name: revision?.name ?? "",
            shortIntro: revision?.shortIntro ?? "",
            officialUrl: revision?.officialUrl ?? "",
            publicContact: revision?.publicContact ?? "",
          }}
        />
      </section>

      <section aria-labelledby="image-heading" className="space-y-4">
        <h2 id="image-heading" className="text-xl font-semibold">
          Bild
        </h2>
        {image?.signedUrl ? (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.signedUrl}
              alt={image.altText ?? ""}
              className="max-h-64 rounded-md"
            />
            <figcaption className="text-muted-foreground mt-2 text-sm">
              Aktuelles Bild. Ein neues Bild ersetzt es im Entwurf.
            </figcaption>
          </figure>
        ) : null}
        <ImageForm action={uploadImage.bind(null, profileId)} />
      </section>
    </main>
  );
}
