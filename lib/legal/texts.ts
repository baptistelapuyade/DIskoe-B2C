// Legal pages. The text is supplied by the founder; nothing here is legal advice.
// While `placeholder` is true the page says so and stays out of search engines.
// Kept as TypeScript (not a file read at runtime) so the Amplify build needs no
// extra file tracing.

export type LegalBlock = { kind: "h2" | "p"; text: string };

export type LegalDocument = {
  title: string;
  placeholder: boolean;
  blocks: LegalBlock[];
};

const PLACEHOLDER: LegalBlock[] = [
  { kind: "p", text: "Angaben folgen." },
  {
    kind: "p",
    text: "Diese Seite ist noch nicht ausgefüllt. Der Text wird vom Betreiber geliefert.",
  },
];

export const IMPRESSUM: LegalDocument = {
  title: "Impressum",
  // TODO(founder): Anbieter, Anschrift, Kontakt. Set placeholder to false when filled.
  placeholder: true,
  blocks: PLACEHOLDER,
};

export const DATENSCHUTZ: LegalDocument = {
  title: "Datenschutz",
  // TODO(founder): Verantwortlicher; Login per E-Mail-Code, Session-Cookies,
  // Supabase (Frankfurt), Amazon SES, Amplify-Logs. Set placeholder to false when filled.
  placeholder: true,
  blocks: PLACEHOLDER,
};

export function legalRobots(doc: LegalDocument) {
  return doc.placeholder ? { index: false, follow: false } : { index: true, follow: true };
}
