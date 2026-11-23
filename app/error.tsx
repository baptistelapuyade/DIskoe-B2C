"use client";

import { ServerError } from "@/components/errors/server-error";

// ERR-04 outside the organizer area.
export default function RootError({ reset }: { reset: () => void }) {
  return <ServerError reset={reset} framed homeHref="/" />;
}
