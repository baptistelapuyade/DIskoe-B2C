import * as Sentry from "@sentry/nextjs";

import { getEuSentryDsn, scrubSentryEvent } from "@/lib/monitoring/privacy";

const dsn = getEuSentryDsn(process.env.NEXT_PUBLIC_SENTRY_DSN);

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "development",
    tracesSampleRate: 0.05,
    beforeSend: scrubSentryEvent,
    beforeBreadcrumb(breadcrumb) {
      delete breadcrumb.data;
      return breadcrumb;
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
