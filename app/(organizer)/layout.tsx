import type { Metadata } from "next";

import { requireAccess } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Organizer – DISKOE",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrganizerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAccess("/organizer");

  return (
    <div className="min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-sm font-medium tracking-[0.16em] uppercase">
            DISKOE Organizer
          </span>
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
      {children}
    </div>
  );
}
