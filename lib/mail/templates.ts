import type { MailKind } from "@/lib/profile/founder";

// System mails to organizers of the alpha (AGENTS.md, extension of 2026-10-27).
// No marketing, no tokens, no recipient address in the text. The only link
// leads to the profile's own page, which needs a sign-in.
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

type Link = { url: string; label: string };

function html(paragraphs: string[], links: Link[]): string {
  const body = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");

  return [
    '<div style="font-family: sans-serif; line-height: 1.5; max-width: 36rem;">',
    body,
    ...links.map(
      (link) =>
        `<p><a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a></p>`,
    ),
    "</div>",
  ].join("\n");
}

const FOOTER =
  "Das ist eine automatische Systemmail zu deinem Profil bei DISKOE.";

// The first event is submitted and approved together with the profile
// (Slice 5). Its title and link are optional: a profile approved without an
// event gets the text of Slice 3.
export type MailInput = {
  name: string | null | undefined;
  url: string;
  eventTitle?: string | null;
  eventUrl?: string | null;
};

export function profileLiveMail(input: MailInput): MailContent {
  const name = cleanName(input.name);
  const withEvent = input.eventTitle !== undefined && input.eventTitle !== null;
  const eventTitle = cleanName(input.eventTitle);
  const paragraphs = [
    "Hallo,",
    withEvent
      ? `dein Profil „${name}“ und das Event „${eventTitle}“ wurden geprüft und sind jetzt live.`
      : `dein Profil „${name}“ wurde geprüft und ist jetzt live.`,
    "Änderungen bleiben privat, bis du sie selbst bestätigst.",
    FOOTER,
  ];
  const links: Link[] = [{ url: input.url, label: "Zu deinem Profil" }];

  if (withEvent && input.eventUrl) {
    links.push({ url: input.eventUrl, label: "Event verwalten" });
  }

  return {
    subject: `Dein Profil „${name}“ ist jetzt live`,
    text: [
      ...paragraphs,
      "",
      ...links.map((link) => `${link.label}: ${link.url}`),
    ].join("\n\n"),
    html: html(paragraphs, links),
  };
}

export function profileQuestionMail(input: MailInput): MailContent {
  const name = cleanName(input.name);
  const paragraphs = [
    "Hallo,",
    `wir haben eine Frage zu deinem Profil „${name}“. Das ist keine Absage: Dein Profil bleibt privat, bis alles passt.`,
    "Über den Link kommst du nach der Anmeldung direkt zu deinem Profil. Dort steht die Frage, und du kannst die Angaben ändern.",
    FOOTER,
  ];

  return {
    subject: `Eine Frage zu deinem Profil „${name}“`,
    text: [...paragraphs, "", `Zur Frage und zu deinem Profil: ${input.url}`].join(
      "\n\n",
    ),
    html: html(paragraphs, [
      { url: input.url, label: "Zur Frage und zu deinem Profil" },
    ]),
  };
}

export function mailFor(kind: MailKind, input: MailInput): MailContent {
  return kind === "profile_live"
    ? profileLiveMail(input)
    : profileQuestionMail(input);
}
