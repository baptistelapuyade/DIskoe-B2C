import type { MailKind } from "@/lib/profile/founder";

// System mails to organizers of the alpha (AGENTS.md, extension of 2026-10-27).
// No marketing, no tokens, no recipient address in the text. The only link
// leads to the sign-in protected start page.
// TODO(spec): wording is a proposal (approved wireframes, 2026-10-27).

export type MailContent = { subject: string; text: string; html: string };

const MAX_NAME_LENGTH = 120;

// Subject lines must not carry line breaks or control characters.
function cleanName(name: string | null | undefined): string {
  const cleaned = (name ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME_LENGTH);

  return cleaned || "ohne Namen";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function html(paragraphs: string[], url: string, linkLabel: string): string {
  const body = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");

  return [
    '<div style="font-family: sans-serif; line-height: 1.5; max-width: 36rem;">',
    body,
    `<p><a href="${escapeHtml(url)}">${escapeHtml(linkLabel)}</a></p>`,
    "</div>",
  ].join("\n");
}

const FOOTER =
  "Das ist eine automatische Systemmail zu deinem Profil bei DISKOE.";

export function profileLiveMail(input: {
  name: string | null | undefined;
  url: string;
}): MailContent {
  const name = cleanName(input.name);
  const paragraphs = [
    "Hallo,",
    `dein Profil „${name}“ wurde geprüft und ist jetzt live.`,
    "Änderungen bleiben privat, bis du sie selbst bestätigst.",
    FOOTER,
  ];

  return {
    subject: `Dein Profil „${name}“ ist jetzt live`,
    text: [...paragraphs, "", `Zu deinem Profil: ${input.url}`].join("\n\n"),
    html: html(paragraphs, input.url, "Zu deinem Profil"),
  };
}

export function profileQuestionMail(input: {
  name: string | null | undefined;
  url: string;
}): MailContent {
  const name = cleanName(input.name);
  const paragraphs = [
    "Hallo,",
    `wir haben eine Frage zu deinem Profil „${name}“. Das ist keine Absage: Dein Profil bleibt privat, bis alles passt.`,
    "Die Frage und den nächsten Schritt findest du nach der Anmeldung auf deiner Startseite.",
    FOOTER,
  ];

  return {
    subject: `Eine Frage zu deinem Profil „${name}“`,
    text: [...paragraphs, "", `Zur Startseite: ${input.url}`].join("\n\n"),
    html: html(paragraphs, input.url, "Zur Startseite"),
  };
}

export function mailFor(
  kind: MailKind,
  input: { name: string | null | undefined; url: string },
): MailContent {
  return kind === "profile_live"
    ? profileLiveMail(input)
    : profileQuestionMail(input);
}
