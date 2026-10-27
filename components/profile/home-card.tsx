import Link from "next/link";

import { describeGaps } from "@/lib/domain/profile-publication";
import type { OwnerProfileView } from "@/lib/profile/load";

import { ProgressSteps, stateLabel } from "./status";

type Next = {
  sentence: string;
  action: { label: string; href: string };
  after: string;
};

// One place for the "what is next and what happens afterwards" texts, so the
// start page never has to guess. TODO(spec): wording is a proposal
// (approved wireframes, 2026-10-27).
function nextStep(view: OwnerProfileView): Next {
  const base = `/organizer/profiles/${view.profile.id}`;

  switch (view.status) {
    case "incomplete":
      return view.live
        ? {
            sentence:
              "Dein Profil ist live. Deine neue Fassung ist noch nicht vollständig.",
            action: { label: "Angaben vervollständigen", href: `${base}/edit` },
            after:
              "Bis du sie veröffentlichst, bleibt der bisherige öffentliche Stand sichtbar.",
          }
        : {
            sentence: "Dir fehlen noch Angaben.",
            action: { label: "Angaben vervollständigen", href: `${base}/edit` },
            after:
              "Danach reichst du dein Profil zur Prüfung ein. Bis dahin sieht nur du es.",
          };
    case "ready":
      return {
        sentence:
          "Alles ist ausgefüllt. Schau dir die Vorschau an und reiche dein Profil ein.",
        action: {
          label: "Vorschau ansehen und einreichen",
          href: `${base}/preview`,
        },
        after: "DISKOE prüft dein Profil. Mit der Freigabe wird es öffentlich.",
      };
    case "in_review":
      return {
        sentence:
          "Danke! Wir schauen uns dein Profil so schnell wie möglich an. Du musst nichts tun.",
        action: { label: "Eingereichtes Profil ansehen", href: `${base}/status` },
        after:
          "Wir schreiben dir per E-Mail, sobald es freigegeben ist oder wir eine Frage haben.",
      };
    case "question":
      return {
        sentence: view.question
          ? `„${view.question.message}“`
          : "DISKOE hat eine Frage zu deinem Profil.",
        action: { label: "Angabe korrigieren", href: `${base}/status` },
        after:
          "Danach reichst du erneut ein. Das ist keine Absage. Bis dahin bleibt alles privat.",
      };
    case "update_ready":
      return {
        sentence: "Du hast Änderungen, die noch nicht öffentlich sind.",
        action: {
          label: "Vorschau ansehen und veröffentlichen",
          href: `${base}/preview`,
        },
        after:
          "Bis du sie veröffentlichst, bleibt der bisherige öffentliche Stand sichtbar.",
      };
    case "published":
      return {
        sentence: "Dein Profil ist veröffentlicht.",
        action: { label: "Profil bearbeiten", href: `${base}/edit` },
        after: "Änderungen bleiben privat, bis du sie selbst bestätigst.",
      };
  }
}

export function ProfileCard({ view }: { view: OwnerProfileView }) {
  const next = nextStep(view);
  const name = view.revision?.name || view.profile.slug;
  const showGaps = view.status === "incomplete";

  return (
    <li className="border-border space-y-4 rounded-lg border p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">{name}</h2>
        <span className="text-muted-foreground text-sm">
          {stateLabel(view.status, view.live)}
        </span>
      </div>

      <ProgressSteps status={view.status} live={view.live} />

      <p className="leading-7">{next.sentence}</p>

      {showGaps && view.gaps.length > 0 ? (
        <ul className="list-disc pl-5">
          {describeGaps(view.gaps).map((gap) => (
            <li key={gap.code}>{gap.message}</li>
          ))}
        </ul>
      ) : null}

      <div className="space-y-2">
        <Link
          href={next.action.href}
          className="bg-primary text-primary-foreground inline-block rounded-md px-5 py-2.5 font-medium"
        >
          {next.action.label}
        </Link>
        <p className="text-muted-foreground text-sm">{next.after}</p>
      </div>

      {view.live && view.status !== "published" ? (
        <p className="text-sm">
          <Link
            href={`/organizer/profiles/${view.profile.id}/status`}
            className="underline"
          >
            Stand deines veröffentlichten Profils
          </Link>
        </p>
      ) : null}
    </li>
  );
}
