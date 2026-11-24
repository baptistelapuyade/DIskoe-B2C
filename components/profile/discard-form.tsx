"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import { buttonClass } from "@/components/ui/button";
import { t, type Lang, type MessageId } from "@/lib/i18n";

type Texts = { yes: MessageId; pending: MessageId; no: MessageId };

const DEFAULT_TEXTS: Texts = {
  yes: "Z29.discard.yes",
  pending: "Z29.discard.pending",
  no: "Z29.discard.no",
};

function YesButton({
  lang,
  texts,
  primary,
}: {
  lang: Lang;
  texts: Texts;
  primary: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        primary
          ? buttonClass("primaryLg", "w-full md:w-auto")
          : buttonClass("secondary", "w-full shadow-sm md:w-auto")
      }
    >
      {t(lang, pending ? texts.pending : texts.yes)}
    </button>
  );
}

// The two buttons of "Discard the changes?" (Figma LPA-06a). The form posts to
// the server action; "No, keep it" is a link, so both work without scripts.
export function DiscardForm({
  lang,
  action,
  keepHref,
  texts = DEFAULT_TEXTS,
  yesFirst = false,
}: {
  lang: Lang;
  action: () => Promise<void>;
  keepHref: string;
  texts?: Texts;
  // The event frames (EVB-06a) put "discard" first and dark, "cancel" after
  // it as the quiet button; the profile frames do it the other way round.
  yesFirst?: boolean;
}) {
  return (
    <form
      action={action}
      className="flex flex-col gap-3 md:flex-row md:items-center"
    >
      {yesFirst ? <YesButton lang={lang} texts={texts} primary /> : null}
      <Link
        href={keepHref}
        className={
          yesFirst
            ? buttonClass("secondary", "w-full shadow-sm md:w-auto")
            : buttonClass("primaryLg", "w-full md:w-auto")
        }
      >
        {t(lang, texts.no)}
      </Link>
      {yesFirst ? null : (
        <YesButton lang={lang} texts={texts} primary={false} />
      )}
    </form>
  );
}
