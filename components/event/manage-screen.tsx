import Link from "next/link";
import type { ReactNode } from "react";

import { ShareProfile } from "@/components/home/share-profile";
import { StepShell } from "@/components/profile/step-shell";
import { SummaryCard } from "@/components/submit/summary-card";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Pill } from "@/components/ui/pill";
import type { ManageDisplay } from "@/lib/event/manage-display";
import { t, type Lang } from "@/lib/i18n";

// The event management page (Figma EVM-01a to 01f). The page loads and
// guards; this file draws the state it is given.

const primary = buttonClass("primaryLg", "w-full md:w-auto");
const secondary = buttonClass("secondary", "w-full shadow-sm md:w-auto");

function Actions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      {children}
    </div>
  );
}

// "Bearbeiten", "Verschieben", "Absagen": a title, one sentence, one button.
function ActionCard({
  title,
  lead,
  href,
  primaryButton = false,
}: {
  title: string;
  lead: string;
  href: string;
  primaryButton?: boolean;
}) {
  return (
    <section className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6">
      <h2 className="text-foreground text-2xl leading-[30px] font-medium tracking-[-0.4px]">
        {title}
      </h2>
      <p className="text-muted-foreground flex-1 text-base leading-6">{lead}</p>
      <Link
        href={href}
        className={buttonClass(
          primaryButton ? "primaryLg" : "secondary",
          `w-full ${primaryButton ? "" : "shadow-sm"}`,
        )}
      >
        {title}
      </Link>
    </section>
  );
}

