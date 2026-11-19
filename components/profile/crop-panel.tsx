"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { Crop } from "@/lib/domain/profile-publication";
import { type Lang } from "@/lib/i18n";

import {
  saveProfileCrop,
  type CropResult,
} from "@/app/(organizer)/organizer/profiles/[profileId]/actions";

import { CropEditor } from "./crop-editor";
import { UploadNotice } from "./upload-notice";
import { ACCEPT, useImageUpload } from "./use-image-upload";

// ORG-05e and ORG-05g: pick the visible square. "Use this crop" saves and goes
// back to the picture step; "Choose a different picture" opens the file picker
// and replaces the picture.
export function CropPanel({
  lang,
  profileId,
  url,
  initial,
  imageHref,
}: {
  lang: Lang;
  profileId: string;
  url: string;
  initial: Crop | null;
  imageHref: string;
}) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const [saving, startSaving] = useTransition();
  const upload = useImageUpload(profileId, () => {
    router.push(imageHref);
    router.refresh();
  });

  function apply(crop: Crop) {
    setFailed(false);
    startSaving(async () => {
      let result: CropResult;

      try {
        result = await saveProfileCrop(profileId, crop);
      } catch {
        result = { status: "error" };
      }

      if (result.status === "ok") {
        router.push(imageHref);
        router.refresh();
      } else {
        setFailed(true);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {upload.error ? <UploadNotice lang={lang} error={upload.error} /> : null}
      <CropEditor
        lang={lang}
        url={url}
        initial={initial}
        failed={failed}
        busy={saving || upload.busy}
        onApply={apply}
        onOther={upload.open}
      />
      <input
        ref={upload.inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          void upload.choose(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
