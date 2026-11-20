import { NextResponse, type NextRequest } from "next/server";

import { getRequestOrigin } from "@/lib/auth/origin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const origin = getRequestOrigin(request.headers);
  const requestOrigin = request.headers.get("origin");

  // Same-origin form posts only; blocks cross-site logout requests.
  if (requestOrigin !== origin) {
    return new NextResponse(null, { status: 403 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/signed-out", origin), { status: 303 });
}
