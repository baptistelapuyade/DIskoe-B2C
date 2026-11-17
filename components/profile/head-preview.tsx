import { buttonClass } from "@/components/ui/button";
import { CroppedSquare } from "@/components/ui/cropped-image";
import type { Crop } from "@/lib/domain/profile-publication";
import { t, type Lang } from "@/lib/i18n";

// "Profilkopf (Vorschau)" (Figma, ORG-06): the top of the public profile page
// as the owner will see it. The buttons only show where they will be; they are
// not operable here (decision of 17.11.2026, option A). They are plain spans
// outside the tab order, and one sentence for screen readers says so.
// The tagline of the design module is not shown: the profile has no such field.
// Replaced by the public page components with PUB-01 (slice 11).
function Inert({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "primary" | "outline";
}) {
  return (
    <span
      aria-hidden="true"
      className={`${buttonClass(variant)} min-h-9! w-full px-3 py-1! text-xs md:min-h-7! md:w-auto`}
    >
      {children}
    </span>
  );
}

export function ProfileHeadPreview({
  lang,
  name,
  shortIntro,
  imageUrl,
  crop,
}: {
  lang: Lang;
  name: string;
  shortIntro: string;
  imageUrl: string | null;
  crop: Crop | null;
}) {
  return (
    <section
      aria-label={t(lang, "Z23.preview.title")}
      className="border-border bg-background flex flex-col gap-10 rounded-xl border p-9 md:p-10"
    >
      <p className="sr-only">{t(lang, "Z23.preview.static")}</p>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-base leading-5 font-bold md:text-[22px] md:leading-[26px]">
            DISKOE
          </span>
          <span className="bg-brand-iris inline-flex min-h-6 items-center rounded-full px-2.5 text-xs leading-4 font-medium text-white">
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="mr-1 size-3 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
              <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
            </svg>
            {t(lang, "Z23.preview.badge")}
          </span>
        </div>
        <div aria-hidden="true" className="hidden items-center gap-3 md:flex">
          <span className="text-xs leading-4">
            {t(lang, "Z23.preview.saved")}
          </span>
          <Inert variant="outline">{t(lang, "Z23.preview.share")}</Inert>
        </div>
        {/* Mobile: two icon buttons of 44 px (Figma, decision of 16.11.). */}
        <div aria-hidden="true" className="flex items-center gap-2 md:hidden">
          {[
            <path key="save" d="M4.5 2.5h7v11L8 10.5l-3.5 3z" />,
            <path key="share" d="M8 10V2.5M5 5l3-2.5L11 5M3.5 8.5v4.5h9V8.5" />,
          ].map((icon, index) => (
            <span
              key={index}
              className={`${buttonClass("outline")} min-h-11! w-11 px-0! py-0!`}
            >
              <svg
                viewBox="0 0 16 16"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {icon}
              </svg>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 text-center">
        {imageUrl ? (
          <div className="w-44 md:w-[258px]">
            <CroppedSquare url={imageUrl} crop={crop} className="rounded-lg" />
          </div>
        ) : null}
        <h2 className="text-foreground text-[32px] leading-[34px] font-bold tracking-[-0.04em] break-words uppercase md:text-[80px] md:leading-[80px]">
          {name}
        </h2>
        {shortIntro ? (
          <p className="max-w-[280px] text-xs leading-4 whitespace-pre-line">
            {shortIntro}
          </p>
        ) : null}
        <div
          aria-hidden="true"
          className="flex w-full flex-col items-center justify-center gap-3 md:w-auto md:flex-row"
        >
          <Inert variant="primary">{t(lang, "Z23.preview.follow")}</Inert>
          <Inert variant="outline">{t(lang, "Z23.preview.programme")} ↓</Inert>
        </div>
        <p
          aria-hidden="true"
          className="text-muted-foreground max-w-[320px] text-[11px] leading-4"
        >
          {t(lang, "Z23.preview.followNote")}
        </p>
      </div>
    </section>
  );
}
