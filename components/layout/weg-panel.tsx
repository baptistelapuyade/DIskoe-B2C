import { t, type Lang, type MessageId } from "@/lib/i18n";

// DISKOE / Weg Panel (Figma 2985:8287). Shows the three steps of the
// organizer's path: sign in, create profile and first event, submit and get
// approved. Desktop is a 400 px side panel whose colour follows the current
// step; mobile is a white card with three segments.
export type WegStep = 1 | 2 | 3;

const STEP_IDS: Record<WegStep, MessageId> = {
  1: "Z20.weg.step1",
  2: "Z20.weg.step2",
  3: "Z20.weg.step3",
};

const STEPS: readonly WegStep[] = [1, 2, 3];

// Panel colour and the text colour that keeps 4.5 : 1 on it.
// `mark` is the filled circle, `markText` the colour of its number or check.
const PANEL: Record<
  WegStep,
  { bg: string; fg: string; mark: string; markText: string }
> = {
  1: {
    bg: "bg-brand-iris",
    fg: "text-white",
    mark: "bg-white",
    markText: "text-brand-iris",
  },
  2: {
    bg: "bg-brand-blue",
    fg: "text-foreground",
    mark: "bg-foreground",
    markText: "text-brand-blue",
  },
  3: {
    bg: "bg-brand-pink",
    fg: "text-foreground",
    mark: "bg-foreground",
    markText: "text-brand-pink",
  },
};

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

export function WegPanel({ lang, current }: { lang: Lang; current: WegStep }) {
  const tone = PANEL[current];

  return (
    <aside
      aria-label={t(lang, "Z20.weg.title")}
      className={`hidden w-[400px] shrink-0 flex-col gap-8 p-12 md:flex ${tone.bg} ${tone.fg}`}
    >
      <p className="text-xl leading-[26px] font-medium">DISKOE</p>
      <p className="text-[13px] leading-4 font-medium tracking-[0.08em] uppercase">
        {t(lang, "Z20.weg.title")}
      </p>
      <ol className="flex flex-col gap-5">
        {STEPS.map((step) => {
          const done = step < current;
          const active = step === current;
          return (
            <li
              key={step}
              aria-current={active ? "step" : undefined}
              className="flex items-center gap-4"
            >
              <span
                aria-hidden="true"
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm leading-5 font-medium ${
                  done || active
                    ? `${tone.mark} ${tone.markText}`
                    : "border-[1.5px] border-current"
                }`}
              >
                {done ? <CheckIcon /> : step}
              </span>
              <span
                className={`text-base leading-6 ${active ? "font-medium" : "font-normal"}`}
              >
                {t(lang, STEP_IDS[step])}
              </span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

// Mobile: white card "Step N of 3 · {name}" with three segments.
export function WegBand({ lang, current }: { lang: Lang; current: WegStep }) {
  const name = t(lang, STEP_IDS[current]);

  return (
    <div
      role="group"
      aria-label={t(lang, "Z20.weg.title")}
      className="bg-card border-border flex flex-col gap-3 rounded-xl border p-5 md:hidden"
    >
      <p className="text-foreground text-base leading-6 font-medium">
        {t(lang, "Z20.weg.mobile", { n: current, name })}
      </p>
      <div aria-hidden="true" className="flex gap-1.5">
        {STEPS.map((step) => (
          <span
            key={step}
            className={`h-2 flex-1 rounded-sm ${step <= current ? "bg-brand-iris" : "bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}
