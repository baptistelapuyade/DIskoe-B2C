import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventView } from "@/components/public/event-view";
import { eventJsonLd, serializeJsonLd } from "@/lib/public/json-ld";
import { eventMetadata } from "@/lib/public/metadata";
import { getLang } from "@/lib/i18n/server";
import { getPublicEvent } from "@/lib/public/queries";
import { siteUrl } from "@/lib/public/site";

// Shows the confirmed, published state of an event. A draft, a withdrawn event
// and an unknown address all end in the same 404.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEvent(await getLang(), slug);

  return event ? eventMetadata(event) : { title: "Nicht gefunden" };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getPublicEvent(await getLang(), slug);

  if (!event) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(eventJsonLd(event, siteUrl())),
        }}
      />
      <EventView event={event} />
    </>
  );
}
