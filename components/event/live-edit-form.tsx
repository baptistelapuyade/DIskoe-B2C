"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { Textarea } from "@/components/ui/textarea";
import { buttonClass } from "@/components/ui/button";
import { EVENT_LIMITS } from "@/lib/domain/event-publication";
import type {
  LiveEditCode,
  LiveEditErrors,
  LiveEditField,
} from "@/lib/domain/event-live-edit";
import { t, type Lang, type MessageId } from "@/lib/i18n";

import type { LiveEditState } from "@/app/(organizer)/organizer/events/[eventId]/changes/actions";

import { DateField } from "./date-field";

// The form of "change a live event" (Figma EVB-01a to 01c): title,
// description, date, start, place and address (one field, "Straße Nr., PLZ
// Ort"). The server checks and decides; the form keeps what was typed after an
// error and puts the first field with a problem in focus.

type Action = (
  previous: LiveEditState,
  formData: FormData,
) => Promise<LiveEditState>;

export type LiveEditValues = {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  placeName: string;
  address: string;
};

const IDLE: LiveEditState = { status: "idle" };

const ORDER: LiveEditField[] = [
  "title",
  "description",
  "startDate",
  "startTime",
  "placeName",
  "address",
];

const ERROR_ID: Record<LiveEditCode, MessageId> = {
  titleMissing: "Z31.edit.title.missing",
  titleTooLong: "Z24.err.tooLong",
  descriptionMissing: "Z31.edit.description.missing",
  descriptionTooLong: "Z24.err.tooLong",
  dateMissing: "Z24.time.date.missing",
  dateInvalid: "Z24.time.date.invalid",
  timeMissing: "Z24.time.time.missing",
  timeInvalid: "Z24.time.time.invalid",
  timeNonexistent: "Z24.time.time.nonexistent",
  timeAmbiguous: "Z24.time.time.ambiguous",
  placeNameMissing: "Z24.place.name.missing",
  placeNameTooLong: "Z24.err.tooLong",
  addressMissing: "Z31.edit.address.missing",
  addressInvalid: "Z31.edit.address.invalid",
  addressTooLong: "Z24.err.tooLong",
};

const MAX: Partial<Record<LiveEditCode, number>> = {
  titleTooLong: EVENT_LIMITS.title,
  descriptionTooLong: EVENT_LIMITS.description,
  placeNameTooLong: EVENT_LIMITS.placeName,
  addressTooLong: EVENT_LIMITS.addressLine,
};

const MISSING_ID: Record<LiveEditField, MessageId> = {
  title: "Z31.edit.err.missing.title",
  description: "Z31.edit.err.missing.description",
  startDate: "Z31.edit.err.missing.startDate",
  startTime: "Z31.edit.err.missing.startTime",
  placeName: "Z31.edit.err.missing.placeName",
  address: "Z31.edit.err.missing.address",
};

const FIELD_ID: Record<LiveEditField, string> = {
  title: "title",
  description: "description",
  startDate: "startDate",
  startTime: "startTime",
  placeName: "placeName",
  address: "address",
};

// The notice above the form (EVB-01b): how many entries, and which one when
// it is a single missing one.
function summary(lang: Lang, errors: LiveEditErrors) {
  const fields = ORDER.filter((field) => errors[field]);
  const only = fields.length === 1 ? fields[0] : null;
  const MISSING: Record<LiveEditField, LiveEditCode> = {
    title: "titleMissing",
    description: "descriptionMissing",
    startDate: "dateMissing",
    startTime: "timeMissing",
    placeName: "placeNameMissing",
    address: "addressMissing",
  };
  const missingOnly = only !== null && errors[only] === MISSING[only];

  return {
    title:
      fields.length === 1
        ? t(lang, "Z31.edit.err.title.one")
        : t(lang, "Z31.edit.err.title.many", { count: fields.length }),
    line:
      only !== null && missingOnly
        ? t(lang, MISSING_ID[only])
        : t(lang, "Z31.edit.err.line.many"),
  };
}

