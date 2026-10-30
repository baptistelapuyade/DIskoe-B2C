"use client";

import { useActionState, useState } from "react";

import { QUESTION_AREAS } from "@/lib/domain/question-area";

import type { FormState } from "@/app/(organizer)/organizer/profiles/[profileId]/actions";

const initial: FormState = { ok: false };

const primary =
  "bg-primary text-primary-foreground rounded-md px-5 py-2.5 font-medium disabled:opacity-60";

function Result({ state }: { state: FormState }) {
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

type Action = (previous: FormState, formData: FormData) => Promise<FormState>;

// The first event travels with the profile when both were submitted together.
export type EventTarget = { eventId: string; revisionId: string };

function EventFields({ event }: { event?: EventTarget | null }) {
  return event ? (
    <>
      <input type="hidden" name="eventId" value={event.eventId} />
      <input type="hidden" name="eventRevisionId" value={event.revisionId} />
    </>
  ) : null;
}

// Approval publishes the profile at once, so it asks once more.
export function ApproveForm({
  action,
  profileId,
  revisionId,
  event,
}: {
  action: Action;
  profileId: string;
  revisionId: string;
  event?: EventTarget | null;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [asking, setAsking] = useState(false);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="revisionId" value={revisionId} />
      <EventFields event={event} />
      {asking ? (
        <>
          <p role="alert" className="font-medium">
            {event
              ? "Profil und Event werden sofort öffentlich. Jetzt freigeben und veröffentlichen?"
              : "Dieser Stand wird sofort öffentlich. Jetzt freigeben und veröffentlichen?"}
          </p>
          <div className="flex gap-3">
            <button type="submit" disabled={pending} className={primary}>
              {pending ? "Gibt frei …" : "Ja, freigeben und veröffentlichen"}
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
          className={primary}
        >
          Freigeben und veröffentlichen
        </button>
      )}
      <Result state={state} />
    </form>
  );
}

export function QuestionForm({
  action,
  profileId,
  revisionId,
  event,
}: {
  action: Action;
  profileId: string;
  revisionId: string;
  event?: EventTarget | null;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="revisionId" value={revisionId} />
      <EventFields event={event} />
      <label htmlFor="question-area" className="block text-sm">
        Betroffene Stelle
      </label>
      <select
        id="question-area"
        name="area"
        defaultValue=""
        className="border-border w-full rounded-md border px-3 py-2"
      >
        <option value="">Allgemein</option>
        {QUESTION_AREAS.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </select>
      <label htmlFor="question" className="block text-sm">
        Deine Frage an den Organizer
      </label>
      <textarea
        id="question"
        name="message"
        rows={4}
        maxLength={500}
        required
        className="border-border w-full rounded-md border px-3 py-2"
        aria-describedby="question-help"
      />
      <p id="question-help" className="text-muted-foreground text-sm">
        Höchstens 500 Zeichen inklusive der betroffenen Stelle. Profil und
        Event bleiben privat. Der Organizer
        korrigiert und reicht erneut ein.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="border-border rounded-md border px-5 py-2.5 font-medium disabled:opacity-60"
      >
        {pending ? "Sendet …" : "Rückfrage stellen"}
      </button>
      <Result state={state} />
    </form>
  );
}

export function RetryImageFounderForm({
  action,
  profileId,
}: {
  action: Action;
  profileId: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="profileId" value={profileId} />
      <button
        type="submit"
        disabled={pending}
        className="border-border rounded-md border px-5 py-2.5 font-medium disabled:opacity-60"
      >
        {pending ? "Versucht es …" : "Bilder erneut veröffentlichen"}
      </button>
      <Result state={state} />
    </form>
  );
}

export function ResendMailForm({
  action,
  profileId,
  revisionId,
  kind,
  label,
}: {
  action: Action;
  profileId: string;
  revisionId: string;
  kind: "profile_live" | "profile_question";
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="revisionId" value={revisionId} />
      <input type="hidden" name="kind" value={kind} />
      <button
        type="submit"
        disabled={pending}
        className="border-border rounded-md border px-5 py-2.5 font-medium disabled:opacity-60"
      >
        {pending ? "Sendet …" : label}
      </button>
      <Result state={state} />
    </form>
  );
}
