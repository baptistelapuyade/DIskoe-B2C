import Link from "next/link";

import {
  EventDetailsForm,
  EventGapList,
  EventImageForm,
} from "@/components/event/forms";
import { loadOwnerEventView } from "@/lib/event/load";

import { saveEventDetails, uploadEventImage } from "../../actions";

export const dynamic = "force-dynamic";

// TODO(spec): texts are proposals (Figma "Eventeditor" is the visual
// reference; the layout here is a plain form).
export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const view = await loadOwnerEventView(
    eventId,
    `/organizer/events/${eventId}/edit`,
  );
  const { image } = view;

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
      <header className="space-y-3">
        <Link href="/organizer" className="text-muted-foreground text-sm">
          ← Zurück
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          Event bearbeiten
        </h1>
        <p className="text-muted-foreground">
          Entwurf – privat. Du kannst jederzeit unvollständig speichern.
        </p>
      </header>

      <EventGapList gaps={view.gaps} />

      <section aria-labelledby="details-heading" className="space-y-4">
        <h2 id="details-heading" className="text-xl font-semibold">
          Angaben
        </h2>
        <EventDetailsForm
          action={saveEventDetails.bind(null, eventId)}
          values={view.form}
        />
      </section>

      <section aria-labelledby="image-heading" className="space-y-4">
        <h2 id="image-heading" className="text-xl font-semibold">
          Eventbild
        </h2>
        <p className="text-muted-foreground text-sm">
          Das Bild ist nur zum Veröffentlichen nötig. Für den Entwurf kannst du
          es später hochladen.
        </p>
        {image?.signedUrl ? (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.signedUrl}
              alt={image.altText ?? ""}
              className="max-h-64 rounded-md"
            />
            <figcaption className="text-muted-foreground mt-2 text-sm">
              Aktuelles Bild. Ein neues Bild ersetzt es im Entwurf.
            </figcaption>
          </figure>
        ) : null}
        <EventImageForm action={uploadEventImage.bind(null, eventId)} />
      </section>
    </main>
  );
}
