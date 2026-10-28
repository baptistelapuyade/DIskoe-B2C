import type { Metadata } from "next";
import Link from "next/link";

import { requireAccess } from "@/lib/auth/server";
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

  // The founder gets a direct way to the review list, with the number of
  // profiles that wait for a decision.
  const open = access.isFounder
    ? await countOpenReviews(await createClient())
    : undefined;

  return (
    <div className="min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-sm font-medium tracking-[0.16em] uppercase">
            DISKOE Organizer
          </span>
          <div className="flex items-center gap-6">
            {access.isFounder ? (
              <Link href="/internal/approvals" className="text-sm font-medium">
                Prüfung{typeof open === "number" ? ` (${open})` : ""}
              </Link>
            ) : null}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-muted-foreground focus-visible:outline-ring text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
