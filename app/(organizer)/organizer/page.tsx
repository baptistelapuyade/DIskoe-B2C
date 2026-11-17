import type { Metadata } from "next";
import Link from "next/link";

import { AreaCard, ProfileCard } from "@/components/home/profile-card";
import type { ProfileHomeData } from "@/components/home/profile-card";
import { AuthShell } from "@/components/layout/auth-shell";
import { LinkButton } from "@/components/ui/button";
import { requireAccess } from "@/lib/auth/server";
import { CONTACT_EMAIL } from "@/lib/contact";
import type { FirstEventState } from "@/lib/domain/home-state";
import { loadOwnerEvents } from "@/lib/event/load";
import { loadPublicationView } from "@/lib/event/publication";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerProfileView } from "@/lib/profile/load";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: `${t(lang, "Z22.home.title")} – DISKOE`,
    robots: { index: false, follow: false },
  };
}

// Start page of the organizer (Figma ORG-100 and ORG-103a to g). Profiles are
// provisioned by the founder; there is deliberately no "create profile" action
// before wave 2.
export default async function OrganizerHome() {
  const access = await requireAccess("/organizer");
  const lang = await getLang();

  if (access.kind === "no_assignment") {
    const heading = (
      <>
        <div className="flex flex-col gap-3">
          <p className="text-brand-iris text-[13px] leading-4 font-medium tracking-[0.08em] uppercase">
            {t(lang, "Z22.noProfile.eyebrow")}
          </p>
          <h1 className="text-foreground text-2xl leading-[30px] font-medium md:text-[32px] md:leading-[38px] md:font-bold">
            {t(lang, "Z22.noProfile.title")}
          </h1>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-base leading-6">
            {t(lang, "Z22.noProfile.lead")}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="focus-visible:outline-ring w-fit text-base leading-6 font-medium underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </>
    );

    // The founder has no profile of their own: the layout frames the page
    // with the header that carries the review link.
    return access.isFounder ? (
      <main className="mx-auto flex w-full max-w-[560px] flex-col gap-8 px-6 py-12">
        {heading}
      </main>
    ) : (
      <AuthShell lang={lang} step={2} signedIn>
        {heading}
      </AuthShell>
    );
  }

  const [views, allEvents] = await Promise.all([
    Promise.all(
      access.profiles.map((profile) =>
        loadOwnerProfileView(profile.id, "/organizer"),
      ),
    ),
    loadOwnerEvents(access.profiles.map((p) => p.id)),
  ]);
  // The list is newest first; the first event of a profile is its oldest.
  const oldestFirst = [...allEvents].reverse();

  const data: ProfileHomeData[] = await Promise.all(
    views.map(async (view) => {
      const events = oldestFirst
        .filter((event) => event.organizerId === view.profile.id)
        .map(({ id, title, published }) => ({ id, title, published }));
      let firstEvent: FirstEventState = "none";

      // Before the first publication the state of the first event decides
      // between "create the event" (103b) and "submit" (103c).
      if (!view.live && view.status === "ready" && events.length > 0) {
        const publication = await loadPublicationView(
          events[0].id,
          "/organizer",
        );
        firstEvent = publication.status === "ready" ? "ready" : "incomplete";
      }

      return { view, events, firstEvent };
    }),
  );

  // Events whose profile is being reviewed are view-only until the review
  // ends (flow map, ORG-103d). Until the event list (EVL-01) exists, the
  // interim list below applies this rule.
  const reviewByProfile = new Map(
    data.map((item) => [
      item.view.profile.id,
      !item.view.live &&
      (item.view.status === "in_review" || item.view.status === "question")
        ? item.view.status
        : null,
    ]),
  );

  const liveIds = data
    .filter((item) => item.view.live)
    .map((item) => item.view.profile.id);
  const newEventHref =
    liveIds.length === 1
      ? `/organizer/events/new?profile=${liveIds[0]}`
      : "/organizer/events/new";
  const showEvents =
    allEvents.length > 0 ||
    data.some(
      (item) =>
        item.view.live ||
        item.view.status === "in_review" ||
        item.view.status === "question",
    );

  return (
    <main
      data-surface="accent"
      className="mx-auto flex w-full max-w-[1128px] flex-col gap-10 px-4 pt-6 pb-6 md:gap-8 md:px-12 md:py-8"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl leading-[30px] font-bold md:text-[32px] md:leading-[38px]">
          {t(lang, data.length > 1 ? "Z22.home.titleMany" : "Z22.home.title")}
        </h1>
        <p className="text-muted-foreground text-base leading-6">
          {t(lang, "Z22.home.lead")}
        </p>
      </header>

      <ul className="flex flex-col gap-8">
        {data.map((item) => (
          <li key={item.view.profile.id} className="flex flex-col gap-6">
            <ul>
              <ProfileCard lang={lang} data={item} />
            </ul>
            <AreaCard lang={lang} data={item} eventsHref="#events" />
          </li>
        ))}
      </ul>

      {showEvents ? (
        <section
          id="events"
          aria-labelledby="events-heading"
          className="bg-background border-border flex flex-col gap-4 rounded-xl border px-6 py-6 md:px-8"
        >
          <h2 id="events-heading" className="text-lg leading-6 font-medium">
            {t(lang, "Z22.events.heading")}
          </h2>
          {allEvents.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {allEvents.map((event) => {
                const review = event.published
                  ? null
                  : (reviewByProfile.get(event.organizerId) ?? null);
                const target = event.published
                  ? "manage"
                  : review
                    ? "review"
                    : "edit";
                const state = event.published
                  ? t(lang, "Z22.events.published")
                  : review === "question"
                    ? t(lang, "Z22.events.question")
                    : review
                      ? t(lang, "Z22.events.inReview")
                      : t(lang, "Z22.events.draft");

                return (
                  <li key={event.id}>
                    <Link
                      href={`/organizer/events/${event.id}/${target}`}
                      className="underline"
                    >
                      {event.title ?? t(lang, "Z22.events.untitled")}
                    </Link>{" "}
                    <span className="text-muted-foreground text-sm">
                      · {state}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              {t(lang, "Z22.events.empty")}
            </p>
          )}
          {liveIds.length > 0 ? (
            <div>
              <LinkButton href={newEventHref} variant="ghostLg">
                {t(lang, "Z22.events.new")}
              </LinkButton>
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
