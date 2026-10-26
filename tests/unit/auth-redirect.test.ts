import { describe, expect, it } from "vitest";

import { normalizeEmail, normalizeOtp } from "@/lib/auth/input";
import { ORGANIZER_HOME, safeNextPath } from "@/lib/auth/guards";

describe("safeNextPath", () => {
  it("keeps organizer paths", () => {
    expect(safeNextPath("/organizer")).toBe("/organizer");
    expect(safeNextPath("/organizer/profiles/setup")).toBe(
      "/organizer/profiles/setup",
    );
    expect(safeNextPath("/organizer/events?tab=draft")).toBe(
      "/organizer/events?tab=draft",
    );
  });

  it("falls back for missing values", () => {
    expect(safeNextPath(undefined)).toBe(ORGANIZER_HOME);
    expect(safeNextPath(null)).toBe(ORGANIZER_HOME);
    expect(safeNextPath("")).toBe(ORGANIZER_HOME);
  });

  it.each([
    "//evil.example/organizer",
    "///evil.example",
    "https://evil.example/organizer",
    "http://localhost:3000/organizer",
    "javascript:alert(1)",
    "/\\evil.example",
    "\\\\evil.example",
    "/organizer\\..\\evil",
    "/organizer\n/evil",
    "/organizer\r\nSet-Cookie: x=y",
    "/organizerx",
    "/organizer-evil",
    "/login",
    "/e/some-event",
    "/",
    "organizer",
    "/organizer/../login",
  ])("rejects %j", (value) => {
    expect(safeNextPath(value)).toBe(ORGANIZER_HOME);
  });

  it("rejects very long values", () => {
    expect(safeNextPath(`/organizer/${"a".repeat(600)}`)).toBe(ORGANIZER_HOME);
  });

  it("uses a custom fallback", () => {
    expect(safeNextPath("//evil", "/organizer/home")).toBe("/organizer/home");
  });
});

describe("normalizeEmail", () => {
  it("trims and lower-cases", () => {
    expect(normalizeEmail("  Anna@Example.COM ")).toBe("anna@example.com");
  });

  it.each([null, undefined, 42, "", "   ", "no-at-sign", "a@b", "a b@c.de"])(
    "rejects %j",
    (value) => {
      expect(normalizeEmail(value)).toBeNull();
    },
  );

  it("rejects overlong addresses", () => {
    expect(normalizeEmail(`${"a".repeat(250)}@x.de`)).toBeNull();
  });
});

describe("normalizeOtp", () => {
  it("accepts digit codes and ignores whitespace", () => {
    expect(normalizeOtp("123456")).toBe("123456");
    expect(normalizeOtp(" 123 456 ")).toBe("123456");
  });

  it.each([
    null,
    undefined,
    123456,
    "",
    "12345",
    "abcdef",
    "12345a",
    "1".repeat(11),
  ])("rejects %j", (value) => {
    expect(normalizeOtp(value)).toBeNull();
  });
});
