import Link from "next/link";

import { buttonClass } from "@/components/ui/button";
import { GENRE_ID } from "@/lib/event/module-summary";
import { t, type Lang, type MessageId } from "@/lib/i18n";
import type { PublicEvent } from "@/lib/public/dto";
import { formatConfirmedDate } from "@/lib/public/format";
import { infoBars, type InfoBar } from "@/lib/public/info-bars";
import { routeHref } from "@/lib/public/route-link";
import { siteUrl } from "@/lib/public/site";

import {
  BadgeEuroIcon,
  CircleHelpIcon,
  ClockIcon,
  MessageCircleIcon,
  UserIcon,
} from "./icons";
import { ShareButton } from "./share-button";

import {
  AtmosphereTag,
  Band,
  Eyebrow,
  FormatTag,
  ProfileImage,
  LegalFooter,
  SiteBar,
} from "./parts";

// The status variants (PUB-01b to d, e). Wording confirmed by the founder on
// 2026-11-03; now in the catalog (Z34.notice.*).
const STATUS_NOTICE: Record<
  Exclude<PublicEvent["status"], "scheduled">,
  { title: MessageId; text: MessageId }
> = {
  rescheduled: {
    title: "Z34.notice.rescheduled.title",
    text: "Z34.notice.rescheduled.text",
  },
  postponed_undated: {
    title: "Z34.notice.postponed.title",
    text: "Z34.notice.postponed.text",
  },
  cancelled: {
    title: "Z34.notice.cancelled.title",
    text: "Z34.notice.cancelled.text",
  },
};

const PAST_NOTICE = {
  title: "Z34.notice.past.title",
  text: "Z34.notice.past.text",
} as const;

const BAR_ICON: Record<InfoBar["key"], React.ReactNode> = {
  doors: <ClockIcon />,
  window: <ClockIcon />,
  entry: <BadgeEuroIcon />,
  age: <UserIcon />,
  language: <MessageCircleIcon />,
  accessibility: <CircleHelpIcon />,
};

function ticketLabel(kind: string): MessageId {
  return kind === "online_registration"
    ? "Z34.event.register"
    : "Z34.event.ticket";
}

