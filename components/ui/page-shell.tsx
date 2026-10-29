import type { ReactNode } from "react";

// The frame of every event editor screen (Figma "Editor-Kopf" and
// "Arbeitsbereich"): context line with a badge, a 32 px title, a subtitle, and
// a work area of one wide column and an optional 328 px side column.
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="bg-border border-border inline-flex min-h-6 items-center rounded-full border px-2 py-[3px] text-xs leading-4">
      {children}
    </span>
  );
}

export function PageShell({
  context,
  badge,
  title,
  subtitle,
  topAction,
  children,
}: {
  context: string;
  badge?: string;
  title: string;
  subtitle?: string;
  // Navigation above the header (Figma "Navigation / oben").
  topAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[1128px] px-4 py-8 sm:px-8">
      {topAction ? <div className="mb-6 flex">{topAction}</div> : null}
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm leading-5 font-medium">{context}</p>
          {badge ? <Badge>{badge}</Badge> : null}
        </div>
        <h1 className="text-[32px] leading-[38px] font-bold tracking-[-0.8px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-muted-foreground text-sm leading-5">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </main>
  );
}

export function Workspace({
  main,
  side,
}: {
  main: ReactNode;
  side?: ReactNode;
}) {
  return (
    <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-4 lg:max-w-[704px]">
        {main}
      </div>
      {side ? (
        <aside className="flex w-full flex-col gap-4 lg:w-[328px] lg:shrink-0">
          {side}
        </aside>
      ) : null}
    </div>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-2xl leading-[30px] font-medium tracking-[-0.4px]">
      {children}
    </h2>
  );
}

// "Kontext" cards in the side column and the open-point cards in the main
// column: white, 1 px border, 24 px padding, title 16/24 and muted body.
export function ContextCard({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children?: ReactNode;
  tone?: "default" | "warning";
}) {
  return (
    <section
      className={`border-border flex flex-col gap-4 border p-6 ${
        tone === "warning" ? "bg-warning-subtle" : "bg-background"
      }`}
    >
      <h2 className="text-base leading-6 font-medium">{title}</h2>
      {children}
    </section>
  );
}

export function MutedText({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted-foreground text-sm leading-5">{children}</p>
  );
}

// Tinted block (Figma "Details / …" and "Öffentliche Anzeige"; the neutral
// fill maps to the surface token).
export function TintedBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-muted flex flex-col gap-4 p-5">
      <h2 className="text-2xl leading-[30px] font-medium tracking-[-0.4px]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function StatusMessage({
  ok,
  message,
}: {
  ok: boolean;
  message?: string;
}) {
  if (!message) return null;

  return (
    <p
      role={ok ? "status" : "alert"}
      className={ok ? "text-success text-sm" : "text-error text-sm"}
    >
      {message}
    </p>
  );
}
