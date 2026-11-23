"use client";

import { ServerError } from "@/components/errors/server-error";

// ERR-04 in the organizer area: header and footer stay.
export default function OrganizerError({ reset }: { reset: () => void }) {
  return <ServerError reset={reset} framed={false} homeHref="/organizer" />;
}
