"use client";

import { useActionState } from "react";

import type { EventFormState } from "@/app/(organizer)/organizer/events/actions";
import { Button, LinkButton } from "@/components/ui/button";
import { AtmosphereChip } from "@/components/ui/chip";
import { controlClass, Field } from "@/components/ui/field";
import { MutedText, StatusMessage } from "@/components/ui/page-shell";
import { ATMOSPHERE_TERMS } from "@/lib/domain/event-publication";
import type { EventFormValues } from "@/lib/event/values";

type Action = (
  previous: EventFormState,
  formData: FormData,
) => Promise<EventFormState>;

const initial: EventFormState = { ok: false };

function pairs<T>(items: readonly T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
}

// Figma 02a/02b "Atmosphäre" (2498:1534, 2496:1744): the question card with the
// ten terms as chips, an optional own description and the actions below it.
// Only "Auswahl übernehmen" confirms the answer.
export function EventAtmosphereForm({
  action,
  values,
  backHref,
  previewHref,
}: {
  action: Action;
  values: EventFormValues;
  backHref: string;
  previewHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const v = state.echo ?? values;

  return (
    <form
      action={formAction}
      noValidate
      className="flex flex-col gap-4"
      key={state.echo ? "echo" : "saved"}
    >
      <fieldset className="border-border bg-background flex flex-col gap-4 border p-6">
        <legend className="sr-only">Atmosphäre</legend>
        <h2 className="text-2xl leading-[30px] font-medium tracking-[-0.4px]">
          Damit Gäste wissen, was sie erwartet.
        </h2>
        <p className="text-base leading-6">
          Wählt bis zu drei passende Begriffe oder beschreibt die Atmosphäre selbst. Eine
          bestätigte eigene Beschreibung genügt ebenfalls.
        </p>
        {pairs(ATMOSPHERE_TERMS).map((row) => (
          <div key={row[0]} className="flex flex-wrap gap-3">
            {row.map((term) => (
              <AtmosphereChip
                key={term}
                name="atmosphereTags"
                value={term}
                label={term}
                defaultChecked={v.atmosphereTags.includes(term)}
              />
            ))}
          </div>
        ))}
        <Field
          id="atmosphereDescription"
          label="Eigene Beschreibung · optional"
          hint="Optional statt oder zusätzlich zur Auswahl."
          error={state.errors?.atmosphere}
        >
          {(p) => (
            <textarea
              {...p}
              name="atmosphereDescription"
              rows={3}
              defaultValue={v.atmosphereDescription}
              placeholder="Zum Beispiel: Kleine Tanzfläche, viel Raum zum Zuhören."
              className={controlClass}
            />
          )}
        </Field>
        <MutedText>Erst „Auswahl übernehmen“ bestätigt die Angabe.</MutedText>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <LinkButton href={backHref}>Zurück zum Entwurf</LinkButton>
        <Button type="submit" disabled={pending}>
          {pending ? "Speichert …" : "Auswahl übernehmen"}
        </Button>
        <StatusMessage ok={state.ok} message={state.message} />
      </div>
      <div>
        <LinkButton href={previewHref} variant="ghost">
          Ohne Antwort zur Vorschau
        </LinkButton>
      </div>
    </form>
  );
}
