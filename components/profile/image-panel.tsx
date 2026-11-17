"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { Button, LinkButton } from "@/components/ui/button";
import { CroppedSquare } from "@/components/ui/cropped-image";
import { Field, controlClassLg } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { LIMITS, type Crop } from "@/lib/domain/profile-publication";
import { t, type Lang } from "@/lib/i18n";

import type { AltState } from "@/app/(organizer)/organizer/profiles/[profileId]/actions";

import { UploadNotice } from "./upload-notice";
import { ACCEPT, useImageUpload } from "./use-image-upload";

// Profile picture step (ORG-05a to ORG-05d, 05f): the upload block "Bild
// hochladen" (Figma 2454:391), the optional description, and the two actions.
// A chosen file is uploaded at once with the largest centred square as its
// crop; "Change crop" leads to ORG-05e.
type AltAction = (previous: AltState, formData: FormData) => Promise<AltState>;

export type CurrentImage = {
  url: string;
  crop: Crop | null;
  altText: string | null;
  fileName: string | null;
};

const IDLE: AltState = { status: "idle" };

export function ImagePanel({
  lang,
  profileId,
  image,
  cropHref,
  previewHref,
  backHref,
  saveAction,
}: {
  lang: Lang;
  profileId: string;
  image: CurrentImage | null;
  cropHref: string;
  previewHref: string;
  backHref: string;
  saveAction: AltAction;
}) {
  const router = useRouter();
  const upload = useImageUpload(profileId, () => router.refresh());
  const [alt, formAction, saving] = useActionState(saveAction, IDLE);

  const input = (
    <input
      ref={upload.inputRef}
      type="file"
      accept={ACCEPT}
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
      onChange={(event) => {
        void upload.choose(event.target.files?.[0]);
        // The same file can be chosen again after an error.
        event.target.value = "";
      }}
    />
  );

  const block = (
    <div className="border-border flex flex-col gap-3 rounded-md border p-4">
      {image ? (
        <div className="w-[200px] max-w-full">
          <CroppedSquare
            url={image.url}
            crop={image.crop}
            className="rounded"
          />
        </div>
      ) : null}
      <p className="text-sm leading-5 font-medium break-all">
        {image?.fileName ?? t(lang, "Z23.image.label")}
      </p>
      <p className="text-muted-foreground text-xs leading-4">
        {image ? t(lang, "Z23.upload.another") : t(lang, "Z23.upload.hint")}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghostLg" onClick={upload.open} disabled={upload.busy}>
          {t(lang, "Z23.upload.choose")}
        </Button>
        {image ? (
          <LinkButton href={cropHref} variant="ghostLg">
            {t(lang, "Z23.upload.crop")}
          </LinkButton>
        ) : (
          <span className="text-muted-foreground text-sm leading-5">
            {t(lang, "Z23.upload.none")}
          </span>
        )}
      </div>
      {input}
    </div>
  );

  const notices = (
    <>
      {upload.busy ? (
        <Notice tone="info" title={t(lang, "Z23.upload.busy.title")}>
          {t(lang, "Z23.upload.busy.line")}
        </Notice>
      ) : null}
      {upload.error ? <UploadNotice lang={lang} error={upload.error} /> : null}
      {alt.status === "failed" ? (
        <Notice tone="error" title={t(lang, "Z23.save.failed.title")}>
          {t(lang, "Z23.save.failed.line")}
        </Notice>
      ) : null}
    </>
  );

  if (!image) {
    return (
      <div className="flex flex-col gap-6">
        {notices}
        {block}
        <p className="text-muted-foreground text-base leading-6">
          {t(lang, "Z23.image.missingHint")}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {upload.busy ? (
            <Button variant="primaryLg" disabled>
              {t(lang, "Z23.image.next")}
            </Button>
          ) : (
            <LinkButton href={previewHref} variant="primaryLg">
              {t(lang, "Z23.image.next")}
            </LinkButton>
          )}
          <LinkButton href={backHref} variant="ghostLg">
            {t(lang, "Z23.image.back")}
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {notices}
      {block}
      <Field
        id="altText"
        label={t(lang, "Z23.image.alt.label")}
        hint={t(lang, "Z23.image.alt.hint")}
        error={
          alt.status === "invalid"
            ? t(lang, "Z23.image.alt.tooLong", { max: LIMITS.altText })
            : undefined
        }
        large
      >
        {(props) => (
          <textarea
            {...props}
            name="altText"
            rows={2}
            defaultValue={image.altText ?? ""}
            placeholder={t(lang, "Z23.image.alt.placeholder")}
            className={`${controlClassLg} min-h-[76px]! py-2!`}
          />
        )}
      </Field>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          variant="primaryLg"
          disabled={upload.busy || saving}
          aria-busy={saving}
        >
          {t(lang, "Z23.image.next")}
        </Button>
        <LinkButton href={backHref} variant="ghostLg">
          {t(lang, "Z23.image.back")}
        </LinkButton>
      </div>
    </form>
  );
}
