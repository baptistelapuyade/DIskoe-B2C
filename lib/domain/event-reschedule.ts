// Check of the replacement date of a live event (Figma EVV-01, EVV-05). Pure:
// the form sends four fields, the action passes the current start and "now".
// The returned codes become catalog texts (Z24.time.* and Z33.err.*) in the
// language of the organizer.
//
// The database accepts any start that differs from the current one; that the
// new start lies in the future is a rule of the app and is enforced here, on
// the server, not only in the form.

import { validateStep, type StepCode } from "./event-steps";
import { localToInstant } from "./time";

export type RescheduleField = "startDate" | "startTime" | "endDate" | "endTime";
export type RescheduleCode = StepCode | "startPast" | "startUnchanged";
export type RescheduleErrors = Partial<Record<RescheduleField, RescheduleCode>>;

export type RescheduleInput = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

export type RescheduleCheck =
  | { ok: true; start: string; end: string | null }
  | { ok: false; errors: RescheduleErrors };

export const RESCHEDULE_ORDER: readonly RescheduleField[] = [
  "startDate",
  "startTime",
  "endDate",
  "endTime",
];

function same(a: string | null, b: string): boolean {
  return a !== null && Date.parse(a) === Date.parse(b);
}

// `currentStart`: the start of the public version as UTC instant (null when
// unknown). `now`: the instant the check runs at.
export function checkReschedule(
  input: RescheduleInput,
  currentStart: string | null,
  now: Date,
): RescheduleCheck {
  const errors: RescheduleErrors = {};
  const fields = {
    startDate: input.startDate.trim(),
    startTime: input.startTime.trim(),
    endDate: input.endDate.trim(),
    endTime: input.endTime.trim(),
  };

  // A replacement date needs a start. The shared step check treats an empty
  // pair as "nothing entered", which is right for the end only.
  if (fields.startDate === "") errors.startDate = "dateMissing";
  if (fields.startTime === "") errors.startTime = "timeMissing";

  const found = validateStep("time", { ...fields, endUnknown: false }, "next");

  for (const field of RESCHEDULE_ORDER) {
    const code = found[field];

    if (code !== undefined && errors[field] === undefined) {
      errors[field] = code as RescheduleCode;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const start = localToInstant(fields.startDate, fields.startTime);

  // The step check has passed, so the start is a unique instant.
  if (!start.ok) {
    return { ok: false, errors: { startDate: "dateInvalid" } };
  }

  if (Date.parse(start.instant) <= now.getTime()) {
    return { ok: false, errors: { startDate: "startPast" } };
  }

  if (same(currentStart, start.instant)) {
    return { ok: false, errors: { startDate: "startUnchanged" } };
  }

  const end =
    fields.endDate !== "" && fields.endTime !== ""
      ? localToInstant(fields.endDate, fields.endTime)
      : null;

  return {
    ok: true,
    start: start.instant,
    end: end !== null && end.ok ? end.instant : null,
  };
}
