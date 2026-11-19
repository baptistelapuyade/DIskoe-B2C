"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { StepShell } from "@/components/profile/step-shell";
import { UploadNotice } from "@/components/profile/upload-notice";
import { ACCEPT, useImageUpload } from "@/components/profile/use-image-upload";
import { Button } from "@/components/ui/button";
import { AtmosphereChip } from "@/components/ui/chip";
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
import {
  ACCESS_KINDS,
  ATMOSPHERE_TERMS,
  EVENT_LIMITS,
  hasAmount,
  MAX_ATMOSPHERE_TAGS,
  PRICE_MODELS,
  PRIMARY_FORMATS,
  TICKET_AVAILABILITY,
  type AccessKind,
} from "@/lib/domain/event-publication";
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

import {
  saveEventStep,
  uploadEventImageFile,
} from "@/app/(organizer)/organizer/events/step-actions";

import { DateField } from "./date-field";
import { clearRetained, loadRetained, saveRetained } from "./retained";

// The six steps of the first event (Figma EVT-01 to EVT-06, EVT-09 to
// EVT-09c). One screen component for all of them: the step decides the fields.
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

const ACCESS_ID: Record<AccessKind, MessageId> = {
  walk_in: "Z25.access.walkIn",
  door: "Z25.access.door",
  online_ticket: "Z25.access.onlineTicket",
  online_registration: "Z25.access.onlineRegistration",
};

const PRICE_MODEL_ID: Record<(typeof PRICE_MODELS)[number], MessageId> = {
  fixed: "Z25.price.form.fixed",
  range: "Z25.price.form.range",
  from_price: "Z25.price.form.fromPrice",
  free: "Z25.price.form.free",
  donation: "Z25.price.form.donation",
  min_donation: "Z25.price.form.minDonation",
  unknown: "Z25.price.form.unknown",
};

const ATMOSPHERE_ID: Record<(typeof ATMOSPHERE_TERMS)[number], MessageId> = {
  Gemütlich: "Z25.atmo.cozy",
  "Intim/persönlich": "Z25.atmo.intimate",
  Entspannt: "Z25.atmo.relaxed",
  Lebhaft: "Z25.atmo.lively",
  Ungezwungen: "Z25.atmo.casual",
  Experimentell: "Z25.atmo.experimental",
  "Underground/DIY": "Z25.atmo.underground",
  "Alternativ/unabhängig": "Z25.atmo.alternative",
  "Community-geprägt": "Z25.atmo.community",
  Immersiv: "Z25.atmo.immersive",
};

// Eyebrow, title, lead and main action of each step. The first three steps
// are catalogued as Z24, the next three as Z25.
const STEP_TEXT: Record<
  EventStep,
  { eyebrow: MessageId; title: MessageId; lead: MessageId; next: MessageId }
> = {
  basics: {
    eyebrow: "Z24.step.basics.eyebrow",
    title: "Z24.basics.title",
    lead: "Z24.basics.lead",
    next: "Z24.basics.next",
  },
  time: {
    eyebrow: "Z24.step.time.eyebrow",
    title: "Z24.time.title",
    lead: "Z24.time.lead",
    next: "Z24.time.next",
  },
  place: {
    eyebrow: "Z24.step.place.eyebrow",
    title: "Z24.place.title",
    lead: "Z24.place.lead",
    next: "Z24.place.next",
  },
  price: {
    eyebrow: "Z25.step.price.eyebrow",
    title: "Z25.price.title",
    lead: "Z25.price.lead",
    next: "Z25.price.next",
  },
  image: {
    eyebrow: "Z25.step.image.eyebrow",
    title: "Z25.image.title",
    lead: "Z25.image.lead",
    next: "Z25.image.next",
  },
  atmosphere: {
    eyebrow: "Z25.step.atmosphere.eyebrow",
    title: "Z25.atmosphere.title",
    lead: "Z25.atmosphere.lead",
    next: "Z25.atmosphere.next",
  },
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
  priceModelInvalid: "Z25.price.form.invalid",
  amountMissing: "Z25.price.amount.missing",
  amountInvalid: "Z25.price.amount.invalid",
  amountTooHigh: "Z25.price.amount.tooHigh",
  amountZero: "Z25.price.amount.zero",
  rangeOrder: "Z25.price.amount.rangeOrder",
  feesInvalid: "Z25.fees.invalid",
  availabilityInvalid: "Z25.availability.invalid",
  accessInvalid: "Z25.access.invalid",
  urlNoScheme: "Z25.link.noScheme",
  urlInvalid: "Z25.link.invalid",
  urlTooLong: "Z25.link.tooLong",
  altTooLong: "Z23.image.alt.tooLong",
  atmosphereInvalid: "Z25.atmosphere.invalid",
  atmosphereTooMany: "Z25.atmosphere.tooMany",
  atmosphereTextTooLong: "Z24.err.tooLong",
};

