import Link from "next/link";

import { ErrorFrame, ErrorScreen } from "@/components/errors/error-screen";
import { buttonClass } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// After "Sign out" (Figma ERR-05). What the owner saved stays saved.
export default async function SignedOutPage() {
  const lang = await getLang();

  return (
    <ErrorFrame lang={lang}>
      <ErrorScreen
        lang={lang}
        eyebrow={t(lang, "Z28.err.out.eyebrow")}
        title={t(lang, "Z28.err.out.title")}
        lead={t(lang, "Z28.err.out.lead")}
      >
        <Link
          href="/login"
          className={buttonClass("primaryLg", "w-full md:w-auto")}
        >
          {t(lang, "Z28.err.out.login")}
        </Link>
      </ErrorScreen>
    </ErrorFrame>
  );
}
