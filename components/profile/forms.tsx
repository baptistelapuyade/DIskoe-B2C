"use client";

import { useActionState, useState } from "react";

import type { FormState } from "@/app/(organizer)/organizer/profiles/[profileId]/actions";

type Action = (previous: FormState, formData: FormData) => Promise<FormState>;

const initial: FormState = { ok: false };

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

export type DetailsValues = {
  name: string;
  shortIntro: string;
  officialUrl: string;
  publicContact: string;
};

export function DetailsForm({
  action,
  values,
  slug,
}: {
  action: Action;
  values: DetailsValues;
  slug: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={values.name}
          className={inputClass}
          autoComplete="off"
          aria-describedby="name-error"
        />
        <FieldError id="name-error" text={state.errors?.name} />
      </div>

      <div>
        <label htmlFor="shortIntro" className="font-medium">
          Kurzvorstellung
        </label>
        <textarea
          id="shortIntro"
          name="shortIntro"
          rows={4}
          defaultValue={values.shortIntro}
          className={inputClass}
          aria-describedby="shortIntro-error"
        />
        <FieldError id="shortIntro-error" text={state.errors?.shortIntro} />
      </div>

      <fieldset className="space-y-5">
        <legend className="font-medium">Link oder Kontakt</legend>
        <p className="text-muted-foreground text-sm">
          Mindestens eines von beiden ist nötig.
        </p>
        <div>
          <label htmlFor="officialUrl">Offizieller Link</label>
          <input
            id="officialUrl"
            name="officialUrl"
            defaultValue={values.officialUrl}
            className={inputClass}
            inputMode="url"
            autoComplete="off"
            aria-describedby="officialUrl-error"
          />
          <FieldError id="officialUrl-error" text={state.errors?.officialUrl} />
        </div>
        <div>
          <label htmlFor="publicContact">Öffentlicher Kontakt</label>
          <input
            id="publicContact"
            name="publicContact"
            defaultValue={values.publicContact}
            className={inputClass}
            autoComplete="off"
            aria-describedby="publicContact-error"
          />
          <FieldError
            id="publicContact-error"
            text={state.errors?.publicContact}
          />
        </div>
      </fieldset>

      <div>
        <span className="font-medium">Adresse deines Profils</span>
        <p className="text-muted-foreground mt-1 text-sm">
          /{slug} · wird von DISKOE festgelegt und kann hier nicht geändert
          werden.
        </p>
      </div>

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Speichert …" : "Speichern"}
      </button>
      <Status state={state} />
    </form>
  );
}

export function ImageForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="image" className="font-medium">
          Profilbild (JPEG, PNG oder WebP, höchstens 5 MB)
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
          Bildbeschreibung · freiwillig
        </label>
        <input
          id="altText"
          name="altText"
          className={inputClass}
          autoComplete="off"
          placeholder="Was ist auf dem Bild zu sehen?"
          aria-describedby="altText-hint altText-error"
        />
        <p id="altText-hint" className="text-muted-foreground mt-1 text-xs">
          Sie hilft Menschen, die das Bild nicht sehen können, und
          Vorlese-Programmen. Ein Satz reicht, zum Beispiel: „Vier Personen vor
          einer Backsteinwand“. Ohne Eintrag gilt das Bild als reine Dekoration.
        </p>
        <FieldError id="altText-error" text={state.errors?.altText} />
      </div>

      <div>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="rights" className="mt-1" />
          <span>
            Ich habe die Rechte an diesem Bild und es darf auf meinem Profil
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