export function LiveEditForm({
  lang,
  action,
  initial,
  cancelHref,
}: {
  lang: Lang;
  action: Action;
  initial: LiveEditValues;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE);
  const [values, setValues] = useState<LiveEditValues>(initial);
  // Until the page is hydrated the form is locked: text typed before that is
  // thrown away or mixed into the stored text when React takes over the
  // fields, and a click on save would send a plain GET request.
  const [ready, setReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errors: LiveEditErrors = state.status === "invalid" ? state.errors : {};

  const set = <K extends keyof LiveEditValues>(key: K, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  useEffect(() => setReady(true), []);

  // After a refused save the first field with a problem takes the focus.
  useEffect(() => {
    if (state.status !== "invalid") return;

    const first = ORDER.find((field) => state.errors[field]);

    if (first) {
      formRef.current
        ?.querySelector<HTMLElement>(`#${FIELD_ID[first]}`)
        ?.focus();
    }
  }, [state]);

  const text = (field: LiveEditField): string | undefined => {
    const code = errors[field];

    return code
      ? t(lang, ERROR_ID[code], MAX[code] ? { max: MAX[code] } : undefined)
      : undefined;
  };

  const notice =
    state.status === "invalid"
      ? summary(lang, state.errors)
      : { title: "", line: "" };
  const head =
    state.status === "invalid" ? (
      <Notice tone="error" title={notice.title}>
        {notice.line}
      </Notice>
    ) : state.status === "failed" ? (
      <Notice tone="error" title={t(lang, "Z31.edit.fail.title")}>
        {t(lang, "Z31.edit.fail.line")}
      </Notice>
    ) : (
      <Notice tone="info" title={t(lang, "Z31.edit.notice.title")}>
        {t(lang, "Z31.edit.notice.line")}
      </Notice>
    );

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
      {head}
      <fieldset disabled={!ready} className="contents">
        <div className="flex flex-col gap-6">
          <Field
            id="title"
            label={t(lang, "Z31.edit.title.label")}
            error={text("title")}
            large
          >
            {(props) => (
              <Input
                {...props}
                value={values.title}
                disabled={pending}
                placeholder={t(lang, "Z31.edit.title.placeholder")}
                onChange={(event) => set("title", event.target.value)}
              />
            )}
          </Field>
          <Field
            id="description"
            label={t(lang, "Z31.edit.description.label")}
            error={text("description")}
            large
          >
            {(props) => (
              <Textarea
                {...props}
                rows={2}
                value={values.description}
                disabled={pending}
                onChange={(event) => set("description", event.target.value)}
              />
            )}
          </Field>
          <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2">
            <DateField
              id="startDate"
              name="startDate"
              label={t(lang, "Z31.edit.date.label")}
              error={text("startDate")}
              lang={lang}
              value={values.startDate}
              onChange={(value) => set("startDate", value)}
              placeholder={t(lang, "Z24.time.date.placeholder")}
              openLabel={t(lang, "Z24.time.date.open")}
              disabled={pending}
            />
            <Field
              id="startTime"
              label={t(lang, "Z31.edit.start.label")}
              error={text("startTime")}
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
            <Field
              id="placeName"
              label={t(lang, "Z31.edit.place.label")}
              error={text("placeName")}
              large
            >
              {(props) => (
                <Input
                  {...props}
                  value={values.placeName}
                  disabled={pending}
                  placeholder={t(lang, "Z31.edit.place.placeholder")}
                  onChange={(event) => set("placeName", event.target.value)}
                />
              )}
            </Field>
            <Field
              id="address"
              label={t(lang, "Z31.edit.address.label")}
              error={text("address")}
              large
            >
              {(props) => (
                <Input
                  {...props}
                  value={values.address}
                  disabled={pending}
                  autoComplete="street-address"
                  placeholder={t(lang, "Z31.edit.address.placeholder")}
                  onChange={(event) => set("address", event.target.value)}
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
            {t(lang, pending ? "Z31.edit.saving" : "Z31.edit.save")}
          </button>
          <Link
            href={cancelHref}
            className={buttonClass("secondary", "w-full shadow-sm md:w-auto")}
          >
            {t(lang, "Z31.edit.cancel")}
          </Link>
        </div>
      </fieldset>
    </form>
  );
}
