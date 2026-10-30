"use client";

import { useActionState } from "react";

import type { EventFormState } from "@/app/(organizer)/organizer/events/actions";
import { Button } from "@/components/ui/button";
import { controlClass, Field, FieldGroupError } from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/page-shell";

type Action = (
  previous: EventFormState,
  formData: FormData,
) => Promise<EventFormState>;

const initial: EventFormState = { ok: false };

// Figma "Öffentliches Eventbild · erforderlich" (2533:4121): the file input.
// Description (optional, Figma 2857:39307) and rights confirmation (required,
// media_uses) are added below the file input.
export function EventImageForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Field
        id="image"
        label="Eventbild (JPEG, PNG oder WebP, höchstens 5 MB)"
        error={state.errors?.image}
      >
        {(p) => (
          <input
            {...p}
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={`${controlClass} file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium`}
          />
        )}
      </Field>
      <Field
        id="altText"
        label="Bildbeschreibung · freiwillig"
        hint="Sie hilft Menschen, die das Bild nicht sehen können, und Vorlese-Programmen. Ein Satz reicht, zum Beispiel: „Zwei Personen am DJ-Pult in einem dunklen Club“. Ohne Eintrag gilt das Bild als reine Dekoration."
        error={state.errors?.altText}
      >
        {(p) => (
          <input
            {...p}
            name="altText"
            autoComplete="off"
            placeholder="Was ist auf dem Bild zu sehen?"
            className={controlClass}
          />
        )}
      </Field>
      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="rights"
            className="accent-primary mt-0.5 size-4"
          />
          <span>
            Ich habe die Rechte an diesem Bild und es darf bei meinem Event
            öffentlich gezeigt werden.
          </span>
        </label>
        <FieldGroupError id="rights-error" text={state.errors?.rights} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Lädt hoch …" : "Bild hochladen"}
        </Button>
        <StatusMessage ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
