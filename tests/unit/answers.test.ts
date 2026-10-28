import { describe, expect, it } from "vitest";

import {
  isAnswerState,
  isProvided,
  noValue,
  provided,
  unanswered,
  valueOrNull,
} from "../../lib/domain/answers";

describe("answer states", () => {
  it("knows exactly the five states", () => {
    for (const state of [
      "provided",
      "unknown",
      "not_applicable",
      "skipped",
      "unanswered",
    ]) {
      expect(isAnswerState(state)).toBe(true);
    }

    expect(isAnswerState("empty")).toBe(false);
    expect(isAnswerState(0)).toBe(false);
    expect(isAnswerState(null)).toBe(false);
  });

  it("carries a value only when provided", () => {
    expect(valueOrNull(provided("x"))).toBe("x");
    expect(valueOrNull(noValue<string>("unknown"))).toBeNull();
    expect(valueOrNull(unanswered<string>())).toBeNull();
  });

  it("keeps a provided falsy value distinct from no value", () => {
    expect(isProvided(provided(0))).toBe(true);
    expect(isProvided(provided(false))).toBe(true);
    expect(isProvided(provided(""))).toBe(true);
    expect(isProvided(noValue<number>("unknown"))).toBe(false);
  });

  it("never turns unknown into 0, false or empty text", () => {
    const unknown = noValue<number>("unknown");

    expect(unknown.state).toBe("unknown");
    expect(unknown.value).toBeUndefined();
    expect(valueOrNull(unknown)).not.toBe(0);
  });
});
