"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";

import type { SubmitState } from "@/app/(organizer)/organizer/profiles/[profileId]/submit/actions";
import { buttonClass } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Notice } from "@/components/ui/notice";
import { t, type Lang } from "@/lib/i18n";

type Action = (
  previous: SubmitState,
  formData: FormData,
) => Promise<SubmitState>;

const INITIAL: SubmitState = { status: "idle" };

// The two confirmations before profile (and first event) go to DISKOE (Figma
// EIN-02a to 02e). Both ticks are needed; the server checks them again and the
// database refuses anything else. The ticks stay as they are after an error.
// The wording is a draft: the legal check is open until the opening of the
// Alpha (docs/startpaket/12-zustandstexte.md, Z27.confirm.rights/usage).
export function ConfirmForm({
  lang,
  action,
  backHref,
  profileOnly,
}: {
  lang: Lang;
  action: Action;
  backHref: string;
  profileOnly: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const [rights, setRights] = useState(false);
  const [usage, setUsage] = useState(false);
  const missing = state.status === "missing" ? state : null;

  const notice = (() => {
    switch (state.status) {
      case "missing": {
        const line = !state.rights && !state.usage
          ? "Z27.err.confirm.both"
          : !state.rights
            ? "Z27.err.confirm.first"
            : "Z27.err.confirm.second";

        return (
          <Notice tone="error" title={t(lang, "Z27.err.confirm.title")}>
            {t(lang, line)}
          </Notice>
        );
      }
      case "failed":
        return (
          <Notice tone="error" title={t(lang, "Z27.err.submit.title")}>
            {t(lang, "Z27.err.submit.line")}
          </Notice>
        );
      case "changed":
        return (
          <Notice tone="error" title={t(lang, "Z27.err.changed.title")}>
            {t(lang, "Z27.err.changed.line")}
          </Notice>
        );
      case "gaps":
        return (
          <Notice tone="error" title={t(lang, "Z27.err.gaps.title")}>
            {t(lang, "Z27.err.gaps.line")}
          </Notice>
        );
      case "decided":
        return (
          <Notice tone="error" title={t(lang, "Z27.err.state.title")}>
            {t(lang, "Z27.err.state.line")}
          </Notice>
        );
      default:
        return null;
    }
  })();

  return (
    <form
      // Sent by hand, not as the form action: an action form is reset after
      // each call, which would clear both ticks after an error. The ticks stay
      // as they are (Figma EIN-02d).
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
      noValidate
      className="flex flex-col gap-10"
    >
      {notice}
      <input type="hidden" name="rights" value={rights ? "on" : ""} />
      <input type="hidden" name="usage" value={usage ? "on" : ""} />
      <fieldset className="flex flex-col">
        <legend className="mb-6 flex flex-col gap-1">
          <span className="text-foreground text-2xl leading-[30px] font-medium tracking-[-0.4px]">
            {t(lang, "Z27.confirm.heading")}
          </span>
          <span className="text-muted-foreground text-sm leading-5 font-normal">
            {t(
              lang,
              profileOnly
                ? "Z27.confirm.hintProfile"
                : "Z27.confirm.hint",
            )}
          </span>
        </legend>
        <div className="flex flex-col gap-2">
          <div className="flex min-h-11 items-start gap-3">
            <Checkbox
              id="confirm-rights"
              checked={rights}
              onCheckedChange={(value) => setRights(value === true)}
              aria-invalid={missing !== null && !rights}
              className="mt-1"
            />
            <label
              htmlFor="confirm-rights"
              className="text-base leading-6"
            >
              {t(lang, "Z27.confirm.rights")}
            </label>
          </div>
          <div className="flex min-h-11 items-start gap-3">
            <Checkbox
              id="confirm-usage"
              checked={usage}
              onCheckedChange={(value) => setUsage(value === true)}
              aria-invalid={missing !== null && !usage}
              className="mt-1"
            />
            <label
              htmlFor="confirm-usage"
              className="text-base leading-6"
            >
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
            ? t(lang, "Z27.confirm.pending")
            : t(
                lang,
                state.status === "failed"
                  ? "Z27.retry"
                  : "Z27.confirm.submit",
              )}
        </button>
        <Link
          href={backHref}
          className={buttonClass("ghostLg", "w-full md:w-auto")}
        >
          {t(lang, "Z27.confirm.back")}
        </Link>
      </div>
    </form>
  );
}
