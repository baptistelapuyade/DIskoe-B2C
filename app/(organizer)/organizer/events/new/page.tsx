import Link from "next/link";

import { ManualStartForm } from "@/components/event/manual-start-form";
import { LinkButton } from "@/components/ui/button";
import { ContextCard, MutedText, PageShell } from "@/components/ui/page-shell";
import { requireOwner } from "@/lib/auth/server";

import { createEvent } from "../actions";

export const dynamic = "force-dynamic";

// Figma "Eventstart — Material oder manuell" (2533:3824). Only "Manuell
// eingeben" is built. Text, flyer and link capture (AI) is a later slice with
// its own authorisation. The profile choice (several profiles) has no Figma
// screen; it stays a plain list.
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
    <PageShell
      topAction={
        <div className="flex w-full items-start justify-between gap-4">
          <LinkButton href="/organizer" variant="ghost">
            Zurück
          </LinkButton>
          {chosen ? (
            <ManualStartForm action={createEvent} profileId={chosen.id} />
          ) : null}
        </div>
      }
      context="DISKOE / Organizer-Einstieg"
      title="Was steht als Nächstes an?"
      subtitle="Legt einen privaten Entwurf an und gebt die Angaben selbst ein. Ihr prüft und ergänzt alles im Editor."
    >
      <div className="mt-6 flex max-w-[704px] flex-col gap-4">
        {chosen ? (
          <ContextCard title="Erfassung aus Flyer oder Text">
            <MutedText>
              Die automatische Erfassung aus Flyer, Text oder Link ist noch
              nicht freigeschaltet. Bis dahin tragt ihr die Angaben von Hand
              ein.
            </MutedText>
          </ContextCard>
        ) : (
          <section aria-labelledby="choose-heading" className="flex flex-col gap-3">
            <h2
              id="choose-heading"
              className="text-2xl leading-[30px] font-medium tracking-[-0.4px]"
            >
              Für welches Profil?
            </h2>
            <ul className="flex flex-col gap-2">
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
      </div>
    </PageShell>
  );
}
