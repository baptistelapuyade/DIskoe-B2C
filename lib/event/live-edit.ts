import { redirect } from "next/navigation";

import { toRowDisplay } from "./list-display";
import { loadManageView, type ManageView } from "./manage";
import type { Lang } from "@/lib/i18n";

// What the pages of "change a live event" (Figma EVB-01 to 06b) need: the
// management view, and the rule that only a live event (public, with or
// without private changes) is changed here. Everything else goes back to the
// management page, which shows the real state; a profile in review goes to
// the review page.
export async function loadLiveEventView(
  eventId: string,
  currentPath: string,
  allow: "editable" | "settled" = "editable",
): Promise<ManageView> {
  const base = `/organizer/events/${eventId}`;
  const view = await loadManageView(eventId, currentPath);

  if (view.review) redirect(`${base}/review`);

  const state = view.row.state;

  // "settled": the result pages (published, discarded) show a live event with
  // nothing waiting; private changes mean it is not the result of those steps.
  if (allow === "settled") {
    if (state === "changes") redirect(`${base}/changes`);
    if (state !== "live") redirect(`${base}/manage`);
  } else if (state !== "live" && state !== "changes") {
    redirect(`${base}/manage`);
  }

  if (view.publishedRevisionId === null) redirect(`${base}/manage`);

  return view;
}

export function eventHead(lang: Lang, view: ManageView) {
  const row = toRowDisplay(lang, view.row);

  return { title: row.title, line: row.line };
}

// The steps of the first event (/edit, /edit/[step], /edit/more) are for
// events that were never public. A live event is changed on its own screen
// (Figma EVB-01); links and bookmarks to the old steps lead there.
export function redirectLiveEvent(
  event: { publishedRevisionId: string | null },
  eventId: string,
): void {
  if (event.publishedRevisionId !== null) {
    redirect(`/organizer/events/${eventId}/changes/edit`);
  }
}
