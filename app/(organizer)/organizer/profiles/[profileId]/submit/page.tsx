import Link from "next/link";
import { redirect } from "next/navigation";

import { SubmitForm } from "@/components/profile/forms";
import { loadOwnerProfileView } from "@/lib/profile/load";

import { submitForReview } from "../actions";

export const dynamic = "force-dynamic";

// Interim screen: submit the profile without an event (ORG-06, second action).
// The submit screens EIN-01 and EIN-02 replace it in a later slice; until then
// this is the older text and form, moved here from the preview page.
export default async function SubmitProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const view = await loadOwnerProfileView(
    profileId,
    `/organizer/profiles/${profileId}/submit`,
  );
  const base = `/organizer/profiles/${profileId}`;

  if (view.status !== "ready") {
    redirect(`${base}/preview`);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <Link href={`${base}/preview`} className="text-muted-foreground text-sm">
        ← Vorschau
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Zur Prüfung einreichen</h1>
      <p className="text-muted-foreground">
        DISKOE prüft genau diesen Stand. Wenn du danach etwas änderst, beginnt
        die Prüfung mit dem neuen Stand von vorn.
      </p>
      <div className="bg-muted space-y-2 rounded-lg p-4">
        <h2 className="font-medium">So geht es weiter</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            DISKOE prüft dein Profil. Wir melden uns so schnell wie möglich und
            versuchen, jedes Profil noch am selben Tag zu prüfen.
          </li>
          <li>
            Du bekommst eine E-Mail: entweder die Freigabe oder eine konkrete
            Frage.
          </li>
          <li>
            Mit der Freigabe ist dein Profil sofort öffentlich. Du musst nichts
            weiter bestätigen.
          </li>
        </ol>
      </div>
      <SubmitForm action={submitForReview.bind(null, profileId)} />
    </main>
  );
}
