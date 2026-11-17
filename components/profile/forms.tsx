"use client";

import { useActionState, useState } from "react";

import type { FormState } from "@/app/(organizer)/organizer/profiles/[profileId]/actions";

type Action = (previous: FormState, formData: FormData) => Promise<FormState>;

const initial: FormState = { ok: false };
const buttonClass =
  "bg-primary text-primary-foreground rounded-md px-5 py-2.5 font-medium disabled:opacity-60";

function FieldError({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={id} role="alert" className="text-destructive mt-1 text-sm">
      {text}
    </p>
  ) : null;
}

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

export function SubmitForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <label className="flex items-start gap-3">
        <input type="checkbox" name="rights" className="mt-1" />
        <span>
          Ich habe die Angaben geprüft und bin berechtigt, für dieses Projekt zu
          veröffentlichen.
        </span>
      </label>
      <label className="flex items-start gap-3">
        <input type="checkbox" name="usage" className="mt-1" />
        <span>
          Ich habe die nötigen Freigaben für die Texte und das Bild. Ich bin
          damit einverstanden, dass mein Profil mit der Freigabe durch DISKOE
          öffentlich wird.
        </span>
      </label>
      {/* TODO(spec): the final legal wording of both declarations is open. */}
      <FieldError id="rights-error" text={state.errors?.rights} />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Reicht ein …" : "Zur Prüfung einreichen"}
      </button>
      <Status state={state} />
    </form>
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
