import { EventImageForm } from "@/components/event/image-form";
import { LinkButton } from "@/components/ui/button";
import { MutedText, PageShell } from "@/components/ui/page-shell";
import { FORMAT_LABEL } from "@/lib/domain/event-publication";
import { loadOwnerEventView } from "@/lib/event/load";
import { placeText, whenText } from "@/lib/event/summary";

import { uploadEventImage } from "../../actions";

export const dynamic = "force-dynamic";

// Figma "Eventeditor — Bild fehlt" / "Flyer ausgewählt" (2533:4121, 2533:4172).
// Not built (not part of the Durchstich): "Hochgeladenen Flyer verwenden" and
// the whole "Eventgestaltung" block (palette, fonts, colours).
export default async function EventImagePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const view = await loadOwnerEventView(
    eventId,
    `/organizer/events/${eventId}/image`,
  );
  const base = `/organizer/events/${eventId}`;
  const v = view.form;
  const image = view.image;
  const format = (FORMAT_LABEL as Record<string, string>)[v.format];

  return (
    <PageShell
      topAction={
        <LinkButton href={`${base}/edit`} variant="ghost">
          Zurück
        </LinkButton>
      }
      context={`DISKOE / ${view.profileName} · privater Entwurf`}
      title="Wie soll euer Event erscheinen?"
      subtitle="Wählt ein Eventbild für die feste Eventseite."
    >
      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <section className="flex min-w-0 flex-1 flex-col gap-4 lg:max-w-[600px]">
          <h2 className="text-2xl leading-[30px] font-medium tracking-[-0.4px]">
            Öffentliches Eventbild · erforderlich
          </h2>
          <p className="text-sm leading-5">
            Vor der Einreichung braucht euer Event ein Bild. Als privaten
            Entwurf könnt ihr es auch ohne Bild speichern und ansehen.
          </p>
          <EventImageForm action={uploadEventImage.bind(null, eventId)} />
          <p className="text-sm leading-5">
            {image?.signedUrl
              ? "Eventbild ausgewählt. Ein neues Bild ersetzt es im Entwurf."
              : "Noch kein Eventbild ausgewählt. Euer Profilbild wird nicht automatisch übernommen."}
          </p>
        </section>

        <section className="flex min-w-0 flex-col gap-4 lg:w-[440px] lg:shrink-0">
          <h2 className="text-2xl leading-[30px] font-medium tracking-[-0.4px]">
            Vorschau
          </h2>
          <article className="border-border bg-background flex flex-col gap-4 rounded-xl border p-5">
            {image?.signedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.signedUrl}
                alt={image.altText ?? ""}
                className="max-h-64 w-full object-cover"
              />
            ) : (
              <div className="bg-muted py-9 text-sm leading-5 font-medium">
                Eventbild fehlt
              </div>
            )}
            <h3 className="text-2xl leading-[30px] font-medium tracking-[-0.4px]">
              {v.title || "Titel fehlt noch"}
            </h3>
            <p className="text-sm leading-5">
              {[view.profileName, format].filter(Boolean).join(" · ")}
            </p>
            <p className="text-sm leading-5">
              {whenText(v) ?? "Beginn fehlt noch"}
              <br />
              {placeText(v) ?? "Ort fehlt noch"}
            </p>
            {v.description ? (
              <p className="text-sm leading-5">{v.description}</p>
            ) : null}
          </article>
          <MutedText>Bild und Angaben werden hier gemeinsam geprüft.</MutedText>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-4">
        <LinkButton href={`${base}/edit`} variant="ghost">
          Zurück zum Entwurf
        </LinkButton>
        <LinkButton href={`${base}/preview`} variant="primary">
          Zur Eventvorschau
        </LinkButton>
      </div>
    </PageShell>
  );
}
