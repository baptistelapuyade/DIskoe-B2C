"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { StatusFormState } from "@/app/(organizer)/organizer/events/status-actions";
import { buttonClass } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import {
  RESCHEDULE_ORDER,
  type RescheduleCode,
  type RescheduleErrors,
  type RescheduleField,
} from "@/lib/domain/event-reschedule";
import { t, type Lang, type MessageId } from "@/lib/i18n";

import { DateField } from "./date-field";

// The forms of "postpone, reschedule, cancel" (Figma EVV-01 to 05, EVA-01).
// The server checks and decides; the forms keep what was typed after an error.
// Until the page is hydrated the controls are locked: text typed before that
// is thrown away when React takes over the fields.

type Action = (
  previous: StatusFormState,
  formData: FormData,
) => Promise<StatusFormState>;

const IDLE: StatusFormState = { status: "idle" };

function useReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  return ready;
}

const CODE_ID: Partial<Record<RescheduleCode, MessageId>> = {
  dateMissing: "Z24.time.date.missing",
  dateInvalid: "Z24.time.date.invalid",
  timeMissing: "Z24.time.time.missing",
  timeInvalid: "Z24.time.time.invalid",
  timeNonexistent: "Z24.time.time.nonexistent",
  timeAmbiguous: "Z24.time.time.ambiguous",
  endBeforeStart: "Z24.time.end.beforeStart",
  startPast: "Z33.err.startPast",
  startUnchanged: "Z33.err.startUnchanged",
};

function errorText(lang: Lang, code: RescheduleCode | undefined) {
  return code ? t(lang, CODE_ID[code] ?? "Z24.time.date.invalid") : undefined;
}

// The notice above the form: what is refused (EVV-01b), what failed or went
// stale, or the plain hint.
function Head({
  lang,
  state,
  info,
}: {
  lang: Lang;
  state: StatusFormState;
  info: ReactNode;
}) {
  if (state.status === "invalid") {
    const fields = RESCHEDULE_ORDER.filter((field) => state.errors[field]);
    const past = fields.length === 1 && state.errors.startDate === "startPast";

    return (
      <Notice
        tone="error"
        title={
          fields.length === 1
            ? t(lang, "Z31.edit.err.title.one")
            : t(lang, "Z31.edit.err.title.many", { count: fields.length })
        }
      >
        {t(lang, past ? "Z33.err.past" : "Z31.edit.err.line.many")}
      </Notice>
    );
  }

  if (state.status === "stale") {
    return (
      <Notice tone="error" title={t(lang, "Z33.stale.title")}>
        {t(lang, "Z33.stale.line")}
      </Notice>
    );
  }

  return info;
}

type Values = Record<RescheduleField, string>;

// EVV-01 (a date that changes) and EVV-05 (the event waits for a date): the
// same four fields. `card` is the "Bisher" card of EVV-01.
export function RescheduleForm({
  lang,
  action,
  mode,
  card,
  openHref,
}: {
  lang: Lang;
  action: Action;
  mode: "reschedule" | "schedule" | "reopen";
  card: ReactNode;
  // EVV-01a: "Date not set yet" leads to EVV-02.
  openHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE);
  const [values, setValues] = useState<Values>({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  const ready = useReady();
  const formRef = useRef<HTMLFormElement>(null);
  const errors: RescheduleErrors =
    state.status === "invalid" ? state.errors : {};
  const scheduling = mode === "schedule";

  const set = (key: RescheduleField, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  // After a refused call the first field with a problem takes the focus.
  useEffect(() => {
    if (state.status !== "invalid") return;

    const first = RESCHEDULE_ORDER.find((field) => state.errors[field]);

    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#${first}`)?.focus();
    }
  }, [state]);

  const reopening = mode === "reopen";
  const yes = scheduling
    ? "Z33.schedule.yes"
    : reopening
      ? "Z33.reopen.yes"
      : "Z33.reschedule.yes";
  const busy = scheduling
    ? "Z33.schedule.pending"
    : reopening
      ? "Z33.reopen.pending"
      : "Z33.reschedule.pending";

  return (
    <form
      ref={formRef}
      // Sent by hand, not as the form action: an action form is reset after
      // each call, which would clear what the owner typed after an error.
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData();

        for (const [key, value] of Object.entries(values)) {
          data.set(key, value);
        }

        startTransition(() => formAction(data));
      }}
      noValidate
      className="flex max-w-[560px] flex-col gap-10"
    >
      <Head
        lang={lang}
        state={state}
        info={
          state.status === "failed" ? (
            <Notice
              tone="error"
              title={t(
                lang,
                reopening ? "Z33.reopen.fail.title" : "Z33.fail.title",
              )}
            >
              {t(lang, reopening ? "Z33.reopen.fail.line" : "Z33.fail.line")}
            </Notice>
          ) : reopening ? (
            <Notice tone="warning" title={t(lang, "Z33.reopen.notice")} />
          ) : (
            <Notice tone="info" title={t(lang, "Z33.reschedule.notice")} />
          )
        }
      />
      <fieldset disabled={!ready} className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          {card}
          <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2">
            <DateField
              id="startDate"
              name="startDate"
              label={t(lang, "Z33.field.date")}
              error={errorText(lang, errors.startDate)}
              lang={lang}
              value={values.startDate}
              onChange={(value) => set("startDate", value)}
              placeholder={t(lang, "Z24.time.date.placeholder")}
              openLabel={t(lang, "Z24.time.date.open")}
              disabled={pending}
            />
            <Field
              id="startTime"
              label={t(lang, "Z33.field.start")}
              error={errorText(lang, errors.startTime)}
              large
            >
              {(props) => (
                <Input
                  {...props}
                  type="time"
                  value={values.startTime}
                  disabled={pending}
                  onChange={(event) => set("startTime", event.target.value)}
                />
              )}
            </Field>
            <DateField
              id="endDate"
              name="endDate"
              label={t(lang, "Z33.field.endDate")}
              error={errorText(lang, errors.endDate)}
              lang={lang}
              value={values.endDate}
              onChange={(value) => set("endDate", value)}
              placeholder={t(lang, "Z24.time.date.placeholder")}
              openLabel={t(lang, "Z24.time.date.open")}
              disabled={pending}
            />
            <Field
              id="endTime"
              label={t(lang, "Z33.field.endTime")}
              error={errorText(lang, errors.endTime)}
              large
            >
              {(props) => (
                <Input
                  {...props}
                  type="time"
                  value={values.endTime}
                  disabled={pending}
                  onChange={(event) => set("endTime", event.target.value)}
                />
              )}
            </Field>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <button
            type="submit"
            disabled={pending}
            className={buttonClass("primaryLg", "w-full md:w-auto")}
          >
            {t(
              lang,
              pending
                ? busy
                : state.status === "failed"
                  ? "Z33.fail.retry"
                  : yes,
            )}
          </button>
          {openHref ? (
            <Link
              href={openHref}
              className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
            >
              {t(lang, "Z33.reschedule.toOpen")}
            </Link>
          ) : null}
        </div>
      </fieldset>
    </form>
  );
}

