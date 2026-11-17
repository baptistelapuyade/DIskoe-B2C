import Link from "next/link";

import type { PublicEvent, PublicProfile } from "@/lib/public/dto";

import { Band, Eyebrow, FormatTag, LegalFooter, ProfileImage, SiteBar } from "./parts";

const VISIBLE = 3;

function EventRow({ event, highlight }: { event: PublicEvent; highlight: boolean }) {
  const when =
    event.status === "postponed_undated"
      ? "Neuer Termin folgt"
      : [event.dateLine, event.timeLine].filter(Boolean).join(" · ");

  return (
    <li>
      <Link
        href={`/e/${event.slug}`}
        className={`${highlight ? "bg-brand-yellow" : "bg-background"} border-foreground flex flex-col gap-3 border p-5 hover:underline`}
      >
        <FormatTag format={event.format} label={event.formatLabel} />
        <span className="text-2xl leading-[30px] font-bold tracking-[-0.4px]">
          {event.title}
        </span>
        <span className="text-base leading-6">{when}</span>
        {event.status === "rescheduled" ? (
          <span className="text-sm leading-5 font-medium">Neuer Termin</span>
        ) : null}
        {event.placeName ? (
          <span className="text-muted-foreground text-sm leading-5">{event.placeName}</span>
        ) : null}
      </Link>
    </li>
  );
}

function ExternalLink({ url, label }: { url: string; label?: string }) {
  return (
    <a
      href={url}
      rel="noopener noreferrer nofollow"
      className="text-base leading-6 underline underline-offset-4"
    >
      {label ?? url.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
    </a>
  );
}

export function ProfileView({
  profile,
  events,
}: {
  profile: PublicProfile;
  events: PublicEvent[];
}) {
  const hasLinks = Boolean(
    profile.officialUrl ||
      profile.instagram ||
      profile.extraLinks.length > 0 ||
      profile.publicContact,
  );
  const shown = events.slice(0, VISIBLE);
  const more = events.slice(VISIBLE);

  return (
    <main>
      <SiteBar />

      <Band tone="surface" label="Veranstalter">
        <div className="flex max-w-[704px] flex-col gap-5">
          <Eyebrow>Veranstalter</Eyebrow>
          <ProfileImage url={profile.imageUrl} size={96} crop={profile.imageCrop} />
          <h1 className="text-[40px] leading-[44px] font-bold tracking-[-0.8px]">
            {profile.name}
          </h1>
          {profile.shortIntro ? (
            <p className="text-base leading-6 whitespace-pre-line">{profile.shortIntro}</p>
          ) : null}
        </div>
      </Band>

      <Band tone="paper" label="Kommende Events">
        <div className="flex max-w-[704px] flex-col gap-6">
          <h2 className="text-[32px] leading-[38px] font-bold tracking-[-0.8px]">
            Kommende Events
          </h2>
          {events.length === 0 ? (
            <p className="text-base leading-6">Neue Termine folgen.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-4">
                {shown.map((event, index) => (
                  <EventRow key={event.id} event={event} highlight={index === 0} />
                ))}
              </ul>
              {more.length > 0 ? (
                <details className="group flex flex-col gap-4">
                  <summary className="text-sm leading-5 font-medium underline underline-offset-4 cursor-pointer">
                    Mehr anzeigen ({more.length})
                  </summary>
                  <ul className="mt-4 flex flex-col gap-4">
                    {more.map((event) => (
                      <EventRow key={event.id} event={event} highlight={false} />
                    ))}
                  </ul>
                </details>
              ) : null}
            </>
          )}
        </div>
      </Band>

      {hasLinks ? (
        <Band tone="ink" label="Links und Kontakt">
          <div className="flex max-w-[704px] flex-col gap-4">
            <h2 className="text-[32px] leading-[38px] font-bold tracking-[-0.8px]">
              Links und Kontakt
            </h2>
            {profile.officialUrl ? <ExternalLink url={profile.officialUrl} /> : null}
            {profile.instagram ? (
              <a
                href={`https://www.instagram.com/${profile.instagram}/`}
                rel="noopener noreferrer nofollow"
                className="text-base leading-6 underline underline-offset-4"
              >
                Instagram @{profile.instagram} ↗
              </a>
            ) : null}
            {profile.extraLinks.map((link) => (
              <ExternalLink key={link.url} url={link.url} label={link.label} />
            ))}
            {profile.publicContact ? (
              <p className="text-base leading-6">{profile.publicContact}</p>
            ) : null}
          </div>
        </Band>
      ) : null}
      <LegalFooter />
    </main>
  );
}
