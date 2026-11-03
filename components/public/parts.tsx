import Link from "next/link";
import type { ReactNode } from "react";

import { atmosphereTagClass, FORMAT_TAG_CLASS } from "@/lib/public/tags";
import type { PrimaryFormat } from "@/lib/domain/event-publication";

// Shared pieces of the public pages. Colours come from the design tokens only.

export function Band({
  children,
  tone = "paper",
  label,
}: {
  children: ReactNode;
  tone?: "paper" | "surface" | "ink" | "lavender";
  label?: string;
}) {
  const toneClass = {
    paper: "bg-background text-foreground",
    surface: "bg-secondary text-foreground",
    ink: "bg-foreground text-background",
    lavender: "bg-brand-lavender text-foreground",
  }[tone];

  return (
    <section aria-label={label} className={`${toneClass} border-y border-foreground`}>
      <div className="mx-auto w-full max-w-[1128px] px-6 py-8 sm:px-8 sm:py-10">
        {children}
      </div>
    </section>
  );
}

export function SiteBar({ back }: { back?: { href: string; label: string } }) {
  return (
    <header className="mx-auto flex w-full max-w-[1128px] flex-col gap-5 px-6 py-5 sm:px-8">
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

export function ProfileImage({ url, size }: { url: string | null; size: number }) {
  if (!url) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      className="rounded-[10px] object-cover"
      style={{ width: size, height: size }}
    />
  );
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
