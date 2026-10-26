// Sends one synthetic error through the real scrubbing hook to the configured
// Sentry project, so the privacy setup can be checked end to end.
//
//   npm run sentry:synthetic
//
// Reads SENTRY_DSN from the environment (.env.local is loaded by the npm
// script). The message contains a fake e-mail address, token and login code;
// all of them must arrive as "[Filtered]". Nothing real is sent and no value
// from the environment is printed.
// @sentry/nextjs is a server-side wrapper around @sentry/node; a plain Node
// script needs the Node entry point directly.
import * as Sentry from "@sentry/node";

import {
  getEuSentryDsn,
  scrubSentryEvent,
} from "../lib/monitoring/privacy.ts";

const dsn = getEuSentryDsn(process.env.SENTRY_DSN);

if (!dsn) {
  console.error(
    "SENTRY_DSN is missing or not an EU (*.de.sentry.io) DSN. Nothing was sent.",
  );
  process.exit(1);
}

Sentry.init({
  dsn,
  environment: "synthetic",
  tracesSampleRate: 0,
  beforeSend: scrubSentryEvent,
});

const eventId = Sentry.captureException(
  new Error(
    "Synthetic privacy check for synthetic.person@example.org token=fake-token-value code=123456",
  ),
);

const delivered = await Sentry.flush(10_000);

console.log(
  delivered
    ? `Synthetic event sent (id ${eventId}).`
    : "Flush timed out; the event may not have been delivered.",
);
process.exit(delivered ? 0 : 1);
