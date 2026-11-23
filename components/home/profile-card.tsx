import Link from "next/link";

import { ProgressSteps } from "@/components/layout/progress-steps";
import { Pill } from "@/components/ui/pill";
import { LinkButton } from "@/components/ui/button";
import {
  HOME_STEP_COUNT,
  homeState,
  type FirstEventState,
  type HomeKind,
} from "@/lib/domain/home-state";
import { splitQuestion } from "@/lib/domain/question-area";
import type { GapCode } from "@/lib/domain/profile-publication";
import { t, type Lang, type MessageId } from "@/lib/i18n";
import { siteUrl } from "@/lib/public/site";
import type { OwnerProfileView } from "@/lib/profile/load";

import { ShareProfile } from "./share-profile";

// Start page card of one profile (Figma ORG-103a to g). The state comes from
// `homeState`; this file only turns it into texts and actions. All copy is
// catalog text (Z22).

export type HomeEvent = {
  id: string;
  title: string | null;
  published: boolean;
};

export type ProfileHomeData = {
  view: OwnerProfileView;
  // This profile's events, oldest first.
  events: HomeEvent[];
  firstEvent: FirstEventState;
};

const STEP_IDS: readonly MessageId[] = [
  "Z22.step.profile",
  "Z22.step.event",
  "Z22.step.submit",
  "Z22.step.review",
  "Z22.step.live",
];

const GAP_IDS: Record<GapCode, MessageId> = {
  name: "Z22.gap.name",
  short_intro: "Z22.gap.shortIntro",
  link_or_contact: "Z22.gap.linkOrContact",
  profile_image: "Z22.gap.profileImage",
  revision_missing: "Z22.gap.revisionMissing",
};

type Action = {
  key: string;
  label: string;
  href: string;
  variant: "primaryLg" | "ghostLg";
};

