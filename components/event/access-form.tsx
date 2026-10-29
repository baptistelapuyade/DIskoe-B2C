"use client";

import { useActionState, useState } from "react";

import type { EventFormState } from "@/app/(organizer)/organizer/events/actions";
import { Button, LinkButton } from "@/components/ui/button";
import {
  controlClass,
  Field,
  FieldGroupError,
  SelectWrap,
  selectClass,
} from "@/components/ui/field";
import {
  MutedText,
  StatusMessage,
  TintedBlock,
  Workspace,
} from "@/components/ui/page-shell";
import {
  ACCESS_KINDS,
  ACCESS_LABEL,
  type AccessKind,
} from "@/lib/domain/event-publication";
import { priceAccessSummary } from "@/lib/event/summary";
import type { EventFormValues } from "@/lib/event/values";

type Action = (
  previous: EventFormState,
  formData: FormData,
) => Promise<EventFormState>;

const initial: EventFormState = { ok: false };

// Figma "Preis und Zugang" (2688:10292 fixed, 2688:12129 unknown, 2688:10777
// free, 2688:13223 link error). Deviation, named in the PR: one price for the
// whole event (Durchstich contract and database), not one per access route.
export function EventAccessForm({
  action,
  values,
  backHref,
}: {
  action: Action;
  values: EventFormValues;
  backHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const v = state.echo ?? values;
  const e = state.errors;

  return (
    <form
      action={formAction}
      noValidate
      key={state.echo ? "echo" : "saved"}
    >
      <AccessFields
        v={v}
        error={e}
        backHref={backHref}
        pending={pending}
        state={state}
      />
    </form>
  );
}

function AccessFields({
  v,
  error,
  backHref,
  pending,
  state,
}: {
  v: EventFormValues;
  error: EventFormState["errors"];
  backHref: string;
  pending: boolean;
  state: EventFormState;
}) {
  const [kinds, setKinds] = useState<string[]>(v.accessKinds);
  const [model, setModel] = useState(v.priceModel);
  const [amount, setAmount] = useState(v.priceAmount);
  const [ticketUrl, setTicketUrl] = useState(v.onlineTicketUrl);
  const [registrationUrl, setRegistrationUrl] = useState(
    v.onlineRegistrationUrl,
  );

  const shown = priceAccessSummary({
    ...v,
    accessKinds: kinds,
    priceModel: model,
    priceAmount: amount,
  });

  function toggle(kind: AccessKind, checked: boolean) {
    setKinds((current) =>
      checked ? [...current, kind] : current.filter((item) => item !== kind),
    );
  }

  return (
    <Workspace
      main={
        <>
          <p className="text-base leading-6">
            Wählt die tatsächlich angebotenen Zugangswege. Der Preis gilt für
            das ganze Event.
          </p>

          <fieldset
            className="flex flex-col gap-3"
            aria-describedby={error?.access ? "access-error" : undefined}
          >
            <legend className="sr-only">Zugangswege</legend>
            {ACCESS_KINDS.map((kind) => (
              <label key={kind} className="flex items-start gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  name="accessKinds"
                  value={kind}
                  checked={kinds.includes(kind)}
                  onChange={(event) => toggle(kind, event.target.checked)}
                  className="accent-primary mt-0.5 size-4"
                />
                <span>{ACCESS_LABEL[kind]}</span>
              </label>
            ))}
            <FieldGroupError id="access-error" text={error?.access} />
          </fieldset>

          <TintedBlock title="Preis">
            <Field id="priceModel" label="Preisform" error={error?.price}>
              {(p) => (
                <SelectWrap>
                  <select
                    {...p}
                    name="priceModel"
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                    className={selectClass}
                  >
                    <option value="">Bitte wählen</option>
                    <option value="free">Frei</option>
                    <option value="fixed">Festpreis</option>
                    <option value="unknown">Noch nicht bekannt</option>
                  </select>
                </SelectWrap>
              )}
            </Field>
            {model === "fixed" ? (
              <Field id="priceAmount" label="Preis in EUR">
                {(p) => (
                  <input
                    {...p}
                    name="priceAmount"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="12,00"
                    className={controlClass}
                  />
                )}
              </Field>
            ) : null}
            {model === "unknown" ? (
              <MutedText>
                Der Preis ist ausdrücklich noch nicht bekannt. Das ist eine
                bestätigte Antwort; ein leeres Feld wäre weiterhin offen.
              </MutedText>
            ) : null}
          </TintedBlock>

          {kinds.includes("online_ticket") ? (
            <TintedBlock title="Online-Ticket">
              <Field id="onlineTicketUrl" label="Ticketlink">
                {(p) => (
                  <input
                    {...p}
                    name="onlineTicketUrl"
                    value={ticketUrl}
                    onChange={(event) => setTicketUrl(event.target.value)}
                    inputMode="url"
                    autoComplete="off"
                    placeholder="https://example.org/tickets"
                    className={controlClass}
                  />
                )}
              </Field>
            </TintedBlock>
          ) : null}

          {kinds.includes("online_registration") ? (
            <TintedBlock title="Online-Anmeldung">
              <Field id="onlineRegistrationUrl" label="Anmeldelink">
                {(p) => (
                  <input
                    {...p}
                    name="onlineRegistrationUrl"
                    value={registrationUrl}
                    onChange={(event) => setRegistrationUrl(event.target.value)}
                    inputMode="url"
                    autoComplete="off"
                    placeholder="https://example.org/anmeldung"
                    className={controlClass}
                  />
                )}
              </Field>
            </TintedBlock>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={pending} className="min-h-11 px-6">
              {pending ? "Speichert …" : "Angaben übernehmen"}
            </Button>
            <LinkButton href={backHref} variant="secondary">
              Zurück zum Event
            </LinkButton>
            <StatusMessage ok={state.ok} message={state.message} />
          </div>
        </>
      }
      side={
        <TintedBlock title="Öffentliche Anzeige">
          <p className="text-base leading-6">
            {shown ?? "Noch nichts angegeben."}
          </p>
          <MutedText>
            Leere Angaben sind nicht automatisch kostenlos. Unbekannt wird
            ausdrücklich bestätigt.
          </MutedText>
        </TintedBlock>
      }
    />
  );
}
