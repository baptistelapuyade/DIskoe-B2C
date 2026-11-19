import { notFound } from "next/navigation";

import { EventStepScreen } from "@/components/event/step-screen";
import { EVENT_STEPS, type EventStep } from "@/lib/domain/event-steps";
import { getLang } from "@/lib/i18n/server";
import { loadOwnerEventView } from "@/lib/event/load";

export const dynamic = "force-dynamic";

// The six steps of the first event (Figma EVT-01 to EVT-06, EVT-09 to
// EVT-09c): basics, date and time, place, price and access, event image,
// atmosphere.
const BACK: Record<Exclude<EventStep, "basics">, EventStep> = {
  time: "basics",
  place: "time",
  price: "place",
  image: "price",
  atmosphere: "image",
};

export default async function EditEventStepPage({
  params,
}: {
  params: Promise<{ eventId: string; step: string }>;
}) {
  const { eventId, step } = await params;

  if (!(EVENT_STEPS as readonly string[]).includes(step)) {
    notFound();
  }

  const current = step as EventStep;
  const base = `/organizer/events/${eventId}`;
  const lang = await getLang();
  const view = await loadOwnerEventView(eventId, `${base}/edit/${current}`);
  const { form } = view;

  return (
    <EventStepScreen
      lang={lang}
      step={current}
      eventId={eventId}
      profileId={view.event.organizerId}
      backHref={
        current === "basics" ? "/organizer" : `${base}/edit/${BACK[current]}`
      }
      image={
        view.image
          ? { url: view.image.signedUrl, fileName: view.image.fileName }
          : null
      }
      initial={{
        title: form.title,
        format: form.format,
        description: form.description,
        startDate: form.startDate,
        startTime: form.startTime,
        endDate: form.endDate,
        endTime: form.endTime,
        endUnknown: form.endUnknown,
        placeName: form.placeName,
        addressLine: form.addressLine,
        postalCode: form.postalCode,
        city: form.city,
        priceModel: form.priceModel,
        priceAmount: form.priceAmount,
        priceAmountMax: form.priceAmountMax,
        priceFees: form.priceFees,
        accessKinds: form.accessKinds,
        onlineTicketUrl: form.onlineTicketUrl,
        onlineRegistrationUrl: form.onlineRegistrationUrl,
        onlineTicketAvailability: form.onlineTicketAvailability,
        altText: view.image?.altText ?? "",
        atmosphereTags: form.atmosphereTags,
        atmosphereDescription: form.atmosphereDescription,
      }}
    />
  );
}
