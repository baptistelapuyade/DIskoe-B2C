import { afterEach, describe, expect, it, vi } from "vitest";

import { attemptKey } from "../../lib/auth/attempts";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("attemptKey", () => {
  it("is a 64-character hex string that never contains the address", () => {
    const key = attemptKey("name@kollektiv.example");
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(key).not.toContain("kollektiv");
  });

  it("is stable for one address and different for another", () => {
    expect(attemptKey("a@example.test")).toBe(attemptKey("a@example.test"));
    expect(attemptKey("a@example.test")).not.toBe(attemptKey("b@example.test"));
  });

  it("depends on the secret", () => {
    vi.stubEnv("AUTH_ATTEMPT_PEPPER", "first-secret-of-16-chars");
    const first = attemptKey("a@example.test");
    vi.stubEnv("AUTH_ATTEMPT_PEPPER", "second-secret-of-16-chars");
    expect(attemptKey("a@example.test")).not.toBe(first);
  });

  it("is off in production without a usable secret", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_ATTEMPT_PEPPER", "");
    expect(attemptKey("a@example.test")).toBeNull();
    vi.stubEnv("AUTH_ATTEMPT_PEPPER", "too-short");
    expect(attemptKey("a@example.test")).toBeNull();
  });

  it("works in production with a secret", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_ATTEMPT_PEPPER", "a-long-enough-random-secret");
    expect(attemptKey("a@example.test")).toMatch(/^[0-9a-f]{64}$/);
  });
});
