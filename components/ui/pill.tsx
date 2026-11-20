import type { ReactNode } from "react";

// DISKOE / Pill (status in the profile card, Figma 2966:7696 and following).
// Meaning is never carried by colour alone: every tone has a text label.
export type PillTone = "neutral" | "info" | "warning" | "success" | "error";

const TONE: Record<PillTone, { box: string; dot: string | null }> = {
  neutral: {
    box: "bg-border border border-border text-foreground",
    dot: "bg-foreground",
  },
  // "In review": Figma shows the blue pill without a dot.
  info: { box: "bg-brand-blue text-foreground", dot: null },
  warning: { box: "bg-warning-subtle text-warning", dot: "bg-warning" },
  success: { box: "bg-success-subtle text-success", dot: "bg-success" },
  // "Fehlt" on a row of the submit checklist (Figma EIN-01b): the word carries
  // the meaning, the red surface only supports it.
  error: { box: "bg-error-subtle text-error", dot: null },
};

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: PillTone;
  children: ReactNode;
}) {
  const { box, dot } = TONE[tone];
  return (
    <span
      className={`inline-flex min-h-8 items-center gap-2 rounded-full px-3 py-1.5 text-sm leading-5 font-medium ${box}`}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={`size-2 shrink-0 rounded-full ${dot}`}
        />
      ) : null}
      {children}
    </span>
  );
}
