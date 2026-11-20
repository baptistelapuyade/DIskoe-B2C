"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { buttonClass } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Notice } from "@/components/ui/notice";
import { t, type Lang, type MessageId } from "@/lib/i18n";

const MANY: Record<number, MessageId> = {
  1: "Z27.gaps.one",
  2: "Z27.gaps.two",
  3: "Z27.gaps.three",
};

// The checklist of Figma EIN-01a to 01e. The profile card is always there. The
// first event is part of the submission as long as its box is ticked; every
// gap in it is shown on its row and named in the banner. Unticking the box
// (or "Submit only the profile") leaves the event out: it stays a private
// draft (EIN-01d). Without an event there is no box (EIN-01c).
export function Checklist({
  lang,
  confirmHref,
  confirmProfileOnlyHref,
  previewHref,
  newEventHref,
  profileCard,
  eventCard,
  gapCount,
  gapText,
  firstGap,
}: {
  lang: Lang;
  confirmHref: string;
  confirmProfileOnlyHref: string;
  previewHref: string;
  newEventHref: string;
  profileCard: ReactNode;
  // null while the profile has no event.
  eventCard: ReactNode | null;
  // How many details of the event are missing, and their names in one text,
  // e.g. "Atmosphäre und Eventbild".
  gapCount: number;
  gapText: string;
  // The first missing detail: the name of the button and where it is added.
  firstGap: { label: string; href: string } | null;
}) {
  const hasEvent = eventCard !== null;
  const [includeEvent, setIncludeEvent] = useState(true);
  const withEvent = hasEvent && includeEvent;
  const gaps = withEvent ? gapCount : 0;
  const button = (variant: "primary" | "secondary") =>
    buttonClass(
      variant === "primary" ? "primaryLg" : "secondary",
      `w-full md:w-auto ${variant === "secondary" ? "shadow-sm" : ""}`,
    );

  let notice: ReactNode;

  if (!hasEvent) {
    notice = (
      <Notice tone="info" title={t(lang, "Z27.only.title")}>
        {t(lang, "Z27.only.lineNone")}
      </Notice>
    );
  } else if (!includeEvent) {
    notice = (
      <Notice tone="info" title={t(lang, "Z27.only.title")}>
        {t(lang, "Z27.only.lineDraft")}
      </Notice>
    );
  } else if (gaps > 0) {
    notice = (
      <Notice tone="error" title={t(lang, MANY[gaps] ?? "Z27.gaps.many")}>
        {t(lang, gaps === 1 ? "Z27.gaps.lineOne" : "Z27.gaps.lineMany", {
          names: gapText,
        })}
      </Notice>
    );
  } else {
    notice = (
      <Notice tone="success" title={t(lang, "Z27.ok.title")}>
        {t(lang, "Z27.ok.line")}
      </Notice>
    );
  }

  return (
    <div className="flex w-full max-w-[1032px] flex-col gap-10">
      {notice}
      <div className="flex flex-col gap-6">
        {profileCard}
        {hasEvent ? (
          <>
            <div className="flex flex-col gap-6">
              <div className="flex min-h-11 items-center gap-3">
                <Checkbox
                  id="include-event"
                  checked={includeEvent}
                  onCheckedChange={(value) => setIncludeEvent(value === true)}
                />
                <label htmlFor="include-event" className="text-base leading-6">
                  {t(lang, "Z27.event.include")}
                </label>
              </div>
              <p className="text-muted-foreground text-sm leading-5">
                {t(
                  lang,
                  includeEvent
                    ? "Z27.event.includeHint"
                    : "Z27.event.excludedHint",
                )}
              </p>
            </div>
            {includeEvent ? eventCard : null}
          </>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {gaps > 0 && firstGap ? (
          <>
            <Link href={firstGap.href} className={button("primary")}>
              {firstGap.label}
            </Link>
            <button
              type="button"
              onClick={() => setIncludeEvent(false)}
              className={button("secondary")}
            >
              {t(lang, "Z27.only.submit")}
            </button>
          </>
        ) : (
          <>
            <Link
              href={withEvent ? confirmHref : confirmProfileOnlyHref}
              className={button("primary")}
            >
              {t(lang, "Z27.next.confirm")}
            </Link>
            {hasEvent ? (
              <Link href={previewHref} className={button("secondary")}>
                {t(lang, "Z27.next.preview")}
              </Link>
            ) : (
              <Link href={newEventHref} className={button("secondary")}>
                {t(lang, "Z27.only.create")}
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
