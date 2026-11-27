"use client";

import { useActionState } from "react";

import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { t, type Lang } from "@/lib/i18n";

export type RetryImageState = { status: "idle" } | { status: "failed" };

// "Bild noch einmal veröffentlichen" (NACH-18): the event is live, only the
// public copy of the flyer is missing. Trying again is safe to repeat. When it
// works the page loads again without this notice.
export function RetryImageForm({
  lang,
  action,
}: {
  lang: Lang;
  action: (previous: RetryImageState) => Promise<RetryImageState>;
}) {
  const [state, formAction, pending] = useActionState(action, {
    status: "idle",
  } as RetryImageState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Notice tone="warning" title={t(lang, "Z36.image.title")}>
        {t(lang, "Z36.image.line")}
      </Notice>
      {state.status === "failed" ? (
        <Notice tone="error" title={t(lang, "Z36.image.fail")} />
      ) : null}
      <div>
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
        >
          {pending ? t(lang, "Z36.image.pending") : t(lang, "Z36.image.retry")}
        </button>
      </div>
    </form>
  );
}
