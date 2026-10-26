import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "@/lib/auth/guards";
import { getRequestOrigin } from "@/lib/auth/origin";
import { createClient } from "@/lib/supabase/server";

// Target of the link in the sign-in e-mail (PKCE). Query values are never
// logged. Only organizer paths are accepted as "next".
export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request.headers);
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin), { status: 303 });
    }
  }

  return NextResponse.redirect(new URL("/login?error=link", origin), {
    status: 303,
  });
}