const MAX: Partial<Record<StepCode, number>> = {
  titleTooLong: EVENT_LIMITS.title,
  descriptionTooLong: EVENT_LIMITS.description,
  placeNameTooLong: EVENT_LIMITS.placeName,
  streetTooLong: EVENT_LIMITS.addressLine,
  postalCodeTooLong: EVENT_LIMITS.postalCode,
  cityTooLong: EVENT_LIMITS.city,
  urlTooLong: EVENT_LIMITS.url,
  altTooLong: EVENT_LIMITS.altText,
  atmosphereTooMany: MAX_ATMOSPHERE_TAGS,
  atmosphereTextTooLong: EVENT_LIMITS.atmosphereDescription,
};

const FIELDS: Record<EventStep, readonly StepField[]> = {
  basics: ["title", "format", "description"],
  time: ["startDate", "startTime", "endDate", "endTime"],
  place: ["placeName", "addressLine", "postalCode", "city"],
  price: [
    "accessKinds",
    "priceModel",
    "priceAmount",
    "priceAmountMax",
    "priceFees",
    "onlineTicketAvailability",
    "onlineTicketUrl",
    "onlineRegistrationUrl",
  ],
  image: ["altText"],
  atmosphere: ["atmosphereTags", "atmosphereDescription"],
};

type Values = Required<Omit<StepInput, "endUnknown">> & { endUnknown: boolean };

// What the image step shows of the stored picture.
export type StepImage = {
  url: string | null;
  fileName: string | null;
} | null;

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
    priceModel: initial.priceModel ?? "",
    priceAmount: initial.priceAmount ?? "",
    priceAmountMax: initial.priceAmountMax ?? "",
    priceFees: initial.priceFees ?? "",
    accessKinds: initial.accessKinds ?? [],
    onlineTicketUrl: initial.onlineTicketUrl ?? "",
    onlineRegistrationUrl: initial.onlineRegistrationUrl ?? "",
    onlineTicketAvailability: initial.onlineTicketAvailability ?? "",
    altText: initial.altText ?? "",
    atmosphereTags: initial.atmosphereTags ?? [],
    atmosphereDescription: initial.atmosphereDescription ?? "",
  };
}

