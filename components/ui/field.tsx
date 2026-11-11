import type { ReactNode } from "react";

// DISKOE / Form Field (Figma 2454:356): label, control, helper and error text.
// The control is rendered by the caller so that it gets the right ids.
export const controlClass =
  "border-border-strong bg-input text-foreground block min-h-9 w-full rounded-lg border px-3 py-[7.5px] text-sm shadow-xs placeholder:text-muted-foreground";

// Control of the v2 screens: 44 px high, 16 px text (framework §3.4, D3).
export const controlClassLg =
  "border-border-strong bg-input text-foreground placeholder:text-muted-foreground aria-invalid:border-error block min-h-11 w-full rounded-lg border px-3 py-[9.5px] text-base shadow-xs disabled:cursor-not-allowed disabled:opacity-60";

export function Field({
  id,
  label,
  hint,
  error,
  className = "",
  large = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  // v2 look: hints and errors at 14 px.
  large?: boolean;
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: true;
  }) => ReactNode;
}) {
  const describedBy =
    [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm leading-5 font-medium">
        {label}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {hint ? (
        <p
          id={`${id}-hint`}
          className={`text-muted-foreground ${large ? "text-sm leading-5" : "text-xs leading-4"}`}
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-error text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// A group of controls with one error (for example Ort und Adresse).
export function FieldGroupError({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={id} role="alert" className="text-error text-sm">
      {text}
    </p>
  ) : null;
}

// Native select with the Figma chevron (Icon / chevron-down).
export function SelectWrap({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m4 6 4 4 4-4" />
      </svg>
    </div>
  );
}

export const selectClass = `${controlClass} appearance-none pr-8`;
