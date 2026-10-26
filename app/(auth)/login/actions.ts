"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { normalizeEmail, normalizeOtp } from "@/lib/auth/input";
import { getRequestOrigin } from "@/lib/auth/origin";
import { safeNextPath } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

// Login state shown by the form. Messages are deliberately neutral: they never
// reveal whether an address is already known, and nothing here is logged.
export type RequestCodeState = {
  step: "email" | "code";
  email?: string;
  error?: string;
};

export type VerifyCodeState = {
  error?: string;
};

// TODO(spec): texts are proposals, no Figma login screen exists yet.
const TEXT = {
  invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein.",
  sendFailed:
    "Der Code konnte gerade nicht gesendet werden. Bitte versuche es in ein paar Minuten erneut.",
  invalidCode: "Der Code ist ungültig oder abgelaufen.",
} as const;

export async function requestCode(
  _previous: RequestCodeState,
  formData: FormData,
): Promise<RequestCodeState> {
  const email = normalizeEmail(formData.get("email"));

  if (!email) {
    return { step: "email", error: TEXT.invalidEmail };
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
    return { step: "email", email, error: TEXT.sendFailed };
  }

  return { step: "code", email };
}

export async function verifyCode(
  _previous: VerifyCodeState,
  formData: FormData,
): Promise<VerifyCodeState> {
  const email = normalizeEmail(formData.get("email"));
  const token = normalizeOtp(formData.get("code"));

  if (!email || !token) {
    return { error: TEXT.invalidCode };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { error: TEXT.invalidCode };
  }

  redirect(safeNextPath(formData.get("next")?.toString()));
}
