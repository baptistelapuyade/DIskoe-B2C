// Public base address of the site, for canonical links, JSON-LD and the
// sitemap. Not taken from the request: a forged Host header must not end up in
// a sitemap.
const DEV_FALLBACK = "http://127.0.0.1:3000";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? DEV_FALLBACK).replace(/\/+$/, "");
}

export function mediaBase(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

// Search engines may index this deployment only when SITE_INDEXING is exactly
// "on" (production). Missing or any other value keeps the site closed, so a
// forgotten variable never makes a preview public.
export function indexingEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.SITE_INDEXING === "on";
}
