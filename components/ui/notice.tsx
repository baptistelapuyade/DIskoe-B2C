import type { ReactNode } from "react";

// DISKOE / Hinweis (Z03 and the single-text notices): box with an info icon,
// a title line and one explaining line. Errors are announced at once
// (role alert), warnings and info politely (role status). The kind is never
// carried by colour alone: the title says what happened.
export type NoticeTone = "error" | "warning" | "info" | "success";

const TONE: Record<NoticeTone, string> = {
  error: "bg-error-subtle border-error text-error",
  warning: "bg-warning-subtle border-warning text-warning",
  info: "bg-brand-blue border-brand-blue text-foreground",
  success: "bg-success-subtle border-success text-success",
};

export function Notice({
  tone,
  title,
  children,
}: {
  tone: NoticeTone;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-lg border p-4 text-sm leading-5 ${TONE[tone]}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="mt-0.5 size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 7.25v3.5M8 5.25h.01" />
      </svg>
      <div className="flex min-w-0 flex-col gap-px">
        <p>{title}</p>
        {children ? <p>{children}</p> : null}
      </div>
    </div>
  );
}
