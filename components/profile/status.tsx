import Link from "next/link";
import {
  describeGaps,
  type GapCode,
  type ReviewStatus,
} from "@/lib/domain/profile-publication";

// TODO(spec): wording is a proposal.
export const STATUS_LABEL: Record<ReviewStatus, string> = {
  incomplete: "Entwurf – unvollständig",
  ready: "Entwurf – bereit zum Einreichen",
  in_review: "In Prüfung",
  approved: "Freigegeben",
  published: "Veröffentlicht",
};

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
          ? "border-foreground border-b-2 pb-2 font-medium"
          : "text-muted-foreground pb-2"
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
