import { redirect } from "next/navigation";

import { LiveLinks } from "@/components/live/live-links";
import { StepShell } from "@/components/profile/step-shell";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { siteUrl } from "@/lib/public/site";
import { formatStamp } from "@/lib/submit/format";
import { loadLiveData } from "@/lib/submit/live";

export const dynamic = "force-dynamic";

// "Your profile is live" (Figma LIV-01a with profile and event, 01b profile
// only; 02 and 03 are the states after copying). Linked from the mail
// "profile live" (MAIL-02). A profile that is not live has nothing to share.
export default async function LivePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const base = `/organizer/profiles/${profileId}`;
  const lang = await getLang();
  const data = await loadLiveData(profileId, `${base}/live`);

  if (!data) redirect(`${base}/status`);

  const origin = siteUrl();

  return (
    <StepShell
      lang={lang}
      backHref="/organizer"
      eyebrow={t(lang, "Z28.live.eyebrow")}
      title={t(lang, "Z28.live.title")}
      lead={t(lang, data.event ? "Z28.live.lead" : "Z28.live.leadProfile")}
      current={4}
      wide={data.event !== null}
      wideProgress
    >
      <LiveLinks
        lang={lang}
        since={data.since ? formatStamp(lang, data.since) : null}
        profile={{
          path: data.profilePath,
          url: `${origin}${data.profilePath}`,
        }}
        event={
          data.event
            ? {
                title: data.event.title || t(lang, "Z22.events.untitled"),
                path: data.event.path,
                url: `${origin}${data.event.path}`,
              }
            : null
        }
        nextEvent={`/organizer/events/new?profile=${profileId}`}
      />
    </StepShell>
  );
}
