"use client";

import { useRef, useState, useTransition } from "react";

import { LIMITS } from "@/lib/domain/profile-publication";

import {
  uploadProfileImage,
  type UploadErrorCode,
} from "@/app/(organizer)/organizer/profiles/[profileId]/actions";

export const ACCEPT = "image/jpeg,image/png,image/webp";

export type UploadError = {
  code: UploadErrorCode;
  bytes?: number;
  width?: number;
  height?: number;
};

function readSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
}

// Picks a file, checks it here (so a wrong file costs no upload) and sends it.
// The server checks again. `onDone` runs after a successful upload.
export function useImageUpload(profileId: string, onDone: () => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<UploadError | null>(null);
  const [busy, startTransition] = useTransition();

  function open() {
    inputRef.current?.click();
  }

  async function choose(file: File | undefined) {
    if (!file) return;

    setError(null);

    if (!ACCEPT.split(",").includes(file.type)) {
      setError({ code: "format" });
      return;
    }

    if (file.size > LIMITS.imageBytes) {
      setError({ code: "tooBig", bytes: file.size });
      return;
    }

    const size = await readSize(file);

    if (!size) {
      setError({ code: "format" });
      return;
    }

    if (size.width < LIMITS.imageMinSide || size.height < LIMITS.imageMinSide) {
      setError({ code: "tooSmall", ...size });
      return;
    }

    const data = new FormData();
    data.set("image", file);

    startTransition(async () => {
      const result = await uploadProfileImage(profileId, data);

      if (result.status === "ok") {
        onDone();
      } else {
        setError({
          code: result.code,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      }
    });
  }

  return { inputRef, open, choose, busy, error, clearError: () => setError(null) };
}
