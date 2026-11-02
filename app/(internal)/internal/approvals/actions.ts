"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { getRequestOrigin } from "@/lib/auth/origin";
import { requireFounder } from "@/lib/auth/server";
import {
  describeGaps,
  parseGapDetail,
  parseQuestion,
} from "@/lib/domain/profile-publication";
import { QUESTION_AREAS, questionWithArea } from "@/lib/domain/question-area";
import { describeEventGaps } from "@/lib/domain/event-publication";
import { copyPublishedEventImage } from "@/lib/event/publish";
import { loadFounderEventView } from "@/lib/event/founder";
import { mailOutcomeText, sendProfileMail } from "@/lib/mail/send";
import { loadRevision } from "@/lib/profile/draft";
import type { MailKind } from "@/lib/profile/founder";
import { copyPublishedImage } from "@/lib/profile/publish";
import { createClient } from "@/lib/supabase/server";

import type { FormState } from "@/app/(organizer)/organizer/profiles/[profileId]/actions";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const GENERIC_ERROR =
  "Das hat leider nicht geklappt. Bitte versuche es noch einmal.";

// With a joint submission the database prefixes the codes with "profile." or
// "event."; a profile-only approval reports plain profile codes.
function gapMessages(details: string | null | undefined, joint: boolean): string[] {
  const codes = parseGapDetail(details);

  if (!joint) {
    return describeGaps(codes).map((gap) => gap.message);
  }

  const profile = codes
    .filter((code) => code.startsWith("profile."))
    .map((code) => code.slice("profile.".length));
  const event = codes
    .filter((code) => code.startsWith("event."))
    .map((code) => code.slice("event.".length));

  return [
    ...describeGaps(profile).map((gap) => `Profil: ${gap.message}`),
    ...describeEventGaps(event).map((gap) => `Event: ${gap.message}`),
  ];
}

function refresh(profileId: string) {
  revalidatePath("/internal/approvals");
  revalidatePath(`/internal/approvals/${profileId}`);
  revalidatePath("/organizer");
}

// Sends the system mail for one revision. A failed or missing mail never
// undoes the decision it follows; the result is reported to the founder, who
// can send it again from the detail page.
async function sendMail(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string,
  revisionId: string,
  kind: MailKind,
): Promise<string> {
  const revision = await loadRevision(supabase, revisionId);
  // The mail names the first event that was decided together with the profile.
  const event = await loadFounderEventView(
    supabase,
    profileId,
    kind === "profile_live",
  );
  const outcome = await sendProfileMail(supabase, {
    profileId,
    revisionId,
    kind,
    name: revision?.name,
    event: event
      ? { id: event.eventId, title: event.form.title.trim() || null }
      : null,
    origin: getRequestOrigin(await headers()),
  });

  return mailOutcomeText(outcome);
}

type Target = {
  profileId: string;
  revisionId: string;
  // Set when the first event is decided together with the profile.
  event: { eventId: string; revisionId: string } | null;
};

