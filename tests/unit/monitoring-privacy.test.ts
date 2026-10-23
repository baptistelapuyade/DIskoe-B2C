import { describe, expect, it } from "vitest";

import { getEuSentryDsn, scrubSentryEvent } from "../../lib/monitoring/privacy";

describe("monitoring privacy", () => {
  it("removes request payloads, user data, and personal text", () => {
    const event = scrubSentryEvent({
      type: undefined,
      message: "Failed for person@example.org with token=secret-value",
      user: { email: "person@example.org" },
      request: {
        cookies: { session: "secret-value" },
        data: { email: "person@example.org" },
        headers: { authorization: "Bearer secret-value" },
        query_string: "code=secret-value",
      },
    });

    expect(event.user).toBeUndefined();
    expect(event.request).toEqual({});
    expect(event.message).toBe("Failed for [Filtered] with token=[Filtered]");
  });

  it("accepts only an EU-region Sentry DSN", () => {
    const euDsn = "https://public@o1.ingest.de.sentry.io/1";

    expect(getEuSentryDsn(euDsn)).toBe(euDsn);
    expect(
      getEuSentryDsn("https://public@o1.ingest.us.sentry.io/1"),
    ).toBeUndefined();
  });
});
