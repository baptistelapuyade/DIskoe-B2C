"use client";

import { useActionState } from "react";

import type { EventFormState } from "@/app/(organizer)/organizer/events/actions";
import { Button } from "@/components/ui/button";
import { StatusMessage } from "@/components/ui/page-shell";

type Action = (
  previous: EventFormState,
  formData: FormData,
) => Promise<EventFormState>;

const initial: EventFormState = { ok: false };

// Figma "Eventstart — Material oder manuell" (2533:3824): "Manuell eingeben".
// Creates an empty private draft and opens the editor. The material fields
// (text, flyer, link) are not built: the AI capture is a later slice.
export function ManualStartForm({
  action,
  profileId,
}: {
  action: Action;
  profileId: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex items-center gap-4">
      <input type="hidden" name="profileId" value={profileId} />
      <StatusMessage ok={state.ok} message={state.message} />
      <Button type="submit" variant="ghost" disabled={pending}>
        {pending ? "Legt an …" : "Manuell eingeben"}
      </Button>
    </form>
  );
}
