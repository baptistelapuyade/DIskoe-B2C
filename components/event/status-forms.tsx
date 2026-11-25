"use client";

import { useActionState } from "react";

import type { StatusFormState } from "@/app/(organizer)/organizer/events/status-actions";
import { Button, LinkButton } from "@/components/ui/button";
import { controlClassLg, Field } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/page-shell";

type Action = (
  previous: StatusFormState,
  formData: FormData,
) => Promise<StatusFormState>;

const initial: StatusFormState = { ok: false };

// Figma "Aktionen" of NACH-11, NACH-12 and NACH-15: a primary button and
// "Abbrechen", stacked.
function Actions({
  pending,
  label,
  pendingLabel,
  backHref,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
  backHref: string;
}) {
  return (
    <div className="flex flex-col items-start gap-5">
      <Button type="submit" disabled={pending} className="w-full sm:w-80">
        {pending ? pendingLabel : label}
      </Button>
      <LinkButton
        href={backHref}
        variant="secondary"
        className="w-full sm:w-80"
      >
        Abbrechen
      </LinkButton>
    </div>
  );
}

// NACH-15 and NACH-12: nothing to enter; the separate page and the button are
// the confirmation.
export function ConfirmStatusForm({
  action,
  label,
  pendingLabel,
  backHref,
}: {
  action: (previous: StatusFormState) => Promise<StatusFormState>;
  label: string;
  pendingLabel: string;
  backHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Actions
        pending={pending}
        label={label}
        pendingLabel={pendingLabel}
        backHref={backHref}
      />
      <StatusMessage ok={state.ok} message={state.message} />
    </form>
  );
}

function local(date: string, time: string): string {
  return date && time ? `${date}T${time}` : date ? `${date}T00:00` : "";
}

// NACH-11: new start and end of the replacement date.
export function RescheduleForm({
  action,
  start,
  end,
  endUnknown,
  backHref,
}: {
  action: Action;
  start: { date: string; time: string };
  end: { date: string; time: string };
  endUnknown: boolean;
  backHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const e = state.errors;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <Field id="start" label="Neuer Beginn" error={e?.start} large>
        {(p) => (
          <input
            {...p}
            name="start"
            type="datetime-local"
            defaultValue={local(start.date, start.time)}
            className={controlClassLg}
          />
        )}
      </Field>
      <Field id="end" label="Neues Ende" error={e?.end} large>
        {(p) => (
          <input
            {...p}
            name="end"
            type="datetime-local"
            defaultValue={local(end.date, end.time)}
            className={controlClassLg}
          />
        )}
      </Field>
      <p className="text-muted-foreground text-sm leading-5">
        Ortszeit: Europe/Berlin
      </p>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="endUnknown"
          defaultChecked={endUnknown}
          className="accent-primary size-4"
        />
        <span>Das Ende steht noch nicht fest.</span>
      </label>
      <Actions
        pending={pending}
        label="Verschiebung bestätigen"
        pendingLabel="Verschiebt …"
        backHref={backHref}
      />
      <StatusMessage ok={state.ok} message={state.message} />
    </form>
  );
}
