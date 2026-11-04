"use client";

import { useState, useSyncExternalStore } from "react";

import { buttonClass } from "@/components/ui/button";

// "Teilen" (PUB-01). On phones the system share sheet opens; elsewhere the
// link is copied. The link is the canonical event address passed in by the
// page: no token, no personal data, no tracking. Without JavaScript the button
// is not shown (an empty box keeps the layout).

type State = "idle" | "copied" | "failed";

const noopSubscribe = () => () => {};

export function ShareButton({ url, title }: { url: string; title: string }) {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const [state, setState] = useState<State>("idle");

  if (!hydrated) return <div className="min-h-11" aria-hidden="true" />;

  async function share() {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch (error) {
      // Closing the share sheet is not an error.
      if (error instanceof DOMException && error.name === "AbortError") return;

      setState("failed");
    }
  }

  return (
    <>
      <button type="button" onClick={share} className={buttonClass("secondary", "w-full")}>
        Teilen
      </button>
      <p role="status" className="col-span-2 text-sm leading-5 empty:hidden">
        {state === "copied"
          ? "Link kopiert."
          : state === "failed"
            ? "Der Link konnte nicht kopiert werden."
            : ""}
      </p>
    </>
  );
}