export function EventStepScreen({
  lang,
  step,
  eventId,
  profileId,
  initial,
  image,
  backHref,
}: {
  lang: Lang;
  step: EventStep;
  eventId: string | null;
  profileId: string;
  initial: StepInput;
  // Only the image step uses it.
  image?: StepImage;
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

  // The event image is uploaded as soon as it is chosen (like the profile
  // picture); the rights are confirmed when the event is submitted (EIN-01).
  const upload = useImageUpload(
    (data) =>
      eventId
        ? uploadEventImageFile(eventId, data)
        : Promise.resolve({
            status: "error" as const,
            code: "failed" as const,
          }),
    () => router.refresh(),
  );

  const msg = (id: MessageId, params?: Record<string, string | number>) =>
    t(lang, id, params);

  // What this browser kept after a failed save comes back first.
  useEffect(() => {
    const kept = loadRetained(scope);

    if (kept) {
      const next = { ...toValues(initial) };

      for (const field of FIELDS[step]) {
        const value = kept[field];
        if (
          typeof value === "string" ||
          (Array.isArray(value) && value.every((v) => typeof v === "string"))
        ) {
          (next as Record<string, string | string[] | boolean>)[field] = value;
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

  // The price step sends only what is visible: an amount of a price type that
  // has none, or a link of a way that is not chosen, is not stored.
  function input(): StepInput {
    if (step !== "price") {
      return { ...values };
    }

    const ticket = values.accessKinds.includes("online_ticket");
    const money = hasAmount(values.priceModel);

    return {
      ...values,
      priceAmount: money ? values.priceAmount : "",
      priceAmountMax:
        values.priceModel === "range" ? values.priceAmountMax : "",
      priceFees: money && ticket ? values.priceFees : "",
      onlineTicketAvailability: ticket ? values.onlineTicketAvailability : "",
      onlineTicketUrl: ticket ? values.onlineTicketUrl : "",
      onlineRegistrationUrl: values.accessKinds.includes("online_registration")
        ? values.onlineRegistrationUrl
        : "",
    };
  }

  function toggleAccess(kind: AccessKind, on: boolean) {
    const chosen = ACCESS_KINDS.filter((item) =>
      item === kind ? on : values.accessKinds.includes(item),
    );

    setValue("accessKinds", chosen);
  }

  function chooseModel(model: string) {
    setValues((previous) => ({
      ...previous,
      priceModel: model,
      priceFees: hasAmount(model) ? previous.priceFees : "",
    }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next.priceModel;
      delete next.priceAmount;
      delete next.priceAmountMax;
      return next;
    });
  }

  function toggleTerm(term: string, on: boolean) {
    const chosen = ATMOSPHERE_TERMS.filter((item) =>
      item === term ? on : values.atmosphereTags.includes(item),
    );

    setValue("atmosphereTags", chosen);
  }

  function keep() {
    const kept: Record<string, string | boolean | string[]> = {};

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
  const nextLabel = msg(STEP_TEXT[step].next);
  const saving = status === "saving";
  const uploading = upload.busy;
  const ticket = values.accessKinds.includes("online_ticket");
  const money = hasAmount(values.priceModel);
  // The ways that have a price at the door or online; the amount applies to them.
  const priced = values.accessKinds.filter(
    (kind) => kind === "door" || kind === "online_ticket",
  );
  const ways =
    priced.length === 0
      ? msg("Z25.price.ways.all")
      : priced.length === 1
        ? msg(ACCESS_ID[priced[0]])
        : msg("Z25.price.ways.and", {
            a: msg(ACCESS_ID[priced[0]]),
            b: msg(ACCESS_ID[priced[1]]),
          });
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
      eyebrow={msg(STEP_TEXT[step].eyebrow)}
      title={msg(STEP_TEXT[step].title)}
      lead={msg(STEP_TEXT[step].lead)}
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

        {step === "image" && uploading ? (
          <Notice tone="info" title={msg("Z23.upload.busy.title")}>
            {msg("Z23.upload.busy.line")}
          </Notice>
        ) : null}

        {step === "image" && upload.error ? (
          <UploadNotice lang={lang} error={upload.error} />
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

          {step === "price" ? (
            <>
              <fieldset className="flex flex-col gap-4">
                <legend className="mb-1 text-2xl leading-[30px] font-medium">
                  {msg("Z25.access.title")}
                </legend>
                <p className="text-muted-foreground text-sm leading-5">
                  {msg("Z25.access.hint")}
                </p>
                <div className="mt-2 flex flex-col">
                  {ACCESS_KINDS.map((kind) => (
                    <label
                      key={kind}
                      htmlFor={`access-${kind}`}
                      className="flex min-h-11 items-center gap-3 text-base leading-6"
                    >
                      <Checkbox
                        id={`access-${kind}`}
                        checked={values.accessKinds.includes(kind)}
                        disabled={saving}
                        onCheckedChange={(checked) =>
                          toggleAccess(kind, checked === true)
                        }
                      />
                      {msg(ACCESS_ID[kind])}
                    </label>
                  ))}
                </div>
                {errors.accessKinds ? (
                  <p role="alert" className="text-error text-sm">
                    {errorText("accessKinds")}
                  </p>
                ) : null}
              </fieldset>

              <section
                aria-labelledby="price-title"
                className="flex flex-col gap-4"
              >
                <h2
                  id="price-title"
                  className="text-2xl leading-[30px] font-medium"
                >
                  {msg("Z25.price.section")}
                </h2>

                <div
                  className={
                    money && values.priceModel !== "range"
                      ? "grid items-start gap-4 sm:grid-cols-2"
                      : "flex flex-col gap-4"
                  }
                >
                  <Field
                    id="priceModel"
                    label={msg("Z25.price.form.label")}
                    error={errorText("priceModel")}
                    large
                  >
                    {(props) => (
                      <Select
                        value={values.priceModel}
                        disabled={saving}
                        onValueChange={chooseModel}
                      >
                        <SelectTrigger {...props}>
                          <SelectValue
                            placeholder={msg("Z25.price.form.placeholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {PRICE_MODELS.map((model) => (
                            <SelectItem key={model} value={model}>
                              {msg(PRICE_MODEL_ID[model])}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </Field>

                  {money && values.priceModel !== "range" ? (
                    <Field
                      id="priceAmount"
                      label={msg(
                        values.priceModel === "from_price"
                          ? "Z25.price.amount.fromPrice"
                          : values.priceModel === "min_donation"
                            ? "Z25.price.amount.minDonation"
                            : "Z25.price.amount.fixed",
                      )}
                      hint={
                        errors.priceAmount
                          ? undefined
                          : values.priceModel === "min_donation"
                            ? msg("Z25.price.amount.minDonationHint")
                            : values.priceModel === "from_price"
                              ? msg("Z25.price.amount.lowest", { ways })
                              : msg("Z25.price.amount.appliesTo", { ways })
                      }
                      error={errorText("priceAmount")}
                      large
                    >
                      {(props) => (
                        <Input
                          {...props}
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          value={values.priceAmount}
                          disabled={saving}
                          onChange={(event) =>
                            setValue("priceAmount", event.target.value)
                          }
                        />
                      )}
                    </Field>
                  ) : null}
                </div>

                {values.priceModel === "free" ? (
                  <p className="text-muted-foreground text-sm leading-5">
                    {msg("Z25.price.free.hint")}
                  </p>
                ) : null}

                {values.priceModel === "donation" ? (
                  <p className="text-muted-foreground text-sm leading-5">
                    {msg("Z25.price.donation.hint")}
                  </p>
                ) : null}

                {values.priceModel === "unknown" ? (
                  <Notice tone="info" title={msg("Z25.price.unknown.title")}>
                    {msg("Z25.price.unknown.line")}
                  </Notice>
                ) : null}

                {values.priceModel === "range" ? (
                  <div className="grid items-start gap-4 sm:grid-cols-2">
                    <Field
                      id="priceAmount"
                      label={msg("Z25.price.amount.rangeFrom")}
                      error={errorText("priceAmount")}
                      large
                    >
                      {(props) => (
                        <Input
                          {...props}
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          value={values.priceAmount}
                          disabled={saving}
                          onChange={(event) =>
                            setValue("priceAmount", event.target.value)
                          }
                        />
                      )}
                    </Field>
                    <Field
                      id="priceAmountMax"
                      label={msg("Z25.price.amount.rangeTo")}
                      error={errorText("priceAmountMax")}
                      large
                    >
                      {(props) => (
                        <Input
                          {...props}
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          value={values.priceAmountMax}
                          disabled={saving}
                          onChange={(event) =>
                            setValue("priceAmountMax", event.target.value)
                          }
                        />
                      )}
                    </Field>
                  </div>
                ) : null}

                {money && ticket ? (
                  <Field
                    id="priceFees"
                    label={msg("Z25.fees.label")}
                    hint={
                      errors.priceFees
                        ? undefined
                        : values.priceFees === "included"
                          ? msg("Z25.fees.included.hint")
                          : values.priceFees === "unknown"
                            ? msg("Z25.fees.unknown.hint")
                            : undefined
                    }
                    error={errorText("priceFees")}
                    large
                  >
                    {(props) => (
                      <Select
                        value={values.priceFees}
                        disabled={saving}
                        onValueChange={(value) => setValue("priceFees", value)}
                      >
                        <SelectTrigger {...props}>
                          <SelectValue
                            placeholder={msg("Z25.fees.placeholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="included">
                            {msg("Z25.fees.included")}
                          </SelectItem>
                          <SelectItem value="unknown">
                            {msg("Z25.fees.unknown")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </Field>
                ) : null}
              </section>

              {ticket ? (
                <>
                  <Field
                    id="onlineTicketAvailability"
                    label={msg("Z25.availability.label")}
                    hint={
                      errors.onlineTicketAvailability ||
                      values.onlineTicketAvailability !== "sold_out"
                        ? undefined
                        : msg("Z25.availability.soldOut.hint")
                    }
                    error={errorText("onlineTicketAvailability")}
                    large
                  >
                    {(props) => (
                      <Select
                        value={values.onlineTicketAvailability}
                        disabled={saving}
                        onValueChange={(value) =>
                          setValue("onlineTicketAvailability", value)
                        }
                      >
                        <SelectTrigger {...props}>
                          <SelectValue
                            placeholder={msg("Z25.availability.placeholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {TICKET_AVAILABILITY.map((value) => (
                            <SelectItem key={value} value={value}>
                              {msg(
                                value === "sold_out"
                                  ? "Z25.availability.soldOut"
                                  : "Z25.availability.available",
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </Field>

                  <Field
                    id="onlineTicketUrl"
                    label={msg("Z25.link.ticket.label")}
                    hint={
                      errors.onlineTicketUrl
                        ? undefined
                        : msg("Z25.link.ticket.hint")
                    }
                    error={errorText("onlineTicketUrl")}
                    large
                  >
                    {(props) => (
                      <Input
                        {...props}
                        type="url"
                        inputMode="url"
                        autoComplete="off"
                        value={values.onlineTicketUrl}
                        disabled={saving}
                        onChange={(event) =>
                          setValue("onlineTicketUrl", event.target.value)
                        }
                      />
                    )}
                  </Field>
                </>
              ) : null}

              {values.accessKinds.includes("online_registration") ? (
                <Field
                  id="onlineRegistrationUrl"
                  label={msg("Z25.link.registration.label")}
                  hint={
                    errors.onlineRegistrationUrl
                      ? undefined
                      : msg("Z25.link.registration.hint")
                  }
                  error={errorText("onlineRegistrationUrl")}
                  large
                >
                  {(props) => (
                    <Input
                      {...props}
                      type="url"
                      inputMode="url"
                      autoComplete="off"
                      value={values.onlineRegistrationUrl}
                      disabled={saving}
                      onChange={(event) =>
                        setValue("onlineRegistrationUrl", event.target.value)
                      }
                    />
                  )}
                </Field>
              ) : null}
            </>
          ) : null}

          {step === "image" ? (
            <>
              <div className="border-border flex flex-col gap-3 rounded-md border p-4">
                {image?.url ? (
                  <div className="w-[200px] max-w-full overflow-hidden rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt=""
                      draggable={false}
                      className="block h-auto w-full"
                    />
                  </div>
                ) : null}
                <p className="text-sm leading-5 font-medium break-all">
                  {image?.fileName ?? msg("Z25.image.label")}
                </p>
                <p className="text-muted-foreground text-xs leading-4">
                  {image ? msg("Z23.upload.another") : msg("Z23.upload.hint")}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="ghostLg"
                    onClick={upload.open}
                    disabled={uploading || saving}
                  >
                    {msg("Z23.upload.choose")}
                  </Button>
                  {image ? null : (
                    <span className="text-muted-foreground text-sm leading-5">
                      {msg("Z23.upload.none")}
                    </span>
                  )}
                </div>
                <input
                  ref={upload.inputRef}
                  type="file"
                  accept={ACCEPT}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(event) => {
                    void upload.choose(event.target.files?.[0]);
                    // The same file can be chosen again after an error.
                    event.target.value = "";
                  }}
                />
              </div>

              {image ? (
                <Field
                  id="altText"
                  label={msg("Z23.image.alt.label")}
                  hint={errors.altText ? undefined : msg("Z23.image.alt.hint")}
                  error={errorText("altText")}
                  large
                >
                  {(props) => (
                    <Textarea
                      {...props}
                      rows={2}
                      value={values.altText}
                      disabled={saving}
                      placeholder={msg("Z23.image.alt.placeholder")}
                      onChange={(event) =>
                        setValue("altText", event.target.value)
                      }
                    />
                  )}
                </Field>
              ) : (
                <p className="text-muted-foreground text-sm leading-5">
                  {msg("Z25.image.missingHint")}
                </p>
              )}
            </>
          ) : null}

          {step === "atmosphere" ? (
            <>
              <fieldset className="flex flex-col gap-6">
                <legend className="sr-only">
                  {msg("Z25.atmosphere.group")}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {ATMOSPHERE_TERMS.map((term) => {
                    const checked = values.atmosphereTags.includes(term);

                    return (
                      <AtmosphereChip
                        key={term}
                        value={term}
                        label={msg(ATMOSPHERE_ID[term])}
                        checked={checked}
                        disabled={
                          saving ||
                          (!checked &&
                            values.atmosphereTags.length >= MAX_ATMOSPHERE_TAGS)
                        }
                        onChange={(on) => toggleTerm(term, on)}
                      />
                    );
                  })}
                </div>
                <p
                  aria-live="polite"
                  className="text-muted-foreground text-sm leading-5"
                >
                  {msg("Z25.atmosphere.count", {
                    n: values.atmosphereTags.length,
                    max: MAX_ATMOSPHERE_TAGS,
                  })}
                  {values.atmosphereTags.length === 0 &&
                  values.atmosphereDescription.trim() === ""
                    ? ` ${msg("Z25.atmosphere.needed")}`
                    : ""}
                </p>
                {errors.atmosphereTags ? (
                  <p role="alert" className="text-error text-sm">
                    {errorText("atmosphereTags")}
                  </p>
                ) : null}
              </fieldset>

              <Field
                id="atmosphereDescription"
                label={msg("Z25.atmosphere.text.label")}
                hint={
                  errors.atmosphereDescription
                    ? undefined
                    : msg("Z25.atmosphere.text.hint", {
                        max: EVENT_LIMITS.atmosphereDescription,
                      })
                }
                error={errorText("atmosphereDescription")}
                large
              >
                {(props) => (
                  <Textarea
                    {...props}
                    rows={2}
                    value={values.atmosphereDescription}
                    disabled={saving}
                    placeholder={msg("Z25.atmosphere.text.placeholder")}
                    onChange={(event) =>
                      setValue("atmosphereDescription", event.target.value)
                    }
                  />
                )}
              </Field>
            </>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            variant="primaryLg"
            disabled={saving || uploading}
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
