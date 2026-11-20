"use client";

import Link from "next/link";
import { useState } from "react";

import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { t, type Lang } from "@/lib/i18n";

type Target = "profile" | "event";
type State =
  { kind: "idle" } | { kind: "copied" } | { kind: "failed"; target: Target };

// The links of a profile that is live (Figma LIV-01a/b, LIV-02, LIV-03): copy
// the link of the profile and of the first event. The path is shown, the
// whole address is copied (the production domain is still open, so it is the
// address of this deployment). If the browser refuses to copy, the link is
// shown in a field to select by hand and the notice says so.
export function LiveLinks({
  lang,
  since,
  profile,
  event,
  nextEvent,
}: {
  lang: Lang;
  // "Fr, 7.11.2026, 16:40", or null.
  since: string | null;
  profile: { path: string; url: string };
  event: { title: string; path: string; url: string } | null;
  // Where "Create first event" leads (without a public event).
  nextEvent: string;
}) {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function copy(target: Target, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setState({ kind: "copied" });
    } catch {
      setState({ kind: "failed", target });
    }
  }

  const pill = since ? (
    <p className="bg-success-subtle text-success -mb-4 w-fit rounded-full px-4 py-2 text-base leading-6">
      {t(lang, "Z28.live.since", { date: since })}
    </p>
  ) : null;
  const primary = buttonClass("primaryLg", "w-full md:w-auto");
  const white = buttonClass("secondary", "w-full shadow-sm md:w-auto");

  if (state.kind === "failed") {
    const forEvent = state.target === "event" && event !== null;
    const link = forEvent ? event : profile;

    return (
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="error" title={t(lang, "Z28.live.failed.title")}>
          {t(lang, "Z28.live.failed.line")}
        </Notice>
        <div className="flex flex-col gap-2">
          <label htmlFor="live-link" className="text-sm leading-5 font-medium">
            {t(
              lang,
              forEvent ? "Z28.live.link.event" : "Z28.live.link.profile",
            )}
          </label>
          <input
            id="live-link"
            readOnly
            value={link.url}
            onFocus={(focused) => focused.currentTarget.select()}
            className="border-border-strong bg-background min-h-11 w-full rounded-lg border px-3 text-base leading-6"
          />
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <button
            type="button"
            className={primary}
            onClick={() => copy(forEvent ? "event" : "profile", link.url)}
          >
            {t(lang, "Z28.live.retry")}
          </button>
          <Link href={link.path} className={white}>
            {t(lang, forEvent ? "Z28.live.viewEvent" : "Z28.live.viewProfile")}
          </Link>
        </div>
      </div>
    );
  }

  const card = (
    title: string,
    link: { path: string; url: string },
    target: Target,
  ) => (
    <section className="bg-card border-border flex min-w-0 flex-1 flex-col gap-4 rounded-xl border p-6">
      <h2 className="text-foreground text-2xl leading-[30px] font-medium tracking-[-0.4px] break-words">
        {title}
      </h2>
      <p className="text-muted-foreground text-base leading-6 break-all">
        {link.path}
      </p>
      <button
        type="button"
        className={buttonClass(
          "primaryLg",
          event ? "w-full" : "w-full md:w-fit",
        )}
        onClick={() => copy(target, link.url)}
      >
        {t(lang, "Z28.live.copy")}
      </button>
    </section>
  );

  return (
    <div className="flex flex-col gap-10">
      {state.kind === "copied" ? (
        <Notice tone="success" title={t(lang, "Z28.live.copied.title")}>
          {t(lang, "Z28.live.copied.line")}
        </Notice>
      ) : null}
      {pill}
      <div className="flex flex-col gap-6 md:flex-row">
        <div className={event ? "contents" : "w-full max-w-[560px]"}>
          {card(t(lang, "Z28.live.profile"), profile, "profile")}
          {event ? card(event.title, event, "event") : null}
        </div>
      </div>
      {event ? null : (
        <section className="-mt-3.5 flex max-w-[560px] flex-col gap-1">
          <h2 className="text-2xl leading-[30px] font-medium tracking-[-0.4px]">
            {t(lang, "Z28.live.next.title")}
          </h2>
          <p className="text-muted-foreground text-sm leading-5">
            {t(lang, "Z28.live.next.line")}
          </p>
        </section>
      )}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {event ? null : (
          <Link href={nextEvent} className={primary}>
            {t(lang, "Z28.live.createEvent")}
          </Link>
        )}
        <Link href={profile.path} className={white}>
          {t(lang, "Z28.live.viewProfile")}
        </Link>
        {event ? (
          <Link href={event.path} className={white}>
            {t(lang, "Z28.live.viewEvent")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
