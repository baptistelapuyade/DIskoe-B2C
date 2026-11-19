import Link from "next/link";

import { EventStepScreen } from "@/components/event/step-screen";
import { PageShell } from "@/components/ui/page-shell";
import { requireOwner } from "@/lib/auth/server";
import { getLang } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// First event, step 1 (Figma EVT-01a): no draft exists until the first save
// ("Continue" or "Continue later"). Only the manual path is built; capture
// from a flyer, text or link (EVT-00) is wave 2. The choice between several
// profiles has no Figma screen; it stays a plain list.
export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ profile?: string }>;
}) {
  const access = await requireOwner("/organizer/events/new");
  const { profile: requested } = await searchParams;
  const lang = await getLang();
  const chosen =
    access.profiles.find((profile) => profile.id === requested) ??
    (access.profiles.length === 1 ? access.profiles[0] : null);

  if (chosen) {
    return (
      <EventStepScreen
        lang={lang}
        step="basics"
        eventId={null}
        profileId={chosen.id}
        backHref="/organizer"
        initial={{}}
      />
    );
  }

  return (
    <PageShell context="DISKOE / Organizer" title="Für welches Profil?">
      <ul className="mt-6 flex flex-col gap-2">
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
    </PageShell>
  );
}
