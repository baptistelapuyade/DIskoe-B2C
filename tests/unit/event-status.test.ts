import { describe, expect, it } from "vitest";

import { canCancel, canPostpone, canReschedule } from "../../lib/event/status";

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
