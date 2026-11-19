"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";

import { StepShell } from "@/components/profile/step-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AGE_RULES,
  blocksOnPage,
  FIELD_BLOCK,
  MAX_GENRES,
  MODULE_KEYS,
  MODULE_LIMITS,
  MUSIC_GENRES,
  PROGRAM_LANGUAGES,
  requiredBlock,
  SHORT_VISITS,
  showsMinAge,
  showsSubtitleLanguage,
  showsWindow,
  storedToForm,
  SUBTITLES,
  validateModules,
  VISIT_MODES,
  type ModuleCode,
  type ModuleErrors,
  type ModuleField,
  type ModuleForm,
  type ModuleIntent,
  type ModuleKey,
  type StoredModules,
} from "@/lib/domain/event-modules";
import {
  AGE_RULE_ID,
  BLOCK_DESC_ID,
  BLOCK_ID,
  GENRE_ID,
  moduleSummary,
  PROGRAM_ID,
  SHORT_VISIT_ID,
  SUBTITLES_ID,
  VISIT_MODE_ID,
} from "@/lib/event/module-summary";
import { t, type Lang, type MessageId } from "@/lib/i18n";

import { saveEventModules } from "@/app/(organizer)/organizer/events/module-actions";

import { clearRetained, loadRetained, saveRetained } from "./retained";

// Step 7 "Mehr zum Abend" (Figma EVT-07, EVT-07m-a to 07m-k, EVT-09 to 09c):
// cards for the blocks that are on the page, a picker for more blocks, remove
// with undo. The check runs here first and again on the server, which decides.
// Six of the eleven blocks are built; the other five follow with their frames.

type Status = "idle" | "saving" | "invalid" | "failed" | "offline";
type View = "form" | "picker" | "leave";

const LEAD: Record<string, MessageId> = {
  club_night: "Z26.more.lead.club",
  opening: "Z26.more.lead.opening",
  screening: "Z26.more.lead.screening",
};

const ERROR_ID: Record<ModuleCode, MessageId> = {
  doorsInvalid: "Z26.err.time",
  ageRuleInvalid: "Z26.err.choice",
  ageMissing: "Z26.err.ageMissing",
  ageInvalid: "Z26.err.ageInvalid",
  visitModeInvalid: "Z26.err.choice",
  windowFromMissing: "Z26.err.windowFromMissing",
  windowFromInvalid: "Z26.err.time",
  windowToInvalid: "Z26.err.time",
  shortVisitInvalid: "Z26.err.choice",
  programInvalid: "Z26.err.choice",
  subtitlesInvalid: "Z26.err.choice",
  subtitleLanguageTooLong: "Z24.err.tooLong",
  precisionTooLong: "Z24.err.tooLong",
  genresInvalid: "Z26.err.choice",
  genresTooMany: "Z26.err.genresTooMany",
  participantsTooLong: "Z24.err.tooLong",
  bringTooLong: "Z24.err.tooLong",
  requiredMissing: "Z26.err.requiredChoice",
};

const MAX: Partial<Record<ModuleCode, number>> = {
  subtitleLanguageTooLong: MODULE_LIMITS.subtitleLanguage,
  precisionTooLong: MODULE_LIMITS.precision,
  genresTooMany: MAX_GENRES,
  participantsTooLong: MODULE_LIMITS.participants,
  bringTooLong: MODULE_LIMITS.bring,
};

const FIELDS = Object.keys(FIELD_BLOCK) as ModuleField[];

function restore(
  base: ModuleForm,
  kept: Record<string, string | boolean | string[]>,
): ModuleForm {
  const next: ModuleForm = { ...base };

  for (const field of Object.keys(base) as Array<keyof ModuleForm>) {
    const value = kept[field];

    if (field === "musicGenres") {
      if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
        next.musicGenres = value;
      }
    } else if (typeof value === "string") {
      next[field] = value as never;
    }
  }

  return next;
}

