import { describe, expect, it } from "vitest";

import {
  getEuSentryDsn,
  scrubSentryEvent,
  scrubText,
} from "../../lib/monitoring/privacy";

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

  it("filters login codes, token hashes and JWTs in text", () => {
    expect(scrubText("verify failed code=123456 for a@b.de")).toBe(
      "verify failed code=[Filtered] for [Filtered]",
    );
    expect(scrubText("access_token=abc.def refresh_token: xyz")).toBe(
      "access_token=[Filtered] refresh_token: [Filtered]",
    );
    expect(scrubText("token_hash=pkce_abc123")).toBe("token_hash=[Filtered]");
    expect(scrubText("bad eyJhbGciOi.eyJzdWIiOi.c2ln here")).toBe(
      "bad [Filtered] here",
    );
  });

  it("strips query strings and fragments from the request URL", () => {
    const event = scrubSentryEvent({
      type: undefined,
      request: {
        url: "http://127.0.0.1:3000/auth/callback?code=abc&next=%2Forganizer#x",
      },
      extra: { email: "person@example.org" },
    });

    expect(event.request?.url).toBe("http://127.0.0.1:3000/auth/callback");
    expect(event.extra).toBeUndefined();
  });
});
