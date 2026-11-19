"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, controlClassLg } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import {
  LIMITS,
  normalizeInstagram,
  normalizeUrl,
  parseSlug,
  type FieldErrorCode,
} from "@/lib/domain/profile-publication";
import { t, type Lang, type MessageId } from "@/lib/i18n";

import type {
  DetailsErrors,
  DetailsState,
  DetailsValues,
} from "@/app/(organizer)/organizer/profiles/[profileId]/actions";

// Step 1 of the profile (ORG-03a to ORG-04). The values are controlled so that
// they survive an error (React resets uncontrolled forms after an action). The
// server decides; the form only checks the format when a field is left, never
// while typing (framework 3.3).
type Action = (previous: DetailsState, formData: FormData) => Promise<DetailsState>;

type Row = { key: number; value: string };

const IDLE: DetailsState = { status: "idle" };

function countErrors(errors: DetailsErrors): number {
  const links = (errors.extraLinks ?? []).filter((code) => code !== null).length;
  const { extraLinks: _links, ...rest } = errors;
  void _links;

  return Object.keys(rest).length + links;
}

export function DetailsForm({
  lang,
  action,
  initial,
  slugFixed,
}: {
  lang: Lang;
  action: Action;
  initial: DetailsValues;
  // After the first approval the address cannot be changed any more.
  slugFixed: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, IDLE);
  const nextKey = useId();
  const [values, setValues] = useState({
    name: initial.name,
    shortIntro: initial.shortIntro,
    slug: initial.slug,
    officialUrl: initial.officialUrl,
    instagram: initial.instagram,
    publicContact: initial.publicContact,
  });
  const [rows, setRows] = useState<Row[]>(
    initial.extraLinks.map((value, index) => ({ key: index, value })),
  );
  const [counter, setCounter] = useState(initial.extraLinks.length);
  // Format errors found when a field was left; cleared when it is edited.
  const [blurred, setBlurred] = useState<Partial<Record<string, FieldErrorCode | "format">>>({});

  // A format error shown when a field is left can move the submit button
  // between the press and the release, and the click is then lost. While a
  // submit button is being pressed, leaving a field shows no error; the server
  // check that follows says what to fix.
  const submitPress = useRef(false);

  useEffect(() => {
    const release = () => {
      submitPress.current = false;
    };

    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);

    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, []);

  function leave(update: (previous: typeof blurred) => typeof blurred) {
    if (!submitPress.current) {
      setBlurred(update);
    }
  }

  const server: DetailsErrors = state.status === "invalid" ? state.errors : {};
  // The server answer is about the values that were sent; once a field is
  // edited its server error is dropped.
  const [edited, setEdited] = useState<Set<string>>(new Set());
  const serverError = <K extends keyof DetailsErrors>(field: K) =>
    edited.has(field) ? undefined : server[field];

  function touch(field: string) {
    setEdited((previous) => new Set(previous).add(field));
    setBlurred((previous) => ({ ...previous, [field]: undefined }));
  }

  function setValue(field: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    touch(field);
  }

  const linkError = (raw: string): FieldErrorCode | undefined =>
    raw.trim() !== "" && normalizeUrl(raw) === null ? "invalidLink" : undefined;

  const msg = (id: MessageId, params?: Record<string, string | number>) => t(lang, id, params);

  const nameError = serverError("name")
    ? msg("Z23.details.name.tooLong", { max: LIMITS.name })
    : undefined;
  const introError = serverError("shortIntro")
    ? msg("Z23.details.intro.tooLong", { max: LIMITS.shortIntro })
    : undefined;
  const contactError = serverError("publicContact")
    ? msg("Z23.details.contact.tooLong", { max: LIMITS.publicContact })
    : undefined;

  const slugCode = edited.has("slug") ? undefined : server.slug;
  const slugBlur = blurred.slug === "format" ? "format" : undefined;
  const slugErrorId = slugCode ?? slugBlur;
  const slugError = slugErrorId
    ? msg(
        slugErrorId === "taken"
          ? "Z23.details.slug.taken"
          : slugErrorId === "reserved"
            ? "Z23.details.slug.reserved"
            : "Z23.details.slug.format",
      )
    : undefined;
  const slugValid = parseSlug(values.slug).ok;

  const websiteCode = serverError("officialUrl") ?? blurred.officialUrl;
  const instagramCode = serverError("instagram") ?? blurred.instagram;
  const websiteError = websiteCode ? msg("Z23.details.link.invalid") : undefined;
  const instagramError = instagramCode ? msg("Z23.details.instagram.invalid") : undefined;

  const rowCodes = server.extraLinks && !edited.has("extraLinks") ? server.extraLinks : [];
  const rowError = (row: Row, index: number) =>
    (blurred[`extra-${row.key}`] ?? rowCodes[index]) ? msg("Z23.details.link.invalid") : undefined;

  // Summary at the top after a failed save (Z01).
  const total = state.status === "invalid" ? countErrors(server) : 0;
  const showSummary = state.status === "invalid" && total > 0;

  const canAddRow = rows.length < LIMITS.extraLinks;

  return (
    <form
      action={formAction}
      className="flex flex-col gap-10"
      noValidate
      onPointerDownCapture={(event) => {
        submitPress.current =
          event.target instanceof Element &&
          event.target.closest('button[type="submit"]') !== null;
      }}
    >
      {showSummary ? (
        <Notice
          tone="error"
          title={
            total === 1
              ? msg("Z23.check.title.one")
              : total === 2
                ? msg("Z23.check.title.two")
                : msg("Z23.check.title.many", { n: total })
          }
        >
          {total === 1 ? msg("Z23.check.line.one") : msg("Z23.check.line.many")}
        </Notice>
      ) : null}

      {state.status === "failed" ? (
        <Notice tone="error" title={msg("Z23.save.failed.title")}>
          {msg("Z23.save.failed.line")}
        </Notice>
      ) : null}

      <div className="flex flex-col gap-6">
        <Field id="name" label={msg("Z23.details.name.label")} hint={msg("Z23.details.name.hint")} error={nameError} large>
          {(props) => (
            <input
              {...props}
              name="name"
              type="text"
              autoComplete="organization"
              value={values.name}
              onChange={(event) => setValue("name", event.target.value)}
              placeholder={msg("Z23.details.name.placeholder")}
              className={controlClassLg}
            />
          )}
        </Field>

        <Field id="shortIntro" label={msg("Z23.details.intro.label")} hint={msg("Z23.details.intro.hint")} error={introError} large>
          {(props) => (
            <textarea
              {...props}
              name="shortIntro"
              rows={2}
              value={values.shortIntro}
              onChange={(event) => setValue("shortIntro", event.target.value)}
              placeholder={msg("Z23.details.intro.placeholder")}
              className={`${controlClassLg} min-h-[76px]! py-2!`}
            />
          )}
        </Field>

        {slugFixed ? (
          <Field id="slug" label={msg("Z23.details.slug.label")} hint={msg("Z23.details.slug.fixed", { slug: initial.slug })} large>
            {(props) => (
              <input {...props} type="text" value={initial.slug} readOnly className={controlClassLg} />
            )}
          </Field>
        ) : (
          <Field
            id="slug"
            label={msg("Z23.details.slug.label")}
            hint={
              slugValid && !slugError
                ? msg("Z23.details.slug.hintValid", { slug: parseSlug(values.slug).ok ? values.slug.trim().toLowerCase() : "" })
                : msg("Z23.details.slug.hint")
            }
            error={slugError}
            large
          >
            {(props) => (
              <input
                {...props}
                name="slug"
                type="text"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={values.slug}
                onChange={(event) => setValue("slug", event.target.value)}
                onBlur={() =>
                  leave((previous) => ({
                    ...previous,
                    slug: values.slug.trim() !== "" && !parseSlug(values.slug).ok ? "format" : undefined,
                  }))
                }
                className={controlClassLg}
              />
            )}
          </Field>
        )}
      </div>

      <section aria-labelledby="where-title" className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 id="where-title" className="text-2xl leading-[30px] font-medium">
            {msg("Z23.details.where.title")}
          </h2>
          <p className="text-muted-foreground text-sm leading-5">{msg("Z23.details.where.hint")}</p>
        </div>

        <Field id="officialUrl" label={msg("Z23.details.website.label")} error={websiteError} large>
          {(props) => (
            <input
              {...props}
              name="officialUrl"
              type="text"
              inputMode="url"
              autoComplete="url"
              autoCapitalize="none"
              spellCheck={false}
              value={values.officialUrl}
              onChange={(event) => setValue("officialUrl", event.target.value)}
              onBlur={() =>
                leave((previous) => ({ ...previous, officialUrl: linkError(values.officialUrl) }))
              }
              placeholder={msg("Z23.details.website.placeholder")}
              className={controlClassLg}
            />
          )}
        </Field>

        <Field id="instagram" label={msg("Z23.details.instagram.label")} error={instagramError} large>
          {(props) => (
            <input
              {...props}
              name="instagram"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={values.instagram}
              onChange={(event) => setValue("instagram", event.target.value)}
              onBlur={() =>
                leave((previous) => ({
                  ...previous,
                  instagram: normalizeInstagram(values.instagram) === null ? "invalidInstagram" : undefined,
                }))
              }
              placeholder={msg("Z23.details.instagram.placeholder")}
              className={controlClassLg}
            />
          )}
        </Field>

        {rows.map((row, index) => (
          <div key={`${nextKey}-${row.key}`} className="flex flex-col gap-2">
            <Field
              id={`extra-${row.key}`}
              label={msg("Z23.details.more.label", { n: index + 1 })}
              error={rowError(row, index)}
              large
            >
              {(props) => (
                <input
                  {...props}
                  name="extraLinks"
                  type="text"
                  inputMode="url"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={row.value}
                  onChange={(event) => {
                    setRows((previous) =>
                      previous.map((item) => (item.key === row.key ? { ...item, value: event.target.value } : item)),
                    );
                    touch("extraLinks");
                    setBlurred((previous) => ({ ...previous, [`extra-${row.key}`]: undefined }));
                  }}
                  onBlur={() =>
                    leave((previous) => ({ ...previous, [`extra-${row.key}`]: linkError(row.value) }))
                  }
                  placeholder={msg("Z23.details.website.placeholder")}
                  className={controlClassLg}
                />
              )}
            </Field>
            <div>
              <Button
                variant="ghostLg"
                onClick={() => {
                  setRows((previous) => previous.filter((item) => item.key !== row.key));
                  touch("extraLinks");
                }}
              >
                {msg("Z23.details.more.remove", { n: index + 1 })}
              </Button>
            </div>
          </div>
        ))}

        {canAddRow ? (
          <div>
            <Button
              variant="ghostLg"
              onClick={() => {
                setRows((previous) => [...previous, { key: counter, value: "" }]);
                setCounter((n) => n + 1);
              }}
            >
              {msg("Z23.details.more.add")}
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm leading-5">{msg("Z23.details.more.max")}</p>
        )}

        <Field
          id="publicContact"
          label={msg("Z23.details.contact.label")}
          hint={msg("Z23.details.contact.hint")}
          error={contactError}
          large
        >
          {(props) => (
            <input
              {...props}
              name="publicContact"
              type="text"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              value={values.publicContact}
              onChange={(event) => setValue("publicContact", event.target.value)}
              placeholder={msg("Z23.details.contact.placeholder")}
              className={controlClassLg}
            />
          )}
        </Field>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" name="intent" value="next" variant="primaryLg" disabled={pending} aria-busy={pending}>
          {msg("Z23.details.next")}
        </Button>
        <Button type="submit" name="intent" value="later" variant="ghostLg" disabled={pending} aria-busy={pending}>
          {msg("Z23.details.later")}
        </Button>
      </div>
    </form>
  );
}