export function ManageScreen({
  lang,
  data,
}: {
  lang: Lang;
  data: ManageDisplay;
}) {
  const { base } = data;
  const viewPage = (
    <Link href={data.publicPath} className={secondary}>
      {t(lang, "Z30.manage.public.view")}
    </Link>
  );

  const pill = (
    <div>
      <Pill tone={data.pill.tone} dot={false}>
        {data.pill.label}
      </Pill>
    </div>
  );

  return (
    <StepShell
      lang={lang}
      backHref="/organizer/events"
      progress={false}
      wide
      eyebrow={t(lang, "Z30.manage.eyebrow")}
      title={data.title}
      lead={data.line}
    >
      <div className="flex flex-col gap-6">
        {data.state === "live" || data.state === "postponed" ? (
          <>
            {pill}
            <SummaryCard
              heading={t(lang, "Z30.manage.public.title")}
              change={{
                label: t(lang, "Z30.manage.public.view"),
                href: data.publicPath,
              }}
              rows={[
                {
                  key: "link",
                  label: t(lang, "Z30.manage.row.link"),
                  text: data.publicPath,
                },
                {
                  key: "price",
                  label: t(lang, "Z30.manage.row.price"),
                  text: data.price,
                },
                {
                  key: "access",
                  label: t(lang, "Z30.manage.row.access"),
                  text: data.access,
                },
              ]}
            />
            {data.state === "live" ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <ActionCard
                  title={t(lang, "Z30.manage.edit.title")}
                  lead={t(lang, "Z30.manage.edit.lead")}
                  href={`${base}/changes/edit`}
                  primaryButton
                />
                <ActionCard
                  title={t(lang, "Z30.manage.reschedule.title")}
                  lead={t(lang, "Z30.manage.reschedule.lead")}
                  href={`${base}/reschedule`}
                />
                <ActionCard
                  title={t(lang, "Z30.manage.cancel.title")}
                  lead={t(lang, "Z30.manage.cancel.lead")}
                  href={`${base}/cancel`}
                />
              </div>
            ) : (
              <Actions>
                {/* No Figma frame for "new date follows": without a date the
                    way on is a replacement date, or cancelling. */}
                <Link href={`${base}/reschedule`} className={primary}>
                  {t(lang, "Z30.manage.postponed.newDate")}
                </Link>
                <Link href={`${base}/cancel`} className={secondary}>
                  {t(lang, "Z30.manage.cancel.title")}
                </Link>
              </Actions>
            )}
            <Actions>
              <ShareProfile
                url={data.publicUrl}
                label={t(lang, "Z30.manage.copyLink")}
                copiedText={t(lang, "Z22.share.copied")}
                failedText={t(lang, "Z22.share.failed")}
                variant="secondary"
              />
              {/* EVM-01a: copy as a new event (only a live event, not a
                  postponed one). */}
              {data.state === "live" ? (
                <Link href={`${base}/copy`} className={secondary}>
                  {t(lang, "Z32.manage.copy")}
                </Link>
              ) : null}
            </Actions>
          </>
        ) : null}

        {data.state === "changes" ? (
          <>
            {pill}
            <Notice
              tone="info"
              title={t(lang, "Z30.manage.changes.notice.title")}
            >
              {t(lang, "Z30.manage.changes.notice.line")}
            </Notice>
            <SummaryCard
              heading={t(lang, "Z30.manage.changes.title")}
              rows={data.changes.map((row) => ({
                key: row.field,
                label: row.label,
                text: row.value,
              }))}
            />
            <Actions>
              <Link href={`${base}/changes`} className={primary}>
                {t(lang, "Z30.manage.changes.review")}
              </Link>
              {data.draftId ? (
                <Link
                  href={`${base}/changes/discard?d=${data.draftId}`}
                  className={secondary}
                >
                  {t(lang, "Z31.changes.discard")}
                </Link>
              ) : null}
              {/* Not in Figma EVM-01b: a live event with private changes can
                  still be moved or cancelled (the weather does not wait). */}
              <Link href={`${base}/reschedule`} className={secondary}>
                {t(lang, "Z30.manage.reschedule.title")}
              </Link>
              <Link href={`${base}/cancel`} className={secondary}>
                {t(lang, "Z30.manage.cancel.title")}
              </Link>
            </Actions>
          </>
        ) : null}

        {data.state === "private" ? (
          <>
            {/* Figma EVM-01c: the note comes first, in amber while something
                is missing. */}
            <Notice
              tone={data.gapCount === 0 ? "info" : "warning"}
              title={t(
                lang,
                data.gapCount === 0
                  ? "Z30.manage.private.ready"
                  : data.gapCount === 1
                    ? "Z30.manage.private.missing.one"
                    : "Z30.manage.private.missing.many",
              )}
            >
              {t(lang, "Z30.manage.private.line")}
            </Notice>
            {pill}
            <SummaryCard
              heading={t(lang, "Z30.manage.private.card")}
              rows={data.stateRows.map((row) => ({
                key: row.key,
                label: row.label,
                text: row.value,
              }))}
            />
            <Actions>
              <Link href={`${base}/edit`} className={primary}>
                {t(lang, "Z30.manage.private.continue")}
              </Link>
              {data.canDiscard ? (
                <Link href={`${base}/discard`} className={secondary}>
                  {t(lang, "Z30.manage.private.discard")}
                </Link>
              ) : null}
            </Actions>
          </>
        ) : null}

        {data.state === "cancelled" ? (
          <>
            <div className="max-w-[560px]">
              <Notice
                tone="warning"
                title={t(lang, "Z30.manage.cancelled.title")}
              >
                {t(lang, "Z30.manage.cancelled.line")}
              </Notice>
            </div>
            {pill}
            <Actions>
              <Link href={`${base}/reschedule`} className={primary}>
                {t(lang, "Z30.manage.cancelled.newDate")}
              </Link>
              {viewPage}
            </Actions>
          </>
        ) : null}

        {data.state === "past" ? (
          <>
            {pill}
            <p className="text-muted-foreground text-base leading-6">
              {t(lang, "Z30.manage.past.line")}
            </p>
            <div className="mt-4">
              <Actions>
                {viewPage}
                {/* EVM-01f */}
                <Link href={`${base}/copy`} className={secondary}>
                  {t(lang, "Z32.manage.copy")}
                </Link>
              </Actions>
            </div>
          </>
        ) : null}
      </div>
    </StepShell>
  );
}