export function homeData(data: ProfileHomeData) {
  const { view, events, firstEvent } = data;
  return homeState({
    status: view.status,
    live: view.live,
    gaps: view.gaps,
    firstEvent,
    hasPublishedEvent: events.some((event) => event.published),
  });
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? [parts[0], parts[parts.length - 1]]
      : [
          Array.from(parts[0] ?? "?")
            .slice(0, 2)
            .join(""),
        ];
  return letters
    .map((part) => Array.from(part)[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function listGaps(lang: Lang, gaps: readonly GapCode[]): string {
  const names = gaps.map((gap) => t(lang, GAP_IDS[gap]));
  return new Intl.ListFormat(lang, {
    style: "long",
    type: "conjunction",
  }).format(names);
}

function newEventHref(profileId: string): string {
  return `/organizer/events/new?profile=${profileId}`;
}

export function ProfileCard({
  lang,
  data,
}: {
  lang: Lang;
  data: ProfileHomeData;
}) {
  const { view, events, firstEvent } = data;
  const state = homeData(data);
  const base = `/organizer/profiles/${view.profile.id}`;
  const publicHref = `/${view.profile.slug}`;
  const name = view.revision?.name || view.profile.slug;
  const oldest = events[0];
  const kind: HomeKind = state.kind;

  let message: string;
  let hint: string | null = null;
  const actions: Action[] = [];
  let share = false;

  const edit: Action = {
    key: "edit",
    label: t(lang, "Z22.a.action"),
    href: `${base}/edit`,
    variant: "primaryLg",
  };
  const viewProfile = (href: string): Action => ({
    key: "view",
    label: t(lang, "Z22.b.view"),
    href,
    variant: "ghostLg",
  });

  switch (kind) {
    case "profile_in_progress":
      message = t(lang, "Z22.a.message", { gaps: listGaps(lang, view.gaps) });
      hint = t(lang, "Z22.a.hint");
      actions.push(edit);
      break;
    case "profile_done":
      message = t(lang, "Z22.b.message");
      hint = t(lang, "Z22.b.hint");
      actions.push(
        {
          key: "event",
          label: t(lang, "Z22.b.action"),
          href:
            firstEvent === "incomplete" && oldest
              ? `/organizer/events/${oldest.id}/edit`
              : newEventHref(view.profile.id),
          variant: "primaryLg",
        },
        viewProfile(`${base}/preview`),
      );
      break;
    case "ready_to_submit":
      message = t(lang, "Z22.c.message");
      hint = t(lang, "Z22.c.hint");
      actions.push({
        key: "submit",
        label: t(lang, "Z22.c.action"),
        href: `${base}/submit`,
        variant: "primaryLg",
      });
      break;
    case "in_review":
      message = t(lang, "Z22.d.message");
      hint = t(lang, "Z22.d.hint");
      actions.push({
        key: "status",
        label: t(lang, "Z22.d.action"),
        href: `${base}/status`,
        variant: "ghostLg",
      });
      break;
    case "question":
      message = view.question
        ? `„${splitQuestion(view.question.message).text}“`
        : t(lang, "Z22.e.fallback");
      hint = t(lang, "Z22.e.hint");
      actions.push({
        key: "correct",
        label: t(lang, "Z22.e.action"),
        href: `${base}/question`,
        variant: "primaryLg",
      });
      break;
    case "live":
      message = events.some((event) => event.published)
        ? t(lang, "Z22.f.message")
        : t(lang, "Z22.f.profileOnly");
      hint = t(lang, "Z22.f.hint");
      share = true;
      actions.push(
        {
          key: "new",
          label: t(lang, "Z22.f.newEvent"),
          href: newEventHref(view.profile.id),
          variant: "ghostLg",
        },
        viewProfile(publicHref),
      );
      break;
    case "live_changes":
      message = t(lang, "Z22.g.message");
      hint = t(lang, "Z22.g.hint");
      actions.push(
        {
          key: "publish",
          label: t(lang, "Z22.g.action"),
          href: `${base}/preview`,
          variant: "primaryLg",
        },
        viewProfile(publicHref),
      );
      break;
    case "live_incomplete":
      message = t(lang, "Z22.g.incomplete");
      hint = t(lang, "Z22.g.hint");
      actions.push(edit, viewProfile(publicHref));
      break;
  }

  const pills = (
    <>
      {kind === "profile_in_progress" ||
      kind === "profile_done" ||
      kind === "ready_to_submit" ? (
        <Pill tone="neutral">{t(lang, "Z22.pill.draft")}</Pill>
      ) : null}
      {kind === "in_review" ? (
        <Pill tone="info">{t(lang, "Z22.pill.review")}</Pill>
      ) : null}
      {kind === "question" ? (
        <Pill tone="warning">{t(lang, "Z22.pill.question")}</Pill>
      ) : null}
      {state.stage === HOME_STEP_COUNT - 1 ? (
        <Pill tone="success">{t(lang, "Z22.pill.live")}</Pill>
      ) : null}
      {state.hasUnpublishedChanges ? (
        <Pill tone="warning">{t(lang, "Z22.pill.changes")}</Pill>
      ) : null}
    </>
  );

  return (
    <li className="bg-background border-border flex flex-col gap-10 rounded-xl border px-6 py-7 md:flex-row md:gap-8 md:p-8">
      <div className="flex min-w-0 flex-col gap-4 md:w-[280px] md:shrink-0">
        <span
          aria-hidden="true"
          className="bg-brand-iris flex size-14 items-center justify-center rounded-lg text-lg font-medium text-white"
        >
          {initials(name)}
        </span>
        <h2 className="text-2xl leading-[30px] font-medium break-words">
          {name}
        </h2>
        <div className="flex flex-wrap gap-2">{pills}</div>
      </div>
      <div
        aria-hidden="true"
        className="bg-border hidden w-px self-stretch md:block"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <ProgressSteps
          lang={lang}
          labels={STEP_IDS.map((id) => t(lang, id))}
          current={state.stage}
          label={t(lang, "Z22.progress.label")}
        />
        <div className="flex flex-col gap-2">
          <p className="text-2xl leading-[30px] font-medium">{message}</p>
          {hint ? (
            <p className="text-muted-foreground text-sm leading-5">{hint}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:gap-3">
          {share ? (
            <ShareProfile
              url={`${siteUrl()}${publicHref}`}
              label={t(lang, "Z22.f.share")}
              copiedText={t(lang, "Z22.share.copied")}
              failedText={t(lang, "Z22.share.failed")}
            />
          ) : null}
          {actions.map((action) => (
            <LinkButton
              key={action.key}
              href={action.href}
              variant={action.variant}
              className="w-full md:w-auto"
            >
              {action.label}
            </LinkButton>
          ))}
        </div>
      </div>
    </li>
  );
}

// "Dein Bereich" (Figma ORG-103c to g): entry points next to the profile card.
// Events always (until the list page exists the row points to the list lower
// on this page); edit only once the profile is live. "Preise und Warteliste"
// follows with wave 4.
export function AreaCard({
  lang,
  data,
  eventsHref,
}: {
  lang: Lang;
  data: ProfileHomeData;
  eventsHref: string;
}) {
  const state = homeData(data);

  if (state.kind === "profile_in_progress" || state.kind === "profile_done") {
    return null;
  }

  const rows: { key: string; title: string; text: string; href: string }[] = [
    {
      key: "events",
      title: t(lang, "Z22.area.events.title"),
      text: t(lang, "Z22.area.events.text"),
      href: eventsHref,
    },
  ];

  if (data.view.live) {
    rows.push({
      key: "edit",
      title: t(lang, "Z22.area.edit.title"),
      text: t(lang, "Z22.area.edit.text"),
      href: `/organizer/profiles/${data.view.profile.id}/edit`,
    });
  }

  return (
    <section
      aria-labelledby={`area-${data.view.profile.id}`}
      className="bg-background border-border flex flex-col rounded-xl border"
    >
      <h2
        id={`area-${data.view.profile.id}`}
        className="px-6 pt-6 pb-3 text-lg leading-6 font-medium md:px-8"
      >
        {t(lang, "Z22.area.title")}
      </h2>
      <ul>
        {rows.map((row) => (
          <li key={row.key} className="border-border border-t">
            <Link
              href={row.href}
              className="focus-visible:outline-ring flex min-h-11 items-center justify-between gap-4 px-6 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 md:px-8 md:py-5"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-base leading-6 font-medium">
                  {row.title}
                </span>
                <span className="text-muted-foreground text-sm leading-5">
                  {row.text}
                </span>
              </span>
              <span aria-hidden="true" className="text-xl leading-6">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
