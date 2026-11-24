"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import { buttonClass } from "@/components/ui/button";
import { t, type Lang } from "@/lib/i18n";

function DiscardButton({ lang }: { lang: Lang }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClass("primaryLg", "w-full md:w-auto")}
    >
      {t(lang, pending ? "Z30.discard.pending" : "Z30.discard.yes")}
    </button>
  );
}

// The two buttons of "Discard the draft?" (Figma EVB-07a): the destructive
// action is the submit button and says what it does; "Cancel" is a link, so
// both work without scripts.
export function DiscardEventForm({
  lang,
  action,
  cancelHref,
}: {
  lang: Lang;
  action: () => Promise<void>;
  cancelHref: string;
}) {
  return (
    <form
      action={action}
      className="flex flex-col gap-3 md:flex-row md:items-center"
    >
      <DiscardButton lang={lang} />
      <Link
        href={cancelHref}
        className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
      >
        {t(lang, "Z30.discard.no")}
      </Link>
    </form>
  );
}
