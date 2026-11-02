import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/types";

// Reads as "anon", without cookies and without a session: public pages show
// the same to everyone, and the views contain published state only.
export function publicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
