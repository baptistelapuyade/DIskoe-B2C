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

// Colors from docs/startpaket/04-design-tokens.md (paper, surface, ink, muted,
// border, iris). Mail clients know no CSS variables and few web fonts, so the
// values are written out and the font is a system stack. Table layout and
// inline styles because that is what mail clients render reliably.
const MAIL_COLORS = {
  surface: "#f1f1ed",
  card: "#ffffff",
  ink: "#343432",
  muted: "#676762",
  border: "#dfdfd9",
  iris: "#7455d8",
  onIris: "#ffffff",
} as const;

const MAIL_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

type MailLayout = {
  headline: string;
  paragraphs: string[];
  links: Link[];
  footer: string;
};

// Hierarchy: wordmark, headline, body, one main button, divider, small print.
// The first link is the button; further links are plain links under it.
function html(layout: MailLayout): string {
  const c = MAIL_COLORS;
  const [main, ...more] = layout.links;
  const body = layout.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:${c.ink};">${escapeHtml(p)}</p>`,
    )
    .join("\n");
  const button = main
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 8px;"><tr><td style="background:${c.iris};border-radius:8px;"><a href="${escapeHtml(main.url)}" style="display:inline-block;padding:14px 24px;font-size:16px;font-weight:600;color:${c.onIris};text-decoration:none;">${escapeHtml(main.label)}</a></td></tr></table>`
    : "";
  const others = more
    .map(
      (link) =>
        `<p style="margin:12px 0 0;font-size:16px;line-height:1.5;"><a href="${escapeHtml(link.url)}" style="color:${c.iris};">${escapeHtml(link.label)}</a></p>`,
    )
    .join("\n");

  return [
    `<!doctype html><html lang="de"><body style="margin:0;padding:0;background:${c.surface};">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.surface};"><tr><td align="center" style="padding:32px 16px;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:${MAIL_FONT};">`,
    `<tr><td style="padding:0 0 16px;font-size:14px;font-weight:700;letter-spacing:0.12em;color:${c.ink};">DISKOE</td></tr>`,
    `<tr><td style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:32px 28px;">`,
    `<h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;font-weight:700;color:${c.ink};">${escapeHtml(layout.headline)}</h1>`,
    body,
    button,
    others,
    `<hr style="border:0;border-top:1px solid ${c.border};margin:28px 0 16px;">`,
    `<p style="margin:0;font-size:13px;line-height:1.5;color:${c.muted};">${escapeHtml(layout.footer)}</p>`,
    "</td></tr>",
    "</table>",
    "</td></tr></table>",
    "</body></html>",
  ].join("\n");
}

// The plain-text part keeps the same order. Only the links carry a URL.
function plainText(layout: MailLayout): string {
  return [
    layout.headline,
    ...layout.paragraphs,
    layout.links.map((link) => `${link.label}: ${link.url}`).join("\n"),
    "—",
    layout.footer,
  ]
    .filter((part) => part !== "")
    .join("\n\n");
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
  ];
  const links: Link[] = [{ url: input.url, label: "Zu deinem Profil" }];

  if (withEvent && input.eventUrl) {
    links.push({ url: input.eventUrl, label: "Event verwalten" });
  }

  const subject = `Dein Profil „${name}“ ist jetzt live`;
  const layout: MailLayout = {
    headline: subject,
    paragraphs,
    links,
    footer: FOOTER,
  };

  return { subject, text: plainText(layout), html: html(layout) };
}

export function profileQuestionMail(input: MailInput): MailContent {
  const name = cleanName(input.name);
  const paragraphs = [
    "Hallo,",
    `wir haben eine Frage zu deinem Profil „${name}“. Das ist keine Absage: Dein Profil bleibt privat, bis alles passt.`,
    "Über den Link kommst du nach der Anmeldung direkt zu deinem Profil. Dort steht die Frage, und du kannst die Angaben ändern.",
  ];
  const subject = `Eine Frage zu deinem Profil „${name}“`;
  const layout: MailLayout = {
    headline: subject,
    paragraphs,
    links: [{ url: input.url, label: "Zur Frage und zu deinem Profil" }],
    footer: FOOTER,
  };

  return { subject, text: plainText(layout), html: html(layout) };
}

export function mailFor(kind: MailKind, input: MailInput): MailContent {
  return kind === "profile_live"
    ? profileLiveMail(input)
    : profileQuestionMail(input);
}
