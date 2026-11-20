import Link from "next/link";

import { ErrorFrame, ErrorScreen } from "@/components/errors/error-screen";
import { buttonClass } from "@/components/ui/button";
import { safeNextPath } from "@/lib/auth/guards";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// The session ran out while the owner was working (Figma ERR-01). Signing in
// again leads back to the page the owner came from (only a path inside the
// organizer area, see safeNextPath).
export default async function SessionExpiredPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const lang = await getLang();
  const { next } = await searchParams;
  const target = safeNextPath(next);

  return (
    <ErrorFrame lang={lang}>
      <ErrorScreen
        lang={lang}
        eyebrow={t(lang, "Z28.err.session.eyebrow")}
        title={t(lang, "Z28.err.session.title")}
        lead={t(lang, "Z28.err.session.lead")}
      >
        <Link
          href={`/login?next=${encodeURIComponent(target)}`}
          className={buttonClass("primaryLg", "w-full md:w-auto")}
        >
          {t(lang, "Z28.err.session.login")}
        </Link>
      </ErrorScreen>
    </ErrorFrame>
  );
}
