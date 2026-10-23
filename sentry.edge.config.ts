import * as Sentry from "@sentry/nextjs";

import { getEuSentryDsn, scrubSentryEvent } from "@/lib/monitoring/privacy";

const dsn = getEuSentryDsn(process.env.SENTRY_DSN);

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? "development",
    tracesSampleRate: 0.05,
    beforeSend: scrubSentryEvent,
  });
}
