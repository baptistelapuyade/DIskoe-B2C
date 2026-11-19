"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { StepShell } from "@/components/profile/step-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_LIMITS, PRIMARY_FORMATS } from "@/lib/domain/event-publication";
import {
  noticeKind,
  validateStep,
  type EventStep,
  type StepCode,
  type StepErrors,
  type StepField,
  type StepInput,
  type StepIntent,
} from "@/lib/domain/event-steps";
import { nextDayIso } from "@/lib/event/date-input";
import { t, type Lang, type MessageId } from "@/lib/i18n";

import { saveEventStep } from "@/app/(organizer)/organizer/events/step-actions";

import { DateField } from "./date-field";
import { clearRetained, loadRetained, saveRetained } from "./retained";

// The first three steps of the first event (Figma EVT-01 to EVT-03, EVT-09 to
// EVT-09c). One screen component for all three: the step decides the fields.
// The check runs here first (no round trip, works offline) and again on the
// server, which decides.

type Status = "idle" | "saving" | "invalid" | "failed" | "offline";

const FORMAT_ID: Record<(typeof PRIMARY_FORMATS)[number], MessageId> = {
  concert: "Z24.format.concert",
  dj_set: "Z24.format.djSet",
  club_night: "Z24.format.clubNight",
  listening_session: "Z24.format.listeningSession",
  opening: "Z24.format.opening",
  exhibition: "Z24.format.exhibition",
  screening: "Z24.format.screening",
};

const ERROR_ID: Record<StepCode, MessageId> = {
  titleMissing: "Z24.basics.title.missing",
  titleTooLong: "Z24.err.tooLong",
  formatMissing: "Z24.basics.format.missing",
  formatInvalid: "Z24.basics.format.invalid",
  descriptionTooLong: "Z24.err.tooLong",
  dateInvalid: "Z24.time.date.invalid",
  dateMissing: "Z24.time.date.missing",
  timeInvalid: "Z24.time.time.invalid",
  timeMissing: "Z24.time.time.missing",
  timeNonexistent: "Z24.time.time.nonexistent",
  timeAmbiguous: "Z24.time.time.ambiguous",
  endBeforeStart: "Z24.time.end.beforeStart",
  placeNameMissing: "Z24.place.name.missing",
  placeNameTooLong: "Z24.err.tooLong",
  streetMissing: "Z24.place.street.missing",
  streetTooLong: "Z24.err.tooLong",
  postalCodeTooLong: "Z24.err.tooLong",
  cityMissing: "Z24.place.city.missing",
  cityTooLong: "Z24.err.tooLong",
};

const MAX: Partial<Record<StepCode, number>> = {
  titleTooLong: EVENT_LIMITS.title,
  descriptionTooLong: EVENT_LIMITS.description,
  placeNameTooLong: EVENT_LIMITS.placeName,
  streetTooLong: EVENT_LIMITS.addressLine,
  postalCodeTooLong: EVENT_LIMITS.postalCode,
  cityTooLong: EVENT_LIMITS.city,
};

const FIELDS: Record<EventStep, readonly StepField[]> = {
  basics: ["title", "format", "description"],
  time: ["startDate", "startTime", "endDate", "endTime"],
  place: ["placeName", "addressLine", "postalCode", "city"],
};

type Values = Required<Omit<StepInput, "endUnknown">> & { endUnknown: boolean };

function toValues(initial: StepInput): Values {
  return {
    title: initial.title ?? "",
    format: initial.format ?? "",
    description: initial.description ?? "",
    startDate: initial.startDate ?? "",
    startTime: initial.startTime ?? "",
    endDate: initial.endDate ?? "",
    endTime: initial.endTime ?? "",
    endUnknown: initial.endUnknown === true,
    placeName: initial.placeName ?? "",
    addressLine: initial.addressLine ?? "",
    postalCode: initial.postalCode ?? "",
    city: initial.city ?? "",
  };
}

