"use client";

import { useActionState, useEffect, useState } from "react";

import { Field, controlClassLg } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Pill } from "@/components/ui/pill";
import { t, type Lang } from "@/lib/i18n";

import {
  requestCode,
  verifyCode,
  type RequestCodeState,
  type VerifyCodeState,
} from "./actions";

// Sign-in screens ORG-01, 01b, 02, 02b, 95, 96, 97, 98, 99 (Figma, section
// "Flow 1 Block 1"). One component runs the states; the texts are catalog
// texts Z21.*. "Use a different email address" and "Back" start the flow
// again with a new key, which resets all form state.

const RESEND_WAIT_MS = 60_000;

const IDLE_REQUEST: RequestCodeState = { status: "idle" };
const IDLE_VERIFY: VerifyCodeState = { status: "idle" };

type Props = { lang: Lang; next: string; linkExpired: boolean };

export function SignInFlow(props: Props) {
  const [run, setRun] = useState(0);
  return <Flow key={run} {...props} onRestart={() => setRun((n) => n + 1)} />;
}

function Header({
  eyebrow,
  title,
  lead,
  pill,
}: {
  eyebrow?: string;
  title: string;
  lead: string;
  pill?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {pill ? (
        <div>
          <Pill tone="success">{pill}</Pill>
        </div>
      ) : (
        <p className="text-brand-iris text-[13px] leading-4 font-medium tracking-[0.08em] uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="text-foreground text-2xl leading-[30px] font-medium md:text-[32px] md:leading-[38px] md:font-bold">
        {title}
      </h1>
      <p className="text-muted-foreground text-base leading-6">{lead}</p>
    </div>
  );
}

function Flow({
  lang,
  next,
  linkExpired,
  onRestart,
}: Props & { onRestart: () => void }) {
  const [request, requestAction, requestPending] = useActionState(
    requestCode,
    IDLE_REQUEST,
  );
  const [resend, resendAction, resendPending] = useActionState(
    requestCode,
    IDLE_REQUEST,
  );
  const [verify, verifyAction, verifyPending] = useActionState(
    verifyCode,
    IDLE_VERIFY,
  );

  // Wait before the next code may be requested (the provider enforces the same
  // minimum interval).
  const sentAt =
    resend.status === "sent"
      ? resend.at
      : request.status === "sent"
        ? request.at
        : 0;
  const [waitUntil, setWaitUntil] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!sentAt) return;
    const until = Date.now() + RESEND_WAIT_MS;
    setWaitUntil(until);
    setNow(Date.now());
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= until) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [sentAt]);

  const waiting = waitUntil > now;

  // ---- Code step (ORG-02, 97, 02b, 98) ----------------------------------
  if (request.status === "sent") {
    const email = request.email;
    const resent = resend.status === "sent" ? resend : null;
    // A newer result of the code check replaces what the resend showed.
    const check =
      verify.status !== "idle" && (!resent || verify.at > resent.at)
        ? verify
        : IDLE_VERIFY;
    const showResent = Boolean(resent) && check.status === "idle";
    const locked = check.status === "locked";
    const wrong = check.status === "wrong";
    const resendFailed =
      resend.status === "failed" && (!resent || resend.at > resent.at);
    const plain = !showResent && check.status === "idle" && !resendFailed;

    return (
      <>
        {plain ? (
          <button
            type="button"
            onClick={onRestart}
            className="text-foreground focus-visible:outline-ring -mt-4 flex min-h-11 w-fit items-center gap-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span aria-hidden="true">←</span>
            {t(lang, "Z20.back")}
          </button>
        ) : null}
        {showResent ? (
          <Header
            pill={t(lang, "Z21.resent.pill")}
            title={t(lang, "Z21.code.title")}
            lead={t(lang, "Z21.resent.lead", { email })}
          />
        ) : (
          <Header
            eyebrow={t(lang, "Z21.code.eyebrow")}
            title={t(lang, "Z21.code.title")}
            lead={t(lang, "Z21.code.lead", { email })}
          />
        )}
        {locked ? (
          <Notice tone="warning" title={t(lang, "Z21.code.locked.title")}>
            {t(lang, "Z21.code.locked.line")}
          </Notice>
        ) : null}
        {resendFailed ? (
          <Notice tone="error" title={t(lang, "Z21.send.failed.title")}>
            {t(lang, "Z21.send.failed.line")}
          </Notice>
        ) : null}
        <form action={verifyAction} className="flex flex-col gap-10" noValidate>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <Field
            id="code"
            label={t(lang, "Z21.code.label")}
            large
            error={wrong ? t(lang, "Z21.code.wrong") : undefined}
            hint={showResent ? t(lang, "Z21.resent.hint") : undefined}
          >
            {(aria) => (
              <input
                {...aria}
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder={t(lang, "Z21.code.placeholder")}
                disabled={locked}
                className={controlClassLg}
              />
            )}
          </Field>
          <div className="flex flex-col gap-3 md:w-max md:flex-row">
            <Button
              type="submit"
              variant="primaryLg"
              disabled={locked || verifyPending}
              aria-busy={verifyPending}
            >
              {t(lang, "Z21.code.submit")}
            </Button>
            <Button
              type="submit"
              formAction={resendAction}
              formNoValidate
              variant="secondary"
              disabled={waiting || resendPending}
              aria-busy={resendPending}
            >
              {t(lang, "Z21.code.resend")}
            </Button>
            <Button type="button" variant="ghostLg" onClick={onRestart}>
              {t(lang, "Z21.code.otherEmail")}
            </Button>
          </div>
        </form>
      </>
    );
  }

  // ---- Email step (ORG-01, 95, 96, 01b, 99) ------------------------------
  const invalid = request.status === "invalid";
  const failed = request.status === "failed";
  const expired = linkExpired && request.status === "idle";
  const sendLabel = expired
    ? t(lang, "Z21.code.resend")
    : t(lang, "Z21.email.send");

  return (
    <>
      {linkExpired ? (
        <Header
          eyebrow={t(lang, "Z21.link.eyebrow")}
          title={t(lang, "Z21.link.title")}
          lead={t(lang, "Z21.link.lead")}
        />
      ) : (
        <Header
          eyebrow={t(lang, "Z21.email.eyebrow")}
          title={t(lang, "Z21.email.title")}
          lead={t(lang, "Z21.email.lead")}
        />
      )}
      {failed ? (
        <Notice tone="error" title={t(lang, "Z21.send.failed.title")}>
          {t(lang, "Z21.send.failed.line")}
        </Notice>
      ) : null}
      <form action={requestAction} className="flex flex-col gap-10" noValidate>
        <input type="hidden" name="next" value={next} />
        <Field
          id="email"
          label={t(lang, "Z21.email.label")}
          large
          error={invalid ? t(lang, "Z21.email.invalid") : undefined}
          hint={
            requestPending || invalid || linkExpired
              ? undefined
              : t(lang, "Z21.email.hint")
          }
        >
          {(aria) => (
            <input
              {...aria}
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t(lang, "Z21.email.placeholder")}
              defaultValue={
                invalid || failed ? (request as { email: string }).email : ""
              }
              readOnly={requestPending}
              className={controlClassLg}
            />
          )}
        </Field>
        <div>
          <Button
            type="submit"
            variant="primaryLg"
            disabled={requestPending}
            aria-busy={requestPending}
          >
            {requestPending ? t(lang, "Z21.email.sending") : sendLabel}
          </Button>
        </div>
      </form>
    </>
  );
}
