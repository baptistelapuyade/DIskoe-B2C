import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/db/types";

// Refreshes the auth session cookies on every matched request and keeps
// unauthenticated visitors out of the organizer area early. The pages check
// access again themselves; this is a second layer, not the only one.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const inOrganizerArea =
    pathname === "/organizer" || pathname.startsWith("/organizer/");

  if (!data.user && inOrganizerArea) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
    const redirect = NextResponse.redirect(url);
    response.cookies
      .getAll()
      .forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}
