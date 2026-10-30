import Link from "next/link";

import { ProfileCard } from "@/components/profile/home-card";
import { requireAccess } from "@/lib/auth/server";
import { loadOwnerEvents } from "@/lib/event/load";
import { loadOwnerProfileView } from "@/lib/profile/load";

export const dynamic = "force-dynamic";

// TODO(spec): texts are proposals (approved wireframes, 2026-10-27). There is
// deliberately no "create profile" action: profiles are provisioned by the
// founder.
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

  const views = await Promise.all(
    access.profiles.map((profile) =>
      loadOwnerProfileView(profile.id, "/organizer"),
    ),
  );

  const events = await loadOwnerEvents(access.profiles.map((p) => p.id));
  const newEventHref =
    access.profiles.length === 1
      ? `/organizer/events/new?profile=${access.profiles[0].id}`
      : "/organizer/events/new";

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Deine Profile</h1>
        <p className="text-muted-foreground max-w-2xl leading-7">
          Hier siehst du immer, was als Nächstes zu tun ist und was danach
          passiert.
        </p>
      </header>

      <ul className="space-y-6">
        {views.map((view) => (
          <ProfileCard key={view.profile.id} view={view} />
        ))}
      </ul>

      <section aria-labelledby="events-heading" className="space-y-4">
        <h2 id="events-heading" className="text-2xl font-bold tracking-tight">
          Deine Events
        </h2>
        {events.length > 0 ? (
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/organizer/events/${event.id}/${
                    event.published ? "manage" : "edit"
                  }`}
                  className="underline"
                >
                  {event.title ?? "Event ohne Titel"}
                </Link>{" "}
                <span className="text-muted-foreground text-sm">
                  · {event.published ? "Veröffentlicht" : "Entwurf – privat"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            Du hast noch kein Event angelegt.
          </p>
        )}
        <Link href={newEventHref} className="inline-block underline">
          Event anlegen
        </Link>
      </section>
    </main>
  );
}
