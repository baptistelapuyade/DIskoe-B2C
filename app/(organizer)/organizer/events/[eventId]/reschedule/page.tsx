import { redirect } from "next/navigation";

import {
  ConfirmStatusForm,
  RescheduleForm,
} from "@/components/event/status-forms";
import { LinkButton } from "@/components/ui/button";
import {
  ContextCard,
  MutedText,
  PageShell,
  TintedBlock,
  Workspace,
} from "@/components/ui/page-shell";
import { loadLiveEvent } from "@/lib/event/live";
import { whenText } from "@/lib/event/summary";
import { canPostpone, canReschedule } from "@/lib/event/status";

import { postponeEvent, rescheduleEvent } from "../../status-actions";

export const dynamic = "force-dynamic";

// Figma NACH-11 "Verschieben, Ersatztermin bekannt" (2700:12070) and NACH-12
// "Verschieben, Ersatztermin offen" (2700:12262), one page with the switch of
// the Figma screens as links. A replacement date changes only the date of the
// public version (reschedule_event_date); private draft changes stay private.
// Left out on purpose: the free text "Kurzer Hinweis" and the sentences about
// subscribers (not part of the Alpha).
export default async function RescheduleEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ termin?: string }>;
}) {
  const { eventId } = await params;
  const { termin } = await searchParams;
  const base = `/organizer/events/${eventId}`;
  const { view, live, draftDiffers } = await loadLiveEvent(
    eventId,
    `${base}/reschedule`,
  );
  const status = view.event.publicStatus;

  if (!canReschedule(status)) redirect(`${base}/manage`);

  // An event that already waits for a date can only get one.
  const open = termin === "offen" && canPostpone(status);
  const waiting = status === "postponed_undated";
  const context = `DISKOE / ${view.profileName} · ${waiting ? "Ersatztermin eintragen" : "Verschiebung vorbereiten"}`;

  const switchLink = waiting ? null : open ? (
    <LinkButton
      href={`${base}/reschedule?termin=fest`}
      variant="secondary"
      className="w-full sm:w-80"
    >
      Ersatztermin steht fest
    </LinkButton>
  ) : canPostpone(status) ? (
    <LinkButton
      href={`${base}/reschedule?termin=offen`}
      variant="secondary"
      className="w-full sm:w-80"
    >
      Ersatztermin steht noch nicht fest
    </LinkButton>
  ) : null;

  if (open) {
    return (
      <PageShell
        context={context}
        title="Verschieben ohne neuen Termin"
        subtitle="Der bisherige Termin findet nicht statt. Bestätigt diese Änderung erst, wenn sie feststeht."
      >
        <Workspace
          main={
            <>
              {switchLink}
              <TintedBlock title="Überholter Termin">
                <p className="text-base leading-6">{whenText(live)}</p>
              </TintedBlock>
              <ConfirmStatusForm
                action={postponeEvent.bind(null, eventId)}
                label="Ohne Ersatztermin verschieben"
                pendingLabel="Verschiebt …"
                backHref={`${base}/manage`}
              />
            </>
          }
          side={
            <ContextCard title="Öffentliche Folgen">
              <MutedText>
                „Neuer Termin folgt“ ersetzt den aktuellen Termin. Den
                Ersatztermin tragt ihr später ein. Das Event behält seinen
                Eventlink.
              </MutedText>
            </ContextCard>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      context={context}
      title={
        waiting
          ? "Ersatztermin eintragen"
          : "Event auf einen neuen Termin verschieben"
      }
      subtitle={
        waiting
          ? "Bestätigt den Ersatztermin. Bis dahin zeigt das Event „Neuer Termin folgt“."
          : "Bestätigt den Ersatztermin. Bis dahin bleibt der bisherige Termin öffentlich."
      }
    >
      <Workspace
        main={
          <>
            {switchLink}
            <TintedBlock title="Bisher">
              <p className="text-base leading-6">{whenText(live)}</p>
            </TintedBlock>
            <RescheduleForm
              action={rescheduleEvent.bind(null, eventId)}
              start={{ date: "", time: "" }}
              end={{ date: "", time: "" }}
              endUnknown={live.endUnknown}
              backHref={`${base}/manage`}
            />
          </>
        }
        side={
          <ContextCard title="Gleicher Eventlink">
            <MutedText>
              Der neue Termin ersetzt den alten. Das Event behält seinen
              Eventlink.
              {draftDiffers
                ? " Euer privater Entwurf übernimmt den neuen Termin, andere Änderungen darin bleiben privat."
                : null}
            </MutedText>
          </ContextCard>
        }
      />
    </PageShell>
  );
}
