"use client";

import { useActionState } from "react";

import type { FormState } from "@/app/(organizer)/organizer/profiles/[profileId]/actions";

const initial: FormState = { ok: false };

export function ApproveForm({
  action,
  profileId,
  revisionId,
}: {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  profileId: string;
  revisionId: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="revisionId" value={revisionId} />
      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-primary-foreground rounded-md px-5 py-2.5 font-medium disabled:opacity-60"
      >
        {pending ? "Gibt frei …" : "Diesen Stand freigeben"}
      </button>
      {state.message ? (
        <div
          role={state.ok ? "status" : "alert"}
          className={state.ok ? "text-sm" : "text-destructive text-sm"}
        >
          <p>{state.message}</p>
          {state.gaps && state.gaps.length > 0 ? (
            <ul className="mt-1 list-disc pl-5">
              {state.gaps.map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
