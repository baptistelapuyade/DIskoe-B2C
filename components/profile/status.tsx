import Link from "next/link";
import {
  PROGRESS_STEPS,
  describeGaps,
  progressStage,
  type GapCode,
  type ReviewStatus,
} from "@/lib/domain/profile-publication";

// TODO(spec): wording is a proposal (wireframes approved by the founder on
// 2026-10-27, no Figma screens yet).
export const STATUS_LABEL: Record<ReviewStatus, string> = {
  incomplete: "Entwurf – unvollständig",
  ready: "Bereit zum Einreichen",
  in_review: "In Prüfung",
  question: "Rückfrage von DISKOE",
  update_ready: "Änderungen bereit zum Veröffentlichen",
  published: "Veröffentlicht",
};

// What the owner sees as the headline for a profile, depending on the draft
// status and on whether something is already public.
export function stateLabel(status: ReviewStatus, live: boolean): string {
  if (live && status === "incomplete") return "Live – neue Fassung in Arbeit";
  if (live && status === "published") return "Live";
  return STATUS_LABEL[status];
}

export function ProfileNav({
  profileId,
  active,
}: {
  profileId: string;
  active: "edit" | "preview";
}) {
  const base = `/organizer/profiles/${profileId}`;
  const link = (key: "edit" | "preview", label: string) => (
    <Link
      href={`${base}/${key}`}
      aria-current={active === key ? "page" : undefined}
      className={
        active === key
          ? "border-foreground inline-flex min-h-11 items-end border-b-2 pb-2 font-medium"
          : "text-muted-foreground inline-flex min-h-11 items-end pb-2"
      }
    >
      {label}
    </Link>
  );

  return (
    <nav aria-label="Profil" className="border-border flex gap-6 border-b">
      {link("edit", "Bearbeiten")}
      {link("preview", "Vorschau")}
    </nav>
  );
}

export function GapList({ gaps }: { gaps: GapCode[] }) {
  if (gaps.length === 0) return null;

  return (
    <div className="bg-[var(--warning-soft)] rounded-md p-4" role="note">
      <p className="font-medium">Das fehlt noch:</p>
      <ul className="mt-2 list-disc pl-5">
        {describeGaps(gaps).map((gap) => (
          <li key={gap.code}>{gap.message}</li>
        ))}
      </ul>
    </div>
  );
}

// Angaben – Eingereicht – Geprüft – Live. Text is part of the markup so that
// the state is readable without colour or shapes.
export function ProgressSteps({
  status,
  live,
}: {
  status: ReviewStatus;
  live: boolean;
}) {
  const stage = progressStage(status, live);

  return (
    <ol
      aria-label="Fortschritt"
      className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
    >
      {PROGRESS_STEPS.map((step, index) => {
        const done = index < stage;
        const now = index === stage;

        return (
          <li
            key={step}
            aria-current={now ? "step" : undefined}
            className={now ? "text-foreground font-medium" : undefined}
          >
            <span aria-hidden="true">{done ? "● " : now ? "◉ " : "○ "}</span>
            {step}
            <span className="sr-only">
              {done ? " (erledigt)" : now ? " (jetzt)" : " (offen)"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
