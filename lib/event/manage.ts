import { diffEventContent, type EventChange } from "@/lib/domain/event-changes";
import {
  listState,
  type EventListRow,
  type EventStatus,
  type ReviewHint,
} from "@/lib/domain/event-list";
import { archiveInstant } from "@/lib/domain/time";
import { createClient } from "@/lib/supabase/server";

import { eventContentOf } from "./changes";
import { loadEventRevision, loadEventRevisionVersion } from "./draft";
import { loadPublicationView } from "./publication";
import { rowToFormValues, type EventFormValues } from "./values";

// Everything the event management page needs (Figma EVM-01a to 01f).
export type ManageView = {
  eventId: string;
  slug: string;
  // The state as the list shows it; the page differs by it.
  row: EventListRow;
  // Events of a profile in review are view-only: the page sends the owner to
  // the review page instead.
  review: ReviewHint;
  // The public stand (published events) or the draft (never published).
  shown: EventFormValues;
  // What the private draft changes against the public stand (EVM-01b).
  changes: EventChange[];
  // Missing details of a private draft (EVM-01c).
  gapCount: number;
  // Only a never-published, never-submitted draft can be discarded (EVB-07).
  canDiscard: boolean;
  draftRevisionId: string | null;
  // The counter of that draft; publish_event refuses a page that shows an
  // older stand of the same draft.
  draftVersion: number | null;
  publishedRevisionId: string | null;
  // What publish_event expects back (optimistic check against a stale page).
  stateVersion: number;
  publicStatus: EventStatus;
  // The private draft as the form shows it (the live edit screen, EVB-01);
  // the public stand while there is no draft.
  draftForm: EventFormValues;
};

export async function loadManageView(
  eventId: string,
  currentPath: string,
  now: Date = new Date(),
): Promise<ManageView> {
  const view = await loadPublicationView(eventId, currentPath);
  const event = view.event.event;
  const supabase = await createClient();
  const publishedRow = event.publishedRevisionId
    ? await loadEventRevision(supabase, event.publishedRevisionId)
    : null;
  const draftRow = event.draftRevisionId
    ? await loadEventRevision(supabase, event.draftRevisionId)
    : null;
  const draftVersion = event.draftRevisionId
    ? await loadEventRevisionVersion(supabase, event.draftRevisionId)
    : null;
  const published = publishedRow !== null;
  const review: ReviewHint =
    !published && (view.status === "in_review" || view.status === "question")
      ? view.status
      : null;
  const changes =
    publishedRow && draftRow && publishedRow.id !== draftRow.id
      ? diffEventContent(eventContentOf(publishedRow), eventContentOf(draftRow))
      : [];
  const shownRow = publishedRow ?? draftRow;
  const end =
    shownRow && shownRow.end_state === "provided" ? shownRow.end_at : null;
  const archiveAt =
    shownRow && shownRow.start_at
      ? archiveInstant(shownRow.start_at, end)
      : null;
  const status = event.publicStatus as EventStatus;
  const state = listState({
    published,
    draftDiffers: changes.length > 0,
    status,
    archiveAt,
    review,
    now,
  });

  return {
    eventId,
    slug: event.slug,
    row: {
      id: eventId,
      title: shownRow?.title ?? null,
      startAt: shownRow?.start_at ?? null,
      placeName: shownRow?.place_name ?? null,
      city: shownRow?.city ?? null,
      state,
    },
    review,
    shown: shownRow ? rowToFormValues(shownRow) : view.event.form,
    changes,
    gapCount: view.event.gaps.length,
    canDiscard:
      !published && event.firstApprovedRevisionId === null && review === null,
    draftRevisionId: event.draftRevisionId,
    draftVersion,
    publishedRevisionId: event.publishedRevisionId,
    stateVersion: event.stateVersion,
    publicStatus: status,
    draftForm: draftRow
      ? rowToFormValues(draftRow)
      : publishedRow
        ? rowToFormValues(publishedRow)
        : view.event.form,
  };
}
