"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import { buttonClass } from "@/components/ui/button";
import { t, type Lang } from "@/lib/i18n";

function YesButton({ lang }: { lang: Lang }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
    >
      {t(lang, pending ? "Z29.discard.pending" : "Z29.discard.yes")}
    </button>
  );
}

// The two buttons of "Discard the changes?" (Figma LPA-06a). The form posts to
// the server action; "No, keep it" is a link, so both work without scripts.
export function DiscardForm({
  lang,
  action,
  keepHref,
}: {
  lang: Lang;
  action: () => Promise<void>;
  keepHref: string;
}) {
  return (
    <form
      action={action}
      className="flex flex-col gap-3 md:flex-row md:items-center"
    >
      <Link
        href={keepHref}
        className={buttonClass("primaryLg", "w-full md:w-auto")}
      >
        {t(lang, "Z29.discard.no")}
      </Link>
      <YesButton lang={lang} />
    </form>
  );
}
