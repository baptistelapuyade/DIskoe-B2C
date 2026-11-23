import Link from "next/link";

import { ErrorScreen } from "@/components/errors/error-screen";
import { buttonClass } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";

// ERR-02 in the organizer area: header and footer stay. A page of another
// account looks the same as a page that does not exist, on purpose.
export default async function OrganizerNotFound() {
  const lang = await getLang();

  return (
    <ErrorScreen
      lang={lang}
      eyebrow={t(lang, "Z28.err.notFound.eyebrow")}
      title={t(lang, "Z28.err.notFound.title")}
      lead={t(lang, "Z28.err.notFound.lead")}
      backHref="/organizer"
    >
      <Link
        href="/organizer"
        className={buttonClass("primaryLg", "w-full md:w-auto")}
      >
        {t(lang, "Z28.err.home")}
      </Link>
    </ErrorScreen>
  );
}
