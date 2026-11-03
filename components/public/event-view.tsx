import Link from "next/link";

import { buttonClass } from "@/components/ui/button";
import type { PublicEvent } from "@/lib/public/dto";
import { infoBars, type InfoBar } from "@/lib/public/info-bars";

import { BadgeEuroIcon, CircleHelpIcon } from "./icons";

import {
  AtmosphereTag,
  Band,
  Eyebrow,
  formatPublishedDate,
  FormatTag,
  ProfileImage,
  LegalFooter,
  SiteBar,
} from "./parts";

// Texts of the status variants (PUB-19, 23, 24). Proposals: the founder has not
// confirmed the wording of these yet.
const STATUS_NOTICE: Record<
  Exclude<PublicEvent["status"], "scheduled">,
  { title: string; text: string }
> = {
  rescheduled: {
    title: "Neuer Termin",
    text: "Dieses Event wurde verschoben. Der Termin unten ist der neue Termin.",
  },
  postponed_undated: {
    title: "Neuer Termin folgt",
    text: "Dieses Event wurde verschoben. Ein neuer Termin steht noch nicht fest.",
  },
  cancelled: {
    title: "Abgesagt",
    text: "Dieses Event findet nicht statt.",
  },
};

const BAR_ICON: Record<InfoBar["key"], React.ReactNode> = {
  entry: <BadgeEuroIcon />,
  accessibility: <CircleHelpIcon />,
};

const PAST_NOTICE = { title: "Vorbei", text: "Dieses Event ist vorbei." };

function ticketLabel(kind: string): string {
  return kind === "online_registration" ? "Zur Anmeldung ↗" : "Zum Ticketanbieter ↗";
}

