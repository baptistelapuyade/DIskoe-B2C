import { CroppedSquare } from "@/components/ui/cropped-image";
import { buttonClass } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import type { SummaryRow } from "@/lib/submit/rows";
import Link from "next/link";

// DISKOE "Zusammenfassung" card of the submit screens (Figma EIN-01a to 01e,
// PRF-02): a heading, an optional "change" button, and rows of label and value
// separated by lines. A required value that is missing is flagged with the
// word "Fehlt" and gets its own way to add it. Desktop: label and value side
// by side; mobile: stacked.
export function SummaryCard({
  heading,
  change,
  rows,
  missingLabel = "",
  fixLabel = "",
  stacked = false,
}: {
  heading: string;
  change?: { label: string; href: string };
  rows: readonly SummaryRow[];
  // Only for rows that can be missing (the submit screens).
  missingLabel?: string;
  fixLabel?: string;
  // Label above value on every width (the question card in a narrow column).
  stacked?: boolean;
}) {
  return (
    <section className="bg-card border-border flex w-full flex-col gap-4 rounded-xl border p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <h2 className="text-foreground text-2xl leading-[30px] font-medium tracking-[-0.4px] md:flex-1">
          {heading}
        </h2>
        {change ? (
          <Link
            href={change.href}
            className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
          >
            {change.label}
          </Link>
        ) : null}
      </div>
      <dl className="flex flex-col">
        {rows.map((row) => (
          <div
            key={row.key}
            className={`border-border flex flex-col gap-1.5 border-t py-4 last:pb-0 ${stacked ? "" : "md:flex-row md:gap-6"}`}
          >
            <dt
              className={`text-muted-foreground flex items-center justify-between gap-2 text-base leading-6 font-medium ${stacked ? "" : "md:w-[260px] md:shrink-0 md:items-start"}`}
            >
              {row.label}
              {row.missing ? <Pill tone="error">{missingLabel}</Pill> : null}
            </dt>
            <dd
              className={`text-foreground flex min-w-0 flex-1 flex-col gap-1.5 text-base leading-6 whitespace-pre-line ${stacked ? "" : "md:flex-row md:items-start md:justify-between md:gap-4"}`}
            >
              {row.missing ? (
                <>
                  <span className="text-muted-foreground">
                    {row.missing.text}
                  </span>
                  <Link
                    href={row.missing.fixHref}
                    className={buttonClass("ghostLg", "w-fit md:shrink-0")}
                  >
                    {fixLabel}
                  </Link>
                </>
              ) : row.image ? (
                <RowImage image={row.image} />
              ) : (
                row.text
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function RowImage({ image }: { image: NonNullable<SummaryRow["image"]> }) {
  if (image.shape === "avatar") {
    return image.url ? (
      <CroppedSquare
        url={image.url}
        alt={image.alt}
        crop={image.crop}
        size={56}
        className="rounded-full"
      />
    ) : (
      <span
        aria-hidden="true"
        className="bg-border block size-14 rounded-full"
      />
    );
  }

  return image.url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.url}
      alt={image.alt}
      className="block h-20 w-16 rounded-[4px] object-cover"
    />
  ) : (
    <span
      aria-hidden="true"
      className="bg-border block h-20 w-16 rounded-[4px]"
    />
  );
}
