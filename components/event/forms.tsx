"use client";

import { useActionState } from "react";

import type { EventFormState } from "@/app/(organizer)/organizer/events/actions";
import {
  ACCESS_KINDS,
  ACCESS_LABEL,
  ATMOSPHERE_TERMS,
  FORMAT_LABEL,
  PRIMARY_FORMATS,
  type EventGap,
} from "@/lib/domain/event-publication";
import type { EventFormValues } from "@/lib/event/values";

type Action = (
  previous: EventFormState,
  formData: FormData,
) => Promise<EventFormState>;

const initial: EventFormState = { ok: false };

const inputClass =
  "border-border bg-background mt-1 block w-full rounded-md border px-3 py-2 text-base";
const buttonClass =
  "bg-primary text-primary-foreground rounded-md px-5 py-2.5 font-medium disabled:opacity-60";

function FieldError({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={id} role="alert" className="text-destructive mt-1 text-sm">
      {text}
    </p>
  ) : null;
}

function Status({ state }: { state: EventFormState }) {
  if (!state.message) return null;

  return (
    <div
      role={state.ok ? "status" : "alert"}
      className={state.ok ? "text-sm" : "text-destructive text-sm"}
    >
      <p>{state.message}</p>
    </div>
  );
}

export function EventGapList({ gaps }: { gaps: EventGap[] }) {
  if (gaps.length === 0) return null;

  return (
    <div className="bg-[var(--warning-soft)] rounded-md p-4" role="note">
      <p className="font-medium">Das fehlt noch, bevor das Event veröffentlicht werden kann:</p>
      <ul className="mt-2 list-disc pl-5">
        {gaps.map((gap) => (
          <li key={gap.code}>{gap.message}</li>
        ))}
      </ul>
    </div>
  );
}

export function NewEventForm({
  action,
  profileId,
}: {
  action: Action;
  profileId: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="profileId" value={profileId} />
      <div>
        <label htmlFor="title" className="font-medium">
          Titel des Events
        </label>
        <input
          id="title"
          name="title"
          className={inputClass}
          autoComplete="off"
          aria-describedby="title-error"
        />
        <FieldError id="title-error" text={state.errors?.title} />
        <p className="text-muted-foreground mt-1 text-sm">
          Du kannst den Titel später ändern. Alles Weitere füllst du im
          nächsten Schritt aus.
        </p>
      </div>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Legt an …" : "Entwurf anlegen"}
      </button>
      <Status state={state} />
    </form>
  );
}

