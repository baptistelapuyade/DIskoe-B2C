import Link from "next/link";

import { NewEventForm } from "@/components/event/forms";
import { requireOwner } from "@/lib/auth/server";

import { createEvent } from "../actions";

export const dynamic = "force-dynamic";

// TODO(spec): texts are proposals (no Figma screen for the first step).
export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ profile?: string }>;
}) {
  const access = await requireOwner("/organizer/events/new");
  const { profile: requested } = await searchParams;
  const chosen =
    access.profiles.find((profile) => profile.id === requested) ??
    (access.profiles.length === 1 ? access.profiles[0] : null);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <header className="space-y-3">
        <Link href="/organizer" className="text-muted-foreground text-sm">
          ← Zurück
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Event anlegen</h1>
        <p className="text-muted-foreground">
          Das Event bleibt ein privater Entwurf, bis es geprüft und
          veröffentlicht wird.
        </p>
      </header>

      {chosen ? (
        <NewEventForm action={createEvent} profileId={chosen.id} />
      ) : (
        <section aria-labelledby="choose-heading" className="space-y-3">
          <h2 id="choose-heading" className="text-xl font-semibold">
            Für welches Profil?
          </h2>
          <ul className="space-y-2">
            {access.profiles.map((profile) => (
              <li key={profile.id}>
                <Link
                  href={`/organizer/events/new?profile=${profile.id}`}
                  className="underline"
                >
                  {profile.draftName ?? profile.slug}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
