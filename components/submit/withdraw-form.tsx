"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import { buttonClass } from "@/components/ui/button";
import { t, type Lang } from "@/lib/i18n";

function YesButton({
  lang,
  failed,
}: {
  lang: Lang;
  failed: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        failed
          ? buttonClass("primaryLg", "w-full md:w-auto")
          : buttonClass("secondary", "w-full shadow-sm md:w-auto")
      }
    >
      {pending
        ? t(lang, "Z27.withdraw.pending")
        : t(lang, failed ? "Z27.retry" : "Z27.withdraw.yes")}
    </button>
  );
}

// The two buttons of "Withdraw the submission?" (Figma PRF-03a) and of the
// failed state (PRF-03c). The form posts to the server action; the buttons
// are links or one submit button, so it works without scripts as well.
export function WithdrawForm({
  lang,
  action,
  keepHref,
  failed,
}: {
  lang: Lang;
  action: () => Promise<void>;
  keepHref: string;
  failed: boolean;
}) {
  const keep = (
    <Link
      href={keepHref}
      className={
        failed
          ? buttonClass("ghostLg", "w-full md:w-auto")
          : buttonClass("primaryLg", "w-full md:w-auto")
      }
    >
      {t(lang, failed ? "Z27.submitted.back" : "Z27.withdraw.keep")}
    </Link>
  );

  return (
    <form action={action} className="flex flex-col gap-3 md:flex-row md:items-center">
      {failed ? (
        <>
          <YesButton lang={lang} failed />
          {keep}
        </>
      ) : (
        <>
          {keep}
          <YesButton lang={lang} failed={false} />
        </>
      )}
    </form>
  );
}