function ids(formData: FormData): Target | null {
  const profileId = String(formData.get("profileId") ?? "");
  const revisionId = String(formData.get("revisionId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  const eventRevisionId = String(formData.get("eventRevisionId") ?? "");

  if (!UUID.test(profileId) || !UUID.test(revisionId)) {
    return null;
  }

  if (eventId === "" && eventRevisionId === "") {
    return { profileId, revisionId, event: null };
  }

  return UUID.test(eventId) && UUID.test(eventRevisionId)
    ? { profileId, revisionId, event: { eventId, revisionId: eventRevisionId } }
    : null;
}

// The founder approves exactly the revision that was shown on the page: the
// revision id travels with the form and the database rejects a changed draft.
// Approval publishes the revision; the public copy of the image follows with
// the founder's own session.
export async function approveFirst(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFounder();

  const target = ids(formData);
  if (!target) {
    return { ok: false, message: "Ungültige Anfrage." };
  }

  const supabase = await createClient();
  const { error } = target.event
    ? await supabase.rpc("approve_first_publication", {
        p_profile_id: target.profileId,
        p_expected_draft_revision_id: target.revisionId,
        p_event_id: target.event.eventId,
        p_expected_event_draft_revision_id: target.event.revisionId,
      })
    : await supabase.rpc("approve_first_profile", {
        p_profile_id: target.profileId,
        p_expected_draft_revision_id: target.revisionId,
      });

  if (error) {
    switch (error.code) {
      case "DK001":
        return {
          ok: false,
          message:
            "Der Entwurf wurde nach deiner Ansicht geändert. Bitte lade die Seite neu und prüfe den neuen Stand.",
        };
      case "DK002":
        return {
          ok: false,
          message: "Es fehlen noch Angaben.",
          gaps: gapMessages(error.details, target.event !== null),
        };
      case "DK003":
        return {
          ok: false,
          message:
            "Dieser Stand kann nicht freigegeben werden: Er wurde nicht eingereicht oder das Profil ist schon freigegeben.",
        };
      case "42501":
        return {
          ok: false,
          message:
            "Diese Freigabe ist nicht erlaubt (zum Beispiel für ein eigenes Profil).",
        };
      default:
        return { ok: false, message: GENERIC_ERROR };
    }
  }

  const profileCopied = await copyPublishedImage(supabase, target.profileId);
  const eventCopied = target.event
    ? await copyPublishedEventImage(supabase, target.event.eventId)
    : "copied";
  const copied =
    profileCopied === "copied" && eventCopied === "copied" ? "copied" : "failed";
  const mail = await sendMail(
    supabase,
    target.profileId,
    target.revisionId,
    "profile_live",
  );
  refresh(target.profileId);

  return copied === "copied"
    ? { ok: true, message: `Freigegeben und veröffentlicht. ${mail}` }
    : {
        ok: true,
        message: `Freigegeben und veröffentlicht, aber mindestens ein Bild ist noch nicht öffentlich. Bitte versuche es mit „Bilder erneut veröffentlichen“ noch einmal. ${mail}`,
      };
}

export async function requestChanges(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFounder();

  const target = ids(formData);
  if (!target) {
    return { ok: false, message: "Ungültige Anfrage." };
  }

  const question = parseQuestion(formData.get("message"));
  if (!question.ok) {
    return { ok: false, message: question.message };
  }

  // The affected spot is stored as the first line of the message: the database
  // has no separate column and the organizer reads the message as written.
  const area = String(formData.get("area") ?? "");
  const message = questionWithArea(
    QUESTION_AREAS.includes(area as (typeof QUESTION_AREAS)[number]) ? area : "",
    question.value,
  );
  if (!message.ok) {
    return { ok: false, message: message.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("request_profile_changes", {
    p_profile_id: target.profileId,
    p_expected_draft_revision_id: target.revisionId,
    p_message: message.value,
    ...(target.event
      ? { p_expected_event_draft_revision_id: target.event.revisionId }
      : {}),
  });

  if (error) {
    switch (error.code) {
      case "DK001":
        return {
          ok: false,
          message:
            "Der Entwurf wurde nach deiner Ansicht geändert. Bitte lade die Seite neu.",
        };
      case "DK003":
        return {
          ok: false,
          message:
            "Zu diesem Stand kann keine Rückfrage gestellt werden: Er wurde nicht eingereicht, ist schon freigegeben oder hat schon eine Frage.",
        };
      case "42501":
        return {
          ok: false,
          message: "Diese Rückfrage ist nicht erlaubt.",
        };
      case "22023":
        return { ok: false, message: "Bitte prüfe die Länge der Frage." };
      default:
        return { ok: false, message: GENERIC_ERROR };
    }
  }

  const mail = await sendMail(
    supabase,
    target.profileId,
    target.revisionId,
    "profile_question",
  );
  refresh(target.profileId);

  return {
    ok: true,
    message: `Rückfrage gespeichert. Das Profil bleibt privat. ${mail}`,
  };
}

// Sends a mail again after "failed" or when it was never sent (for example
// because no SMTP settings existed at the time). The database refuses a second
// mail once one was accepted.
export async function resendMail(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFounder();

  const target = ids(formData);
  const kind = String(formData.get("kind") ?? "");
  if (!target || (kind !== "profile_live" && kind !== "profile_question")) {
    return { ok: false, message: "Ungültige Anfrage." };
  }

  const supabase = await createClient();
  const mail = await sendMail(supabase, target.profileId, target.revisionId, kind);
  refresh(target.profileId);

  return { ok: true, message: mail };
}

export async function retryImage(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireFounder();

  const profileId = String(formData.get("profileId") ?? "");
  if (!UUID.test(profileId)) {
    return { ok: false, message: "Ungültige Anfrage." };
  }

  const supabase = await createClient();
  const profileCopied = await copyPublishedImage(supabase, profileId);
  const eventView = await loadFounderEventView(supabase, profileId, true);
  const eventCopied = eventView
    ? await copyPublishedEventImage(supabase, eventView.eventId)
    : "copied";
  const copied =
    profileCopied === "copied" && eventCopied === "copied" ? "copied" : "failed";
  refresh(profileId);

  return copied === "copied"
    ? { ok: true, message: "Die Bilder sind jetzt öffentlich." }
    : {
        ok: false,
        message:
          "Mindestens ein Bild konnte noch nicht veröffentlicht werden. Bitte versuche es später noch einmal.",
      };
}
