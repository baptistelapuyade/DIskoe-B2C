import type { NextRequest } from "next/server";

import { indexingEnabled } from "@/lib/public/site";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Closed deployment: also say it in a header, which wins over page metadata.
  if (!indexingEnabled()) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  // Node.js runtime: Amplify SSR does not support Edge middleware.
  runtime: "nodejs",
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ico)$).*)",
  ],
};
