"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import type { PublishEventState } from "@/app/(organizer)/organizer/events/[eventId]/changes/actions";
import type { RetryImageState } from "@/components/event/retry-image-form";
import { copyPublishedEventImage } from "@/lib/event/publish";
import { DISCARDED_COOKIE } from "@/lib/event/discard-cookie";
import { loadEventRevision } from "@/lib/event/draft";
import { requireOwnedEvent } from "@/lib/event/load";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Publish a further event (Figma NACH-17, NACH-18)
// ---------------------------------------------------------------------------
// The profile is approved, so the owner publishes the event himself with the
// two confirmations. `expected` is the stand the owner reviewed; the database
// refuses anything else. Nothing a person typed is logged.
export async function publishLaterEvent(
  eventId: string,
  expected: {
    draftId: string;
    draftVersion: number | null;
    stateVersion: number;
    status: "scheduled" | "rescheduled" | "postponed_undated" | "cancelled";
  },
  _previous: PublishEventState,
  formData: FormData,
): Promise<PublishEventState> {
  const base = `/organizer/events/${eventId}`;

  await requireOwnedEvent(eventId, `${base}/publish`);

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
    // A further event has no published revision yet.
    p_expected_published_revision_id: null as unknown as string,
    p_expected_state_version: expected.stateVersion,
    p_expected_status: expected.status,
    p_confirmed_rights: rights,
    p_confirmed_usage: usage,
  });

  if (error) {
    switch (error.code) {
      // The draft is not the one that was reviewed: the page opens again with
      // a hint.
      case "DK001":
        redirect(`${base}/publish?stale=1`);
      // Details are missing, or this is not possible any more (profile not
      // approved, nothing new): the page sends the owner where it belongs.
      case "DK002":
      case "DK003":
        redirect(`${base}/publish`);
      default:
        return { status: "failed" };
    }
  }

  // The public copy of the image. If it fails the event is live already; the
  // confirmation page offers to try again.
  await copyPublishedEventImage(supabase, eventId);

  revalidatePath("/organizer");
  revalidatePath(`/organizer/events/${eventId}`, "layout");
  redirect(`${base}/published`);
}

export async function retryEventImagePublish(
  eventId: string,
  _previous: RetryImageState,
): Promise<RetryImageState> {
  await requireOwnedEvent(eventId, `/organizer/events/${eventId}/published`);

  const supabase = await createClient();
  const result = await copyPublishedEventImage(supabase, eventId);

  revalidatePath(`/organizer/events/${eventId}/published`);

  return result === "copied" ? { status: "idle" } : { status: "failed" };
}

// ---------------------------------------------------------------------------
// Discard the draft of an event that was never published (Figma EVB-07a, 07b)
// ---------------------------------------------------------------------------
// The title for the result page travels in a short-lived cookie: the event is
// gone by then, and a title in the address could be forged into the sentence.
export async function discardEventDraft(
  eventId: string,
  expectedDraftId: string,
): Promise<void> {
  const base = `/organizer/events/${eventId}`;
  const { event } = await requireOwnedEvent(eventId, `${base}/discard`);
  const supabase = await createClient();
  const revision = event.draftRevisionId
    ? await loadEventRevision(supabase, event.draftRevisionId)
    : null;
  const title = revision?.title?.trim() || null;
  const { data: paths, error } = await supabase.rpc("discard_event_draft", {
    p_event_id: eventId,
    p_expected_draft_revision_id: expectedDraftId,
  });

  if (error) {
    // Not the draft that was shown, or it is not discardable any more (public,
    // in review, submitted before): the management page shows the real state.
    if (error.code === "DK001" || error.code === "DK003") {
      redirect(`${base}/manage`);
    }
    if (error.code === "42501") notFound();

    redirect(`${base}/discard?failed=1`);
  }

  // The files of the draft's images. The rows are gone already; a file that
  // could not be removed is an orphan in the private bucket, never public.
  if (paths && paths.length > 0) {
    try {
      await supabase.storage.from("private-media").remove(paths);
    } catch {
      // Best effort.
    }
  }

  (await cookies()).set(DISCARDED_COOKIE, encodeURIComponent(title ?? ""), {
    maxAge: 120,
    path: "/organizer/events/discarded",
    httpOnly: true,
    sameSite: "lax",
  });

  revalidatePath("/organizer/events");
  revalidatePath("/organizer");
  redirect("/organizer/events/discarded");
}
