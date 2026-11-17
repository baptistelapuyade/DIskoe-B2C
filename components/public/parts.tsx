import Link from "next/link";
import type { ReactNode } from "react";

import { atmosphereTagClass, FORMAT_TAG_CLASS } from "@/lib/public/tags";
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
    <section aria-label={label} className={`${toneClass} border-y border-foreground`}>
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

export function SiteBar({
  back,
  wide = false,
}: {
  back?: { href: string; label: string };
  wide?: boolean;
}) {
  return (
    <header
      className={`${wide ? CONTAINER_WIDE : CONTAINER} flex flex-col gap-5 py-5 lg:py-8`}
    >
      <p className="text-2xl leading-[30px] font-medium tracking-[-0.4px]">DISKOE</p>
      {back ? (
        <Link href={back.href} className="text-sm leading-5 underline-offset-4 hover:underline">
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

export function FormatTag({ format, label }: { format: PrimaryFormat; label: string }) {
  return (
    <span
      className={`${FORMAT_TAG_CLASS[format]} border-foreground inline-flex w-fit items-center rounded-full border px-5 py-2.5 text-[17px] font-medium`}
    >
      {label}
    </span>
  );
}

export function AtmosphereTag({ tag }: { tag: string }) {
  return (
    <span
      className={`${atmosphereTagClass(tag)} border-foreground inline-flex items-center rounded-full border px-5 py-2.5 text-[17px] font-medium`}
    >
      {tag}
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

  return <CroppedSquare url={url} crop={crop} size={size} className="rounded-[10px]" />;
}

export function formatPublishedDate(iso: string | null): string | null {
  if (!iso) return null;

  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  });
}

export function LegalFooter() {
  return (
    <nav
      aria-label="Rechtliches"
      className="mx-auto flex w-full max-w-[1128px] gap-6 px-6 pb-8 text-sm leading-5 sm:px-8"
    >
      <Link href="/impressum" className="underline-offset-4 hover:underline">
        Impressum
      </Link>
      <Link href="/datenschutz" className="underline-offset-4 hover:underline">
        Datenschutz
      </Link>
    </nav>
  );
}
