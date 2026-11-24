import Link from "next/link";

import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Pill } from "@/components/ui/pill";
import type { EventFilter, Page } from "@/lib/domain/event-list";
import type { RowDisplay } from "@/lib/event/list-display";
import { listHref } from "@/lib/event/list-href";
import { t, type Lang } from "@/lib/i18n";

// The parts of the event list (Figma EVL-01a to 01g). The page loads and
// decides; what is drawn lives here, so every state can be rendered without a
// database.

const secondary = buttonClass("secondary", "w-full shadow-sm md:w-auto");
const primary = buttonClass("primaryLg", "w-full md:w-auto");

// One card, one row per event: title, date and place, state, one action.
export function EventListCard({ rows }: { rows: readonly RowDisplay[] }) {
  return (
    <ul className="bg-card border-border flex w-full flex-col overflow-hidden rounded-xl border">
      {rows.map((row) => (
        <li
          key={row.id}
          className="border-border flex flex-col gap-4 border-t px-4 py-4 first:border-t-0 md:flex-row md:items-center md:justify-between md:gap-6 md:px-6"
        >
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-foreground text-base leading-6 font-medium break-words">
              {row.title}
            </p>
            <p className="text-muted-foreground text-sm leading-5 break-words">
              {row.line}
            </p>
            <div>
              <Pill tone={row.tone} dot={false}>
                {row.stateLabel}
              </Pill>
            </div>
          </div>
          <Link
            href={row.actionHref}
            aria-label={row.actionName}
            className={`${secondary} md:shrink-0`}
          >
            {row.actionLabel}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ListCount({ lang, page }: { lang: Lang; page: Page<unknown> }) {
  return (
    <p className="text-muted-foreground text-sm leading-5">
      {page.pages > 1
        ? t(lang, "Z30.count.many", {
            from: page.from,
            to: page.to,
            total: page.total,
          })
        : t(lang, "Z30.count.one", { to: page.to, total: page.total })}
    </p>
  );
}

const pagerLink =
  "text-foreground focus-visible:outline-ring inline-flex min-h-11 items-center gap-1 px-2 text-sm leading-5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2";
const pagerOff =
  "text-muted-foreground inline-flex min-h-11 items-center gap-1 px-2 text-sm leading-5";

// Only for more than one page (EVL-01g). The links keep search and filter.
export function ListPager({
  lang,
  page,
  query,
  filter,
}: {
  lang: Lang;
  page: Page<unknown>;
  query: string;
  filter: EventFilter;
}) {
  if (page.pages <= 1) return null;

  const prev = t(lang, "Z30.pager.prev");
  const next = t(lang, "Z30.pager.next");

  return (
    <nav
      aria-label={t(lang, "Z30.pager.nav")}
      className="flex items-center justify-between gap-4 md:justify-end md:gap-6"
    >
      {page.page > 1 ? (
        <Link
          href={listHref({ query, filter, page: page.page - 1 })}
          className={pagerLink}
          rel="prev"
        >
          <span aria-hidden="true">‹</span> {prev}
        </Link>
      ) : (
        <span className={pagerOff}>
          <span aria-hidden="true">‹</span> {prev}
        </span>
      )}
      <span
        className="text-muted-foreground text-sm leading-5"
        aria-current="page"
      >
        {t(lang, "Z30.pager.page", { page: page.page, pages: page.pages })}
      </span>
      {page.page < page.pages ? (
        <Link
          href={listHref({ query, filter, page: page.page + 1 })}
          className={pagerLink}
          rel="next"
        >
          {next} <span aria-hidden="true">›</span>
        </Link>
      ) : (
        <span className={pagerOff}>
          {next} <span aria-hidden="true">›</span>
        </span>
      )}
    </nav>
  );
}

function Card({
  title,
  narrow = false,
  children,
}: {
  title: string;
  // The empty state is a narrow card (Figma EVL-01b), "no match" a full one.
  narrow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`bg-card border-border flex w-full flex-col gap-4 rounded-xl border p-6 ${narrow ? "md:max-w-[560px]" : ""}`}
    >
      <h2 className="text-foreground text-2xl leading-[30px] font-medium tracking-[-0.4px]">
        {title}
      </h2>
      {children}
    </section>
  );
}

// EVL-01b: no event at all.
export function EmptyList({ lang, newHref }: { lang: Lang; newHref: string }) {
  return (
    <Card title={t(lang, "Z30.empty.title")} narrow>
      <p className="text-muted-foreground text-base leading-6">
        {t(lang, "Z30.empty.lead")}
      </p>
      <Link href={newHref} className={`${primary} md:w-fit`}>
        {t(lang, "Z30.empty.cta")}
      </Link>
    </Card>
  );
}

// EVL-01c: events exist, nothing matches search and filter.
export function NoMatch({
  lang,
  query,
  filter,
  resetHref,
}: {
  lang: Lang;
  query: string;
  filter: EventFilter;
  resetHref: string;
}) {
  const scope = t(lang, `Z30.noMatch.scope.${filter}`);

  return (
    <Card title={t(lang, "Z30.noMatch.title")}>
      <p className="text-muted-foreground text-base leading-6">
        {query.trim() !== ""
          ? t(lang, "Z30.noMatch.query", { query: query.trim(), scope })
          : t(lang, "Z30.noMatch.filter")}
      </p>
      <Link href={resetHref} className={`${secondary} md:w-fit`}>
        {t(lang, "Z30.noMatch.reset")}
      </Link>
    </Card>
  );
}

// EVL-01e: the list could not be loaded.
export function LoadError({
  lang,
  retryHref,
}: {
  lang: Lang;
  retryHref: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Notice tone="error" title={t(lang, "Z30.error.title")}>
        {t(lang, "Z30.error.line")}
      </Notice>
      <Link href={retryHref} className={`${primary} md:w-fit`}>
        {t(lang, "Z30.error.retry")}
      </Link>
    </div>
  );
}

// EVL-01f: while the list loads.
export function LoadingNote({ lang }: { lang: Lang }) {
  return (
    <p role="status" className="text-muted-foreground text-base leading-6">
      {t(lang, "Z30.loading")}
    </p>
  );
}

export function NewEventButton({ lang, href }: { lang: Lang; href: string }) {
  return (
    <Link href={href} className={`${primary} md:w-fit`}>
      {t(lang, "Z30.list.new")}
    </Link>
  );
}
