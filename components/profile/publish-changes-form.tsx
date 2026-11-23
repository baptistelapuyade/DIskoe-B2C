"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";

import type { PublishState } from "@/app/(organizer)/organizer/profiles/[profileId]/changes/actions";
import { buttonClass } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Notice } from "@/components/ui/notice";
import { t, type Lang } from "@/lib/i18n";

type Action = (
  previous: PublishState,
  formData: FormData,
) => Promise<PublishState>;

const INITIAL: PublishState = { status: "idle" };

// The two confirmations before changes to a live profile go public (Figma
// LPA-04a to 04c). The wording is the one of the first submission
// (Z27.confirm.rights/usage); the legal check of it is open until the opening
// of the Alpha. Both ticks are needed; the server checks them again and the
// database refuses anything else. The ticks stay as they are after an error.
export function PublishChangesForm({
  lang,
  action,
  backHref,
}: {
  lang: Lang;
  action: Action;
  backHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const [rights, setRights] = useState(false);
  const [usage, setUsage] = useState(false);
  const missing = state.status === "missing" ? state : null;

  return (
    <form
      // Sent by hand, not as the form action: an action form is reset after
      // each call, which would clear both ticks after an error.
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
      noValidate
      className="flex flex-col gap-10"
    >
      {state.status === "missing" ? (
        <Notice tone="error" title={t(lang, "Z29.publish.err.title")}>
          {t(lang, "Z29.publish.err.line")}
        </Notice>
      ) : null}
      {state.status === "failed" ? (
        <Notice tone="error" title={t(lang, "Z29.publish.fail.title")}>
          {t(lang, "Z29.publish.fail.line")}
        </Notice>
      ) : null}
      <input type="hidden" name="rights" value={rights ? "on" : ""} />
      <input type="hidden" name="usage" value={usage ? "on" : ""} />
      <fieldset className="flex flex-col">
        <legend className="sr-only">{t(lang, "Z27.confirm.heading")}</legend>
        <div className="flex flex-col">
          <div className="flex min-h-12 items-center gap-3">
            <Checkbox
              id="publish-rights"
              checked={rights}
              onCheckedChange={(value) => setRights(value === true)}
              aria-invalid={missing !== null && !rights}
              className="shrink-0"
            />
            <label htmlFor="publish-rights" className="text-base leading-6">
              {t(lang, "Z27.confirm.rights")}
            </label>
          </div>
          <div className="flex min-h-12 items-center gap-3">
            <Checkbox
              id="publish-usage"
              checked={usage}
              onCheckedChange={(value) => setUsage(value === true)}
              aria-invalid={missing !== null && !usage}
              className="shrink-0"
            />
            <label htmlFor="publish-usage" className="text-base leading-6">
              {t(lang, "Z27.confirm.usage")}
            </label>
          </div>
        </div>
      </fieldset>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primaryLg", "w-full md:w-auto")}
        >
          {pending
            ? t(lang, "Z29.publish.pending")
            : t(
                lang,
                state.status === "failed"
                  ? "Z29.publish.retry"
                  : "Z29.publish.go",
              )}
        </button>
        <Link
          href={backHref}
          className={buttonClass("ghostLg", "w-full md:w-auto")}
        >
          {t(lang, "Z29.publish.back")}
        </Link>
      </div>
    </form>
  );
}
