import { requireAccess } from "@/lib/auth/server";
import type { PublicationState } from "@/lib/auth/guards";

// TODO(spec): texts are proposals until Figma screens for the organizer entry
// exist. There is deliberately no "create profile" action: profiles are
// provisioned by the founder.
const STATE_LABEL: Record<PublicationState, string> = {
  private: "Privat",
  published: "Veröffentlicht",
  withdrawn: "Zurückgezogen",
};

export default async function OrganizerHome() {
  const access = await requireAccess("/organizer");

  if (access.kind === "no_assignment") {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">
          Noch kein Organizer-Profil zugeordnet
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-8">
          Dein Konto ist angemeldet, aber noch keinem Organizer-Profil
          zugeordnet. Wenn du Zugriff erwartest, melde dich bei DISKOE.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Deine Profile</h1>
      <ul className="border-border mt-8 divide-y border-y">
        {access.profiles.map((profile) => (
          <li
            key={profile.id}
            className="flex items-center justify-between py-4"
          >
            <span className="font-medium">
              {profile.draftName ?? profile.slug}
            </span>
            <span className="text-muted-foreground text-sm">
              {STATE_LABEL[profile.publicationState]}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
