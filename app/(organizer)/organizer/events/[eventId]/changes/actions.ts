"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { parseEventInput } from "@/lib/domain/event-publication";
import {
  applyLiveEdit,
  type LiveEditErrors,
} from "@/lib/domain/event-live-edit";
import { ensureEditableEventDraft } from "@/lib/event/draft";
import { requireOwnedEvent } from "@/lib/event/load";
import { loadManageView } from "@/lib/event/manage";
import { copyPublishedEventImage } from "@/lib/event/publish";
import { valuesToRow } from "@/lib/event/values";
import { createClient } from "@/lib/supabase/server";

// Changing a live event (Figma EVB-01 to EVB-06b). The changes go into the
// private draft; the public page is not touched until the owner publishes.
// Nothing a person typed is logged.

function basePath(eventId: string) {
  return `/organizer/events/${eventId}`;
}

function revalidateEvent(eventId: string) {
  revalidatePath(`${basePath(eventId)}`, "layout");
  revalidatePath("/organizer/events");
  revalidatePath("/organizer");
}

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

// ---------------------------------------------------------------------------
// EVB-01a to 01c: save the changes into the private draft.
// ---------------------------------------------------------------------------
export type LiveEditState =
  | { status: "idle" }
  // Something typed does not fit; the codes belong to the fields (EVB-01b).
  | { status: "invalid"; errors: LiveEditErrors }
  // The save did not go through (EVB-01c).
  | { status: "failed" };

export async function saveLiveEventChanges(
  eventId: string,
  _previous: LiveEditState,
  formData: FormData,
): Promise<LiveEditState> {
  const base = basePath(eventId);
  const path = `${base}/changes/edit`;
  const { userId, event } = await requireOwnedEvent(eventId, path);
  const view = await loadManageView(eventId, path);

  // Only a live event is changed here; before that the steps apply.
  if (view.row.state !== "live" && view.row.state !== "changes") {
    redirect(`${base}/manage`);
  }

  const result = applyLiveEdit(view.draftForm, {
    title: text(formData.get("title")),
    description: text(formData.get("description")),
    startDate: text(formData.get("startDate")),
    startTime: text(formData.get("startTime")),
    placeName: text(formData.get("placeName")),
    address: text(formData.get("address")),
  });

  if (!result.ok) {
    return { status: "invalid", errors: result.errors };
  }

  const merged = { ...view.draftForm, ...result.values };
  const parsed = parseEventInput({
    ...merged,
    endUnknown: merged.endUnknown ? "on" : null,
  });

  if (!parsed.ok) {
    return { status: "failed" };
  }

  try {
    const supabase = await createClient();
    const { revisionId } = await ensureEditableEventDraft(
      supabase,
      userId,
      event,
    );

    // Row Level Security filters silently: an update that touches no row is a
    // failure, not a success.
    const { data, error } = await supabase
      .from("event_revisions")
      .update(valuesToRow(parsed.value))
      .eq("id", revisionId)
      .select("id");

    if (error || !data || data.length !== 1) {
      return { status: "failed" };
    }
  } catch {
    return { status: "failed" };
  }

  revalidateEvent(eventId);
  redirect(`${base}/changes/saved`);
}

// ---------------------------------------------------------------------------
// EVB-04a to 04c: publish the draft. Both declarations are checked here and
// again by the database. The ids and the stand of the draft are the ones the
// owner saw on the publish screen: if the draft (even in place) or the public
// page changed meanwhile (another tab or device), nothing is published and the
// review screen opens again.
// ---------------------------------------------------------------------------
export type PublishEventState =
  | { status: "idle" }
  // One or both ticks are missing (EVB-04b).
  | { status: "missing"; rights: boolean; usage: boolean }
  // The call did not go through (EVB-04c).
  | { status: "failed" };

export async function publishEventChanges(
  eventId: string,
  expected: {
    draftId: string;
    // The stand of the draft the owner saw (counter of the revision).
    draftVersion: number | null;
    publishedId: string;
    stateVersion: number;
    status: "scheduled" | "rescheduled" | "postponed_undated" | "cancelled";
  },
  _previous: PublishEventState,
  formData: FormData,
): Promise<PublishEventState> {
  const base = basePath(eventId);

  await requireOwnedEvent(eventId, `${base}/changes/publish`);

  const rights = formData.get("rights") === "on";
  const usage = formData.get("usage") === "on";

  if (!rights || !usage) {
    return { status: "missing", rights, usage };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("publish_event", {
    p_event_id: eventId,
    p_expected_draft_revision_id: expected.draftId,
    p_expected_draft_version: expected.draftVersion ?? undefined,
    p_expected_published_revision_id: expected.publishedId,
    p_expected_state_version: expected.stateVersion,
    p_expected_status: expected.status,
    p_confirmed_rights: rights,
    p_confirmed_usage: usage,
  });

  if (error) {
    switch (error.code) {
      // The draft or the public page is not the one that was reviewed.
      case "DK001":
        redirect(`${base}/changes?stale=1`);
      // Required details are missing: back to the editor, which names them.
      case "DK002":
        redirect(`${base}/changes/edit`);
      // Nothing new to publish (or not allowed): the review screen says so.
      case "DK003":
        redirect(`${base}/changes`);
      default:
        return { status: "failed" };
    }
  }

  // The event image is not part of these changes and is public already;
  // copying is safe to repeat and only matters for a draft with a new image.
  await copyPublishedEventImage(supabase, eventId);

  revalidateEvent(eventId);
  redirect(`${base}/changes/published`);
}

// ---------------------------------------------------------------------------
// EVB-06a: really delete the private changes. The public page stays as it is.
// ---------------------------------------------------------------------------
export async function discardEventChanges(
  eventId: string,
  expectedDraftId: string,
): Promise<void> {
  const base = basePath(eventId);

  await requireOwnedEvent(eventId, `${base}/changes/discard`);

  const supabase = await createClient();
  const { data: paths, error } = await supabase.rpc("discard_event_changes", {
    p_event_id: eventId,
    p_expected_draft_revision_id: expectedDraftId,
  });

  if (error) {
    // The draft is not the one that was shown.
    if (error.code === "DK001") {
      redirect(`${base}/changes?stale=1`);
    }

    if (error.code === "42501") notFound();

    // Nothing left to discard (second click, other tab): same result.
    if (error.code !== "DK003") {
      redirect(`${base}/changes/discard?d=${expectedDraftId}&failed=1`);
    }
  }

  // The files of the discarded draft's images. The rows are gone already; a
  // file that could not be removed is an orphan in the private bucket, never
  // public.
  if (paths && paths.length > 0) {
    try {
      await supabase.storage.from("private-media").remove(paths);
    } catch {
      // Best effort.
    }
  }

  revalidateEvent(eventId);
  redirect(`${base}/changes/discarded`);
}
