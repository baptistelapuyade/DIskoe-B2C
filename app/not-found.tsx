import Link from "next/link";

import { ErrorFrame, ErrorScreen } from "@/components/errors/error-screen";
import { buttonClass } from "@/components/ui/button";
import { getAccess } from "@/lib/auth/server";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// ERR-02: the link is wrong or the page is gone. "Sign out" shows only when
// somebody is signed in. A failed access check counts as signed out here:
// this page must never fail itself.
export default async function NotFound() {
  const lang = await getLang();
  const signedIn = await getAccess().then(
    (access) => access.kind !== "anonymous",
    () => false,
  );
  const home = signedIn ? "/organizer" : "/";

  return (
    <ErrorFrame lang={lang} signedIn={signedIn} homeHref={home}>
      <ErrorScreen
        lang={lang}
        eyebrow={t(lang, "Z28.err.notFound.eyebrow")}
        title={t(lang, "Z28.err.notFound.title")}
        lead={t(lang, "Z28.err.notFound.lead")}
        backHref={home}
      >
        <Link
          href={home}
          className={buttonClass("primaryLg", "w-full md:w-auto")}
        >
          {t(lang, "Z28.err.home")}
        </Link>
      </ErrorScreen>
    </ErrorFrame>
  );
}