export function EventView({ event }: { event: PublicEvent }) {
  const notice = event.past
    ? PAST_NOTICE
    : event.status === "scheduled"
      ? null
      : STATUS_NOTICE[event.status];
  const cancelled = event.status === "cancelled";
  const ticketRoute = event.ticketUrl
    ? event.access.find((route) => route.url === event.ticketUrl)
    : undefined;
  const confirmed = formatPublishedDate(event.publishedAt);
  const hasWhen = event.dateLine !== null;
  const hasPlace = event.placeName !== null || event.addressLines.length > 0;

  return (
    <main>
      <SiteBar back={{ href: `/${event.organizer.slug}`, label: event.organizer.name }} />

      <Band tone="surface" label="Event">
        {notice ? (
          <div
            role="status"
            className={`${cancelled ? "bg-error-subtle text-error" : event.past ? "bg-background text-foreground border-border border" : "bg-warning-subtle text-warning"} mb-6 flex flex-col gap-1 rounded-lg px-5 py-4`}
          >
            <p className="text-lg leading-6 font-bold">{notice.title}</p>
            <p className="text-base leading-6">{notice.text}</p>
          </div>
        ) : null}

        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <FormatTag format={event.format} label={event.formatLabel} />
              <h1 className="text-[40px] leading-[44px] font-bold tracking-[-0.8px] sm:text-[56px] sm:leading-[60px]">
                {event.title}
              </h1>
              <p className="text-base leading-6">
                Von{" "}
                <Link href={`/${event.organizer.slug}`} className="underline underline-offset-4">
                  {event.organizer.name} ↗
                </Link>
              </p>
            </div>

            {hasWhen ? (
              <div className="flex flex-col gap-5">
                <Eyebrow>{cancelled ? "War geplant für" : "Wann"}</Eyebrow>
                <p className="text-[32px] leading-[38px] font-bold tracking-[-0.8px]">
                  {event.dateLine}
                </p>
                <p className="text-2xl leading-[30px] font-medium tracking-[-0.4px]">
                  {event.timeLine}
                </p>
                <p className="text-muted-foreground text-sm leading-5">
                  {[event.untilLine, "Berliner Ortszeit"].filter(Boolean).join(" · ")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <Eyebrow>Wann</Eyebrow>
                <p className="text-[32px] leading-[38px] font-bold tracking-[-0.8px]">
                  Neuer Termin folgt
                </p>
              </div>
            )}

            {hasPlace ? (
              <div className="flex flex-col gap-5">
                <Eyebrow>Wo</Eyebrow>
                {event.placeName ? (
                  <p className="text-[32px] leading-[38px] font-bold tracking-[-0.8px]">
                    {event.placeName}
                  </p>
                ) : null}
                <address className="text-base leading-6 not-italic">
                  {event.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </div>
            ) : null}

            {!cancelled && (event.priceText || ticketRoute) ? (
              <div className="flex flex-col gap-5">
                {event.priceText ? (
                  <p className="text-2xl leading-[30px] font-medium tracking-[-0.4px]">
                    {event.priceText}
                  </p>
                ) : null}
                {event.access.length > 0 ? (
                  <p className="text-base leading-6">
                    {event.access.map((route) => route.label).join(" · ")}
                  </p>
                ) : null}
                {ticketRoute?.url ? (
                  <a
                    href={ticketRoute.url}
                    rel="noopener noreferrer nofollow"
                    className={buttonClass("primary", "min-h-11 w-full sm:w-fit sm:px-6")}
                  >
                    {ticketLabel(ticketRoute.kind)}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="bg-muted border-foreground flex min-h-[320px] items-center justify-center overflow-hidden border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.imageUrl}
              alt=""
              className={`${cancelled ? "opacity-60 grayscale" : ""} max-h-[640px] w-full object-contain`}
            />
          </div>
        </div>
      </Band>

      {event.description ? (
        <Band tone="ink" label="Beschreibung">
          <div className="flex max-w-[704px] flex-col gap-5">
            <h2 className="text-[32px] leading-[38px] font-bold tracking-[-0.8px]">
              Über das Event
            </h2>
            <p className="text-base leading-6 whitespace-pre-line">{event.description}</p>
          </div>
        </Band>
      ) : null}

      {event.atmosphereTags.length > 0 || event.atmosphereDescription ? (
        <Band tone="lavender" label="Atmosphäre">
          <div className="flex max-w-[704px] flex-col gap-5">
            <h2 className="text-[32px] leading-[38px] font-bold tracking-[-0.8px]">
              Wie es sich anfühlt
            </h2>
            {event.atmosphereDescription ? (
              <p className="text-base leading-6">{event.atmosphereDescription}</p>
            ) : null}
            <p className="text-sm leading-5">Atmosphäre nach Einschätzung des Veranstalters.</p>
            {event.atmosphereTags.length > 0 ? (
              <ul className="flex flex-wrap gap-3">
                {event.atmosphereTags.map((tag) => (
                  <li key={tag}>
                    <AtmosphereTag tag={tag} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Band>
      ) : null}

      <section aria-label="Gut zu wissen" className="border-foreground border-y">
        <div className="mx-auto flex w-full max-w-[1128px] flex-col gap-2 px-6 py-10 sm:px-8">
          <h2 className="text-[32px] leading-[35px] font-bold">Gut zu wissen</h2>
          <p className="text-muted-foreground text-[15px] leading-[21px]">
            Was ihr vor dem Besuch wissen wollt. Wir fragen es extra beim Veranstalter ab.
          </p>
        </div>
        <ul className="bg-foreground flex flex-col gap-px py-px">
          {infoBars(event).map((bar) => (
            <li key={bar.key} className="bg-secondary">
              <div className="mx-auto flex w-full max-w-[1128px] flex-col gap-2.5 px-6 py-[18px] sm:px-8">
                <p className="flex items-center gap-2.5 text-xs font-bold tracking-[1.2px] uppercase">
                  {BAR_ICON[bar.key]}
                  {bar.label}
                </p>
                <p className="text-[26px] leading-[29px] font-bold">{bar.value}</p>
                {bar.pills.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {bar.pills.map((pill) => (
                      <li
                        key={pill}
                        className="bg-brand-yellow border-foreground rounded-full border px-3.5 py-1.5 text-sm font-medium"
                      >
                        {pill}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {bar.detail ? (
                  <p className="max-w-[704px] text-[17px] leading-[20px] font-medium">
                    {bar.detail}
                  </p>
                ) : null}
                {bar.action ? (
                  <a href={bar.action.href} className={buttonClass("outline", "w-fit")}>
                    {bar.action.label}
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Band tone="ink" label="Veranstalter">
        <div className="flex max-w-[704px] flex-col gap-5">
          <Eyebrow>Veranstaltet von</Eyebrow>
          <ProfileImage url={event.organizer.imageUrl} size={64} />
          <p className="text-[32px] leading-[38px] font-bold tracking-[-0.8px]">
            {event.organizer.name}
          </p>
          {event.organizer.shortIntro ? (
            <p className="text-base leading-6">{event.organizer.shortIntro}</p>
          ) : null}
          <Link href={`/${event.organizer.slug}`} className="text-sm leading-5 font-medium underline underline-offset-4">
            Zum Profil ↗
          </Link>
        </div>
      </Band>

      <footer className="mx-auto w-full max-w-[1128px] px-6 py-8 sm:px-8">
        <p className="text-muted-foreground text-sm leading-5">
          Angaben von {event.organizer.name}
          {confirmed ? (
            <>
              <br />
              Zuletzt bestätigt am {confirmed}
            </>
          ) : null}
        </p>
      </footer>
      <LegalFooter />
    </main>
  );
}
