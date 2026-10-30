"use client";

import { useActionState } from "react";

import type { PublishFormState } from "@/app/(organizer)/organizer/events/actions";
import { Button, LinkButton } from "@/components/ui/button";
import { FieldGroupError } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/page-shell";

type Action = (
  previous: PublishFormState,
  formData: FormData,
) => Promise<PublishFormState>;

const initial: PublishFormState = { ok: false };

// The two confirmations of Figma 04c and S5-C (2859:40161, 2855:38933). Both
// must be checked; the server checks them again and the database refuses
// anything else. The wording is a text draft (see the Figma note), the final
// legal text is open.
export function ConfirmForm({
  action,
  submitLabel,
  pendingLabel,
  backHref,
}: {
  action: Action;
  submitLabel: string;
  pendingLabel: string;
  backHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <label className="flex items-start gap-3 text-sm leading-5">
          <input
            type="checkbox"
            name="rights"
            className="accent-primary mt-0.5 size-4"
          />
          <span>
            Ich habe die Angaben geprüft und bin berechtigt, für dieses Projekt
            zu veröffentlichen.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm leading-5">
          <input
            type="checkbox"
            name="usage"
            className="accent-primary mt-0.5 size-4"
          />
          <span>
            Ich verfüge über die nötigen Freigaben für die Texte und
            ausgewählten öffentlichen Bilder im erläuterten Nutzungsumfang.
          </span>
        </label>
        <FieldGroupError id="rights-error" text={state.errors?.rights} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <LinkButton href={backHref}>Zurück zur Vorschau</LinkButton>
        <Button type="submit" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
      <StatusMessage ok={state.ok} message={state.message} />
      {state.gaps && state.gaps.length > 0 ? (
        <ul className="text-error list-disc pl-5 text-sm">
          {state.gaps.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}

export function RetryImageButton({
  action,
}: {
  action: (previous: PublishFormState) => Promise<PublishFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Versucht es …" : "Bild erneut veröffentlichen"}
        </Button>
      </div>
      <StatusMessage ok={state.ok} message={state.message} />
    </form>
  );
}
