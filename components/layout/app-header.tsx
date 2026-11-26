import Link from "next/link";

import type { Lang } from "@/lib/i18n";

import { LanguageSwitch } from "./language-switch";
import { SignOutForm } from "./sign-out-form";

// DISKOE / App Header (Figma 2980:8182). Wordmark left; language switch and,
// when signed in, "Sign out" right. Desktop 76 px high, mobile 60 px.
export function AppHeader({
  lang,
  signedIn = false,
  homeHref = "/",
  extra,
}: {
  lang: Lang;
  signedIn?: boolean;
  homeHref?: string;
  extra?: React.ReactNode;
}) {
  return (
    <header className="flex h-15 items-center justify-between px-4 min-[360px]:px-6 md:h-19 md:px-12">
      <Link
        href={homeHref}
        className="text-foreground focus-visible:outline-ring flex min-h-11 items-center text-[22px] leading-[26px] font-bold tracking-[1.32px] focus-visible:outline-2 focus-visible:outline-offset-2 md:text-[28px] md:tracking-[1.68px]"
      >
        DISKOE
      </Link>
      <div className="flex items-center gap-2">
        {extra}
        <LanguageSwitch lang={lang} />
        {signedIn ? <SignOutForm lang={lang} /> : null}
      </div>
    </header>
  );
}
