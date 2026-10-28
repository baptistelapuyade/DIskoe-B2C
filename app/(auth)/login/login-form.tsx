"use client";

import { useActionState } from "react";

import {
  requestCode,
  verifyCode,
  type RequestCodeState,
  type VerifyCodeState,
} from "./actions";

const inputClass =
  "border-border-strong bg-input text-foreground focus-visible:outline-ring w-full rounded-md border px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2";
const buttonClass =
  "bg-primary text-primary-foreground focus-visible:outline-ring rounded-md px-4 py-2 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60";

export function LoginForm({
  next,
  linkError,
}: {
  next: string;
  linkError: boolean;
}) {
  const [requestState, requestAction, requestPending] = useActionState<
    RequestCodeState,
    FormData
  >(requestCode, { step: "email" });
  const [verifyState, verifyAction, verifyPending] = useActionState<
    VerifyCodeState,
    FormData
  >(verifyCode, {});

  if (requestState.step === "code" && requestState.email) {
    return (
      <form action={verifyAction} className="mt-8 space-y-4" noValidate>
        <input type="hidden" name="email" value={requestState.email} />
        <input type="hidden" name="next" value={next} />
        <p className="text-muted-foreground">
          Wir haben dir einen Code an {requestState.email} gesendet. Gib ihn
          hier ein oder öffne den Link in der E-Mail.
        </p>
        <p className="text-muted-foreground text-sm">
          Das kann einen Moment dauern. Schau auch im Spam-Ordner nach.
        </p>
        <div>
          <label htmlFor="code" className="mb-1 block text-sm font-medium">
            Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            className={inputClass}
          />
        </div>
        {verifyState.error ? (
          <p role="alert" className="text-error text-sm">
            {verifyState.error}
          </p>
        ) : null}
        <button type="submit" disabled={verifyPending} className={buttonClass}>
          Anmelden
        </button>
      </form>
    );
  }

  return (
    <form action={requestAction} className="mt-8 space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      {linkError ? (
        <p role="alert" className="text-error text-sm">
          Der Link ist ungültig oder abgelaufen. Fordere einen neuen Code an.
        </p>
      ) : null}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          E-Mail-Adresse
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={requestState.email ?? ""}
          className={inputClass}
        />
      </div>
      {requestState.error ? (
        <p role="alert" className="text-error text-sm">
          {requestState.error}
        </p>
      ) : null}
      <button type="submit" disabled={requestPending} className={buttonClass}>
        Code senden
      </button>
    </form>
  );
}