export function EventView({ lang, event }: { lang: Lang; event: PublicEvent }) {
  const notice = event.past
    ? PAST_NOTICE
    : event.status === "scheduled"
      ? null
      : STATUS_NOTICE[event.status];
  const cancelled = event.status === "cancelled";
  const ticketRoute = event.ticketUrl
    ? event.access.find((route) => route.url === event.ticketUrl)
    : undefined;
  const confirmed = formatConfirmedDate(
    lang,
    event.publishedAt,
    event.timezone,
  );
  const music = event.modules.music;
  const musicLines = [
    ...(music?.precision ? [music.precision] : []),
    ...(music && music.genres.length > 0
      ? [music.genres.map((genre) => t(lang, GENRE_ID[genre])).join(" · ")]
      : []),
  ];
  const hasWhen = event.dateLine !== null;
  const hasPlace = event.placeName !== null || event.addressLines.length > 0;
  const routeUrl = routeHref(event.placeName, event.addressLines);
  const shareUrl = `${siteUrl()}/e/${event.slug}`;

  return (
    <main>
      <SiteBar
        lang={lang}
        wide
        back={{ href: `/${event.organizer.slug}`, label: event.organizer.name }}
      />

      <Band tone="neutral100" label={t(lang, "Z34.event.label")} wide>
        {notice ? (
          <div
            role="status"
            className={`${cancelled ? "bg-error-subtle text-error" : event.past ? "bg-background text-foreground border-border border" : "bg-warning-subtle text-warning"} mb-6 flex flex-col gap-1 rounded-lg px-5 py-4`}
          >
            <p className="text-lg leading-6 font-bold">
              {t(lang, notice.title)}
            </p>
            <p className="text-base leading-6">{t(lang, notice.text)}</p>
          </div>
        ) : null}

        {/* PUB-01: flyer left, information right (lg). On small screens the
            order is identity, flyer, information. */}
        <div className="grid gap-6 lg:grid-cols-[5fr_8fr] lg:items-start lg:gap-x-16 lg:gap-y-7">
          <div className="flex flex-col gap-3 lg:col-start-2 lg:row-start-1">
            <FormatTag format={event.format} label={event.formatLabel} />
            <h1 className="text-[40px] leading-[44px] font-bold tracking-[-0.8px] [overflow-wrap:anywhere] lg:text-[56px] lg:leading-[60px] lg:tracking-[-1.5px]">
              {event.title}
            </h1>
            <p className="text-base leading-6">
              {t(lang, "Z34.event.by")}{" "}
              <Link
                href={`/${event.organizer.slug}`}
                className="-my-3 inline-block py-3 underline underline-offset-4"
              >
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
                  <Eyebrow>
                    {t(
                      lang,
                      cancelled ? "Z34.event.wasPlanned" : "Z34.event.when",
                    )}
                  </Eyebrow>
                  <p className="text-[32px] leading-[38px] font-bold tracking-[-0.8px] [overflow-wrap:anywhere]">
                    {event.dateLine}
                  </p>
                  <p className="text-2xl leading-[30px] font-medium tracking-[-0.4px]">
                    {event.timeLine}
                  </p>
                  <p className="text-muted-foreground text-sm leading-5">
                    {[event.untilLine, t(lang, "Z34.event.timezone")]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Eyebrow>{t(lang, "Z34.event.when")}</Eyebrow>
                  <p className="text-[32px] leading-[38px] font-bold tracking-[-0.8px] [overflow-wrap:anywhere]">
                    {t(lang, "Z34.event.dateTbd")}
                  </p>
                </div>
              )}

              {hasPlace ? (
                <div className="flex flex-col gap-2">
                  <Eyebrow>{t(lang, "Z34.event.where")}</Eyebrow>
                  {event.placeName ? (
                    <p className="text-[32px] leading-[38px] font-bold tracking-[-0.8px] [overflow-wrap:anywhere]">
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
                      className="inline-flex min-h-11 w-fit items-center text-sm leading-5 font-medium underline underline-offset-4"
                    >
                      {t(lang, "Z34.event.route")}
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
                    {t(lang, ticketLabel(ticketRoute.kind))}
                  </a>
                ) : null}
                {/* "Merken" is wave 3 (Figma PUB-01a): it comes back with the
                    saved list, not as a button without a function. */}
                <div className="grid gap-3">
                  <ShareButton
                    url={shareUrl}
                    title={event.title}
                    labels={{
                      share: t(lang, "Z34.share.button"),
                      copied: t(lang, "Z34.share.copied"),
                      failed: t(lang, "Z34.share.failed"),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Band>

      {event.description ||
      event.atmosphereTags.length > 0 ||
      event.atmosphereDescription ||
      musicLines.length > 0 ? (
        <section
          aria-label={t(lang, "Z34.event.sectionLabel")}
          className="border-foreground flex flex-col border-y lg:flex-row"
        >
          {event.description ? (
            <div className="text-background border-foreground flex flex-col gap-5 bg-neutral-800 px-6 py-8 lg:flex-[560] lg:border-r lg:px-10 lg:py-12">
              <h2 className="text-[32px] leading-[38px] font-bold tracking-[-0.8px] lg:text-[40px] lg:leading-[44px]">
                {t(lang, "Z34.event.about")}
              </h2>
              <p className="text-base leading-6 [overflow-wrap:anywhere] whitespace-pre-line">
                {event.description}
              </p>
            </div>
          ) : null}

          {event.atmosphereTags.length > 0 ||
          event.atmosphereDescription ||
          musicLines.length > 0 ? (
            <div className="bg-brand-lavender text-foreground flex flex-col gap-5 px-6 py-8 lg:flex-[464] lg:px-10 lg:py-12">
              <h2 className="text-[32px] leading-[38px] font-bold tracking-[-0.8px] lg:text-[40px] lg:leading-[44px]">
                {t(lang, "Z34.event.feel")}
              </h2>
              {musicLines.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-2xl leading-[30px] font-medium tracking-[-0.4px] uppercase">
                    {t(lang, "Z34.event.music")}
                  </p>
                  {musicLines.map((line) => (
                    <p key={line} className="text-base leading-6">
                      {line}
                    </p>
                  ))}
                </div>
              ) : null}
              {event.atmosphereDescription ? (
                <p className="text-base leading-6">
                  {event.atmosphereDescription}
                </p>
              ) : null}
              <p className="text-sm leading-5">
                {t(lang, "Z34.event.feel.note")}
              </p>
              {event.atmosphereTags.length > 0 ? (
                <ul className="flex flex-wrap gap-3">
                  {event.atmosphereTags.map((tag) => (
                    <li key={tag}>
                      <AtmosphereTag lang={lang} tag={tag} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <section aria-label={t(lang, "Z34.know.title")}>
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-6 pt-10 pb-6 sm:px-8 lg:px-16 lg:pt-16 lg:pb-9">
          <h2 className="text-[32px] leading-[35px] font-bold lg:text-[40px] lg:leading-[44px]">
            {t(lang, "Z34.know.title")}
          </h2>
          <p className="text-muted-foreground text-[15px] leading-[21px] lg:text-lg lg:leading-[25px]">
            {t(lang, "Z34.know.lead")}
          </p>
        </div>
        <ul className="bg-foreground mb-10 flex flex-col gap-px py-px lg:mb-16">
          {infoBars(lang, event).map((bar) => (
            <li key={bar.key} className="bg-secondary">
              <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2.5 px-6 py-[18px] sm:px-8 lg:flex-row lg:items-center lg:gap-7 lg:px-16 lg:py-[22px]">
                <p className="flex items-center gap-2.5 text-xs font-bold tracking-[1.2px] uppercase lg:w-[210px] lg:shrink-0 lg:text-[13px] lg:tracking-[1.3px]">
                  {BAR_ICON[bar.key]}
                  {bar.label}
                </p>
                <p className="text-[26px] leading-[29px] font-bold [overflow-wrap:anywhere] lg:leading-[33px]">
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
                  <a
                    href={bar.action.href}
                    className={buttonClass("outline", "w-fit lg:shrink-0")}
                  >
                    {bar.action.label}
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Band tone="neutral900" label={t(lang, "Z34.event.organizerLabel")} wide>
        <div className="flex max-w-[720px] flex-col gap-4 lg:gap-4">
          <Eyebrow>{t(lang, "Z34.event.organizerEyebrow")}</Eyebrow>
          <ProfileImage url={event.organizer.imageUrl} size={64} />
          <p className="text-[32px] leading-[38px] font-bold tracking-[-0.8px] [overflow-wrap:anywhere] lg:text-[40px] lg:leading-[44px]">
            {event.organizer.name}
          </p>
          {event.organizer.shortIntro ? (
            <p className="text-base leading-6">{event.organizer.shortIntro}</p>
          ) : null}
          <Link
            href={`/${event.organizer.slug}`}
            className="inline-flex min-h-11 w-fit items-center text-sm leading-5 font-medium underline underline-offset-4"
          >
            {t(lang, "Z34.event.profileLink")}
          </Link>
        </div>
      </Band>

      <footer className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8 lg:px-16 lg:py-16">
        <p className="text-muted-foreground text-sm leading-5">
          {t(lang, "Z34.event.source", { name: event.organizer.name })}
          {confirmed ? (
            <>
              <br />
              {t(lang, "Z34.event.confirmed", { date: confirmed })}
            </>
          ) : null}
        </p>
      </footer>
      <LegalFooter lang={lang} wide />
    </main>
  );
}
