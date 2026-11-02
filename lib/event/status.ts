// What an organizer may do with a live event, and how the status reads.
// Pure: no database access. The database functions (cancel_event,
// postpone_event, reschedule_event) check the same rules again.

import type { Database } from "@/lib/db/types";

import type { EventFormValues } from "./values";

export type EventStatus = Database["public"]["Enums"]["event_status"];

export const STATUS_LABEL: Record<EventStatus, string> = {
  scheduled: "Findet statt",
  rescheduled: "Verschoben, neuer Termin",
  postponed_undated: "Neuer Termin folgt",
  cancelled: "Abgesagt",
};

export function canCancel(status: EventStatus): boolean {
  return status !== "cancelled";
}

// Postponing without a date starts from a scheduled event.
export function canPostpone(status: EventStatus): boolean {
  return status === "scheduled" || status === "rescheduled";
}

// A replacement date may follow a postponement as well.
export function canReschedule(status: EventStatus): boolean {
  return status !== "cancelled";
}

const TIME_FIELDS = [
  "startDate",
  "startTime",
  "endDate",
  "endTime",
  "endUnknown",
] as const satisfies readonly (keyof EventFormValues)[];

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Rescheduling publishes the whole draft (reschedule_event). So that no private
// change becomes public by accident, it is only offered while the draft equals
// the live version apart from the date and time and the image is the same.
export function differsOutsideTime(
  live: EventFormValues,
  draft: EventFormValues,
  liveImageUseId: string | null,
  draftImageUseId: string | null,
): boolean {
  if (liveImageUseId !== draftImageUseId) return true;

  const skip = new Set<string>(TIME_FIELDS);

  return (Object.keys(live) as (keyof EventFormValues)[]).some(
    (key) => !skip.has(key) && !same(live[key], draft[key]),
  );
}
