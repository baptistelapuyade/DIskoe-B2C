"use client";

import Link from "next/link";

import { buttonClass } from "@/components/ui/button";
import { t } from "@/lib/i18n";

import { ErrorFrame, ErrorScreen } from "./error-screen";
import { useDocumentLang } from "./use-document-lang";

// "Something went wrong on our side" (Figma ERR-04). `reset` tries to render
// the page again. Inside the organizer area the layout brings header and
// footer; elsewhere `framed` adds them. The error itself is not shown: it
// can carry personal data. Monitoring has it already.
export function ServerError({
  reset,
  framed,
  homeHref,
}: {
  reset: () => void;
  framed: boolean;
  homeHref: string;
}) {
  const lang = useDocumentLang();
  const screen = (
    <ErrorScreen
      lang={lang}
      eyebrow={t(lang, "Z28.err.server.eyebrow")}
      title={t(lang, "Z28.err.server.title")}
      lead={t(lang, "Z28.err.server.lead")}
      backHref={homeHref}
    >
      <button
        type="button"
        onClick={reset}
        className={buttonClass("primaryLg", "w-full md:w-auto")}
      >
        {t(lang, "Z28.err.server.retry")}
      </button>
      <Link
        href={homeHref}
        className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
      >
        {t(lang, "Z28.err.home")}
      </Link>
    </ErrorScreen>
  );

  return framed ? <ErrorFrame lang={lang}>{screen}</ErrorFrame> : screen;
}
