import { describe, expect, it } from "vitest";

import {
  canCancel,
  canPostpone,
  canReschedule,
  differsOutsideTime,
} from "../../lib/event/status";
import { EMPTY_FORM_VALUES, type EventFormValues } from "../../lib/event/values";

const live: EventFormValues = {
  ...EMPTY_FORM_VALUES,
  title: "Zwischen den Boxen",
  description: "Ein Abend.",
  startDate: "2026-10-23",
  startTime: "22:00",
  endDate: "2026-10-24",
  endTime: "04:00",
  accessKinds: ["door"],
};

describe("allowed status changes", () => {
  it("lets a scheduled or rescheduled event be postponed, not a cancelled or postponed one", () => {
    expect(canPostpone("scheduled")).toBe(true);
    expect(canPostpone("rescheduled")).toBe(true);
    expect(canPostpone("postponed_undated")).toBe(false);
    expect(canPostpone("cancelled")).toBe(false);
  });

  it("lets everything but a cancelled event be cancelled or given a new date", () => {
    for (const status of ["scheduled", "rescheduled", "postponed_undated"] as const) {
      expect(canCancel(status)).toBe(true);
      expect(canReschedule(status)).toBe(true);
    }
    expect(canCancel("cancelled")).toBe(false);
    expect(canReschedule("cancelled")).toBe(false);
  });
});

describe("draft that differs from the live version", () => {
  it("accepts a draft that changes only date and time", () => {
    const draft = {
      ...live,
      startDate: "2026-10-30",
      endDate: "2026-10-31",
      endUnknown: false,
    };

    expect(differsOutsideTime(live, draft, "img", "img")).toBe(false);
  });

  it("refuses a draft with another private change", () => {
    expect(
      differsOutsideTime(live, { ...live, description: "Neu." }, "img", "img"),
    ).toBe(true);
    expect(
      differsOutsideTime(live, { ...live, accessKinds: [] }, "img", "img"),
    ).toBe(true);
  });

  it("refuses a draft with another image", () => {
    expect(differsOutsideTime(live, live, "a", "b")).toBe(true);
    expect(differsOutsideTime(live, live, null, "b")).toBe(true);
    expect(differsOutsideTime(live, live, "a", "a")).toBe(false);
  });
});
