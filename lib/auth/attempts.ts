import { createHmac } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/types";

// Wrong sign-in codes are counted per address (ORG-02b): after five wrong
// codes the sign-in is locked for ten minutes. The key is an HMAC of the
// normalized address under a server-side secret, so the database never holds
// the address and nobody without the secret can lock or unlock an address.
// This is a usability guarantee. The hard protection against guessing is the
// auth provider's own rate limit.

export const MAX_WRONG_CODES = 5;
export const LOCK_MINUTES = 10;

const DEV_PEPPER = "diskoe-local-development-only";

export function attemptKey(email: string): string | null {
  const configured = process.env.AUTH_ATTEMPT_PEPPER;
  // Without the secret the counter is off in production (no guessable keys);
  // local development and tests use a fixed value.
  const pepper =
    configured && configured.length >= 16
      ? configured
      : process.env.NODE_ENV === "production"
        ? null
        : DEV_PEPPER;

  if (!pepper) {
    return null;
  }

  return createHmac("sha256", pepper).update(email).digest("hex");
}

type Client = SupabaseClient<Database>;

// Counter failures never block the sign-in: if the call fails, the provider's
// own limits still apply.
export async function lockedUntil(
  supabase: Client,
  key: string | null,
): Promise<Date | null> {
  if (!key) return null;
  const { data, error } = await supabase.rpc("auth_code_status", {
    p_key: key,
  });
  return !error && data ? new Date(data) : null;
}

export async function recordWrongCode(
  supabase: Client,
  key: string | null,
): Promise<Date | null> {
  if (!key) return null;
  const { data, error } = await supabase.rpc("auth_code_fail", { p_key: key });
  return !error && data ? new Date(data) : null;
}

export async function clearAttempts(
  supabase: Client,
  key: string | null,
): Promise<void> {
  if (!key) return;
  await supabase.rpc("auth_code_clear", { p_key: key });
}
