import Link from "next/link";
import type { ReactNode } from "react";

import { LanguageSwitch } from "@/components/layout/language-switch";
import { t, type Lang } from "@/lib/i18n";
import {
  atmosphereLabel,
  atmosphereTagClass,
  FORMAT_TAG_CLASS,
} from "@/lib/public/tags";
import type { PrimaryFormat } from "@/lib/domain/event-publication";
import type { Crop } from "@/lib/domain/profile-publication";
import { CroppedSquare } from "@/components/ui/cropped-image";

// Shared pieces of the public pages. Colours come from the design tokens only.

// Container widths. "wide" follows the 1440 px frames of PUB-01 (64 px side
// padding on desktop); the default keeps the narrower pages as they were.
const CONTAINER = "mx-auto w-full max-w-[1128px] px-6 sm:px-8";
const CONTAINER_WIDE = "mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-16";

export function Band({
  children,
  tone = "paper",
  label,
  wide = false,
}: {
  children: ReactNode;
  tone?: "paper" | "surface" | "ink" | "lavender" | "neutral100" | "neutral900";
  label?: string;
  wide?: boolean;
}) {
  const toneClass = {
    paper: "bg-background text-foreground",
    surface: "bg-secondary text-foreground",
    ink: "bg-foreground text-background",
    lavender: "bg-brand-lavender text-foreground",
    neutral100: "bg-neutral-100 text-foreground",
    neutral900: "bg-neutral-900 text-background",
  }[tone];

  return (
    <section
      aria-label={label}
      className={`${toneClass} border-foreground border-y`}
    >
      <div
        className={
          wide
            ? `${CONTAINER_WIDE} py-8 lg:py-16`
            : `${CONTAINER} py-8 sm:py-10`
        }
      >
        {children}
      </div>
    </section>
  );
}

// DISKOE / Gäste-Kopfzeile (Figma NAV-01a, without "Gemerkt": that button
// belongs to wave 3): wordmark on the left, language switch on the right, the
// way back below.
export function SiteBar({
  lang,
  back,
  wide = false,
}: {
  lang: Lang;
  back?: { href: string; label: string };
  wide?: boolean;
}) {
  return (
    <header
      className={`${wide ? CONTAINER_WIDE : CONTAINER} flex flex-col gap-3 py-4 lg:gap-6 lg:py-8`}
    >
      <div className="flex min-h-[50px] items-center justify-between lg:min-h-[76px]">
        <p className="text-[28px] leading-[26px] font-bold tracking-[1.68px]">
          DISKOE
        </p>
        <LanguageSwitch lang={lang} />
      </div>
      {back ? (
        <Link
          href={back.href}
          className="inline-flex min-h-11 w-fit items-center text-sm leading-5 underline-offset-4 hover:underline"
        >
          ← {back.label}
        </Link>
      ) : null}
    </header>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[13px] leading-4 font-medium tracking-[0.78px] uppercase">
      {children}
    </p>
  );
}

export function FormatTag({
  format,
  label,
}: {
  format: PrimaryFormat;
  label: string;
}) {
  return (
    <span
      className={`${FORMAT_TAG_CLASS[format]} border-foreground inline-flex w-fit items-center rounded-full border px-5 py-2.5 text-[17px] font-medium`}
    >
      {label}
    </span>
  );
}

export function AtmosphereTag({ lang, tag }: { lang: Lang; tag: string }) {
  return (
    <span
      className={`${atmosphereTagClass(tag)} border-foreground inline-flex items-center rounded-full border px-5 py-2.5 text-[17px] font-medium`}
    >
      {atmosphereLabel(lang, tag)}
    </span>
  );
}

export function ProfileImage({
  url,
  size,
  crop = null,
}: {
  url: string | null;
  size: number;
  crop?: Crop | null;
}) {
  if (!url) return null;

  return (
    <CroppedSquare
      url={url}
      crop={crop}
      size={size}
      className="rounded-[10px]"
    />
  );
}

export function LegalFooter({
  lang,
  wide = false,
}: {
  lang: Lang;
  wide?: boolean;
}) {
  return (
    <nav
      aria-label={t(lang, "Z20.legal.nav")}
      className={`${wide ? CONTAINER_WIDE : CONTAINER} flex gap-6 pb-8 text-sm leading-5`}
    >
      <Link
        href="/impressum"
        className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
      >
        {t(lang, "Z20.legal.imprint")}
      </Link>
      <Link
        href="/datenschutz"
        className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
      >
        {t(lang, "Z20.legal.privacy")}
      </Link>
    </nav>
  );
}
