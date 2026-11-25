import type { ReactNode } from "react";
import Link from "next/link";

import { DiscardForm } from "@/components/profile/discard-form";
import { PublishChangesForm } from "@/components/profile/publish-changes-form";
import { StepShell } from "@/components/profile/step-shell";
import { SummaryCard } from "@/components/submit/summary-card";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import type { ChangeRow } from "@/lib/event/changes-text";
import { t, type Lang } from "@/lib/i18n";

import type { PublishEventState } from "@/app/(organizer)/organizer/events/[eventId]/changes/actions";

import { LiveEditForm, type LiveEditValues } from "./live-edit-form";

// The screens of "change a live event" (Figma EVB-01 to EVB-06b). The pages
// guard and load; what is drawn lives here, so the states can be rendered and
// tested without a database. Back goes to the event management page.

function Actions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {children}
    </div>
  );
}

const primary = buttonClass("primaryLg", "w-full md:w-auto");
const secondary = buttonClass("secondary", "w-full shadow-sm md:w-auto");

// What every screen shows under the eyebrow: the event as it is public.
export type EventHead = {
  title: string;
  // "Sa, 14.11.2026, 20:00 · Hof am Kanal, Berlin"
  line: string;
};

// EVB-01a to 01c
export function LiveEditScreen({
  lang,
  base,
  head,
  initial,
  action,
}: {
  lang: Lang;
  base: string;
  head: EventHead;
  initial: LiveEditValues;
  action: React.ComponentProps<typeof LiveEditForm>["action"];
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/manage`}
      progress={false}
      eyebrow={t(lang, "Z31.edit.eyebrow")}
      title={head.title}
      lead={head.line}
    >
      <LiveEditForm
        lang={lang}
        action={action}
        initial={initial}
        cancelHref={`${base}/manage`}
      />
    </StepShell>
  );
}

// EVB-02
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
      backHref={`${base}/manage`}
      progress={false}
      eyebrow={t(lang, "Z31.edit.eyebrow")}
      title={t(lang, "Z31.saved.title")}
      lead={t(lang, "Z31.saved.lead")}
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="success" title={t(lang, "Z31.saved.notice.title")}>
          {t(lang, "Z31.saved.notice.line")}
        </Notice>
        <Actions>
          <Link href={`${base}/changes`} className={primary}>
            {t(lang, "Z31.saved.review")}
          </Link>
          <Link href={`${base}/changes/edit`} className={secondary}>
            {t(lang, "Z31.keepEditing")}
          </Link>
        </Actions>
      </div>
    </StepShell>
  );
}

// EVB-03c
export function NoChangesScreen({ lang, base }: { lang: Lang; base: string }) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/manage`}
      progress={false}
      eyebrow={t(lang, "Z31.edit.eyebrow")}
      title={t(lang, "Z31.none.title")}
      lead={t(lang, "Z31.none.lead")}
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="info" title={t(lang, "Z31.none.notice.title")}>
          {t(lang, "Z31.none.notice.line")}
        </Notice>
        <Actions>
          <Link href={`${base}/changes/edit`} className={primary}>
            {t(lang, "Z31.keepEditing")}
          </Link>
          <Link href={`${base}/manage`} className={secondary}>
            {t(lang, "Z31.toManage")}
          </Link>
        </Actions>
      </div>
    </StepShell>
  );
}

function ChangesCard({
  heading,
  rows,
}: {
  heading: string;
  rows: ChangeRow[];
}) {
  return (
    <SummaryCard
      heading={heading}
      rows={rows.map((row) => ({
        key: row.field,
        label: row.label,
        text: row.value,
      }))}
    />
  );
}

