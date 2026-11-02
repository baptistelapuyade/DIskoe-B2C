"use client";

import { useActionState, useState } from "react";

import { Button, LinkButton, buttonClass } from "@/components/ui/button";
import {
  Field,
  SelectWrap,
  controlClass,
  selectClass,
} from "@/components/ui/field";
import { TintedBlock } from "@/components/ui/page-shell";
import { questionWithArea } from "@/lib/domain/question-area";

import type { FormState } from "@/app/(organizer)/organizer/profiles/[profileId]/actions";

const initial: FormState = { ok: false };

const primary = buttonClass("primary");
const outline = buttonClass("outline");

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
            <Button variant="outline" onClick={() => setAsking(false)}>
              Abbrechen
            </Button>
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

// Figma S5-D "Rückfrage an den Organizer stellen" (2894:1019): affected spot,
// question and a live preview of what the organizer reads. The preview is the
// mail subject and the stored message (the spot is its first line).
export function QuestionForm({
  action,
  profileId,
  revisionId,
  event,
  areas,
  backHref,
}: {
  action: Action;
  profileId: string;
  revisionId: string;
  event?: EventTarget | null;
  areas: readonly string[];
  backHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");
  const shown = message.trim() === "" ? "…" : message.trim();
  const length = questionWithArea(area, message.trim());

  return (
    <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
      <form
        action={formAction}
        className="flex min-w-0 flex-1 flex-col gap-6 lg:max-w-[704px]"
      >
        <input type="hidden" name="profileId" value={profileId} />
        <input type="hidden" name="revisionId" value={revisionId} />
        <EventFields event={event} />
        <Field
          id="question-area"
          label="Betroffene Stelle"
          hint={`Zum Beispiel ${areas.slice(0, 3).join(", ")} oder ${areas[areas.length - 1]}.`}
        >
          {(props) => (
            <SelectWrap>
              <select
                {...props}
                name="area"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className={selectClass}
              >
                <option value="">Bitte wählen</option>
                {areas.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </SelectWrap>
          )}
        </Field>
        <Field
          id="question"
          label="Deine Frage"
          hint="Der Organizer sieht den Text in der Mail und im Organizer-Bereich. Höchstens 500 Zeichen inklusive der betroffenen Stelle."
          error={length.ok ? undefined : length.message}
        >
          {(props) => (
            <textarea
              {...props}
              name="message"
              rows={4}
              maxLength={500}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${controlClass} min-h-24`}
            />
          )}
        </Field>
        <div className="flex flex-wrap gap-4">
          <button type="submit" disabled={pending} className={primary}>
            {pending ? "Sendet …" : "Rückfrage senden"}
          </button>
          <LinkButton href={backHref} variant="outline">
            Abbrechen
          </LinkButton>
        </div>
        <Result state={state} />
      </form>
      <aside className="flex w-full flex-col gap-4 lg:w-[328px] lg:shrink-0">
        <TintedBlock title="Was der Organizer sieht">
          <p className="text-base leading-6 whitespace-pre-line">
            {`Betreff: Rückfrage zu deiner Einreichung\nBetroffen: ${area || "…"}\nFrage: ${shown}\nDein Stand bleibt privat. Antworte im Organizer-Bereich.`}
          </p>
        </TintedBlock>
      </aside>
    </div>
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
        className={outline}
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
        className={outline}
      >
        {pending ? "Sendet …" : label}
      </button>
      <Result state={state} />
    </form>
  );
}
