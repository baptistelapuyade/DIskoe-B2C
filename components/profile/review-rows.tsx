import type { ReactNode } from "react";

// One label/value list of the founder review (Figma S5-A 2855:38880): label in
// the left column, value in the right one. Empty values are shown as missing,
// never hidden.
export function ReviewRows({
  rows,
}: {
  rows: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="grid gap-x-6 gap-y-3 text-sm leading-5 sm:grid-cols-[10rem_1fr]">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="break-words whitespace-pre-line">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Image with caption and the description as the organizer wrote it. An empty
// description is allowed: the image then counts as decoration.
export function ReviewImage({
  src,
  alt,
  label,
}: {
  src: string | null | undefined;
  alt: string | null | undefined;
  label: string;
}) {
  return (
    <figure className="flex max-w-[400px] flex-col gap-2">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? ""} className="bg-muted max-h-64 w-full object-cover" />
      ) : (
        <p className="border-border border p-4 text-sm">Kein Bild</p>
      )}
      <figcaption className="text-sm leading-5">
        <span className="font-medium">{label}</span>
        <br />
        <span className="text-muted-foreground">
          {alt
            ? `Bildbeschreibung: ${alt}`
            : "Keine Bildbeschreibung (das Bild zählt als Dekoration)"}
        </span>
      </figcaption>
    </figure>
  );
}