export function EventMoreScreen({
  lang,
  eventId,
  format,
  stored,
  backHref,
}: {
  lang: Lang;
  eventId: string;
  // The primary format of the draft ("" while it has none).
  format: string;
  stored: StoredModules | null;
  backHref: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const scope = `${eventId}:more`;
  const required = requiredBlock(format);

  const [form, setForm] = useState<ModuleForm>(() => storedToForm(stored));
  const [blocks, setBlocks] = useState<ModuleKey[]>(() =>
    blocksOnPage(stored, format),
  );
  // Blocks removed in this visit: still shown as a dashed note with "Undo"
  // until the step is saved.
  const [removed, setRemoved] = useState<ModuleKey[]>([]);
  const [open, setOpen] = useState<ModuleKey[]>(() => {
    // A required block that is not answered yet starts open (EVT-07m-c, d).
    return required && blocksOnPage(stored, format).includes(required)
      ? [required]
      : [];
  });
  const [picked, setPicked] = useState<ModuleKey[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ModuleErrors>({});
  const [focusTick, setFocusTick] = useState(0);
  const [lastIntent, setLastIntent] = useState<ModuleIntent>("next");
  const [view, setView] = useState<View>("form");
  const [leaveHref, setLeaveHref] = useState<string | null>(null);

  const msg = (id: MessageId, params?: Record<string, string | number>) =>
    t(lang, id, params);

  // What this browser kept after a failed save comes back first.
  useEffect(() => {
    const kept = loadRetained(scope);

    if (kept) {
      setForm((previous) => restore(previous, kept));

      if (
        Array.isArray(kept.blocks) &&
        kept.blocks.every((b) => (MODULE_KEYS as readonly string[]).includes(b))
      ) {
        setBlocks(
          MODULE_KEYS.filter(
            (key) =>
              (kept.blocks as string[]).includes(key) || key === required,
          ),
        );
      }
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

  function setValue<K extends keyof ModuleForm>(
    key: K,
    value: ModuleForm[K],
    ...fields: ModuleField[]
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      const cleared = fields.filter((field) => field in previous);

      if (cleared.length === 0) {
        return previous;
      }

      const next = { ...previous };
      for (const field of cleared) delete next[field];

      return next;
    });
  }

  function keep() {
    const kept: Record<string, string | boolean | string[]> = { ...form };
    kept.blocks = blocks;
    saveRetained(scope, kept);
  }

  function fail(kind: "failed" | "offline") {
    keep();
    setStatus(kind);
  }

  async function run(intent: ModuleIntent) {
    if (status === "saving") {
      return;
    }

    setLastIntent(intent);
    const input = { blocks, form };
    const found = validateModules(input, format, intent);

    if (Object.keys(found).length > 0) {
      showErrors(found);
      return;
    }

    setErrors({});

    if (!navigator.onLine) {
      fail("offline");
      return;
    }

    setStatus("saving");

    try {
      const result = await saveEventModules({ eventId, intent, input });

      if (result.status === "saved") {
        clearRetained(scope);
        router.push(result.next);
        return;
      }

      if (result.status === "invalid") {
        showErrors(result.errors);
        return;
      }

      fail("failed");
    } catch {
      fail(navigator.onLine ? "failed" : "offline");
    }
  }

  function showErrors(found: ModuleErrors) {
    setErrors(found);
    setStatus("invalid");
    // The cards with a problem open so that the field can be seen.
    const withProblem = new Set(
      (Object.keys(found) as ModuleField[]).map((field) => FIELD_BLOCK[field]),
    );
    setOpen((previous) => [...new Set([...previous, ...withProblem])]);
    setFocusTick((n) => n + 1);
  }

  const errorText = (field: ModuleField): string | undefined => {
    const code = errors[field];

    return code
      ? msg(ERROR_ID[code], MAX[code] ? { max: MAX[code] } : undefined)
      : undefined;
  };

  const toggle = (key: ModuleKey) =>
    setOpen((previous) =>
      previous.includes(key)
        ? previous.filter((item) => item !== key)
        : [...previous, key],
    );

  function removeBlock(key: ModuleKey) {
    setBlocks((previous) => previous.filter((item) => item !== key));
    setRemoved((previous) => [...previous, key]);
    setOpen((previous) => previous.filter((item) => item !== key));
    setErrors((previous) => {
      const next = { ...previous };
      for (const field of FIELDS) {
        if (FIELD_BLOCK[field] === key) delete next[field];
      }
      return next;
    });
  }

  function restoreBlock(key: ModuleKey) {
    setRemoved((previous) => previous.filter((item) => item !== key));
    setBlocks((previous) =>
      MODULE_KEYS.filter((k) => k === key || previous.includes(k)),
    );
  }

  function addPicked() {
    setBlocks((previous) =>
      MODULE_KEYS.filter(
        (key) => previous.includes(key) || picked.includes(key),
      ),
    );
    setRemoved((previous) => previous.filter((key) => !picked.includes(key)));
    setOpen((previous) => [...new Set([...previous, ...picked])]);
    setPicked([]);
    setView("form");
  }

  const saving = status === "saving";

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

  if (view === "picker") {
    // Every block that is not on the page (removed ones included).
    const available = MODULE_KEYS.filter((key) => !blocks.includes(key));

    return (
      <StepShell
        lang={lang}
        backHref={backHref}
        eyebrow={msg("Z26.picker.eyebrow")}
        title={msg("Z26.picker.title")}
        lead={msg("Z26.picker.lead")}
        current={1}
      >
        <div className="flex flex-col gap-10">
          {available.length === 0 ? (
            <p className="text-muted-foreground text-base">
              {msg("Z26.picker.none")}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {available.map((key) => (
                <li key={key}>
                  <label
                    htmlFor={`pick-${key}`}
                    className="border-border bg-background flex cursor-pointer items-start gap-3 rounded-lg border p-4"
                  >
                    <Checkbox
                      id={`pick-${key}`}
                      className="mt-1"
                      checked={picked.includes(key)}
                      onCheckedChange={(on) =>
                        setPicked((previous) =>
                          on === true
                            ? [...previous, key]
                            : previous.filter((item) => item !== key),
                        )
                      }
                    />
                    <span className="flex flex-col gap-1">
                      <span className="text-xl leading-7">
                        {msg(BLOCK_ID[key])}
                      </span>
                      <span className="text-muted-foreground text-sm leading-5">
                        {msg(BLOCK_DESC_ID[key])}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primaryLg"
              disabled={picked.length === 0}
              onClick={addPicked}
            >
              {msg("Z26.picker.add")}
            </Button>
            <Button
              variant="ghostLg"
              onClick={() => {
                setPicked([]);
                setView("form");
              }}
            >
              {msg("Z26.picker.cancel")}
            </Button>
          </div>
        </div>
      </StepShell>
    );
  }

  const errorBlocks = new Set(
    (Object.keys(errors) as ModuleField[]).map((field) => FIELD_BLOCK[field]),
  );
  const codes = Object.values(errors);
  const onlyRequired =
    codes.length > 0 && codes.every((code) => code === "requiredMissing");
  const shown = MODULE_KEYS.filter(
    (key) => blocks.includes(key) || removed.includes(key),
  );
  const mainLabel = saving
    ? msg("Z24.saving.button")
    : unsaved
      ? msg("Z24.retry")
      : msg("Z26.more.next");

  return (
    <StepShell
      lang={lang}
      backHref={backHref}
      eyebrow={msg("Z26.step.more.eyebrow")}
      title={msg("Z26.more.title")}
      lead={msg(LEAD[format] ?? "Z26.more.lead.none")}
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
        {status === "invalid" && errorBlocks.size > 0 ? (
          <Notice
            tone="error"
            title={
              errorBlocks.size === 1
                ? msg("Z23.check.title.one")
                : errorBlocks.size === 2
                  ? msg("Z23.check.title.two")
                  : msg("Z23.check.title.many", { n: errorBlocks.size })
            }
          >
            {onlyRequired && errorBlocks.size === 1
              ? msg(
                  required === "language"
                    ? "Z26.check.line.required.language"
                    : "Z26.check.line.required.visitMode",
                )
              : errorBlocks.size === 1
                ? msg("Z23.check.line.one")
                : msg("Z23.check.line.many")}
          </Notice>
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

        {shown.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {shown.map((key) => {
              if (!blocks.includes(key)) {
                return (
                  <li
                    key={key}
                    className="border-border-strong text-muted-foreground flex flex-col items-start justify-between gap-3 rounded-lg border border-dashed p-4 text-sm leading-5 sm:flex-row sm:items-center"
                  >
                    <span>
                      {msg("Z26.removed.line", { name: msg(BLOCK_ID[key]) })}
                    </span>
                    <Button
                      variant="ghostLg"
                      disabled={saving}
                      onClick={() => restoreBlock(key)}
                    >
                      {msg("Z26.removed.undo")}
                    </Button>
                  </li>
                );
              }

              const isOpen = open.includes(key);
              const summary = moduleSummary(lang, key, form);
              const isRequired = key === required;
              // A required block that is only unanswered keeps its own line
              // (EVT-07m-d); a field that does not fit says so (EVT-07m-g).
              const hasError = (Object.keys(errors) as ModuleField[]).some(
                (field) =>
                  FIELD_BLOCK[field] === key &&
                  errors[field] !== "requiredMissing",
              );
              const subline = hasError
                ? msg("Z26.card.error")
                : (summary ??
                  (isRequired
                    ? msg("Z26.card.requiredEmpty")
                    : msg("Z26.card.empty")));
              const action = isOpen
                ? msg("Z26.card.collapse")
                : summary
                  ? msg("Z26.card.edit")
                  : msg("Z26.card.fill");

              return (
                <li
                  key={key}
                  className="border-border bg-background flex flex-col gap-6 rounded-lg border p-4"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`block-${key}`}
                    onClick={() => toggle(key)}
                    className="focus-visible:outline-ring flex w-full items-start justify-between gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="flex min-w-0 flex-col gap-1">
                      <h2 className="text-foreground text-xl leading-7">
                        {msg(BLOCK_ID[key])}
                      </h2>
                      <span className="text-muted-foreground text-sm leading-5 [overflow-wrap:anywhere]">
                        {subline}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1 text-sm leading-5">
                      {isRequired ? (
                        <span className="text-brand-iris">
                          {msg("Z26.card.required")}
                        </span>
                      ) : null}
                      <span className="text-muted-foreground">{action}</span>
                    </span>
                  </button>

                  {isOpen ? (
                    <div id={`block-${key}`} className="flex flex-col gap-6">
                      {key === "entry_age" ? (
                        <EntryAge
                          msg={msg}
                          form={form}
                          disabled={saving}
                          errorText={errorText}
                          setValue={setValue}
                        />
                      ) : null}
                      {key === "visit_mode" ? (
                        <VisitMode
                          msg={msg}
                          form={form}
                          disabled={saving}
                          errorText={errorText}
                          setValue={setValue}
                        />
                      ) : null}
                      {key === "language" ? (
                        <LanguageBlock
                          msg={msg}
                          form={form}
                          required={isRequired}
                          disabled={saving}
                          errorText={errorText}
                          setValue={setValue}
                        />
                      ) : null}
                      {key === "music" ? (
                        <MusicBlock
                          msg={msg}
                          form={form}
                          disabled={saving}
                          errorText={errorText}
                          setValue={setValue}
                        />
                      ) : null}
                      {key === "participants" ? (
                        <Field
                          id="participants"
                          label={msg("Z26.participants.label")}
                          hint={
                            errors.participants
                              ? undefined
                              : msg("Z26.participants.hint")
                          }
                          error={errorText("participants")}
                          large
                        >
                          {(props) => (
                            <Textarea
                              {...props}
                              rows={3}
                              value={form.participants}
                              disabled={saving}
                              onChange={(event) =>
                                setValue(
                                  "participants",
                                  event.target.value,
                                  "participants",
                                )
                              }
                            />
                          )}
                        </Field>
                      ) : null}
                      {key === "bring_participation" ? (
                        <Field
                          id="bringText"
                          label={msg("Z26.bring.label")}
                          error={errorText("bringText")}
                          large
                        >
                          {(props) => (
                            <Textarea
                              {...props}
                              rows={3}
                              value={form.bringText}
                              disabled={saving}
                              placeholder={msg("Z26.bring.placeholder")}
                              onChange={(event) =>
                                setValue(
                                  "bringText",
                                  event.target.value,
                                  "bringText",
                                )
                              }
                            />
                          )}
                        </Field>
                      ) : null}

                      {!isRequired ? (
                        <div className="flex">
                          <Button
                            variant="ghostLg"
                            disabled={saving}
                            onClick={() => removeBlock(key)}
                          >
                            {msg("Z26.card.remove")}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="flex">
          <Button
            variant="ghostLg"
            disabled={saving}
            onClick={() => {
              setPicked([]);
              setView("picker");
            }}
          >
            {msg("Z26.more.add")}
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" variant="primaryLg" disabled={saving}>
            {mainLabel}
          </Button>
          <Button
            variant="ghostLg"
            disabled={saving}
            onClick={() => void run("later")}
          >
            {msg("Z26.more.skip")}
          </Button>
        </div>
      </form>
    </StepShell>
  );
}

// ---------------------------------------------------------------------------
// The blocks
// ---------------------------------------------------------------------------

type Msg = (id: MessageId, params?: Record<string, string | number>) => string;

type BlockProps = {
  msg: Msg;
  form: ModuleForm;
  disabled: boolean;
  errorText: (field: ModuleField) => string | undefined;
  setValue: <K extends keyof ModuleForm>(
    key: K,
    value: ModuleForm[K],
    ...fields: ModuleField[]
  ) => void;
};

// Einlass und Alter (EVT-07m-f): door time, age rule, minimum age.
function EntryAge({ msg, form, disabled, errorText, setValue }: BlockProps) {
  return (
    <>
      <div className="grid items-start gap-6 sm:grid-cols-2 sm:gap-4">
        <Field
          id="doorsAt"
          label={msg("Z26.entry.doors.label")}
          error={errorText("doorsAt")}
          large
        >
          {(props) => (
            <Input
              {...props}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={form.doorsAt}
              disabled={disabled}
              placeholder={msg("Z26.entry.doors.placeholder")}
              onChange={(event) =>
                setValue("doorsAt", event.target.value, "doorsAt")
              }
            />
          )}
        </Field>

        <Field
          id="ageRule"
          label={msg("Z26.entry.rule.label")}
          hint={errorText("ageRule") ? undefined : msg("Z26.entry.rule.hint")}
          error={errorText("ageRule")}
          large
        >
          {(props) => (
            <Select
              value={form.ageRule}
              disabled={disabled}
              onValueChange={(value) =>
                setValue("ageRule", value, "ageRule", "minAge")
              }
            >
              <SelectTrigger {...props}>
                <SelectValue placeholder={msg("Z26.entry.rule.choose")} />
              </SelectTrigger>
              <SelectContent>
                {AGE_RULES.map((rule) => (
                  <SelectItem key={rule} value={rule}>
                    {msg(AGE_RULE_ID[rule])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
      </div>

      {showsMinAge(form.ageRule) ? (
        <Field
          id="minAge"
          label={msg("Z26.entry.age.label")}
          error={errorText("minAge")}
          large
        >
          {(props) => (
            <Input
              {...props}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={form.minAge}
              disabled={disabled}
              onChange={(event) =>
                setValue("minAge", event.target.value, "minAge")
              }
            />
          )}
        </Field>
      ) : null}
    </>
  );
}

// A heading with a hint above a group of radio buttons and its error.
function Question({
  id,
  title,
  hint,
  error,
  children,
}: {
  id: string;
  title: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 id={id} className="text-foreground text-xl leading-7">
        {title}
      </h3>
      {hint ? (
        <p className="text-muted-foreground text-sm leading-5">{hint}</p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-error text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// Besuchsmodus (EVT-07m-c): the mode, the visiting window of a flexible visit,
// and whether a short visit is enough.
function VisitMode({ msg, form, disabled, errorText, setValue }: BlockProps) {
  const flexible = showsWindow(form.visitMode);

  return (
    <>
      <Question
        id="visitMode"
        title={msg("Z26.visit.mode.legend")}
        error={errorText("visitMode")}
      >
        <RadioGroup
          name="visitMode"
          labelledBy="visitMode"
          describedBy={errorText("visitMode") ? "visitMode-error" : undefined}
          value={form.visitMode}
          disabled={disabled}
          invalid={errorText("visitMode") !== undefined}
          options={VISIT_MODES.map((mode) => ({
            value: mode,
            label: msg(VISIT_MODE_ID[mode]),
          }))}
          onChange={(value) => setValue("visitMode", value, "visitMode")}
        />
      </Question>

      {flexible ? (
        <>
          <div className="flex flex-col gap-2">
            <h3 className="text-foreground text-xl leading-7">
              {msg("Z26.visit.window.title")}
            </h3>
            <p className="text-muted-foreground text-sm leading-5">
              {msg("Z26.visit.window.hint")}
            </p>
          </div>
          <Field
            id="windowFrom"
            label={msg("Z26.visit.from.label")}
            error={errorText("windowFrom")}
            large
          >
            {(props) => (
              <Input
                {...props}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={form.windowFrom}
                disabled={disabled}
                onChange={(event) =>
                  setValue("windowFrom", event.target.value, "windowFrom")
                }
              />
            )}
          </Field>
          <Field
            id="windowTo"
            label={msg("Z26.visit.to.label")}
            error={errorText("windowTo")}
            large
          >
            {(props) => (
              <Input
                {...props}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={form.windowTo}
                disabled={disabled}
                placeholder={msg("Z26.visit.to.placeholder")}
                onChange={(event) =>
                  setValue("windowTo", event.target.value, "windowTo")
                }
              />
            )}
          </Field>

          <Question
            id="shortVisit"
            title={msg("Z26.visit.short.title")}
            hint={msg("Z26.visit.short.hint")}
            error={errorText("shortVisit")}
          >
            <RadioGroup
              name="shortVisit"
              labelledBy="shortVisit"
              value={form.shortVisit}
              disabled={disabled}
              invalid={errorText("shortVisit") !== undefined}
              options={SHORT_VISITS.map((item) => ({
                value: item,
                label: msg(SHORT_VISIT_ID[item]),
              }))}
              onChange={(value) => setValue("shortVisit", value, "shortVisit")}
            />
          </Question>
        </>
      ) : null}
    </>
  );
}

// Sprache und Untertitel (EVT-07m-d).
function LanguageBlock({
  msg,
  form,
  required,
  disabled,
  errorText,
  setValue,
}: BlockProps & { required: boolean }) {
  const hint = msg(
    required ? "Z26.lang.hint.required" : "Z26.lang.hint.optional",
  );

  return (
    <>
      <Question
        id="program"
        title={msg("Z26.lang.program.title")}
        hint={hint}
        error={errorText("program")}
      >
        <RadioGroup
          name="program"
          labelledBy="program"
          describedBy={errorText("program") ? "program-error" : undefined}
          value={form.program}
          disabled={disabled}
          invalid={errorText("program") !== undefined}
          options={PROGRAM_LANGUAGES.map((item) => ({
            value: item,
            label: msg(PROGRAM_ID[item]),
          }))}
          onChange={(value) => setValue("program", value, "program")}
        />
      </Question>

      <Question
        id="subtitles"
        title={msg("Z26.lang.subtitles.title")}
        hint={hint}
        error={errorText("subtitles")}
      >
        <RadioGroup
          name="subtitles"
          labelledBy="subtitles"
          describedBy={errorText("subtitles") ? "subtitles-error" : undefined}
          value={form.subtitles}
          disabled={disabled}
          invalid={errorText("subtitles") !== undefined}
          options={SUBTITLES.map((item) => ({
            value: item,
            label: msg(SUBTITLES_ID[item]),
          }))}
          onChange={(value) => setValue("subtitles", value, "subtitles")}
        />
      </Question>

      {showsSubtitleLanguage(form.subtitles) ? (
        <Field
          id="subtitleLanguage"
          label={msg("Z26.lang.subtitleLanguage.label")}
          error={errorText("subtitleLanguage")}
          large
        >
          {(props) => (
            <Input
              {...props}
              type="text"
              autoComplete="off"
              value={form.subtitleLanguage}
              disabled={disabled}
              onChange={(event) =>
                setValue(
                  "subtitleLanguage",
                  event.target.value,
                  "subtitleLanguage",
                )
              }
            />
          )}
        </Field>
      ) : null}
    </>
  );
}

// Musik (EVT-07m-h, 07m-i): a short text and up to three broad directions,
// chosen in a list; the choice is shown as tags below it.
function MusicBlock({ msg, form, disabled, errorText, setValue }: BlockProps) {
  const full = form.musicGenres.length >= MAX_GENRES;
  const chosen = MUSIC_GENRES.filter((genre) =>
    form.musicGenres.includes(genre),
  );

  function toggleGenre(genre: string, on: boolean) {
    setValue(
      "musicGenres",
      MUSIC_GENRES.filter((item) =>
        item === genre ? on : form.musicGenres.includes(item),
      ),
      "musicGenres",
    );
  }

  return (
    <>
      <Field
        id="musicPrecision"
        label={msg("Z26.music.precision.label")}
        error={errorText("musicPrecision")}
        large
      >
        {(props) => (
          <Input
            {...props}
            type="text"
            autoComplete="off"
            value={form.musicPrecision}
            disabled={disabled}
            placeholder={msg("Z26.music.precision.placeholder")}
            onChange={(event) =>
              setValue("musicPrecision", event.target.value, "musicPrecision")
            }
          />
        )}
      </Field>

      <Field
        id="musicGenres"
        label={msg("Z26.music.genres.label")}
        hint={
          errorText("musicGenres") ? undefined : msg("Z26.music.genres.hint")
        }
        error={errorText("musicGenres")}
        large
      >
        {(props) => (
          <div className="flex flex-col gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  {...props}
                  type="button"
                  disabled={disabled}
                  className="border-border-strong bg-input text-foreground focus-visible:outline-ring aria-invalid:border-error flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-[9.5px] text-left text-base shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span
                    className={
                      chosen.length === 0 ? "text-muted-foreground" : undefined
                    }
                  >
                    {chosen.length === 0
                      ? msg("Z26.music.genres.none")
                      : msg("Z26.music.genres.count", { n: chosen.length })}
                  </span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="text-muted-foreground size-4 shrink-0"
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-(--radix-popover-trigger-width) p-2"
              >
                <ul className="flex flex-col">
                  {MUSIC_GENRES.map((genre) => {
                    const on = form.musicGenres.includes(genre);
                    const off = full && !on;

                    return (
                      <li key={genre}>
                        <label
                          htmlFor={`genre-${genre}`}
                          className={`flex min-h-11 items-center gap-3 rounded-md px-2 text-sm ${
                            off
                              ? "text-muted-foreground cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        >
                          <Checkbox
                            id={`genre-${genre}`}
                            checked={on}
                            disabled={off}
                            onCheckedChange={(next) =>
                              toggleGenre(genre, next === true)
                            }
                          />
                          {msg(GENRE_ID[genre])}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </PopoverContent>
            </Popover>

            {chosen.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {chosen.map((genre) => (
                  <li
                    key={genre}
                    className="bg-muted text-foreground rounded-full px-3 py-1 text-sm leading-5"
                  >
                    {msg(GENRE_ID[genre])}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </Field>
    </>
  );
}
