// Origin of the current request, used for auth redirect targets. The auth
// provider checks every target against its allow-list, so a forged Host header
// cannot send a login link anywhere that is not already allowed.

const DEV_FALLBACK = "http://127.0.0.1:3000";

type HeaderReader = { get(name: string): string | null };

export function getRequestOrigin(headers: HeaderReader): string {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");

  if (host && /^[a-z0-9.\-:[\]]+$/i.test(host)) {
    const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0];
    const isLocal = /^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(host);
    const proto = forwardedProto ?? (isLocal ? "http" : "https");

    if (proto === "http" || proto === "https") {
      return `${proto}://${host}`;
    }
  }

  return (process.env.NEXT_PUBLIC_SITE_URL ?? DEV_FALLBACK).replace(/\/+$/, "");
}
