"use client";

import { useActionState } from "react";

import type { EventFormState } from "@/app/(organizer)/organizer/events/actions";
import { Button } from "@/components/ui/button";
import {
  controlClass,
  Field,
  FieldGroupError,
  SelectWrap,
  selectClass,
} from "@/components/ui/field";
import { StatusMessage } from "@/components/ui/page-shell";
import { FORMAT_LABEL, PRIMARY_FORMATS } from "@/lib/domain/event-publication";
import type { EventFormValues } from "@/lib/event/values";

type Action = (
  previous: EventFormState,
  formData: FormData,
) => Promise<EventFormState>;

const initial: EventFormState = { ok: false };

function local(date: string, time: string): string {
  return date && time ? `${date}T${time}` : date ? `${date}T00:00` : "";
}

// Figma "Grundlagen" (2496:1261): Titel, Hauptformat, Beschreibung, Beginn und
// Ende, Ort und Adresse.
export function EventBasicsForm({
  action,
  values,
}: {
  action: Action;
  values: EventFormValues;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  // After a rejected save the typed values stay in the form.
  const v = state.echo ?? values;
  const e = state.errors;

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      noValidate
      key={state.echo ? "echo" : "saved"}
    >
      <Field id="title" label="Titel" error={e?.title}>
        {(p) => (
          <input
            {...p}
            name="title"
            defaultValue={v.title}
            className={controlClass}
            autoComplete="off"
          />
        )}
      </Field>

      <Field id="format" label="Hauptformat" error={e?.format}>
        {(p) => (
          <SelectWrap>
            <select
              {...p}
              name="format"
              defaultValue={v.format}
              className={selectClass}
            >
              <option value="">Bitte wählen</option>
              {PRIMARY_FORMATS.map((format) => (
                <option key={format} value={format}>
                  {FORMAT_LABEL[format]}
                </option>
              ))}
            </select>
          </SelectWrap>
        )}
      </Field>

      <Field id="description" label="Beschreibung" error={e?.description}>
        {(p) => (
          <textarea
            {...p}
            name="description"
            rows={3}
            defaultValue={v.description}
            className={controlClass}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="start" label="Beginn" error={e?.start}>
          {(p) => (
            <input
              {...p}
              name="start"
              type="datetime-local"
              defaultValue={local(v.startDate, v.startTime)}
              className={controlClass}
            />
          )}
        </Field>
        <Field id="end" label="Ende" error={e?.end}>
          {(p) => (
            <input
              {...p}
              name="end"
              type="datetime-local"
              defaultValue={local(v.endDate, v.endTime)}
              className={controlClass}
            />
          )}
        </Field>
      </div>
      <p className="text-muted-foreground text-xs leading-4">
        Ortszeit: Europe/Berlin
      </p>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="endUnknown"
          defaultChecked={v.endUnknown}
          className="accent-primary size-4"
        />
        <span>Das Ende steht noch nicht fest.</span>
      </label>

      <fieldset
        className="flex flex-col gap-2"
        aria-describedby={e?.place ? "place-error" : undefined}
      >
        <legend className="mb-2 text-sm leading-5 font-medium">
          Ort und Adresse
        </legend>
        <input
          name="placeName"
          aria-label="Name des Orts"
          placeholder="Name des Orts"
          defaultValue={v.placeName}
          className={controlClass}
          autoComplete="off"
        />
        <input
          name="addressLine"
          aria-label="Straße und Hausnummer"
          placeholder="Straße und Hausnummer"
          defaultValue={v.addressLine}
          className={controlClass}
          autoComplete="off"
        />
        <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
          <input
            name="postalCode"
            aria-label="Postleitzahl"
            placeholder="PLZ"
            defaultValue={v.postalCode}
            className={controlClass}
            autoComplete="off"
          />
          <input
            name="city"
            aria-label="Stadt"
            placeholder="Stadt"
            defaultValue={v.city}
            className={controlClass}
            autoComplete="off"
          />
        </div>
        <FieldGroupError id="place-error" text={e?.place} />
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Speichert …" : "Grundlagen speichern"}
        </Button>
        <StatusMessage ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
