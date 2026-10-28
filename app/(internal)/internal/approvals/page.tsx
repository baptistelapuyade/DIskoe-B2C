import Link from "next/link";

import { requireFounder } from "@/lib/auth/server";
import {
  loadQueue,
  mailText,
  type QueueItem,
  type QueueState,
} from "@/lib/profile/founder";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const TABS: { key: QueueState; label: string }[] = [
  { key: "open", label: "Offen" },
  { key: "question", label: "Rückfrage gestellt" },
  { key: "done", label: "Erledigt" },
];

function rowStatus(item: QueueItem): string {
  switch (item.state) {
    case "open":
      return "Wartet auf dich";
    case "question":
      return "Wartet auf Organizer";
    case "done":
      return "Veröffentlicht";
  }
}

function when(iso: string) {
  return new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
}

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireFounder("/internal/approvals");

  const { tab } = await searchParams;
  const active: QueueState =
    TABS.find((entry) => entry.key === tab)?.key ?? "open";

  const supabase = await createClient();
  const queue = await loadQueue(supabase);
  const shown = queue.filter((item) => item.state === active);
  const count = (key: QueueState) =>
    queue.filter((item) => item.state === key).length;

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile zur Prüfung</h1>
        <p className="text-muted-foreground">
          Nur für den Founder sichtbar. Jede Entscheidung wird mit Zeitpunkt
          gespeichert.
        </p>
      </header>

      <nav aria-label="Filter" className="flex flex-wrap gap-2">
        {TABS.map((entry) => (
          <Link
            key={entry.key}
            href={`/internal/approvals?tab=${entry.key}`}
            aria-current={entry.key === active ? "page" : undefined}
            className={
              entry.key === active
                ? "bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm"
                : "border-border rounded-md border px-4 py-2 text-sm"
            }
          >
            {entry.label}
            {entry.key === "done" ? "" : ` (${count(entry.key)})`}
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <p>
          {active === "open"
            ? "Keine Profile warten auf Prüfung."
            : "Hier ist noch nichts."}
        </p>
      ) : (
        <ul className="border-border divide-y border-y">
          {shown.map((item) => (
            <li
              key={item.profileId}
              className="flex items-center justify-between gap-4 py-4"
            >
              <span>
                <span className="font-medium">{item.name ?? item.slug}</span>
                <span className="text-muted-foreground block text-sm">
                  /{item.slug} · {rowStatus(item)} · {when(item.at)}
                </span>
                {item.mail ? (
                  <span className="text-muted-foreground block text-sm">
                    {mailText(item.mail)}
                  </span>
                ) : null}
              </span>
              <Link
                href={`/internal/approvals/${item.profileId}`}
                className="font-medium underline"
              >
                {item.state === "open" ? "Prüfen" : "Ansehen"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
