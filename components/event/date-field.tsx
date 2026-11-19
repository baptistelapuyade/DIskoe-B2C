"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { de, enGB } from "react-day-picker/locale";

import { Calendar } from "@/components/ui/calendar";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  calendarDateToIso,
  formatDateInput,
  isoToCalendarDate,
  parseDateInput,
} from "@/lib/event/date-input";
import type { Lang } from "@/lib/i18n";

// A date the organizer can type or pick (EVT-02): shadcn Input plus Popover
// and Calendar (the Date Picker pattern of the UI kit, Figma page 11). The
// parent holds the ISO form "YYYY-MM-DD", or the raw text while it cannot be
// read, so that the step check can name the problem.
export function DateField({
  id,
  name,
  label,
  hint,
  error,
  lang,
  value,
  onChange,
  placeholder,
  openLabel,
  disabled = false,
  describedBy,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  error?: string;
  lang: Lang;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  openLabel: string;
  disabled?: boolean;
  describedBy?: string;
}) {
  const [text, setText] = useState(() => formatDateInput(value, lang));
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(value);

  // The parent can change the value (saved input put back, "the end isn't
  // fixed yet" emptying the field). Typed text that already means this value is
  // left alone, so that typing is not rewritten under the cursor.
  if (value !== seen) {
    setSeen(value);
    const parsed = parseDateInput(text);

    if ((parsed.ok ? parsed.iso : text.trim()) !== value) {
      setText(formatDateInput(value, lang));
    }
  }
  const selected = isoToCalendarDate(value);

  return (
    <Field id={id} label={label} hint={hint} error={error} large>
      {(props) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <div className="relative">
              <Input
                {...props}
                aria-describedby={
                  [props["aria-describedby"], describedBy]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                name={name}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={text}
                disabled={disabled}
                placeholder={placeholder}
                className="pr-12"
                onChange={(event) => {
                  const raw = event.target.value;
                  const parsed = parseDateInput(raw);

                  setText(raw);
                  onChange(parsed.ok ? parsed.iso : raw.trim());
                }}
                onBlur={() => {
                  const parsed = parseDateInput(text);

                  // A readable date is shown in the written form of the
                  // language; an unreadable one stays as typed.
                  if (parsed.ok && parsed.iso !== "") {
                    setText(formatDateInput(parsed.iso, lang));
                  }
                }}
              />
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={openLabel}
                  className="text-muted-foreground hover:text-foreground focus-visible:outline-ring absolute top-0 right-0 inline-flex size-11 items-center justify-center rounded-lg outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] disabled:opacity-60"
                >
                  <CalendarIcon className="size-4" aria-hidden="true" />
                </button>
              </PopoverTrigger>
            </div>
          </PopoverAnchor>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              locale={lang === "de" ? de : enGB}
              weekStartsOn={1}
              selected={selected}
              defaultMonth={selected}
              onSelect={(date) => {
                if (date) {
                  const iso = calendarDateToIso(date);

                  setText(formatDateInput(iso, lang));
                  onChange(iso);
                  setOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    </Field>
  );
}
