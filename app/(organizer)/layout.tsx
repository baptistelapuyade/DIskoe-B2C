import type { Metadata } from "next";
import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { Footer } from "@/components/layout/footer";
import { requireAccess } from "@/lib/auth/server";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/i18n/server";
import { countOpenReviews } from "@/lib/profile/founder";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Organizer – DISKOE",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrganizerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const access = await requireAccess("/organizer");
  const lang = await getLang();

  // The founder gets a direct way to the review list, with the number of
  // profiles that wait for a decision.
  const open = access.isFounder
    ? await countOpenReviews(await createClient())
    : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        lang={lang}
        signedIn
        homeHref="/organizer"
        extra={
          access.isFounder ? (
            <Link
              href="/internal/approvals"
              className="focus-visible:outline-ring mr-2 flex min-h-11 items-center text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t(lang, "Z20.nav.review")}
              {typeof open === "number" ? ` (${open})` : ""}
            </Link>
          ) : null
        }
      />
      <div className="flex-1">{children}</div>
      <Footer lang={lang} />
    </div>
  );
}
