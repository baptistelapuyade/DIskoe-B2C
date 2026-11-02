// schema.org Event from the public DTO, the same source as the page. Pure.
// Rules: no offer for an unknown price (and never price 0 for it), no end date
// when the end is unknown, no offer for a cancelled event, no start date for an
// event that is postponed without a new date, no offer for a past event.

import type { PublicEvent } from "./dto";

const STATUS_URL: Record<PublicEvent["status"], string> = {
  scheduled: "https://schema.org/EventScheduled",
  rescheduled: "https://schema.org/EventRescheduled",
  postponed_undated: "https://schema.org/EventPostponed",
  cancelled: "https://schema.org/EventCancelled",
};

export type JsonLdEvent = Record<string, unknown>;

export function eventJsonLd(event: PublicEvent, siteUrl: string): JsonLdEvent {
  const base = siteUrl.replace(/\/+$/, "");
  const data: JsonLdEvent = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    url: `${base}/e/${event.slug}`,
    eventStatus: STATUS_URL[event.status],
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [event.imageUrl],
    organizer: {
      "@type": "Organization",
      name: event.organizer.name,
      url: `${base}/${event.organizer.slug}`,
    },
  };

  if (event.description) {
    data.description = event.description;
  }

  if (event.status !== "postponed_undated") {
    data.startDate = new Date(event.startInstant).toISOString();

    if (event.endInstant) {
      data.endDate = new Date(event.endInstant).toISOString();
    }
  }

  if (event.placeName || event.addressLines.length > 0) {
    data.location = {
      "@type": "Place",
      ...(event.placeName ? { name: event.placeName } : {}),
      address: event.addressLines.join(", "),
    };
  }

  if (event.offer && event.status !== "cancelled" && !event.past) {
    data.offers = {
      "@type": "Offer",
      price: event.offer.amount,
      priceCurrency: event.offer.currency,
      ...(event.ticketUrl ? { url: event.ticketUrl } : {}),
    };
  }

  return data;
}

// The text goes into a script tag: "<" is escaped so that no value can close
// the tag.
export function serializeJsonLd(data: JsonLdEvent): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
