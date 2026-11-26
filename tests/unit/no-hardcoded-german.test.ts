import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

// Guard against new fixed German copy in the code (AGENTS.md: "Keine neuen
// Texte ohne Katalog-ID"; all platform copy is German and English, English by
// default). The scan is a heuristic over string literals and JSX text: it looks
// for umlauts and for German words that are no English words. It does not
// catch every German text (a word like "Uhr" passes); it stops the usual cases.
//
// LEGACY lists the files that still carry fixed German copy. It is a ratchet:
// a file outside the list with a hit fails the test, and a file on the list
// without a hit fails it too, so the entry has to be removed when the file is
// cleaned up. Do not add files; move the texts into the catalog instead
// (docs/startpaket/12-zustandstexte.md, lib/i18n/messages.*.ts).
const ROOT = join(__dirname, "..", "..");
const SCAN_DIRS = ["app", "components", "lib"];

const LEGACY: Record<string, string> = {
  // Old wireframe pages, replaced by their Figma flows (see docs/STATUS.md).
  "app/(organizer)/organizer/events/[eventId]/preview/page.tsx": "VOR-01",
  "app/(organizer)/organizer/events/[eventId]/publish/page.tsx": "VOR-01",
  "app/(organizer)/organizer/events/[eventId]/published/page.tsx": "VOR-01",
  "app/(organizer)/organizer/events/[eventId]/edit/page.tsx": "draft hub",
  "app/(organizer)/organizer/events/actions.ts": "draft actions",
  "app/(organizer)/organizer/profiles/[profileId]/status/page.tsx":
    "profile status",
  "app/(organizer)/organizer/profiles/[profileId]/preview/page.tsx": "VOR-01",
  "app/(organizer)/organizer/profiles/[profileId]/actions.ts":
    "profile actions",
  "components/profile/status.tsx": "profile status",
  "components/profile/forms.tsx": "profile forms",
  "components/profile/approve-form.tsx": "founder area",
  "components/event/confirm-form.tsx": "event confirm form",
  // Founder area (internal), German until the Founder-Bereich is built.
  "app/(internal)/internal/approvals/page.tsx": "founder area",
  "app/(internal)/internal/approvals/actions.ts": "founder area",
  "app/(internal)/internal/approvals/[profileId]/page.tsx": "founder area",
  "lib/profile/founder.ts": "founder area",
  "app/page.tsx": "start page",
  "app/(organizer)/organizer/events/new/page.tsx": "profile picker",
  // Legal texts: German is the authoritative version, English follows.
  "lib/legal/texts.ts": "legal texts",
  // Domain helpers with German messages, moved with the screens that use them.
  "lib/domain/event-publication.ts": "event input messages",
  "lib/domain/profile-publication.ts": "profile input messages",
  "lib/domain/question-area.ts": "question area",
  "lib/domain/money.ts": "price input messages",
  "lib/domain/time.ts": "time messages",
  "lib/event/labels.ts": "German keys of closed lists",
  "lib/mail/templates.ts": "MAIL-01 to 14",
  "lib/mail/send.ts": "MAIL-01 to 14",
};

const GERMAN_WORDS = new RegExp(
  "\\b(nicht|und|für|Zurück|Weiter|Bitte|bitte|Dein|dein|Deine|deine|Eure|eure|Euer|euer|noch|wird|wurde|sind|fehlt|Vorschau|Speichern|Abbrechen|Preis|Zugang|Profil|Abmelden|Prüfung|Entwurf|Gäste|Besucher|veröffentlicht|veröffentlichen|oder|auch|dann|nur|kann|können|ihr|Ihr|Wir|wir)\\b",
);
const UMLAUT = /[äöüÄÖÜß]/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);

    if (statSync(path).isDirectory()) return files(path);

    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

function hasGermanCopy(source: string): boolean {
  const code = stripComments(source);
  const literals =
    code.match(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g) ??
    [];
  const jsxText = code
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        /^[^{}<>=;()]*$/.test(line) &&
        /\s/.test(line) &&
        /[A-Za-zÄÖÜäöüß]/.test(line),
    );
  const jsxInline = [...code.matchAll(/>([^<>{}\n]{3,})</g)].map((m) => m[1]);

  return [...literals, ...jsxText, ...jsxInline].some(
    (text) => UMLAUT.test(text) || GERMAN_WORDS.test(text),
  );
}

describe("no fixed German copy in the code", () => {
  const hits = SCAN_DIRS.flatMap((dir) => files(join(ROOT, dir)))
    .map((path) => relative(ROOT, path).split(sep).join("/"))
    .filter((path) => !path.startsWith("lib/i18n/messages."))
    .filter((path) => hasGermanCopy(readFileSync(join(ROOT, path), "utf8")));

  it("finds German copy only in the files of the legacy list", () => {
    const unlisted = hits.filter((path) => !(path in LEGACY));

    expect(
      unlisted,
      "Move these texts into the catalog (lib/i18n/messages.*.ts, doc 12) instead of writing them into the code",
    ).toEqual([]);
  });

  it("keeps the legacy list honest: every listed file still has German copy", () => {
    const stale = Object.keys(LEGACY).filter((path) => !hits.includes(path));

    expect(stale, "Remove these files from LEGACY").toEqual([]);
  });
});
