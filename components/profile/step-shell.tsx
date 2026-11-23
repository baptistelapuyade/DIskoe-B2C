import type { ReactNode } from "react";

import { Button, LinkButton } from "@/components/ui/button";
import { ProgressSteps } from "@/components/layout/progress-steps";
import { t, type Lang } from "@/lib/i18n";

// Frame of the profile steps (Figma ORG-03a to ORG-06, desktop and mobile):
// "Back", the five-step progress bar (the profile is step 1), then a head with
// eyebrow, title and lead, then the content. A 560 px column, left-aligned on
// the axis of the logo (framework V1). The app header and footer come from the
// organizer layout.
export function StepShell({
  lang,
  backHref,
  eyebrow,
  title,
  lead,
  wide = false,
  wideProgress = false,
  current = 0,
  progress = true,
  onBack,
  notice,
  children,
}: {
  lang: Lang;
  backHref: string;
  eyebrow: string;
  title: string;
  lead?: string;
  // The preview needs the full container width.
  wide?: boolean;
  // The progress bar spans the wide column too (the submit checklist, Figma
  // EIN-01); the other screens keep it in the 560 px column.
  wideProgress?: boolean;
  // 0-based step of the five-step progress bar: 0 profile, 1 first event.
  current?: number;
  // The screens of a live profile (Figma LPA) have no progress bar: the
  // profile is already through all five steps.
  progress?: boolean;
  // Only for client screens: "Back" asks first (unsaved changes, LPA-01d)
  // instead of following the link.
  onBack?: () => void;
  // A hint between the head and the content (the open question).
  notice?: ReactNode;
  children: ReactNode;
}) {
  const labels = [
    t(lang, "Z22.step.profile"),
    t(lang, "Z22.step.event"),
    t(lang, "Z22.step.submit"),
    t(lang, "Z22.step.review"),
    t(lang, "Z22.step.live"),
  ];

  return (
    <main
      data-surface="accent"
      className="flex w-full flex-col gap-6 px-6 pt-2 pb-6 md:px-12 md:pt-8 md:pb-8"
    >
      <div
        className={`flex w-full flex-col gap-6 md:gap-8 ${wide ? "max-w-[1032px]" : "max-w-[560px]"}`}
      >
        <div className="flex">
          {onBack ? (
            <Button variant="ghostLg" onClick={onBack}>
              {t(lang, "Z20.back")}
            </Button>
          ) : (
            <LinkButton href={backHref} variant="ghostLg">
              {t(lang, "Z20.back")}
            </LinkButton>
          )}
        </div>
        <div className="flex flex-col gap-10">
          {progress ? (
            <div className={wide && wideProgress ? "" : "max-w-[560px]"}>
              <ProgressSteps
                lang={lang}
                labels={labels}
                current={current}
                label={t(lang, "Z22.progress.label")}
              />
            </div>
          ) : null}
          <div
            className={`flex flex-col gap-3 ${wide && wideProgress ? "" : "max-w-[560px]"}`}
          >
            <p className="text-brand-iris text-[13px] leading-4 font-medium tracking-[0.78px] uppercase">
              {eyebrow}
            </p>
            <h1 className="text-foreground text-[32px] leading-[38px] font-bold tracking-[-0.8px] md:text-[40px] md:leading-[44px]">
              {title}
            </h1>
            {lead ? (
              <p className="text-muted-foreground text-base leading-6">
                {lead}
              </p>
            ) : null}
          </div>
          {notice}
          {children}
        </div>
      </div>
    </main>
  );
}
