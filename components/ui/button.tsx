import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

// DISKOE / Button (Figma 2453:242) and "Merken / sekundär" (44 px, used for the
// section buttons). Colours come from the design tokens only.
// All variants are at least 44 px high (framework §3.4 and checklist D3). The "Lg" variants differ in
// padding only; the Figma kit button is 40 px (deviation decided by the founder, 25.11.2026).
export type ButtonVariant =
  "primary" | "outline" | "ghost" | "secondary" | "primaryLg" | "ghostLg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground min-h-11 px-4 py-[9.5px]",
  outline:
    "bg-background text-foreground border-border min-h-11 border px-4 py-[9.5px] shadow-sm",
  ghost: "bg-[var(--paper)] text-foreground min-h-11 px-4 py-[9.5px]",
  secondary:
    "bg-background text-foreground border-border min-h-11 border px-6 py-[9.5px]",
  primaryLg: "bg-primary text-primary-foreground min-h-11 px-6 py-[9.5px]",
  ghostLg:
    "bg-[var(--paper)] text-foreground border-border-strong min-h-11 border px-6 py-[9.5px]",
};

export function buttonClass(variant: ButtonVariant, extra = ""): string {
  return `${BASE} ${VARIANT[variant]} ${extra}`.trim();
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type={type}
      className={buttonClass(variant, className)}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  variant = "outline",
  className = "",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