export function EventDetailsForm({
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
      className="space-y-8"
      noValidate
      key={state.echo ? "echo" : "saved"}
    >
      <section className="space-y-5" aria-labelledby="what-heading">
        <h3 id="what-heading" className="text-lg font-semibold">
          Was
        </h3>
        <div>
          <label htmlFor="title" className="font-medium">
            Titel
          </label>
          <input
            id="title"
            name="title"
            defaultValue={v.title}
            className={inputClass}
            autoComplete="off"
            aria-describedby="title-error"
          />
          <FieldError id="title-error" text={e?.title} />
        </div>
        <div>
          <label htmlFor="format" className="font-medium">
            Format
          </label>
          <select
            id="format"
            name="format"
            defaultValue={v.format}
            className={inputClass}
            aria-describedby="format-error"
          >
            <option value="">Bitte wählen</option>
            {PRIMARY_FORMATS.map((format) => (
              <option key={format} value={format}>
                {FORMAT_LABEL[format]}
              </option>
            ))}
          </select>
          <FieldError id="format-error" text={e?.format} />
        </div>
        <div>
          <label htmlFor="description" className="font-medium">
            Beschreibung
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={v.description}
            className={inputClass}
            aria-describedby="description-error"
          />
          <FieldError id="description-error" text={e?.description} />
        </div>
      </section>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold">Wann</legend>
        <p className="text-muted-foreground text-sm">
          Alle Zeiten gelten in Berlin (Europe/Berlin).
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="font-medium">
              Beginn – Datum
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={v.startDate}
              className={inputClass}
              aria-describedby="start-error"
            />
          </div>
          <div>
            <label htmlFor="startTime" className="font-medium">
              Beginn – Uhrzeit
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              defaultValue={v.startTime}
              className={inputClass}
              aria-describedby="start-error"
            />
          </div>
        </div>
        <FieldError id="start-error" text={e?.start} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="endDate" className="font-medium">
              Ende – Datum
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={v.endDate}
              className={inputClass}
              aria-describedby="end-error"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="font-medium">
              Ende – Uhrzeit
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              defaultValue={v.endTime}
              className={inputClass}
              aria-describedby="end-error"
            />
          </div>
        </div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="endUnknown"
            defaultChecked={v.endUnknown}
            className="mt-1"
          />
          <span>Das Ende steht noch nicht fest.</span>
        </label>
        <FieldError id="end-error" text={e?.end} />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold">Wo</legend>
        <div>
          <label htmlFor="placeName" className="font-medium">
            Name des Orts
          </label>
          <input
            id="placeName"
            name="placeName"
            defaultValue={v.placeName}
            className={inputClass}
            autoComplete="off"
            aria-describedby="place-error"
          />
        </div>
        <div>
          <label htmlFor="addressLine" className="font-medium">
            Adresse (Straße und Hausnummer)
          </label>
          <input
            id="addressLine"
            name="addressLine"
            defaultValue={v.addressLine}
            className={inputClass}
            autoComplete="off"
            aria-describedby="place-error"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="postalCode" className="font-medium">
              Postleitzahl
            </label>
            <input
              id="postalCode"
              name="postalCode"
              defaultValue={v.postalCode}
              className={inputClass}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="city" className="font-medium">
              Stadt
            </label>
            <input
              id="city"
              name="city"
              defaultValue={v.city}
              className={inputClass}
              autoComplete="off"
            />
          </div>
        </div>
        <FieldError id="place-error" text={e?.place} />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Preis</legend>
        <p className="text-muted-foreground text-sm">
          Wenn der Preis noch nicht feststeht, wähle „Preis noch nicht
          bekannt“. Das wird nie als „Frei“ angezeigt.
        </p>
        {[
          ["free", "Frei"],
          ["fixed", "Festpreis"],
          ["unknown", "Preis noch nicht bekannt"],
        ].map(([value, label]) => (
          <label key={value} className="flex items-center gap-3">
            <input
              type="radio"
              name="priceModel"
              value={value}
              defaultChecked={v.priceModel === value}
            />
            <span>{label}</span>
          </label>
        ))}
        <div>
          <label htmlFor="priceAmount" className="font-medium">
            Betrag in Euro (nur bei Festpreis)
          </label>
          <input
            id="priceAmount"
            name="priceAmount"
            defaultValue={v.priceAmount}
            className={inputClass}
            inputMode="decimal"
            autoComplete="off"
            aria-describedby="price-error"
          />
        </div>
        <FieldError id="price-error" text={e?.price} />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Zugang</legend>
        <p className="text-muted-foreground text-sm">
          Mindestens ein Weg ist nötig.
        </p>
        {ACCESS_KINDS.map((kind) => (
          <label key={kind} className="flex items-center gap-3">
            <input
              type="checkbox"
              name="accessKinds"
              value={kind}
              defaultChecked={v.accessKinds.includes(kind)}
            />
            <span>{ACCESS_LABEL[kind]}</span>
          </label>
        ))}
        <div>
          <label htmlFor="onlineTicketUrl" className="font-medium">
            Link für Online-Tickets
          </label>
          <input
            id="onlineTicketUrl"
            name="onlineTicketUrl"
            defaultValue={v.onlineTicketUrl}
            className={inputClass}
            inputMode="url"
            autoComplete="off"
            aria-describedby="access-error"
          />
        </div>
        <div>
          <label htmlFor="onlineRegistrationUrl" className="font-medium">
            Link für die Online-Anmeldung
          </label>
          <input
            id="onlineRegistrationUrl"
            name="onlineRegistrationUrl"
            defaultValue={v.onlineRegistrationUrl}
            className={inputClass}
            inputMode="url"
            autoComplete="off"
            aria-describedby="access-error"
          />
        </div>
        <FieldError id="access-error" text={e?.access} />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Atmosphäre</legend>
        <p className="text-muted-foreground text-sm">
          Wähle bis zu drei Begriffe oder schreibe einen eigenen Satz.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {ATMOSPHERE_TERMS.map((term) => (
            <label key={term} className="flex items-center gap-3">
              <input
                type="checkbox"
                name="atmosphereTags"
                value={term}
                defaultChecked={v.atmosphereTags.includes(term)}
              />
              <span>{term}</span>
            </label>
          ))}
        </div>
        <div>
          <label htmlFor="atmosphereDescription" className="font-medium">
            Eigene Beschreibung der Atmosphäre
          </label>
          <textarea
            id="atmosphereDescription"
            name="atmosphereDescription"
            rows={2}
            defaultValue={v.atmosphereDescription}
            className={inputClass}
            aria-describedby="atmosphere-error"
          />
        </div>
        <FieldError id="atmosphere-error" text={e?.atmosphere} />
      </fieldset>

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Speichert …" : "Speichern"}
      </button>
      <Status state={state} />
    </form>
  );
}

export function EventImageForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="image" className="font-medium">
          Eventbild (JPEG, PNG oder WebP, höchstens 5 MB)
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={inputClass}
          aria-describedby="image-error"
        />
        <FieldError id="image-error" text={state.errors?.image} />
      </div>
      <div>
        <label htmlFor="altText" className="font-medium">
          Bildbeschreibung (Alternativtext)
        </label>
        <input
          id="altText"
          name="altText"
          className={inputClass}
          autoComplete="off"
          aria-describedby="altText-error"
        />
        <FieldError id="altText-error" text={state.errors?.altText} />
      </div>
      <div>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="rights" className="mt-1" />
          <span>
            Ich habe die Rechte an diesem Bild und es darf bei meinem Event
            öffentlich gezeigt werden.
          </span>
        </label>
        <FieldError id="rights-error" text={state.errors?.rights} />
      </div>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Lädt hoch …" : "Bild hochladen"}
      </button>
      <Status state={state} />
    </form>
  );
}