// EVV-02: nothing to enter; the separate page and the button are the
// confirmation. A failed call keeps the page and offers "Try again" (EVV-02b).
export function PostponeForm({
  lang,
  action,
  card,
  dateHref,
}: {
  lang: Lang;
  action: (previous: StatusFormState) => Promise<StatusFormState>;
  card: ReactNode;
  dateHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE);

  return (
    <form action={formAction} className="flex max-w-[560px] flex-col gap-10">
      <Head
        lang={lang}
        state={state}
        info={
          state.status === "failed" ? (
            <Notice tone="error" title={t(lang, "Z33.fail.title")}>
              {t(lang, "Z33.fail.line")}
            </Notice>
          ) : (
            <Notice tone="info" title={t(lang, "Z33.open.notice.title")}>
              {t(lang, "Z33.open.notice.line")}
            </Notice>
          )
        }
      />
      {card}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primaryLg", "w-full md:w-auto")}
        >
          {t(
            lang,
            pending
              ? "Z33.reschedule.pending"
              : state.status === "failed"
                ? "Z33.fail.retry"
                : "Z33.open.yes",
          )}
        </button>
        <Link
          href={dateHref}
          className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
        >
          {t(lang, "Z33.open.toDate")}
        </Link>
      </div>
    </form>
  );
}

// EVA-01: the tick is the confirmation (EVA-01b when it is missing). After a
// failed call it stays ticked ("your confirmation is saved", EVA-01c).
export function CancelForm({
  lang,
  action,
  card,
  keepHref,
}: {
  lang: Lang;
  action: Action;
  card: ReactNode;
  keepHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE);
  const [checked, setChecked] = useState(false);
  const ready = useReady();
  const unchecked = state.status === "unchecked" && !checked;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData();

        if (checked) data.set("confirm", "on");

        startTransition(() => formAction(data));
      }}
      noValidate
      className="flex max-w-[560px] flex-col gap-10"
    >
      {unchecked ? (
        <Notice tone="error" title={t(lang, "Z33.cancel.err.title")}>
          {t(lang, "Z33.cancel.err.line")}
        </Notice>
      ) : state.status === "stale" ? (
        <Notice tone="error" title={t(lang, "Z33.stale.title")}>
          {t(lang, "Z33.stale.line")}
        </Notice>
      ) : state.status === "failed" ? (
        <Notice tone="error" title={t(lang, "Z33.cancel.fail.title")}>
          {t(lang, "Z33.cancel.fail.line")}
        </Notice>
      ) : (
        <Notice tone="warning" title={t(lang, "Z33.cancel.notice.title")}>
          {t(lang, "Z33.cancel.notice.line")}
        </Notice>
      )}
      <fieldset disabled={!ready} className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          {card}
          <label
            htmlFor="confirm"
            className="flex min-h-11 items-center gap-3 text-base leading-6"
          >
            <Checkbox
              id="confirm"
              checked={checked}
              disabled={pending}
              aria-invalid={unchecked ? true : undefined}
              onCheckedChange={(value) => setChecked(value === true)}
            />
            {t(lang, "Z33.cancel.confirm")}
          </label>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <button
            type="submit"
            disabled={pending}
            className={buttonClass("primaryLg", "w-full md:w-auto")}
          >
            {t(
              lang,
              pending
                ? "Z33.cancel.pending"
                : state.status === "failed"
                  ? "Z33.fail.retry"
                  : "Z33.cancel.yes",
            )}
          </button>
          <Link
            href={keepHref}
            className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
          >
            {t(lang, "Z33.cancel.no")}
          </Link>
        </div>
      </fieldset>
    </form>
  );
}
