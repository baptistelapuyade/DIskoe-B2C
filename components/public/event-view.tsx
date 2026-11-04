import Link from "next/link";

import { buttonClass } from "@/components/ui/button";
import type { PublicEvent } from "@/lib/public/dto";
import { infoBars, type InfoBar } from "@/lib/public/info-bars";
import { routeHref } from "@/lib/public/route-link";
import { siteUrl } from "@/lib/public/site";

import { BadgeEuroIcon, CircleHelpIcon } from "./icons";
import { ShareButton } from "./share-button";

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

// Texts of the status variants (PUB-19, 23, 24). Wording confirmed by the
// founder on 2026-11-03 (the Figma originals were overwritten on 2026-11-02).
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
  const routeUrl = routeHref(event.placeName, event.addressLines);
  const shareUrl = `${siteUrl()}/e/${event.slug}`;

  return (
    <main>
      <SiteBar wide back={{ href: `/${event.organizer.slug}`, label: event.organizer.name }} />

      <Band tone="neutral100" label="Event" wide>
        {notice ? (
          <div
            role="status"
            className={`${cancelled ? "bg-error-subtle text-error" : event.past ? "bg-background text-foreground border-border border" : "bg-warning-subtle text-warning"} mb-6 flex flex-col gap-1 rounded-lg px-5 py-4`}
          >
            <p className="text-lg leading-6 font-bold">{notice.title}</p>
            <p className="text-base leading-6">{notice.text}</p>
          </div>
        ) : null}

        {/* PUB-01: flyer left, information right (lg). On small screens the
            order is identity, flyer, information. */}
        <div className="grid gap-6 lg:grid-cols-[5fr_8fr] lg:items-start lg:gap-x-16 lg:gap-y-7">
          <div className="flex flex-col gap-3 lg:col-start-2 lg:row-start-1">
            <FormatTag format={event.format} label={event.formatLabel} />
            <h1 className="text-[40px] leading-[44px] font-bold tracking-[-0.8px] lg:text-[56px] lg:leading-[60px] lg:tracking-[-1.5px]">
              {event.title}
            </h1>
            <p className="text-base leading-6">
              Von{" "}
              <Link href={`/${event.organizer.slug}`} className="underline underline-offset-4">
                {event.organizer.name} ↗
              </Link>
            </p>
          </div>

          <div className="flex h-[428px] w-full items-center justify-center overflow-hidden lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:h-[600px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.imageUrl}
              alt=""
              className={`${cancelled ? "opacity-60 grayscale" : ""} h-full w-full object-contain`}
            />
          </div>

          <div className="flex flex-col gap-6 lg:col-start-2 lg:row-start-2 lg:gap-7">
            <div className="grid gap-6 md:grid-cols-[minmax(0,352fr)_minmax(0,384fr)] md:gap-8">
              {hasWhen ? (
                <div className="flex flex-col gap-2">
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
                <div className="flex flex-col gap-2">
                  <Eyebrow>Wann</Eyebrow>
                  <p className="text-[32px] leading-[38px] font-bold tracking-[-0.8px]">
                    Neuer Termin folgt
                  </p>
                </div>
              )}

              {hasPlace ? (
                <div className="flex flex-col gap-2">
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
                  {routeUrl ? (
                    <a
                      href={routeUrl}
                      rel="noopener noreferrer"
                      className="text-sm leading-5 font-medium underline underline-offset-4"
                    >
                      Route öffnen ↗
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-4">
              {!cancelled && (event.priceText || event.access.length > 0) ? (
                <div className="flex flex-col gap-2">
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
                </div>
              ) : null}

              <div className="flex w-full flex-col gap-3 sm:max-w-[336px]">
                {!cancelled && ticketRoute?.url ? (
                  <a
                    href={ticketRoute.url}
                    rel="noopener noreferrer nofollow"
                    className={buttonClass("primary", "min-h-11 w-full px-6")}
                  >
                    {ticketLabel(ticketRoute.kind)}
                  </a>
                ) : null}
                <div className="grid grid-cols-2 gap-3">
                  {/* "Merken" comes after the alpha: a visible placeholder so
                      it is not forgotten, without a function. */}
                  <button
                    type="button"
                    disabled
                    aria-describedby="merken-hint"
                    className={buttonClass("secondary", "w-full")}
                  >
                    Merken
                  </button>
                  <ShareButton url={shareUrl} title={event.title} />
                </div>
                <p id="merken-hint" className="text-muted-foreground text-sm leading-5">
                  „Merken“ kommt nach der Alpha.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Band>

      {event.description || event.atmosphereTags.length > 0 || event.atmosphereDescription ? (
        <section
          aria-label="Beschreibung und Atmosphäre"
          className="border-foreground flex flex-col border-y lg:flex-row"
        >
          {event.description ? (
            <div className="bg-neutral-800 text-background border-foreground flex flex-col gap-5 px-6 py-8 lg:flex-[560] lg:border-r lg:px-10 lg:py-12">
              <h2 className="text-[32px] leading-[38px] font-bold tracking-[-0.8px] lg:text-[40px] lg:leading-[44px]">
                Über das Event
              </h2>
              <p className="text-base leading-6 whitespace-pre-line">{event.description}</p>
            </div>
          ) : null}

          {event.atmosphereTags.length > 0 || event.atmosphereDescription ? (
            <div className="bg-brand-lavender text-foreground flex flex-col gap-5 px-6 py-8 lg:flex-[464] lg:px-10 lg:py-12">
              <h2 className="text-[32px] leading-[38px] font-bold tracking-[-0.8px] lg:text-[40px] lg:leading-[44px]">
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
          ) : null}
        </section>
      ) : null}

      <section aria-label="Gut zu wissen">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-6 pt-10 pb-6 sm:px-8 lg:px-16 lg:pt-16 lg:pb-9">
          <h2 className="text-[32px] leading-[35px] font-bold lg:text-[40px] lg:leading-[44px]">
            Gut zu wissen
          </h2>
          <p className="text-muted-foreground text-[15px] leading-[21px] lg:text-lg lg:leading-[25px]">
            Was ihr vor dem Besuch wissen wollt. Wir fragen es extra beim Veranstalter ab.
          </p>
        </div>
        <ul className="bg-foreground flex flex-col gap-px py-px mb-10 lg:mb-16">
          {infoBars(event).map((bar) => (
            <li key={bar.key} className="bg-secondary">
              <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2.5 px-6 py-[18px] sm:px-8 lg:flex-row lg:items-center lg:gap-7 lg:px-16 lg:py-[22px]">
                <p className="flex items-center gap-2.5 text-xs font-bold tracking-[1.2px] uppercase lg:w-[210px] lg:shrink-0 lg:text-[13px] lg:tracking-[1.3px]">
                  {BAR_ICON[bar.key]}
                  {bar.label}
                </p>
                <p className="text-[26px] leading-[29px] font-bold lg:leading-[33px]">
                  {bar.value}
                </p>
                {bar.pills.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {bar.pills.map((pill) => (
                      <li
                        key={pill}
                        className="bg-brand-yellow border-foreground rounded-full border px-3.5 py-1.5 text-sm font-medium lg:px-[18px] lg:py-2 lg:text-base"
                      >
                        {pill}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {bar.detail ? (
                  <p className="text-[17px] leading-5 font-medium lg:ml-auto lg:max-w-[440px] lg:text-right lg:leading-[22px]">
                    {bar.detail}
                  </p>
                ) : null}
                {bar.action ? (
                  <a href={bar.action.href} className={buttonClass("outline", "w-fit lg:shrink-0")}>
                    {bar.action.label}
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Band tone="neutral900" label="Veranstalter" wide>
        <div className="flex max-w-[720px] flex-col gap-4 lg:gap-4">
          <Eyebrow>Veranstaltet von</Eyebrow>
          <ProfileImage url={event.organizer.imageUrl} size={64} />
          <p className="text-[32px] leading-[38px] font-bold tracking-[-0.8px] lg:text-[40px] lg:leading-[44px]">
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

      <footer className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8 lg:px-16 lg:py-16">
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
