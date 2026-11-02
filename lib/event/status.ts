// What an organizer may do with a live event, and how the status reads.
// Pure: no database access. The database functions (cancel_event,
// postpone_event, reschedule_event_date) check the same rules again.
import type { Database } from "@/lib/db/types";

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
