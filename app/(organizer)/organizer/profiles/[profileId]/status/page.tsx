import Link from "next/link";
import { redirect } from "next/navigation";

import { ProgressSteps, stateLabel } from "@/components/profile/status";
import { ReviewStatus } from "@/components/submit/review-status";
import { getLang } from "@/lib/i18n/server";
import { loadSubmitData } from "@/lib/submit/load";

export const dynamic = "force-dynamic";

// TODO(spec): texts are proposals (approved wireframes, 2026-10-27).
export default async function ProfileStatusPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const data = await loadSubmitData(
    profileId,
    `/organizer/profiles/${profileId}/status`,
  );
  const view = data.profile;
  const base = `/organizer/profiles/${profileId}`;
  const name = view.revision?.name || view.profile.slug;

  // In review for the first time: Figma PRF-01a and 01b. The question and the
  // live states below keep the older screen until their own slices.
  if (!view.live && view.status === "in_review") {
    return (
      <ReviewStatus
        lang={await getLang()}
        profileId={profileId}
        data={data}
      />
    );
  }

  // Drafts that are not waiting for anyone have their own pages.
  if (!view.live && (view.status === "incomplete" || view.status === "ready")) {
    redirect(view.status === "ready" ? `${base}/preview` : `${base}/edit`);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <Link href="/organizer" className="text-muted-foreground text-sm">
        ← Zurück zu deinen Profilen
      </Link>

      <header className="space-y-3">
        <p className="text-muted-foreground text-sm">
          {name} · {stateLabel(view.status, view.live)}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          {view.status === "question"
            ? "Wir haben eine Frage zu deinem Profil"
            : view.status === "in_review"
              ? "Dein Profil ist in Prüfung"
              : "Dein Profil ist veröffentlicht"}
        </h1>
        <ProgressSteps status={view.status} live={view.live} />
      </header>

      {view.status === "in_review" ? (
        <>
          <p className="text-lg leading-8">
            Danke! Wir schauen uns dein Profil so schnell wie möglich an.
          </p>
          <section className="bg-muted space-y-2 rounded-lg p-6">
            <h2 className="text-lg font-semibold">Du musst nichts tun</h2>
            <p className="leading-7">
              Wir schreiben dir per E-Mail, sobald wir fertig sind. Entweder ist
              dein Profil dann freigegeben und live, oder wir haben eine
              konkrete Frage.
            </p>
          </section>
          <section className="bg-muted space-y-2 rounded-lg p-6">
            <h2 className="text-lg font-semibold">Noch nicht öffentlich</h2>
            <p className="leading-7">
              Bis zur Freigabe sieht nur du dein Profil. Wenn du jetzt etwas
              änderst, beginnt die Prüfung mit dem neuen Stand von vorn.
            </p>
          </section>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`${base}/preview`}
              className="border-border rounded-md border px-5 py-2.5 font-medium"
            >
              Eingereichtes Profil ansehen
            </Link>
            <Link
              href={`${base}/edit`}
              className="border-border rounded-md border px-5 py-2.5 font-medium"
            >
              Zurückziehen und bearbeiten
            </Link>
          </div>
        </>
      ) : null}

      {view.status === "question" ? (
        <>
          <section
            aria-labelledby="question-heading"
            className="bg-muted space-y-3 rounded-lg p-6"
          >
            <h2 id="question-heading" className="text-sm font-medium">
              Frage von DISKOE
              {view.question
                ? ` · ${new Date(view.question.createdAt).toLocaleString(
                    "de-DE",
                    { timeZone: "Europe/Berlin", dateStyle: "long", timeStyle: "short" },
                  )} Uhr`
                : ""}
            </h2>
            <p className="text-lg leading-8 whitespace-pre-line">
              {view.question ? `„${view.question.message}“` : ""}
            </p>
          </section>
          <section className="bg-muted space-y-2 rounded-lg p-6">
            <h2 className="text-lg font-semibold">Das ist keine Absage</h2>
            <p className="leading-7">
              Dein Profil bleibt privat, bis die Frage geklärt ist. Danach
              schaust du dir den neuen Stand an und reichst ihn erneut ein.
            </p>
          </section>
          <p className="leading-7">
            So geht es weiter: <strong>1.</strong> Angabe korrigieren.{" "}
            <strong>2.</strong> Vorschau ansehen. <strong>3.</strong> Erneut
            einreichen. Alles andere bleibt, wie du es eingereicht hast.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`${base}/edit`}
              className="bg-primary text-primary-foreground rounded-md px-5 py-2.5 font-medium"
            >
              Angabe korrigieren
            </Link>
            <Link
              href={`${base}/preview`}
              className="border-border rounded-md border px-5 py-2.5 font-medium"
            >
              Eingereichten Stand ansehen
            </Link>
          </div>
        </>
      ) : null}

      {view.live && view.status !== "in_review" && view.status !== "question" ? (
        <>
          <p className="text-lg leading-8">
            DISKOE hat dein Profil freigegeben. Es ist veröffentlicht.
          </p>
          <section className="bg-muted space-y-2 rounded-lg p-6">
            <h2 className="text-lg font-semibold">Du behältst die Kontrolle</h2>
            <p className="leading-7">
              Weitere Änderungen bleiben privat. Erst deine Bestätigung ändert
              die öffentliche Fassung.
            </p>
          </section>
          <p className="text-muted-foreground text-sm">
            Die öffentliche Profilseite selbst wird in einem nächsten Schritt
            gebaut.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`${base}/edit`}
              className="border-border rounded-md border px-5 py-2.5 font-medium"
            >
              Profil bearbeiten
            </Link>
            {view.status === "update_ready" ? (
              <Link
                href={`${base}/preview`}
                className="bg-primary text-primary-foreground rounded-md px-5 py-2.5 font-medium"
              >
                Änderungen ansehen und veröffentlichen
              </Link>
            ) : null}
          </div>
        </>
      ) : null}
    </main>
  );
}
