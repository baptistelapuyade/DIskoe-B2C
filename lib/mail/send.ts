import type { SupabaseClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

import type { Database } from "@/lib/db/types";
import type { MailKind } from "@/lib/profile/founder";

import { readMailConfig } from "./config";
import { mailFor } from "./templates";

type Client = SupabaseClient<Database>;

// sent: the provider accepted the mail (not "delivered").
// failed: the attempt was made and failed; the log says so and the founder can
//   try again.
// skipped: nothing to do (already sent, another attempt is running, or the
//   state the mail talks about is no longer true).
// not_configured: no SMTP settings; nothing was claimed or logged.
export type MailOutcome = "sent" | "failed" | "skipped" | "not_configured";

export type ProfileMailInput = {
  profileId: string;
  revisionId: string;
  kind: MailKind;
  name: string | null | undefined;
  // The first event that was submitted and approved with the profile, if any.
  event?: { id: string; title: string | null } | null;
  // Origin of the app. The one link in the mail leads to the profile's own
  // page; after sign-in the app lands there (login keeps the target).
  origin: string;
};

// Claim -> send -> finish. The database re-checks the state right before the
// claim and hands out the recipient address only to the founder and only once
// per profile, revision and kind. The address stays in this function: it is
// not logged, not returned and not part of any error.
export async function sendProfileMail(
  supabase: Client,
  input: ProfileMailInput,
): Promise<MailOutcome> {
  const config = readMailConfig();
  if (!config) {
    return "not_configured";
  }

  const { data: recipient, error: claimError } = await supabase.rpc(
    "claim_profile_mail",
    {
      p_profile_id: input.profileId,
      p_revision_id: input.revisionId,
      p_kind: input.kind,
    },
  );

  if (claimError || !recipient) {
    return "skipped";
  }

  const origin = input.origin.replace(/\/+$/, "");
  const profileUrl = `${origin}/organizer/profiles/${input.profileId}/status`;
  const content = mailFor(input.kind, {
    name: input.name,
    // A question about profile and first event is answered on the event's
    // review page; a live mail links to both.
    url:
      input.kind === "profile_question" && input.event
        ? `${origin}/organizer/events/${input.event.id}/review`
        : profileUrl,
    eventTitle: input.event ? (input.event.title ?? "") : undefined,
    eventUrl: input.event
      ? `${origin}/organizer/events/${input.event.id}/manage`
      : undefined,
  });

  let messageId: string | null = null;
  let success = false;
  let failureCode: string | null = null;

  try {
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      requireTLS: !config.local,
      auth:
        config.user && config.password
          ? { user: config.user, pass: config.password }
          : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });

    const info = await transport.sendMail({
      from: config.from,
      to: recipient,
      subject: content.subject,
      text: content.text,
      html: content.html,
      headers: { "Auto-Submitted": "auto-generated" },
    });

    messageId = typeof info.messageId === "string" ? info.messageId : null;
    success = true;
  } catch (error) {
    // Only the error code. The message of a transport error can contain the
    // address or server details.
    failureCode = safeFailureCode(error);
    console.error(`Profile mail failed (${input.kind}, ${failureCode})`);
  }

  // If recording the result fails, the log row stays "pending" and can be
  // claimed again after a few minutes. The outcome below is still true.
  const { error: finishError } = await supabase.rpc("finish_profile_mail", {
    p_profile_id: input.profileId,
    p_revision_id: input.revisionId,
    p_kind: input.kind,
    p_success: success,
    p_provider_message_id: messageId ?? undefined,
    p_failure_code: failureCode ?? undefined,
  });

  if (finishError) {
    console.error(`Profile mail result not recorded (${input.kind})`);
  }

  return success ? "sent" : "failed";
}

// The short error code of the mail library (EAUTH, ETIMEDOUT, ...). The
// database accepts only letters, digits, "_" and "-" (40 at most), so
// anything else becomes "unknown". The message text of the error is never used:
// it can contain the address or server details.
export function safeFailureCode(error: unknown): string {
  const raw =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  return /^[A-Za-z0-9_-]{1,40}$/.test(raw) ? raw : "unknown";
}

// One sentence for the founder after an attempt.
export function mailOutcomeText(outcome: MailOutcome): string {
  switch (outcome) {
    case "sent":
      return "Die Mail an den Organizer ist beim Anbieter angenommen.";
    case "failed":
      return "Die Mail konnte nicht gesendet werden. Du kannst sie auf dieser Seite erneut senden.";
    case "not_configured":
      return "Der Mailversand ist hier nicht eingerichtet, es wurde keine Mail gesendet.";
    case "skipped":
      return "Es wurde keine Mail gesendet, weil schon eine gesendet wurde oder gerade gesendet wird.";
  }
}
