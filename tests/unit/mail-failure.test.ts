import { describe, expect, it } from "vitest";

import { safeFailureCode } from "../../lib/mail/send";
import { mailFailureHint, mailText } from "../../lib/profile/founder";

describe("safeFailureCode", () => {
  it("keeps the short code of a mail library error", () => {
    expect(
      safeFailureCode({ code: "EAUTH", message: "a@b.test refused" }),
    ).toBe("EAUTH");
  });

  it("never passes on anything that is not a plain code", () => {
    expect(safeFailureCode({ code: "535 5.7.8 user a@b.test" })).toBe(
      "unknown",
    );
    expect(safeFailureCode({ code: "x".repeat(41) })).toBe("unknown");
    expect(safeFailureCode(new Error("a@b.test"))).toBe("unknown");
    expect(safeFailureCode(null)).toBe("unknown");
  });
});

describe("mail text for the founder", () => {
  const failed = {
    kind: "profile_question" as const,
    status: "failed" as const,
    attempts: 2,
  };

  it("names the code of a failed mail", () => {
    expect(mailText({ ...failed, failureCode: "EAUTH" })).toBe(
      "Mail fehlgeschlagen (EAUTH)",
    );
  });

  it("stays as before without a code", () => {
    expect(mailText({ ...failed, failureCode: null })).toBe(
      "Mail fehlgeschlagen",
    );
  });

  it("does not show a code for accepted mails", () => {
    expect(mailText({ ...failed, status: "sent", failureCode: "EAUTH" })).toBe(
      "Mail vom Anbieter angenommen",
    );
  });

  it("has a hint for the common codes and none for unknown ones", () => {
    expect(mailFailureHint("EAUTH")).toContain("MAIL_SMTP_PASSWORD");
    expect(mailFailureHint("ETIMEDOUT")).toContain("MAIL_SMTP_HOST");
    expect(mailFailureHint("unknown")).toBeNull();
    expect(mailFailureHint(null)).toBeNull();
  });
});
