"use server";

import { revalidatePath } from "next/cache";

import type { Json } from "@/lib/db/types";
import {
  formToStored,
  MODULE_KEYS,
  validateModules,
  type ModuleErrors,
  type ModuleIntent,
  type ModulesInput,
} from "@/lib/domain/event-modules";
import { ensureEditableEventDraft, loadEventRevision } from "@/lib/event/draft";
import { requireOwnedEvent } from "@/lib/event/load";
import { rowToFormValues } from "@/lib/event/values";
import { createClient } from "@/lib/supabase/server";

// Saves step 7 "Mehr zum Abend" (Figma EVT-07, EVT-07m-a to 07m-k): the blocks
// that are on the page and what is in them. The answer carries codes, never
// texts. Nothing a person typed is logged.
export type ModulesResult =
  | { status: "saved"; next: string }
  | { status: "invalid"; errors: ModuleErrors }
  | { status: "failed" };

const FAILED: ModulesResult = { status: "failed" };

function isModulesInput(value: unknown): value is ModulesInput {
  if (typeof value !== "object" || value === null) return false;

  const input = value as { blocks?: unknown; form?: unknown };

  return (
    Array.isArray(input.blocks) &&
    input.blocks.every((block) => typeof block === "string") &&
    typeof input.form === "object" &&
    input.form !== null
  );
}

export async function saveEventModules(request: {
  eventId: string;
  intent: ModuleIntent;
  input: ModulesInput;
}): Promise<ModulesResult> {
  const { eventId, intent, input } = request;

  if ((intent !== "next" && intent !== "later") || !isModulesInput(input)) {
    return FAILED;
  }

  // Only known blocks, each once; anything else is dropped before the check.
  const blocks = MODULE_KEYS.filter((key) => input.blocks.includes(key));
  const clean: ModulesInput = { blocks, form: input.form };

  try {
    const { userId, event } = await requireOwnedEvent(
      eventId,
      `/organizer/events/${eventId}/edit/more`,
    );
    const supabase = await createClient();
    const revision = event.draftRevisionId
      ? await loadEventRevision(supabase, event.draftRevisionId)
      : null;

    if (!revision) {
      return FAILED;
    }

    const errors = validateModules(
      clean,
      rowToFormValues(revision).format,
      intent,
    );

    if (Object.keys(errors).length > 0) {
      return { status: "invalid", errors };
    }

    const { revisionId } = await ensureEditableEventDraft(
      supabase,
      userId,
      event,
    );

    // Row Level Security filters silently: an update that touches no row is a
    // failure, not a success.
    const { data, error } = await supabase
      .from("event_revisions")
      .update({ modules: formToStored(clean) as unknown as Json })
      .eq("id", revisionId)
      .select("id");

    if (error || !data || data.length !== 1) {
      return FAILED;
    }

    revalidatePath(`/organizer/events/${eventId}`, "layout");
    revalidatePath("/organizer");

    // The submit check (EIN-01) is a later slice: until then the overview.
    return { status: "saved", next: `/organizer/events/${eventId}/edit` };
  } catch (error) {
    // The framework signals redirect() and notFound() by throwing; those must
    // pass through. Everything else is a failed save.
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      /^NEXT_(REDIRECT|HTTP_ERROR_FALLBACK|NOT_FOUND)/.test(
        (error as { digest: string }).digest,
      )
    ) {
      throw error;
    }

    return FAILED;
  }
}
