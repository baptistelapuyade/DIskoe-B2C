# 01 — Architektur (Bestätigt durch den Founder am 2026-10-23)

Ausgangslage: Ein Entwickler (Founder) mit Claude, Codex und Cursor, grüne Wiese, Alpha mit offener Registrierung aber betreuten ersten Organizern, Daten in der EU. AWS-Guthaben vorhanden (ca. 1000 €, Ablaufdatum prüfen).

## ADR-001 — Stack
**Entscheidung — Bestätigt (Founder, 2026-10-23):** TypeScript-Fullstack mit Next.js (App Router, SSR/ISR für öffentliche Seiten), Supabase (Postgres, Auth, Storage, Row Level Security) in Frankfurt.
**Gründe:** öffentliche Event-/Profilseiten brauchen SSR und strukturierte Daten (R11); Supabase liefert E-Mail-Code-Login (Delta v0.4 §14.1), Dateispeicher und Zugriffsregeln ohne eigenes Backend; ein Stack für Claude und Codex.
**Verworfen:** eigenes Backend (mehr Aufbau), SvelteKit (kleineres Agenten-Ökosystem).

## ADR-002 — Hosting
**Entscheidung:** AWS Amplify Hosting in `eu-central-1` (Frankfurt) für die Next.js-App, bezahlt über das AWS-Guthaben. Supabase separat (Free-Plan in der Alpha, später Pro, wird nicht vom AWS-Guthaben bezahlt).
**Risiken:** Next.js-Versionen werden von Amplify teils verzögert unterstützt → Version pinnen. Guthaben läuft ab → Datum prüfen. Rückfallebene: Vercel, gleicher Code.
**Bestätigt (Founder, 23.10.2026):** AWS-Guthaben ist ein Jahr gültig, Hosting läuft über Amplify. Die Domain liegt bei einem externen Anbieter; DNS dort auf Amplify verweisen (CNAME/ALIAS laut Amplify-Anleitung), Zertifikat über Amplify. **Offen:** Umgebungen (`preview` pro Branch, `staging`, `production`), AWS-Zugang (Root-Zugriff klären, eigener Admin-Zugang, MFA).

## ADR-003 — Login und Rollen
**Bestätigt (Founder, 2026-10-23):** E-Mail-Code für Besucher und Organizer (kein Passwort). Google-Login ist Option, nicht Alpha-Pflicht. Organizerrechte nur über ausdrückliche Zuordnung (`owner_id` je Profil), nie über gleiche E-Mail (Delta v0.4 §14.1). Eine Person kann mehrere Profile verantworten, Wechsel im Organizerbereich. Founder-Rolle für interne Prüfseite (D8) über eine Allowlist.

## ADR-004 — Daten
Postgres in Supabase. Row Level Security auf allen Tabellen mit Nutzerdaten. Öffentliche Leseprojektion (View oder materialisierte Tabelle) für veröffentlichte Stände; Entwurf und veröffentlichter Stand getrennt (`draft_revision` / `published_revision`, v0.3 §3). Antworten als `A(T)` mit Zustand (v0.3 §2). Migrationen als SQL im Repo (`supabase/migrations`). Typen aus dem Schema generieren.

## ADR-005 — Medien
Supabase Storage, getrennte Buckets für privates Erfassungsmaterial (30 Tage nach Veröffentlichung löschen, v0.3 §13) und öffentliche Medien. Nutzung pro Verwendung bestätigen (`media_use`). Bildverarbeitung (Zuschnitt, Größen) serverseitig, Originale erhalten.

## ADR-006 — E-Mail
Zwei Klassen: Auth-Mails (Code) und Produktmails (Follow, Änderungen, Absagen, später Plus-Nachrichten). **Entschieden (Founder, 23.10.2026):** Amazon SES über das AWS-Guthaben. Einzurichten: Domain-Verifizierung (DKIM/SPF/DMARC) im externen DNS, Produktionszugang beantragen (aus dem Sandbox-Modus), Bounce-/Complaint-Benachrichtigung (SNS), Region `eu-central-1`. Anforderungen: Bounce-/Complaint-Behandlung, Abmeldelink, Zustellstatus `queued/submitted/failed/uncertain/suppressed`, Versandzeit 10 Uhr `Europe/Berlin`, 15-Minuten-Bündelung (v0.3 §10, §16). **Nicht in der ersten Bauphase.**

## ADR-007 — KI-Erfassung
Flyer/Text/Link → editierbarer Entwurf (R05). **Entschieden (Founder, 23.10.2026):** Google-Modell über das vorhandene Google-Guthaben (ca. 2000 $). **Offen:** konkretes Modell (Gemini über Vertex AI oder Gemini API), EU-Region/Datenverarbeitung, Kosten pro Lauf, Qualität bei Flyern. Vorgehen: Provider hinter einer eigenen Schnittstelle kapseln (`extractEvent(input) → Entwurf`), mit 20–30 echten Flyern messen (Trefferquote je Feld, Kosten, Dauer), bevor die Erfassungsschicht gebaut wird. Datenschutz: Flyer und Texte gehen an einen Drittanbieter; Hinweis in den Einwilligungstexten prüfen. Pflicht: manueller Fallback, KI-Fehler blockiert nie die Veröffentlichung, KI erzeugt keine Fakten ohne Bestätigung. **Nicht im Durchstich.**

## ADR-008 — Tests und Qualität
Vitest (Einheiten, Vertragsregeln), Playwright (Durchstich-Flows), Typecheck und Lint in CI (GitHub Actions). Prüffälle aus den Verträgen (P01–P50, E01–E47) werden als benannte Tests geführt, soweit sie Logik betreffen.

## ADR-009 — UI
Tailwind mit CSS-Variablen für Tokens (`04-design-tokens.md`). Das Figma-Fundament ist shadcn-basiert, deshalb shadcn/ui als Komponentenbasis. Schrift im Design: Space Grotesk. Profilgestaltung (6 kuratierte Schriftpaare) ist noch nicht konkretisiert.

## Offene technische Fragen (Q23–Q25 im Build-Doc)
Integration Zugang/Medien/KI, Fehlerbehandlung und Monitoring (Vorschlag: Sentry plus Supabase-Logs), Backup (Supabase PITR, Ziel max. 30 Tage), Löschkonzept, Messschema (Analytics ohne Fremd-Tracker, Aggregation), Rate Limits für Anmeldung/Bestätigung (v0.3 Q32).