export function EventStepScreen({
  lang,
  step,
  eventId,
  profileId,
  initial,
  backHref,
}: {
  lang: Lang;
  step: EventStep;
  eventId: string | null;
  profileId: string;
  initial: StepInput;
  backHref: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const scope = `${eventId ?? `new-${profileId}`}:${step}`;
  const [values, setValues] = useState<Values>(() => toValues(initial));
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<StepErrors>({});
  const [focusTick, setFocusTick] = useState(0);
  const [lastIntent, setLastIntent] = useState<StepIntent>("next");
  const [view, setView] = useState<"form" | "leave">("form");
  const [leaveHref, setLeaveHref] = useState<string | null>(null);

  const msg = (id: MessageId, params?: Record<string, string | number>) =>
    t(lang, id, params);

  // What this browser kept after a failed save comes back first.
  useEffect(() => {
    const kept = loadRetained(scope);

    if (kept) {
      const next = { ...toValues(initial) };

      for (const field of FIELDS[step]) {
        const value = kept[field];
        if (typeof value === "string") {
          (next as Record<string, string | boolean>)[field] = value;
        }
      }

      if (step === "time" && typeof kept.endUnknown === "boolean") {
        next.endUnknown = kept.endUnknown;
      }

      setValues(next);
    }
    // Only once per screen: the values are the ones the person works on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  // UX-05: after a failed check the first marked field gets the focus.
  useEffect(() => {
    if (focusTick > 0) {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    }
  }, [focusTick]);

  // While nothing is saved, a click on a link opens the "not saved" screen
  // (EVT-09c) instead of leaving at once.
  const unsaved = status === "failed" || status === "offline";

  useEffect(() => {
    if (!unsaved) {
      return;
    }

    const onClick = (event: MouseEvent) => {
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      const href = link?.getAttribute("href") ?? "";

      if (
        !link ||
        !href.startsWith("/") ||
        link.target === "_blank" ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setLeaveHref(href);
      setView("leave");
    };

    document.addEventListener("click", onClick, true);

    return () => document.removeEventListener("click", onClick, true);
  }, [unsaved]);

  function setValue<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!(key in previous)) {
        return previous;
      }

      const next = { ...previous };
      delete next[key as StepField];
      // The end-before-start problem belongs to both ends.
      if (
        (key === "startDate" || key === "startTime" || key === "endTime") &&
        next.endDate === "endBeforeStart"
      ) {
        delete next.endDate;
      }

      return next;
    });
  }

  function input(): StepInput {
    return { ...values };
  }

  function keep() {
    const kept: Record<string, string | boolean> = {};

    for (const field of FIELDS[step]) {
      kept[field] = values[field];
    }

    if (step === "time") {
      kept.endUnknown = values.endUnknown;
    }

    saveRetained(scope, kept);
  }

  function fail(kind: "failed" | "offline") {
    keep();
    setStatus(kind);
  }

  async function run(intent: StepIntent) {
    if (status === "saving") {
      return;
    }

    setLastIntent(intent);
    const found = validateStep(step, input(), intent);

    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus("invalid");
      setFocusTick((n) => n + 1);
      return;
    }

    setErrors({});

    if (!navigator.onLine) {
      fail("offline");
      return;
    }

    setStatus("saving");

    try {
      const result = await saveEventStep({
        step,
        intent,
        eventId,
        profileId,
        input: input(),
      });

      if (result.status === "saved") {
        clearRetained(scope);
        router.push(result.next);
        return;
      }

      if (result.status === "invalid") {
        setErrors(result.errors);
        setStatus("invalid");
        setFocusTick((n) => n + 1);
        return;
      }

      fail("failed");
    } catch {
      fail(navigator.onLine ? "failed" : "offline");
    }
  }

  const errorText = (field: StepField): string | undefined => {
    const code = errors[field];

    return code
      ? msg(ERROR_ID[code], MAX[code] ? { max: MAX[code] } : undefined)
      : undefined;
  };

  if (view === "leave") {
    return (
      <StepShell
        lang={lang}
        backHref={backHref}
        eyebrow={msg("Z24.leave.eyebrow")}
        title={msg("Z24.leave.title")}
        lead={msg("Z24.leave.lead")}
        current={1}
      >
        <div className="flex flex-col gap-10">
          <Notice tone="warning" title={msg("Z24.leave.notice.title")}>
            {msg("Z24.leave.notice.line")}
          </Notice>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primaryLg"
              onClick={() => {
                setView("form");
                void run(lastIntent);
              }}
            >
              {msg("Z24.leave.back")}
            </Button>
            <Button
              variant="ghostLg"
              onClick={() => {
                keep();
                router.push(leaveHref ?? "/organizer");
              }}
            >
              {msg("Z24.leave.leave")}
            </Button>
          </div>
        </div>
      </StepShell>
    );
  }

  const codes = Object.values(errors);
  const kind = noticeKind(errors);
  const nextLabel =
    step === "basics"
      ? msg("Z24.basics.next")
      : step === "time"
        ? msg("Z24.time.next")
        : msg("Z24.place.next");
  const saving = status === "saving";
  const mainLabel = saving
    ? msg("Z24.saving.button")
    : unsaved
      ? msg("Z24.retry")
      : nextLabel;
  const startNextDay =
    values.startDate !== "" && values.endDate === nextDayIso(values.startDate);

  return (
    <StepShell
      lang={lang}
      backHref={backHref}
      eyebrow={msg(`Z24.step.${step}.eyebrow` as MessageId)}
      title={msg(`Z24.${step}.title` as MessageId)}
      lead={msg(`Z24.${step}.lead` as MessageId)}
      current={1}
    >
      <form
        ref={formRef}
        noValidate
        className="flex flex-col gap-10"
        onSubmit={(event) => {
          event.preventDefault();
          void run(unsaved ? lastIntent : "next");
        }}
      >
        {status === "invalid" && codes.length > 0 ? (
          kind === "endBeforeStart" ? (
            <Notice tone="error" title={msg("Z23.check.title.one")}>
              {msg("Z24.time.end.beforeStart")}
            </Notice>
          ) : (
            <Notice
              tone="error"
              title={
                codes.length === 1
                  ? msg("Z23.check.title.one")
                  : codes.length === 2
                    ? msg("Z23.check.title.two")
                    : msg("Z23.check.title.many", { n: codes.length })
              }
            >
              {kind === "missing"
                ? codes.length === 1
                  ? msg("Z24.check.line.missing.one")
                  : msg("Z24.check.line.missing.many")
                : codes.length === 1
                  ? msg("Z23.check.line.one")
                  : msg("Z23.check.line.many")}
            </Notice>
          )
        ) : null}

        {status === "failed" ? (
          <Notice tone="error" title={msg("Z24.failed.title")}>
            {msg("Z24.failed.line")}
          </Notice>
        ) : null}

        {status === "offline" ? (
          <Notice tone="warning" title={msg("Z24.offline.title")}>
            {msg("Z24.offline.line")}
          </Notice>
        ) : null}

        {saving ? (
          <Notice tone="info" title={msg("Z24.saving.title")}>
            {msg("Z24.saving.line")}
          </Notice>
        ) : null}

        <div className="flex flex-col gap-6">
          {step === "basics" ? (
            <>
              <div className="grid items-start gap-6 sm:grid-cols-2 sm:gap-4">
                <Field
                  id="title"
                  label={msg("Z24.basics.title.label")}
                  hint={errors.title ? undefined : msg("Z24.basics.title.hint")}
                  error={errorText("title")}
                  large
                >
                  {(props) => (
                    <Input
                      {...props}
                      type="text"
                      autoComplete="off"
                      value={values.title}
                      disabled={saving}
                      placeholder={msg("Z24.basics.title.placeholder")}
                      onChange={(event) =>
                        setValue("title", event.target.value)
                      }
                    />
                  )}
                </Field>

                <Field
                  id="format"
                  label={msg("Z24.basics.format.label")}
                  hint={
                    errors.format ? undefined : msg("Z24.basics.format.hint")
                  }
                  error={errorText("format")}
                  large
                >
                  {(props) => (
                    <Select
                      value={values.format}
                      disabled={saving}
                      onValueChange={(value) => setValue("format", value)}
                    >
                      <SelectTrigger {...props}>
                        <SelectValue
                          placeholder={msg("Z24.basics.format.placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIMARY_FORMATS.map((format) => (
                          <SelectItem key={format} value={format}>
                            {msg(FORMAT_ID[format])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
              </div>

              <Field
                id="description"
                label={msg("Z24.basics.description.label")}
                hint={
                  errors.description
                    ? undefined
                    : msg("Z24.basics.description.hint", {
                        max: EVENT_LIMITS.description,
                      })
                }
                error={errorText("description")}
                large
              >
                {(props) => (
                  <Textarea
                    {...props}
                    rows={2}
                    value={values.description}
                    disabled={saving}
                    placeholder={msg("Z24.basics.description.placeholder")}
                    onChange={(event) =>
                      setValue("description", event.target.value)
                    }
                  />
                )}
              </Field>
            </>
          ) : null}

          {step === "time" ? (
            <>
              <section
                aria-labelledby="start-title"
                className="flex flex-col gap-4"
              >
                <h2
                  id="start-title"
                  className="text-2xl leading-[30px] font-medium"
                >
                  {msg("Z24.time.start.title")}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DateField
                    id="startDate"
                    name="startDate"
                    label={msg("Z24.time.date.label")}
                    error={errorText("startDate")}
                    lang={lang}
                    value={values.startDate}
                    onChange={(value) => setValue("startDate", value)}
                    placeholder={msg("Z24.time.date.placeholder")}
                    openLabel={msg("Z24.time.date.open")}
                    disabled={saving}
                  />
                  <Field
                    id="startTime"
                    label={msg("Z24.time.time.label")}
                    error={errorText("startTime")}
                    large
                  >
                    {(props) => (
                      <Input
                        {...props}
                        type="time"
                        value={values.startTime}
                        disabled={saving}
                        onChange={(event) =>
                          setValue("startTime", event.target.value)
                        }
                      />
                    )}
                  </Field>
                </div>
              </section>

              <section
                aria-labelledby="end-title"
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <h2
                    id="end-title"
                    className="text-2xl leading-[30px] font-medium"
                  >
                    {msg("Z24.time.end.title")}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-5">
                    {msg("Z24.time.end.hint")}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DateField
                    id="endDate"
                    name="endDate"
                    label={msg("Z24.time.date.label")}
                    hint={
                      startNextDay && !errors.endDate
                        ? msg("Z24.time.end.nextDay")
                        : undefined
                    }
                    error={errorText("endDate")}
                    lang={lang}
                    value={values.endDate}
                    onChange={(value) => setValue("endDate", value)}
                    placeholder={msg("Z24.time.date.placeholder")}
                    openLabel={msg("Z24.time.date.open")}
                    disabled={saving || values.endUnknown}
                  />
                  <Field
                    id="endTime"
                    label={msg("Z24.time.time.label")}
                    error={errorText("endTime")}
                    large
                  >
                    {(props) => (
                      <Input
                        {...props}
                        type="time"
                        value={values.endTime}
                        disabled={saving || values.endUnknown}
                        onChange={(event) =>
                          setValue("endTime", event.target.value)
                        }
                      />
                    )}
                  </Field>
                </div>
                <label
                  htmlFor="endUnknown"
                  className="flex min-h-11 items-center gap-3 text-base leading-6"
                >
                  <Checkbox
                    id="endUnknown"
                    checked={values.endUnknown}
                    disabled={saving}
                    onCheckedChange={(checked) => {
                      const on = checked === true;

                      setValues((previous) => ({
                        ...previous,
                        endUnknown: on,
                        endDate: on ? "" : previous.endDate,
                        endTime: on ? "" : previous.endTime,
                      }));

                      if (on) {
                        setErrors((previous) => {
                          const next = { ...previous };
                          delete next.endDate;
                          delete next.endTime;
                          return next;
                        });
                      }
                    }}
                  />
                  {msg("Z24.time.end.unknown")}
                </label>
              </section>
            </>
          ) : null}

          {step === "place" ? (
            <div className="grid items-start gap-6 sm:grid-cols-2 sm:gap-x-4">
              <Field
                id="placeName"
                label={msg("Z24.place.name.label")}
                hint={errors.placeName ? undefined : msg("Z24.place.name.hint")}
                error={errorText("placeName")}
                large
              >
                {(props) => (
                  <Input
                    {...props}
                    type="text"
                    autoComplete="off"
                    value={values.placeName}
                    disabled={saving}
                    placeholder={msg("Z24.place.name.placeholder")}
                    onChange={(event) =>
                      setValue("placeName", event.target.value)
                    }
                  />
                )}
              </Field>
              <Field
                id="addressLine"
                label={msg("Z24.place.street.label")}
                error={errorText("addressLine")}
                large
              >
                {(props) => (
                  <Input
                    {...props}
                    type="text"
                    autoComplete="street-address"
                    value={values.addressLine}
                    disabled={saving}
                    placeholder={msg("Z24.place.street.placeholder")}
                    onChange={(event) =>
                      setValue("addressLine", event.target.value)
                    }
                  />
                )}
              </Field>
              <Field
                id="postalCode"
                label={msg("Z24.place.postalCode.label")}
                error={errorText("postalCode")}
                large
              >
                {(props) => (
                  <Input
                    {...props}
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={values.postalCode}
                    disabled={saving}
                    placeholder={msg("Z24.place.postalCode.placeholder")}
                    onChange={(event) =>
                      setValue("postalCode", event.target.value)
                    }
                  />
                )}
              </Field>
              <Field
                id="city"
                label={msg("Z24.place.city.label")}
                error={errorText("city")}
                large
              >
                {(props) => (
                  <Input
                    {...props}
                    type="text"
                    autoComplete="address-level2"
                    value={values.city}
                    disabled={saving}
                    placeholder={msg("Z24.place.city.placeholder")}
                    onChange={(event) => setValue("city", event.target.value)}
                  />
                )}
              </Field>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            variant="primaryLg"
            disabled={saving}
            aria-busy={saving}
          >
            {mainLabel}
          </Button>
          <Button
            variant="ghostLg"
            disabled={saving}
            onClick={() => void run("later")}
          >
            {msg("Z24.later")}
          </Button>
        </div>
      </form>
    </StepShell>
  );
}
