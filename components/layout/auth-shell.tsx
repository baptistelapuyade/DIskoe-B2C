import type { ReactNode } from "react";

import type { Lang } from "@/lib/i18n";

import { AppHeader } from "./app-header";
import { SignOutForm } from "./sign-out-form";
import { Footer } from "./footer";
import { LanguageSwitch } from "./language-switch";
import { WegBand, WegPanel, type WegStep } from "./weg-panel";

// Frame of the sign-in screens (Figma ORG-01 and following): on desktop the
// Weg Panel stands left and the content right with the language switch on top;
// on mobile the header comes first, then the Weg band, then the content.
export function AuthShell({
  lang,
  step,
  signedIn = false,
  children,
}: {
  lang: Lang;
  step: WegStep;
  signedIn?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <div className="md:hidden">
        <AppHeader lang={lang} signedIn={signedIn} />
        <div className="px-6 py-2">
          <WegBand lang={lang} current={step} />
        </div>
      </div>
      <div className="flex flex-1">
        <WegPanel lang={lang} current={step} />
        <div className="flex min-w-0 flex-1 flex-col gap-12 px-6 py-8 md:px-12">
          <div className="hidden items-center justify-end gap-2 md:flex">
            <LanguageSwitch lang={lang} />
            {signedIn ? <SignOutForm lang={lang} /> : null}
          </div>
          <main className="flex w-full max-w-[560px] flex-col gap-8 md:gap-10">
            {children}
          </main>
        </div>
      </div>
      <Footer lang={lang} divider />
    </div>
  );
}
