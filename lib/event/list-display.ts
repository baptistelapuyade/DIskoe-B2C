import type { EventListRow, EventListState } from "@/lib/domain/event-list";
import type { PillTone } from "@/components/ui/pill";
import { t, type Lang, type MessageId } from "@/lib/i18n";

import { listWhen } from "./list-format";

// What one row of the list shows (Figma EVL-01a, 01d). Built from the row and
// the language, so the markup stays free of rules.
export type RowDisplay = {
  id: string;
  title: string;
  // "Sa, 14.11.2026, 20:00 · Hof am Kanal, Berlin"
  line: string;
  stateLabel: string;
  tone: PillTone;
  actionLabel: string;
  actionHref: string;
  // Name of the action for screen readers: "Verwalten: Sommerfest im Hof".
  actionName: string;
};

const STATE: Record<
  EventListState,
  { label: MessageId; tone: PillTone; action: MessageId; target: string }
> = {
  live: {
    label: "Z30.state.live",
    tone: "success",
    action: "Z30.row.manage",
    target: "manage",
  },
  changes: {
    label: "Z30.state.changes",
    tone: "warning",
    action: "Z30.row.manage",
    target: "manage",
  },
  private: {
    label: "Z30.state.private",
    tone: "neutral",
    action: "Z30.row.continue",
    target: "edit",
  },
  inReview: {
    label: "Z30.state.inReview",
    tone: "info",
    action: "Z30.row.viewSubmitted",
    target: "review",
  },
  question: {
    label: "Z30.state.question",
    tone: "info",
    action: "Z30.row.viewSubmitted",
    target: "review",
  },
  postponed: {
    label: "Z30.state.postponed",
    tone: "info",
    action: "Z30.row.manage",
    target: "manage",
  },
  cancelled: {
    label: "Z30.state.cancelled",
    tone: "warning",
    action: "Z30.row.manage",
    target: "manage",
  },
  past: {
    label: "Z30.state.past",
    tone: "neutral",
    action: "Z30.row.manage",
    target: "manage",
  },
};

export function whenLine(lang: Lang, row: EventListRow): string {
  if (row.state === "postponed") return t(lang, "Z30.row.datePostponed");

  const when = row.startAt ? listWhen(lang, row.startAt) : null;

  if (!when) return t(lang, "Z30.row.dateOpen");

  // Cancelled and past events show the day only (Figma EVL-01d).
  return row.state === "cancelled" || row.state === "past"
    ? t(lang, "Z30.row.whenNoTime", { weekday: when.weekday, date: when.date })
    : t(lang, "Z30.row.when", {
        weekday: when.weekday,
        date: when.date,
        time: when.time,
      });
}

export function toRowDisplay(lang: Lang, row: EventListRow): RowDisplay {
  const spec = STATE[row.state];
  const place = [row.placeName, row.city].filter(Boolean).join(", ");
  const title = row.title?.trim() || t(lang, "Z30.row.untitled");
  const actionLabel = t(lang, spec.action);

  return {
    id: row.id,
    title,
    line: [whenLine(lang, row), place].filter((p) => p !== "").join(" · "),
    stateLabel: t(lang, spec.label),
    tone: spec.tone,
    actionLabel,
    actionHref: `/organizer/events/${row.id}/${spec.target}`,
    actionName: t(lang, "Z30.row.aria", { action: actionLabel, title }),
  };
}
