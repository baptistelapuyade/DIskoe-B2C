import type { Metadata } from "next";
import { redirect, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import {
  EmptyList,
  ListCount,
  ListPager,
  EventListCard,
  LoadError,
  LoadingNote,
  NewEventButton,
  NoMatch,
} from "@/components/event/event-list";
import { ListFilters } from "@/components/event/list-filters";
import { StepShell } from "@/components/profile/step-shell";
import { requireAccess } from "@/lib/auth/server";
import {
  buildListView,
  parseFilter,
  parsePage,
  type EventFilter,
  type ReviewHint,
} from "@/lib/domain/event-list";
import { loadEventRows } from "@/lib/event/list";
import { toRowDisplay } from "@/lib/event/list-display";
import { listHref } from "@/lib/event/list-href";
import { t, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerProfileView } from "@/lib/profile/load";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();

  return {
    title: `${t(lang, "Z30.list.title")} – DISKOE`,
    robots: { index: false, follow: false },
  };
}

type SearchParams = { q?: string; state?: string; page?: string };

// The owner's event list (Figma EVL-01a to 01g). Search, filter and page live
// in the address. The head and the filters draw at once; the list streams in
// behind a loading note (EVL-01f).
export default async function EventListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const access = await requireAccess("/organizer/events");

  if (access.kind !== "owner") redirect("/organizer");

  const params = await searchParams;
  const lang = await getLang();
  const query = (typeof params.q === "string" ? params.q : "").slice(0, 120);
  const filter = parseFilter(params.state);
  const page = parsePage(params.page);

  return (
    <StepShell
      lang={lang}
      backHref="/organizer"
      progress={false}
      wide
      eyebrow={t(lang, "Z30.list.eyebrow")}
      title={t(lang, "Z30.list.title")}
      lead={t(lang, "Z30.list.lead")}
    >
      <Suspense
        key={`${query}|${filter}|${page}`}
        fallback={
          <div className="flex flex-col gap-6">
            <Filters lang={lang} query={query} filter={filter} />
            <LoadingNote lang={lang} />
          </div>
        }
      >
        <Results
          lang={lang}
          profileIds={access.profiles.map((p) => p.id)}
          query={query}
          filter={filter}
          page={page}
        />
      </Suspense>
    </StepShell>
  );
}

function Filters({
  lang,
  query,
  filter,
}: {
  lang: Lang;
  query: string;
  filter: EventFilter;
}) {
  return (
    <ListFilters
      query={query}
      filter={filter}
      labels={{
        search: t(lang, "Z30.list.search.label"),
        placeholder: t(lang, "Z30.list.search.placeholder"),
        filter: t(lang, "Z30.list.filter.label"),
        options: {
          upcoming: t(lang, "Z30.filter.upcoming"),
          all: t(lang, "Z30.filter.all"),
          drafts: t(lang, "Z30.filter.drafts"),
          past: t(lang, "Z30.filter.past"),
        },
      }}
    />
  );
}

async function Results({
  lang,
  profileIds,
  query,
  filter,
  page,
}: {
  lang: Lang;
  profileIds: string[];
  query: string;
  filter: EventFilter;
  page: number;
}) {
  const here = listHref({ query, filter, page });

  try {
    const views = await Promise.all(
      profileIds.map((id) => loadOwnerProfileView(id, "/organizer/events")),
    );
    // Events whose profile is in review are view-only until the review ends
    // (flow map, ORG-103d).
    const review = new Map<string, ReviewHint>(
      views.map((view) => [
        view.profile.id,
        !view.live &&
        (view.status === "in_review" || view.status === "question")
          ? view.status
          : null,
      ]),
    );
    const live = views.filter((view) => view.live);
    const newHref =
      live.length === 1
        ? `/organizer/events/new?profile=${live[0].profile.id}`
        : "/organizer/events/new";
    const rows = await loadEventRows(profileIds, review);
    const view = buildListView(rows, { filter, query, page });

    if (view.empty) {
      return <EmptyList lang={lang} newHref={newHref} />;
    }

    // Filters, list and count sit close together (24 px); the button stands
    // apart (Figma EVL-01a).
    return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <Filters lang={lang} query={query} filter={filter} />
          {view.noMatch ? (
            <NoMatch
              lang={lang}
              query={query}
              filter={filter}
              resetHref={listHref({})}
            />
          ) : (
            <>
              <EventListCard
                rows={view.rows.map((r) => toRowDisplay(lang, r))}
              />
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <ListCount lang={lang} page={view.page} />
                <ListPager
                  lang={lang}
                  page={view.page}
                  query={query}
                  filter={filter}
                />
              </div>
            </>
          )}
        </div>
        {view.noMatch ? null : <NewEventButton lang={lang} href={newHref} />}
      </div>
    );
  } catch (error) {
    // A redirect or 404 from a guard is not a load error.
    unstable_rethrow(error);

    return (
      <div className="flex flex-col gap-6">
        <Filters lang={lang} query={query} filter={filter} />
        <LoadError lang={lang} retryHref={here} />
      </div>
    );
  }
}
