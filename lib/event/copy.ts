// "Als neues Event kopieren" (Figma EVM-02a/b). Pure: builds the revision of the
// new private draft from the public stand of an event. No database access.

import { unanswered, valueOrNull } from "@/lib/domain/answers";
import type { EventListState } from "@/lib/domain/event-list";
import type { TablesUpdate } from "@/lib/db/types";

import { rowToValues, valuesToRow, type EventRevisionRow } from "./values";

// Only a published event is copied: live, or past (EVM-01a, EVM-01f). A
// cancelled or postponed event, one with private changes and a private draft
// have no copy action in the frames.
const COPYABLE: readonly EventListState[] = ["live", "past"];

export function canCopyEvent(state: EventListState): boolean {
  return COPYABLE.includes(state);
}

// What the copy carries over: title, description, format, place, price,
// access kinds, atmosphere and the "Mehr zum Abend" blocks (founder, 25.11.2026:
// format and blocks come along, they belong together). Date and time are new
// (not answered yet, never copied), and so are the link to the ticket sale and
// the "sold out" mark: both belong to the old date. The picture is a new use of
// the same file and is linked by the caller.
export function copyRevisionFields(
  source: EventRevisionRow,
): Omit<TablesUpdate<"event_revisions">, "id" | "event_id"> {
  const values = rowToValues(source);
  const routes = valueOrNull(values.access);

  return {
    ...valuesToRow({
      ...values,
      start: unanswered(),
      end: unanswered(),
      access:
        routes === null
          ? values.access
          : {
              state: "provided",
              value: routes.map((route) => ({ kind: route.kind, url: null })),
            },
    }),
    modules: source.modules,
  };
}
