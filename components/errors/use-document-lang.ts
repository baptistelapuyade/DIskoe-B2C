"use client";

import { useSyncExternalStore } from "react";

import type { Lang } from "@/lib/i18n";

const noopSubscribe = () => () => {};

// The language of the page in an error boundary, which cannot read the cookie
// on the server: the root layout sets <html lang> from the language choice.
export function useDocumentLang(): Lang {
  return useSyncExternalStore(
    noopSubscribe,
    () => (document.documentElement.lang === "de" ? "de" : "en"),
    () => "en",
  );
}
