import Link from "next/link";

import { EventAccessForm } from "@/components/event/access-form";
import { buttonClass } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { loadOwnerEventView } from "@/lib/event/load";

import { saveEventSection } from "../../actions";

export const dynamic = "force-dynamic";

// Figma "Preis und Zugang" (2688:10292 and variants). The tab "Programm und
// Besuch" is not built (not part of the Durchstich).
export default async function AccessPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const view = await loadOwnerEventView(
    eventId,
    `/organizer/events/${eventId}/access`,
  );
  const base = `/organizer/events/${eventId}`;

  return (
    <PageShell
      context={`DISKOE / ${view.form.title || "Neues Event"} · privater Entwurf`}
      title="Preis und Zugang"
    >
      <nav aria-label="Editorbereiche" className="mt-4 flex flex-wrap gap-4">
        <Link href={`${base}/edit`} className={buttonClass("secondary", "w-[180px]")}>
          Basisangaben
        </Link>
        <span
          aria-current="page"
          className={buttonClass("secondary", "w-[220px]")}
        >
          Preis und Zugang
        </span>
      </nav>
      <EventAccessForm
        action={saveEventSection.bind(null, eventId, "access")}
        values={view.form}
        backHref={`${base}/edit`}
      />
    </PageShell>
  );
}
