import { Notice } from "@/components/ui/notice";
import { LIMITS } from "@/lib/domain/profile-publication";
import { t, type Lang } from "@/lib/i18n";

import type { UploadError } from "./use-image-upload";

function megabytes(lang: Lang, bytes: number): string {
  return `${new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-US", {
    maximumFractionDigits: 1,
  }).format(bytes / (1024 * 1024))} MB`;
}

// The red notices of the upload block: too large (Z05, ORG-05d), too small
// (Z06, ORG-05f), wrong format (Z07) and a technical failure (Z03).
export function UploadNotice({ lang, error }: { lang: Lang; error: UploadError }) {
  switch (error.code) {
    case "tooBig":
      return (
        <Notice tone="error" title={t(lang, "Z23.upload.tooBig.title")}>
          {t(lang, "Z23.upload.tooBig.line", {
            limit: megabytes(lang, LIMITS.imageBytes),
            size: megabytes(lang, error.bytes ?? 0),
          })}
        </Notice>
      );
    case "tooSmall":
      return (
        <Notice tone="error" title={t(lang, "Z23.upload.tooSmall.title")}>
          {t(lang, "Z23.upload.tooSmall.line", {
            min: LIMITS.imageMinSide,
            w: error.width ?? 0,
            h: error.height ?? 0,
          })}
        </Notice>
      );
    case "format":
      return (
        <Notice tone="error" title={t(lang, "Z23.upload.format.title")}>
          {t(lang, "Z23.upload.format.line")}
        </Notice>
      );
    default:
      return (
        <Notice tone="error" title={t(lang, "Z23.upload.failed.title")}>
          {t(lang, "Z23.upload.failed.line")}
        </Notice>
      );
  }
}
