import Link from "next/link";

import { requireFounder } from "@/lib/auth/server";
import { loadQueue } from "@/lib/profile/founder";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  await requireFounder("/internal/approvals");

  const supabase = await createClient();
  const queue = await loadQueue(supabase);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile zur Prüfung</h1>
        <p className="text-muted-foreground">
          Eingereichte Profile ohne Erstfreigabe. Nur Founder sehen diese Seite.
        </p>
      </header>

      {queue.length === 0 ? (
        <p>Keine Profile warten auf Prüfung.</p>
      ) : (
        <ul className="border-border divide-y border-y">
          {queue.map((item) => (
            <li
              key={item.profileId}
              className="flex items-center justify-between py-4"
            >
              <span>
                <span className="font-medium">{item.name ?? item.slug}</span>
                <span className="text-muted-foreground block text-sm">
                  /{item.slug} · eingereicht{" "}
                  {new Date(item.submittedAt).toLocaleString("de-DE", {
                    timeZone: "Europe/Berlin",
                  })}
                </span>
              </span>
              <Link
                href={`/internal/approvals/${item.profileId}`}
                className="font-medium underline"
              >
                Prüfen
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
