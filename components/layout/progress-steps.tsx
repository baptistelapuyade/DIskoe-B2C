import { t, type Lang } from "@/lib/i18n";

// DISKOE / Progress bar (Figma 2984:8323): equal segments with a label each.
// `current` is the 0-based index of the active step; earlier steps are done.
// Desktop shows a label per segment, mobile the segments and one line
// "Step N of M · {name}".
export function ProgressSteps({
  lang,
  labels,
  current,
  label,
}: {
  lang: Lang;
  labels: readonly string[];
  current: number;
  label: string;
}) {
  const total = labels.length;
  const currentName = labels[current] ?? "";

  return (
    <div role="group" aria-label={label}>
      <ol className="hidden gap-1.5 md:flex">
        {labels.map((name, i) => (
          <li
            key={name}
            aria-current={i === current ? "step" : undefined}
            className="flex min-w-0 flex-1 flex-col gap-2"
          >
            <span
              aria-hidden="true"
              className={`h-1.5 rounded-[3px] ${i <= current ? "bg-brand-iris" : "bg-border"}`}
            />
            <span
              className={`text-sm leading-5 ${
                i === current
                  ? "text-foreground font-medium"
                  : i < current
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {name}
            </span>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-2 md:hidden">
        <div aria-hidden="true" className="flex gap-1.5">
          {labels.map((name, i) => (
            <span
              key={name}
              className={`h-1.5 flex-1 rounded-[3px] ${i <= current ? "bg-brand-iris" : "bg-border"}`}
            />
          ))}
        </div>
        <p className="text-foreground text-sm leading-5">
          {t(lang, "Z20.progress.mobile", {
            n: current + 1,
            total,
            name: currentName,
          })}
        </p>
      </div>
    </div>
  );
}
