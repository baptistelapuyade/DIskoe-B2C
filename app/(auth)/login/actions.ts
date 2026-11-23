"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  attemptKey,
  clearAttempts,
  lockedUntil,
  recordWrongCode,
} from "@/lib/auth/attempts";
import { normalizeEmail, normalizeOtp } from "@/lib/auth/input";
import { getRequestOrigin } from "@/lib/auth/origin";
import { safeNextPath } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

// States of the sign-in screens. They carry no texts: the client picks the
// catalog text for each state (Z21). `at` orders results of different actions.
// Messages never reveal whether an address is already known, and nothing here
// is logged.
export type RequestCodeState =
  | { status: "idle" }
  | { status: "invalid"; email: string; at: number }
  | { status: "failed"; email: string; at: number }
  | { status: "sent"; email: string; at: number };

export type VerifyCodeState =
  | { status: "idle" }
  | { status: "wrong"; at: number }
  | { status: "locked"; at: number };

export async function requestCode(
  _previous: RequestCodeState,
  formData: FormData,
): Promise<RequestCodeState> {
  const raw = formData.get("email");
  const email = normalizeEmail(raw);

  if (!email) {
    return {
      status: "invalid",
      email: typeof raw === "string" ? raw : "",
      at: Date.now(),
    };
  }

  const next = safeNextPath(formData.get("next")?.toString());
  const origin = getRequestOrigin(await headers());
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Anyone may sign in. Signing in creates no profile and no role.
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    console.error("TEMP-DEBUG requestCode", error.name, error.status, error.code, error.message); // TEMP-DEBUG
    return { status: "failed", email, at: Date.now() };
  }

  // A new code starts a new count: the old code is no longer valid.
  await clearAttempts(supabase, attemptKey(email));

  return { status: "sent", email, at: Date.now() };
}

export async function verifyCode(
  _previous: VerifyCodeState,
  formData: FormData,
): Promise<VerifyCodeState> {
  const email = normalizeEmail(formData.get("email"));
  const token = normalizeOtp(formData.get("code"));

  if (!email || !token) {
    return { status: "wrong", at: Date.now() };
  }

  const supabase = await createClient();
  const key = attemptKey(email);

  if (await lockedUntil(supabase, key)) {
    return { status: "locked", at: Date.now() };
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return (await recordWrongCode(supabase, key))
      ? { status: "locked", at: Date.now() }
      : { status: "wrong", at: Date.now() };
  }

  await clearAttempts(supabase, key);
  redirect(safeNextPath(formData.get("next")?.toString()));
}
