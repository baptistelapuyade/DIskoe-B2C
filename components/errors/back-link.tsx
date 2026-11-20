"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { buttonClass } from "@/components/ui/button";
import { t, type Lang } from "@/lib/i18n";

// "Back" at the top of the error screens (Figma ERR-01 to 05): one step back
// in the browser history; without a history (a link opened in a new tab) it
// leads to the start page.
export function BackLink({ lang, fallback }: { lang: Lang; fallback: string }) {
  const router = useRouter();

  return (
    <Link
      href={fallback}
      className={buttonClass("ghostLg")}
      onClick={(event) => {
        if (window.history.length > 1) {
          event.preventDefault();
          router.back();
        }
      }}
    >
      {t(lang, "Z20.back")}
    </Link>
  );
}