// EVB-03b, and the same screen with a hint when the draft was changed
// elsewhere while the owner was publishing or discarding.
export function ChangesReviewScreen({
  lang,
  base,
  rows,
  draftId,
  stale,
}: {
  lang: Lang;
  base: string;
  rows: ChangeRow[];
  draftId: string;
  stale: boolean;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/manage`}
      progress={false}
      wide
      eyebrow={t(lang, "Z31.edit.eyebrow")}
      title={t(lang, "Z31.changes.title")}
      lead={t(lang, "Z31.changes.lead")}
      notice={
        stale ? (
          <Notice tone="info" title={t(lang, "Z29.changes.stale.title")}>
            {t(lang, "Z29.changes.stale.line")}
          </Notice>
        ) : null
      }
    >
      <div className="flex max-w-[1032px] flex-col gap-4">
        <ChangesCard heading={t(lang, "Z31.changes.card")} rows={rows} />
      </div>
      <Actions>
        <Link href={`${base}/changes/publish?d=${draftId}`} className={primary}>
          {t(lang, "Z31.changes.next")}
        </Link>
        <Link href={`${base}/changes/edit`} className={secondary}>
          {t(lang, "Z31.keepEditing")}
        </Link>
      </Actions>
    </StepShell>
  );
}

// EVB-04a to 04c (the notices live in the form)
export function PublishChangesScreen({
  lang,
  base,
  rows,
  action,
}: {
  lang: Lang;
  base: string;
  rows: ChangeRow[];
  action: (
    previous: PublishEventState,
    formData: FormData,
  ) => Promise<PublishEventState>;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/changes`}
      progress={false}
      wide
      eyebrow={t(lang, "Z31.edit.eyebrow")}
      title={t(lang, "Z31.publish.title")}
      lead={t(lang, "Z31.publish.lead")}
    >
      <PublishChangesForm
        lang={lang}
        dense
        summary={
          <ChangesCard heading={t(lang, "Z31.publish.card")} rows={rows} />
        }
        action={action}
        backHref={`${base}/changes`}
        texts={{
          failLine: "Z31.publish.fail.line",
          back: "Z31.publish.back",
        }}
      />
    </StepShell>
  );
}

// EVB-05
export function ChangesPublishedScreen({
  lang,
  base,
  head,
  publicPath,
}: {
  lang: Lang;
  base: string;
  head: EventHead;
  publicPath: string;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/manage`}
      progress={false}
      eyebrow={t(lang, "Z31.edit.eyebrow")}
      title={t(lang, "Z31.done.title")}
      lead={head.line}
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="success" title={t(lang, "Z31.done.notice.title")} />
        <Actions>
          <Link href={publicPath} className={primary}>
            {t(lang, "Z30.manage.public.view")}
          </Link>
          <Link href={`${base}/manage`} className={secondary}>
            {t(lang, "Z31.toManage")}
          </Link>
        </Actions>
      </div>
    </StepShell>
  );
}

// EVB-06a
export function DiscardChangesScreen({
  lang,
  base,
  failed,
  action,
}: {
  lang: Lang;
  base: string;
  failed: boolean;
  action: () => Promise<void>;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/manage`}
      progress={false}
      eyebrow={t(lang, "Z31.edit.eyebrow")}
      title={t(lang, "Z31.discard.title")}
      lead={t(lang, "Z31.discard.lead")}
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        {failed ? (
          <Notice tone="error" title={t(lang, "Z31.discard.fail")} />
        ) : null}
        <Notice tone="warning" title={t(lang, "Z31.discard.notice.title")}>
          {t(lang, "Z31.discard.notice.line")}
        </Notice>
        <DiscardForm
          lang={lang}
          action={action}
          keepHref={`${base}/manage`}
          texts={{
            yes: "Z31.discard.yes",
            pending: "Z31.discard.pending",
            no: "Z31.discard.no",
          }}
          yesFirst
        />
      </div>
    </StepShell>
  );
}

// EVB-06b
export function ChangesDiscardedScreen({
  lang,
  base,
  head,
}: {
  lang: Lang;
  base: string;
  head: EventHead;
}) {
  return (
    <StepShell
      lang={lang}
      backHref={`${base}/manage`}
      progress={false}
      eyebrow={t(lang, "Z31.edit.eyebrow")}
      title={t(lang, "Z31.discarded.title")}
      lead={head.line}
    >
      <div className="flex max-w-[560px] flex-col gap-10">
        <Notice tone="success" title={t(lang, "Z31.discarded.notice.title")}>
          {t(lang, "Z31.discarded.notice.line")}
        </Notice>
        <Link
          href={`${base}/manage`}
          className={buttonClass("primaryLg", "w-full md:w-fit")}
        >
          {t(lang, "Z31.toManage")}
        </Link>
      </div>
    </StepShell>
  );
}
