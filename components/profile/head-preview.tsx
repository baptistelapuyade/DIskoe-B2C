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
    <span aria-hidden="true" className={`${buttonClass(variant)} min-h-8 px-3 text-xs`}>
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
      className="border-border bg-background flex flex-col gap-10 rounded-xl border p-6 md:p-10"
    >
      <p className="sr-only">{t(lang, "Z23.preview.static")}</p>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-[22px] leading-[26px] font-bold">DISKOE</span>
          <span className="bg-brand-iris inline-flex min-h-6 items-center rounded-full px-2.5 text-xs leading-4 font-medium text-white">
            {t(lang, "Z23.preview.badge")}
          </span>
        </div>
        <div aria-hidden="true" className="flex items-center gap-3">
          <span className="text-xs leading-4">{t(lang, "Z23.preview.saved")}</span>
          <Inert variant="outline">{t(lang, "Z23.preview.share")}</Inert>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 text-center">
        {imageUrl ? (
          <CroppedSquare url={imageUrl} crop={crop} size={258} className="max-w-full" />
        ) : null}
        <h2 className="text-foreground text-[44px] leading-[44px] font-bold tracking-[-0.04em] break-words uppercase md:text-[80px] md:leading-[80px]">
          {name}
        </h2>
        {shortIntro ? (
          <p className="max-w-[420px] text-sm leading-5 whitespace-pre-line">{shortIntro}</p>
        ) : null}
        <div aria-hidden="true" className="flex flex-wrap items-center justify-center gap-3">
          <Inert variant="primary">{t(lang, "Z23.preview.follow")}</Inert>
          <Inert variant="outline">{t(lang, "Z23.preview.programme")} ↓</Inert>
        </div>
        <p aria-hidden="true" className="text-muted-foreground max-w-[320px] text-[11px] leading-4">
          {t(lang, "Z23.preview.followNote")}
        </p>
      </div>
    </section>
  );
}
