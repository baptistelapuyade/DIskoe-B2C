import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { AppHeader } from "@/components/layout/app-header";
import type { Lang } from "@/lib/i18n";

import { BackLink } from "./back-link";

// The content of an error screen (Figma ERR-01 to 05): "Back", eyebrow, title,
// one explaining line and the actions. A 560 px column on the axis of the
// logo, like the steps of the organizer area.
export function ErrorScreen({
  lang,
  eyebrow,
  title,
  lead,
  backHref = "/",
  children,
}: {
  lang: Lang;
  eyebrow: string;
  title: string;
  lead: string;
  backHref?: string;
  children: ReactNode;
}) {
  return (
    <main
      data-surface="accent"
      className="flex w-full flex-col gap-6 px-6 pt-2 pb-6 md:px-12 md:pt-8 md:pb-8"
    >
      <div className="flex w-full max-w-[560px] flex-col gap-6 md:gap-8">
        <div className="flex">
          <BackLink lang={lang} fallback={backHref} />
        </div>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <p className="text-brand-iris text-[13px] leading-4 font-medium tracking-[0.78px] uppercase">
              {eyebrow}
            </p>
            <h1 className="text-foreground text-[32px] leading-[38px] font-bold tracking-[-0.8px] md:text-[40px] md:leading-[44px]">
              {title}
            </h1>
            <p className="text-muted-foreground text-base leading-6">{lead}</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

// The frame for error screens outside the organizer area, which brings its
// own header and footer. "Sign out" only shows when somebody is signed in.
export function ErrorFrame({
  lang,
  signedIn = false,
  homeHref = "/",
  children,
}: {
  lang: Lang;
  signedIn?: boolean;
  homeHref?: string;
  children: ReactNode;
}) {
  return (
    <div className="has-[[data-surface=accent]]:bg-accent flex min-h-screen flex-col">
      <AppHeader lang={lang} signedIn={signedIn} homeHref={homeHref} />
      <div className="flex-1">{children}</div>
      <Footer lang={lang} />
    </div>
  );
}
