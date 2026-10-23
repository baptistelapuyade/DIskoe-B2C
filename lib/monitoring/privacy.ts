import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";

const FILTERED = "[Filtered]";
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const SENSITIVE_VALUE_PATTERN =
  /\b(authorization|cookie|password|secret|token|code)(\s*[:=]\s*)([^\s,;&]+)/gi;

export function scrubText(value: string) {
  return value
    .replace(EMAIL_PATTERN, FILTERED)
    .replace(SENSITIVE_VALUE_PATTERN, `$1$2${FILTERED}`);
}

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  delete event.user;

  if (event.request) {
    delete event.request.cookies;
    delete event.request.data;
    delete event.request.headers;
    delete event.request.query_string;
  }

  if (event.message) {
    event.message = scrubText(event.message);
  }

  event.exception?.values?.forEach((exception) => {
    if (exception.value) {
      exception.value = scrubText(exception.value);
    }
  });

  event.breadcrumbs = event.breadcrumbs?.map(scrubBreadcrumb);

  return event;
}

function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  const safeBreadcrumb = { ...breadcrumb };

  delete safeBreadcrumb.data;

  if (safeBreadcrumb.message) {
    safeBreadcrumb.message = scrubText(safeBreadcrumb.message);
  }

  return safeBreadcrumb;
}

export function getEuSentryDsn(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  try {
    const hostname = new URL(value).hostname;
    return hostname.endsWith(".de.sentry.io") ? value : undefined;
  } catch {
    return undefined;
  }
}
