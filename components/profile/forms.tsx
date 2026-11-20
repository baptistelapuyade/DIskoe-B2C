"use client";

import { useActionState, useState } from "react";

import type { FormState } from "@/app/(organizer)/organizer/profiles/[profileId]/actions";

type Action = (previous: FormState, formData: FormData) => Promise<FormState>;

const initial: FormState = { ok: false };
const buttonClass =
  "bg-primary text-primary-foreground rounded-md px-5 py-2.5 font-medium disabled:opacity-60";

function Status({ state }: { state: FormState }) {
  if (!state.message) return null;

  return (
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
  );
}

export function PublishForm({
  action,
  update,
}: {
  action: Action;
  update: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [asking, setAsking] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {asking ? (
        <>
          <input type="hidden" name="confirmed" value="yes" />
          <p role="alert" className="font-medium">
            {update
              ? "Die geänderten Angaben werden öffentlich sichtbar. Jetzt veröffentlichen?"
              : "Dein Profil wird öffentlich sichtbar. Jetzt veröffentlichen?"}
          </p>
          <div className="flex gap-3">
            <button type="submit" disabled={pending} className={buttonClass}>
              {pending ? "Veröffentlicht …" : "Ja, jetzt veröffentlichen"}
            </button>
            <button
              type="button"
              onClick={() => setAsking(false)}
              className="border-border rounded-md border px-5 py-2.5"
            >
              Abbrechen
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setAsking(true)}
          className={buttonClass}
        >
          {update ? "Änderungen veröffentlichen" : "Veröffentlichen"}
        </button>
      )}
      <Status state={state} />
    </form>
  );
}

export function RetryImageForm({
  action,
}: {
  action: (previous: FormState) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-3">
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Versucht es …" : "Bild erneut veröffentlichen"}
      </button>
      <Status state={state} />
    </form>
  );
}
