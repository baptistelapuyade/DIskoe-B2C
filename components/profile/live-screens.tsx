import type { ReactNode } from "react";
import Link from "next/link";

import { DiscardForm } from "@/components/profile/discard-form";
import { PublishChangesForm } from "@/components/profile/publish-changes-form";
import { StepShell } from "@/components/profile/step-shell";
import { SummaryCard } from "@/components/submit/summary-card";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import type { ProfileChanges } from "@/lib/domain/profile-changes";
import { t, type Lang } from "@/lib/i18n";
import {
  changeAnchor,
  changeHeading,
  changeRows,
  unchangedText,
} from "@/lib/profile/changes-text";

import type { PublishState } from "@/app/(organizer)/organizer/profiles/[profileId]/changes/actions";

// The screens of "change a live profile" after the editor (Figma LPA-02 to
// LPA-06b). The pages only guard and load; what is drawn lives here, so the
// states can be rendered and tested without a database.

const HOME = "/organizer";

function Actions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {children}
    </div>
  );
}

const primary = buttonClass("primaryLg", "w-full md:w-auto");
const secondary = buttonClass("secondary", "w-full shadow-sm md:w-auto");
const ghost = buttonClass("ghostLg", "w-full md:w-auto");

// LPA-02
export function ChangesSavedScreen({
  lang,
  base,
}: {
  lang: Lang;
  base: string;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={HOME}
      progress={false}
      eyebrow={t(lang, "Z29.edit.eyebrow")}
      title={t(lang, "Z29.saved.title")}
      lead={t(lang, "Z29.saved.lead")}
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="success" title={t(lang, "Z29.saved.notice.title")}>
          {t(lang, "Z29.saved.notice.line")}
        </Notice>
        <Actions>
          <Link href={`${base}/changes`} className={primary}>
            {t(lang, "Z29.saved.review")}
          </Link>
          <Link href={`${base}/changes/edit`} className={secondary}>
            {t(lang, "Z29.keepEditing")}
          </Link>
        </Actions>
      </div>
    </StepShell>
  );
}

// LPA-03b
export function NoChangesScreen({ lang, base }: { lang: Lang; base: string }) {
  return (
    <StepShell
      lang={lang}
      backHref={HOME}
      progress={false}
      eyebrow={t(lang, "Z29.changes.eyebrow")}
      title={t(lang, "Z29.none.title")}
      lead={t(lang, "Z29.none.lead")}
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="info" title={t(lang, "Z29.none.notice.title")}>
          {t(lang, "Z29.none.notice.line")}
        </Notice>
        <Actions>
          <Link href={`${base}/changes/edit`} className={primary}>
            {t(lang, "Z29.none.edit")}
          </Link>
          <Link href={HOME} className={secondary}>
            {t(lang, "Z29.home")}
          </Link>
        </Actions>
      </div>
    </StepShell>
  );
}

// LPA-03a, and 03c with `stale`
export function ChangesReviewScreen({
  lang,
  base,
  changes,
  draftId,
  stale,
}: {
  lang: Lang;
  base: string;
  changes: ProfileChanges;
  draftId: string;
  // The draft was changed elsewhere while the owner was publishing or
  // discarding: same screen with a hint (03c).
  stale: boolean;
}) {
  const unchanged = unchangedText(lang, changes.unchanged);

  return (
    <StepShell
      lang={lang}
      backHref={HOME}
      progress={false}
      wide
      wideProgress
      eyebrow={t(lang, "Z29.changes.eyebrow")}
      title={t(lang, "Z29.changes.title")}
      lead={t(lang, "Z29.changes.lead")}
      notice={
        stale ? (
          <Notice tone="info" title={t(lang, "Z29.changes.stale.title")}>
            {t(lang, "Z29.changes.stale.line")}
          </Notice>
        ) : null
      }
    >
      <div className="flex max-w-[1032px] flex-col gap-4">
        {changes.changes.map((change) => (
          <SummaryCard
            key={change.field}
            heading={changeHeading(lang, change.field)}
            change={{
              label: t(lang, "Z29.changes.change"),
              href: `${base}/changes/edit#${changeAnchor(change.field)}`,
            }}
            rows={changeRows(lang, change)}
          />
        ))}
        {unchanged ? (
          <p className="text-muted-foreground text-sm leading-5">{unchanged}</p>
        ) : null}
      </div>
      <Actions>
        <Link href={`${base}/changes/publish?d=${draftId}`} className={primary}>
          {t(lang, "Z29.changes.publish")}
        </Link>
        <Link href={`${base}/changes/edit`} className={secondary}>
          {t(lang, "Z29.keepEditing")}
        </Link>
        <Link href={`${base}/changes/discard?d=${draftId}`} className={ghost}>
          {t(lang, "Z29.changes.discard")}
        </Link>
      </Actions>
    </StepShell>
  );
}

// LPA-04a to 04c (the notices live in the form)
export function PublishChangesScreen({
  lang,
  base,
  action,
}: {
  lang: Lang;
  base: string;
  action: (previous: PublishState, formData: FormData) => Promise<PublishState>;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/changes`}
      progress={false}
      eyebrow={t(lang, "Z29.changes.eyebrow")}
      title={t(lang, "Z29.publish.title")}
      lead={t(lang, "Z29.publish.lead")}
    >
      <PublishChangesForm
        lang={lang}
        action={action}
        backHref={`${base}/changes`}
      />
    </StepShell>
  );
}

// LPA-05
export function ChangesPublishedScreen({
  lang,
  slug,
}: {
  lang: Lang;
  slug: string;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={HOME}
      progress={false}
      eyebrow={t(lang, "Z28.live.eyebrow")}
      title={t(lang, "Z29.done.title")}
      lead={t(lang, "Z29.done.lead")}
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="success" title={t(lang, "Z29.done.notice.title")}>
          {t(lang, "Z29.done.notice.line")}
        </Notice>
        <Actions>
          <Link href={`/${slug}`} className={primary}>
            {t(lang, "Z28.live.viewProfile")}
          </Link>
          <Link href={HOME} className={secondary}>
            {t(lang, "Z29.home")}
          </Link>
        </Actions>
      </div>
    </StepShell>
  );
}

// LPA-06a
export function DiscardChangesScreen({
  lang,
  base,
  action,
}: {
  lang: Lang;
  base: string;
  action: () => Promise<void>;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/changes`}
      progress={false}
      eyebrow={t(lang, "Z29.discard.eyebrow")}
      title={t(lang, "Z29.discard.title")}
      lead={t(lang, "Z29.discard.lead")}
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="warning" title={t(lang, "Z29.discard.notice.title")}>
          {t(lang, "Z29.discard.notice.line")}
        </Notice>
        <DiscardForm lang={lang} action={action} keepHref={`${base}/changes`} />
      </div>
    </StepShell>
  );
}

// LPA-06b
export function ChangesDiscardedScreen({ lang }: { lang: Lang }) {
  return (
    <StepShell
      lang={lang}
      backHref={HOME}
      progress={false}
      eyebrow={t(lang, "Z29.discard.eyebrow")}
      title={t(lang, "Z29.discarded.title")}
      lead={t(lang, "Z29.discarded.lead")}
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="success" title={t(lang, "Z29.discarded.notice.title")}>
          {t(lang, "Z29.discarded.notice.line")}
        </Notice>
        <Link
          href={HOME}
          className={buttonClass("primaryLg", "w-full md:w-fit")}
        >
          {t(lang, "Z29.home")}
        </Link>
      </div>
    </StepShell>
  );
}
