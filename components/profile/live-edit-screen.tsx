"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DetailsForm } from "@/components/profile/details-form";
import { StepShell } from "@/components/profile/step-shell";
import { Button, LinkButton } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { t, type Lang } from "@/lib/i18n";

import type {
  DetailsState,
  DetailsValues,
} from "@/app/(organizer)/organizer/profiles/[profileId]/actions";

type Action = (
  previous: DetailsState,
  formData: FormData,
) => Promise<DetailsState>;

// Edit screen of a live profile (Figma LPA-01a to 01c) and the question that
// follows "Cancel" or "Back" when something typed is not saved (LPA-01d). The
// form stays mounted while the question is shown, so "Keep editing" finds
// every value as it was.
export function LiveEditScreen({
  lang,
  action,
  initial,
  homeHref,
}: {
  lang: Lang;
  action: Action;
  initial: DetailsValues;
  homeHref: string;
}) {
  const router = useRouter();
  const [dirty, setDirty] = useState(false);
  const [asking, setAsking] = useState(false);

  const leave = () => {
    if (dirty) {
      setAsking(true);
    } else {
      router.push(homeHref);
    }
  };

  return (
    <StepShell
      lang={lang}
      backHref={homeHref}
      onBack={asking ? () => setAsking(false) : leave}
      progress={false}
      eyebrow={t(lang, "Z29.edit.eyebrow")}
      title={t(lang, asking ? "Z29.leave.title" : "Z29.edit.title")}
      lead={t(lang, asking ? "Z29.leave.lead" : "Z29.edit.lead")}
      notice={
        asking ? (
          <Notice tone="warning" title={t(lang, "Z29.leave.notice.title")}>
            {t(lang, "Z29.leave.notice.line")}
          </Notice>
        ) : null
      }
    >
      <div hidden={asking}>
        <DetailsForm
          lang={lang}
          mode="live"
          action={action}
          initial={initial}
          slugFixed
          onCancel={leave}
          onDirtyChange={setDirty}
        />
      </div>
      {asking ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Button
            variant="primaryLg"
            className="w-full md:w-auto"
            onClick={() => setAsking(false)}
          >
            {t(lang, "Z29.keepEditing")}
          </Button>
          <LinkButton
            href={homeHref}
            variant="ghostLg"
            className="w-full md:w-auto"
          >
            {t(lang, "Z29.leave.go")}
          </LinkButton>
        </div>
      ) : null}
    </StepShell>
  );
}
