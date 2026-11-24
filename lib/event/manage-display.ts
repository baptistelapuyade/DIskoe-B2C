import type { PillTone } from "@/components/ui/pill";
import type { EventListState } from "@/lib/domain/event-list";
import { t, type Lang } from "@/lib/i18n";

import { changeRows, type ChangeRow } from "./changes-text";
import { toRowDisplay } from "./list-display";
import type { ManageView } from "./manage";
import { accessText, priceText, placeText } from "./summary";
import { listWhen } from "./list-format";

// What the management page shows (Figma EVM-01a to 01f), as plain texts. The
// markup only places them.
export type ManageDisplay = {
  state: EventListState;
  title: string;
  // "Sa, 14.11.2026, 20:00 · Hof am Kanal, Berlin"
  line: string;
  pill: { label: string; tone: PillTone };
  base: string;
  publicPath: string;
  publicUrl: string;
  // "Öffentlich" card (live): never blank, never "Frei" when unknown.
  price: string;
  access: string;
  changes: ChangeRow[];
  // "Stand" card (private draft).
  stateRows: { key: string; label: string; value: string }[];
  gapCount: number;
  canDiscard: boolean;
  // The private draft (for "Änderungen verwerfen" of a live event).
  draftId: string | null;
};

export function toManageDisplay(
  lang: Lang,
  view: ManageView,
  siteBase: string,
): ManageDisplay {
  const row = toRowDisplay(lang, view.row);
  const notSet = t(lang, "Z30.manage.notSet");
  const state = view.row.state;
  const form = view.shown;
  const publicPath = `/e/${view.slug}`;
  const when = view.row.startAt ? listWhen(lang, view.row.startAt) : null;
  const pill =
    state === "changes"
      ? { label: t(lang, "Z30.manage.changes.pill"), tone: "warning" as const }
      : { label: row.stateLabel, tone: row.tone };

  return {
    state,
    title: row.title,
    line: row.line,
    pill,
    base: `/organizer/events/${view.eventId}`,
    publicPath,
    publicUrl: `${siteBase}${publicPath}`,
    price: priceText(form) ?? notSet,
    access: accessText(form) ?? notSet,
    changes: changeRows(lang, view.changes),
    stateRows: [
      {
        key: "title",
        label: t(lang, "Z30.manage.row.title"),
        value: form.title.trim() || notSet,
      },
      {
        key: "when",
        label: t(lang, "Z30.manage.row.when"),
        value: when
          ? t(lang, "Z30.row.when", {
              weekday: when.weekday,
              date: when.date,
              time: when.time,
            })
          : notSet,
      },
      {
        key: "place",
        label: t(lang, "Z30.manage.row.place"),
        value: placeText(form) ?? notSet,
      },
      {
        key: "price",
        label: t(lang, "Z30.manage.row.price"),
        value: priceText(form) ?? notSet,
      },
    ],
    gapCount: view.gapCount,
    canDiscard: view.canDiscard,
    draftId: view.draftRevisionId,
  };
}
