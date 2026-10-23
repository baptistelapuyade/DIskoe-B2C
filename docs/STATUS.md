# DISKOE B2C V1 — technischer Übergabestand

**Stand:** 2026-10-23
**Phase:** Phase 4 „Durchstich (Alpha-Kern)“ geplant; technisches Projektgerüst als separater Schritt umgesetzt, Fach-Slices nicht begonnen.
**Implementierung:** Freigegeben durch den Founder am 23.10.2026, Umfang laut `AGENTS.md`; Scaffold auf `feat/scaffold`, noch keine Fachfunktion.

## Tatsächlicher Stand

- Frisches Git-Repository auf `main` initialisiert; zum Einrichtungszeitpunkt kein Remote vorhanden.
- Verbindliche Arbeitsregeln, Einstieg, Projektstatus, separater B2C-Datenvertrag, offene Architektur und Entscheidungsverfahren angelegt.
- Cursor-Regel verweist auf `AGENTS.md`; keine widersprüchliche zweite Regelbasis.
- GSD ist lokal verfügbar. Eigene B2C-Planung ist grob angelegt; automatisches Fortschreiten zur Implementierung ist deaktiviert.
- Next.js-App-Router-Gerüst mit strikt typisiertem TypeScript, Default-Design-Tokens/Space Grotesk, shadcn/ui-Basis, Supabase-Client-Hüllen und datensparsamer, ohne DSN inaktiver Sentry-Vorbereitung angelegt.
- Tooling umfasst exakt gepinnte npm-Abhängigkeiten, ESLint, Prettier, Vitest, Playwright und Pull-Request-CI. Supabase enthält nur `config.toml`; keine Tabellen oder Migrationen. Kein Deployment und keine Cloud-Konten.
- Toolchain ist Node `24.22.1` (LTS; Node 20 ist seit 2026-04-30 End-of-Life, Amplify unterstützt 20, 22 und 24) mit npm `10.8.2`. Space Grotesk ist selbst gehostet (`app/fonts/`, Lizenz OFL 1.1), der Build braucht kein Netz für Schriften. `@types/node` steht noch auf `20.19.43`; Anhebung auf 24.x braucht einen Lauf mit Registry-Zugriff.
- CI-Job `audit` (`npm run audit:check`) lässt Pull Requests bei High/Critical-Funden fehlschlagen. Akzeptierte Funde stehen befristet in `.github/audit-allowlist.json`: zwei PostCSS-Funde (`GHSA-r28c-9q8g-f849`, `GHSA-6g55-p6wh-862q`) im von Next 15 gebündelten PostCSS 8.4.31, nur Build-Zeit, bis 2027-01-31. Behebung nur über Next 16, sobald AWS Amplify SSR es dokumentiert unterstützt.
- Nicht lokal geprüft: `npm ci` und Build der Node-24-Umstellung (Registry in der Sitzung gesperrt); belegt ist nur der grüne CI-Lauf auf `47dee9f`.
- Slice 1 (Datenbank): Zwei Supabase-Migrationen (Schema, Sicherheit) mit Revisionsmodell, revisionsgebundener Founder-Erstfreigabe, RLS, den Views `public_profiles`/`public_events` und sieben privilegierten Funktionen sowie 198 SQL-Zusicherungen (`npm run test:rls`, CI-Job `rls`) auf Branch `feat/slice-1-alpha-core`. Geprüft gegen PostgreSQL 16 mit Supabase-Nachbildung; 25 absichtlich eingebaute Sicherheitslücken wurden alle erkannt. **Nicht gegen echtes Supabase geprüft**, Storage-Policies und generierte Typen fehlen. Details und Abweichungen: `.planning/phases/04-durchstich/SLICE-1-SUMMARY.md`, Founder-Einrichtung: `docs/runbooks/founder-bootstrap.md`.
- S3-Fragenpool für Live-/DJ-, Offspace-/Vernissage- und Filmabende in `docs/QUESTION_POOL_B2C_V1.md` ausgearbeitet: Basispool, Formatfragen, Prioritäten, Zustände, Ebenen, Beratung und vier ausdrücklich fiktive Auswahlfälle.
- 2026-10-15: Scope-Erweiterung aus Nutzerübergabe (Developer-Chat vom 15.10.2026) dokumentiert: `docs/SCOPE_EXTENSION_B2C_2026-10-15.md`, `docs/DATA_CONTRACT_B2C_V1_ADDENDUM_2026-10-15.md`, Anpassungen in README, PROJECT, ARCHITECTURE, Fragenpool und `.planning/`. Notion war in dieser Session nicht zugänglich (404); es gab keinen Notion-Abgleich, dieser bleibt offen.
- 2026-10-15 (später): Beschlüsse Q29–Q36 und fünf S3-Detailentscheidungen aus der direkt gelesenen Notion-Beschlussseite (plus Scope- und S3-Seite) in `docs/PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md` dokumentiert; abhängige Dokumente und `.planning/` abgeglichen. Gelesen wurde nicht die übergeordnete Build-Seite und nicht der Outcome Brief; Auto-Sync gibt es nicht. Zugriff bestand erst nach erneuter Connector-Verbindung des Nutzers.
- Aktuellen Notion-Build-Stand (Stand 2026-10-14) mit der Repo-Lesefassung abgeglichen; neue Detailheuristiken und UI-nahe Optionen bleiben als Vorschläge markiert.
- 2026-10-15 (Notion-Übergabe „Datenvertrag v0.3 & Abschlussbeschlüsse"): Nachtrag in `docs/PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md` ergänzt; Datenvertrag v0.3 als Entwurf in `docs/DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md` angelegt; B13 (Atmosphärenpflicht) im Fragenpool ergänzt; Roadmap, Requirements, Architektur, README und Planungsstand abgeglichen. v0.1 und Ergänzung A1 unverändert erhalten. Keine Entwicklung.

- 2026-10-16: Produktdelta v0.4 (Notion „B2C-Datenvertrag — Delta v0.4“, vollständig inkl. Abschnitte 14–15, Seitenstand 16.10.2026 11:42 UTC) als Lesefassung in `docs/PRODUCT_DECISIONS_DELTA_V04_2026-10-16.md` dokumentiert. Abgeglichen: `docs/PROJECT.md`, `docs/PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md` (Verweis), `docs/DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md` (Verweis; Inhalt unverändert), `.planning/REQUIREMENTS.md` (38 statt 25 Anforderungen, Traceability), `.planning/ROADMAP.md` (Phasenzuordnung, Abnahmefälle), `.planning/PROJECT.md`, `.planning/STATE.md`. Die Premium-Grenze „nach V1“ ist präzisiert: Plus Alpha als manueller achtwöchiger Testzugang; Billing nicht autorisiert.
- 2026-10-23: Startpaket unter `docs/startpaket/` aufgenommen. Architekturentscheidungen und weiterhin offene Punkte sind in `docs/startpaket/01-architektur.md` festgehalten; es wurde keine Entwicklung begonnen.
- 2026-10-23: Entwicklungsfreigabe durch den Founder erteilt; Umfang siehe `AGENTS.md`.
- 2026-10-23: Umsetzungsplan unter `.planning/phases/04-durchstich/PLAN.md` erstellt. Er gliedert den autorisierten Durchstich in sieben Slices (Migrationen/RLS, Login, Profil, Event/Lückenprüfung, Publizieren/Absagen, öffentliche Seiten/JSON-LD, Playwright), enthält die 38er-Inventur (37 V1-IDs plus separat geführtes `PREMIUM-01`) und wurde im GSD-Planprüflauf nach zwei Korrekturschleifen bestanden. Kein Code, keine Abhängigkeit und keine Installation.
- Das technische Gerüst besitzt Unit-/Smoke-Prüfungen; die fachlichen Abnahmefälle D01–D15 bleiben Papierspezifikationen und kein Requirement gilt als umgesetzt. Entwicklungsfreigabe siehe `AGENTS.md`.

## Gelesene und geprüfte Quellen

- Notion: Outcome Brief, Build/Specs/LLM-Übergabe und strategischer Hintergrund, jeweils Stand 2026-10-14.
- Notion am 2026-10-15 direkt gelesen: Build-Seite (vollständig), Scope-Erweiterung, S3-Fragenpool, Beschlussseite Q29–Q36/S3, Datenvertrag v0.2 und v0.3 sowie Claude-Übergabe. Nicht erneut gelesen: Outcome Brief und Strategie (im Abgleich nicht als betroffen markiert) sowie die Taxonomie-Quellen des v0.2-Zwischenstands. Kein Auto-Sync.
- DMO-Referenz: lokales `AGENTS.md`, `.cursor/rules/documentation.mdc`, `docs/PROJECT.md`, `docs/STATUS.md` und `.planning/`-Struktur; DMO-Arbeitsbaum blieb unverändert.
- Bestandsprüfung: Build-Q22 und Draft-PR-Link; der GitHub-Webabruf war in dieser Sitzung nicht direkt verfügbar, der lokale DMO-Stand und die Notion-Auditfassung waren zugänglich.
- Figma: Metadaten des Screen-Canvas `7:13`, der Foundations `4:11` und ein Übersichtsscreenshot. Keine vollständige Library-/Designabnahme.

## Bestätigt, offen und ungeprüft

**Bestätigt/dokumentiert:** V1-Scope R01–R12; zahlreiche Regeln Q01–Q21; separate Datenvertragslesefassung; manuelle Storyvalidierung; frische Codebasis.

**Beschlossen (2026-10-15):** Q29–Q36 (Module, Gestaltungsrahmen, Musik SoundCloud/Spotify, Follow, Versand-/Änderungs-/Absageregeln, Empfehlungen/Einladungen, Profilminimum mit Bildpflicht und unabhängiger Eventgestaltung, offene Alpha ohne Testerlimit) und die fünf S3-Detailentscheidungen. Produktentscheidungen, keine Entwicklungsfreigabe.

**Nachtrag beschlossen (2026-10-15):** Atmosphärenpflicht (B13), Versand 10:00 Europe/Berlin mit 15-Minuten-Fenster, Einladungs-, Profilpausen-, Lösch- und Produktfristregeln; Discovery-Grundlogik mit Bildpflicht für Discovery.

**Offen:** Discovery-Suchdetails und Schwellen; Gesamtdurchsicht des Datenvertrags v0.3 (Entwurf, nicht abgenommen); Startvoraussetzungen (Aufbewahrung, Backup, Rechtetexte, Anbieter); Follow-Spec S9; D1–D10 mobile Designs; Einladungszuordnung-Details; Offline-/Entfernungszustände; Zustellmechanik; technische Architektur Q23–Q25; Messschema/Betrieb; Pilotorganisation und neu zu schätzender Aufwand.

**Nicht geprüft:** echte Organizer-Materialien/Nutzerverständnis, Auth-Funktion, Datenbankfachschema/RLS, Medienverarbeitung, Analytics, SEO-Ausgabe, Deployment und externe Dienste.

## Nächste autorisierte Aufgabe

Entwicklung ist ausschließlich im in `AGENTS.md` freigegebenen Umfang zulässig. Nach Review des Slice-1-PRs und einer Abnahme der Migrationen gegen echtes Supabase (`supabase db reset` plus dieselben Tests) ist Slice 2 (Login, Organizerzuordnung) der nächste technische Schritt; weiterhin kein Auto-Advance. Unabhängige nächste fachliche Arbeit bleibt die Gesamtdurchsicht von Datenvertrag v0.3 und Produktdelta v0.4 samt Discovery-Suchdetails und Rest-Specs.

## Übergabeformat

Am Sessionende tatsächlichen Diff und passende Prüfungen dokumentieren, diesen Status knapp aktualisieren und Branch sowie Commit-/Push-/PR-Stand nennen. Notion nur gezielt für betroffene Produktentscheidungen abgleichen; dieses Dokument nicht zur zweiten Produktaufgabenliste ausbauen.
