import type { Metadata } from "next";
import Link from "next/link";

import { getAccess } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Intern – DISKOE",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// The header is a convenience for the founder. It is not a guard: every page
// and action under /internal checks the founder role itself.
export default async function InternalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const access = await getAccess();
  const isFounder = access.kind !== "anonymous" && access.isFounder;

  return (
    <div className="min-h-screen">
      {isFounder ? (
        <header className="border-border border-b">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <nav aria-label="Intern" className="flex items-center gap-6">
              <span className="text-sm font-medium tracking-[0.16em] uppercase">
                DISKOE Intern
              </span>
              <Link href="/internal/approvals" className="text-sm font-medium">
                Prüfung
              </Link>
              <Link href="/organizer" className="text-muted-foreground text-sm">
                Organizer-Ansicht
              </Link>
            </nav>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-muted-foreground focus-visible:outline-ring text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Abmelden
              </button>
            </form>
          </div>
        </header>
      ) : null}
      {children}
    </div>
  );
}
