"use client";

import { useState, useSyncExternalStore } from "react";

import { buttonClass, type ButtonVariant } from "@/components/ui/button";

// "Share profile" (ORG-103f): copies the public profile link. The link is the
// canonical profile address passed in by the page: no token, no personal data.
// Without JavaScript the button is not shown (an empty box keeps the layout).
// Texts come from the catalog via props, so this file carries no copy.

type State = "idle" | "copied" | "failed";

const noopSubscribe = () => () => {};

export function ShareProfile({
  url,
  label,
  copiedText,
  failedText,
  variant = "primaryLg",
}: {
  url: string;
  label: string;
  copiedText: string;
  failedText: string;
  variant?: ButtonVariant;
}) {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const [state, setState] = useState<State>("idle");

  if (!hydrated) return <div className="min-h-11" aria-hidden="true" />;

  async function share() {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={share}
        className={buttonClass(
          variant,
          variant === "secondary" ? "shadow-sm" : "",
        )}
      >
        {label}
      </button>
      <p role="status" className="text-sm leading-5 empty:hidden">
        {state === "copied" ? copiedText : state === "failed" ? failedText : ""}
      </p>
    </div>
  );
}
