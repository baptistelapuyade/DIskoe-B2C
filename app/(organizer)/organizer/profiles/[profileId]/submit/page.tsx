import { redirect } from "next/navigation";

import { StepShell } from "@/components/profile/step-shell";
import { Checklist } from "@/components/submit/checklist";
import { SummaryCard } from "@/components/submit/summary-card";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { loadSubmitData } from "@/lib/submit/load";
import {
  eventRows,
  gapHref,
  gapName,
  gapShortName,
  joinNames,
  profileRows,
} from "@/lib/submit/rows";

export const dynamic = "force-dynamic";

// The checklist before the first submission (Figma EIN-01a to 01e): profile and
// first event once more, what is missing, and the choice to send the profile
// without the event. The first submission has no other way in; a profile that
// is already in review, or live, goes elsewhere.
export default async function SubmitChecklistPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const data = await loadSubmitData(profileId, `${base}/submit`);
  const { profile, event } = data;

  if (profile.live) redirect("/organizer");
  if (profile.status === "question") redirect(`${base}/question`);
  if (profile.status === "in_review") redirect(`${base}/status`);
  // A profile with gaps has its own screen (ORG-06) that names them.
  if (profile.status !== "ready") redirect(`${base}/preview`);

  const eventId = event?.event.id ?? null;
  const missing = {
    missingLabel: t(lang, "Z27.row.missing"),
    fixLabel: t(lang, "Z27.row.fix"),
  };
  const firstCode = data.eventGapCodes[0];

  return (
    <StepShell
      lang={lang}
      backHref={
        eventId ? `/organizer/events/${eventId}/edit/more` : `${base}/preview`
      }
      eyebrow={t(lang, "Z27.submit.eyebrow")}
      title={t(lang, "Z27.submit.title")}
      lead={t(lang, "Z27.submit.lead")}
      current={2}
      wide
      wideProgress
    >
      <Checklist
        lang={lang}
        confirmHref={`${base}/submit/confirm`}
        confirmProfileOnlyHref={`${base}/submit/confirm?event=none`}
        previewHref={`${base}/preview/full`}
        newEventHref={`/organizer/events/new?profile=${profileId}`}
        profileCard={
          <SummaryCard
            heading={t(lang, "Z27.profile.heading")}
            change={{
              label: t(lang, "Z27.profile.change"),
              href: `${base}/edit`,
            }}
            rows={profileRows(lang, data)}
            {...missing}
          />
        }
        eventCard={
          eventId ? (
            <SummaryCard
              heading={t(lang, "Z27.event.heading")}
              change={{
                label: t(lang, "Z27.event.change"),
                href: `/organizer/events/${eventId}/edit`,
              }}
              rows={eventRows(lang, data)}
              {...missing}
            />
          ) : null
        }
        gapCount={data.eventGapCodes.length}
        gapText={joinNames(
          lang,
          data.eventGapCodes.map((code) => gapName(lang, code)),
        )}
        firstGap={
          eventId && firstCode
            ? {
                label: t(lang, "Z27.gap.fix", {
                  name: gapShortName(lang, firstCode),
                }),
                href: gapHref(eventId, firstCode),
              }
            : null
        }
      />
    </StepShell>
  );
}
