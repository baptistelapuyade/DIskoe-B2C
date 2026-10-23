# DISKOE B2C V1 — technischer Übergabestand

**Stand:** 2026-10-23
**Phase:** Repository-Grundlage, S3-Fragenpool (33 Fragen), Scope-Erweiterung, Produktbeschlüsse Q29–Q36/S3, Nachtrag-Beschlüsse, Datenvertrag-v0.3-Entwurf, Produktdelta v0.4 und Startpaket dokumentiert.
**Implementierung:** Freigegeben durch den Founder am 23.10.2026, Umfang laut `AGENTS.md`; noch kein Code geschrieben.

## Tatsächlicher Stand

- Frisches Git-Repository auf `main` initialisiert; zum Einrichtungszeitpunkt kein Remote vorhanden.
- Verbindliche Arbeitsregeln, Einstieg, Projektstatus, separater B2C-Datenvertrag, offene Architektur und Entscheidungsverfahren angelegt.
- Cursor-Regel verweist auf `AGENTS.md`; keine widersprüchliche zweite Regelbasis.
- GSD ist lokal verfügbar. Eigene B2C-Planung ist grob angelegt; automatisches Fortschreiten zur Implementierung ist deaktiviert.
- Kein Anwendungscode, `package.json`, Lockfile, Schema, Migration, Build, Test-Runner oder Deployment angelegt.
- S3-Fragenpool für Live-/DJ-, Offspace-/Vernissage- und Filmabende in `docs/QUESTION_POOL_B2C_V1.md` ausgearbeitet: Basispool, Formatfragen, Prioritäten, Zustände, Ebenen, Beratung und vier ausdrücklich fiktive Auswahlfälle.
- 2026-10-15: Scope-Erweiterung aus Nutzerübergabe (Developer-Chat vom 15.10.2026) dokumentiert: `docs/SCOPE_EXTENSION_B2C_2026-10-15.md`, `docs/DATA_CONTRACT_B2C_V1_ADDENDUM_2026-10-15.md`, Anpassungen in README, PROJECT, ARCHITECTURE, Fragenpool und `.planning/`. Notion war in dieser Session nicht zugänglich (404); es gab keinen Notion-Abgleich, dieser bleibt offen.
- 2026-10-15 (später): Beschlüsse Q29–Q36 und fünf S3-Detailentscheidungen aus der direkt gelesenen Notion-Beschlussseite (plus Scope- und S3-Seite) in `docs/PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md` dokumentiert; abhängige Dokumente und `.planning/` abgeglichen. Gelesen wurde nicht die übergeordnete Build-Seite und nicht der Outcome Brief; Auto-Sync gibt es nicht. Zugriff bestand erst nach erneuter Connector-Verbindung des Nutzers.
- Aktuellen Notion-Build-Stand (Stand 2026-10-14) mit der Repo-Lesefassung abgeglichen; neue Detailheuristiken und UI-nahe Optionen bleiben als Vorschläge markiert.
- 2026-10-15 (Notion-Übergabe „Datenvertrag v0.3 & Abschlussbeschlüsse"): Nachtrag in `docs/PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md` ergänzt; Datenvertrag v0.3 als Entwurf in `docs/DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md` angelegt; B13 (Atmosphärenpflicht) im Fragenpool ergänzt; Roadmap, Requirements, Architektur, README und Planungsstand abgeglichen. v0.1 und Ergänzung A1 unverändert erhalten. Keine Entwicklung.

- 2026-10-16: Produktdelta v0.4 (Notion „B2C-Datenvertrag — Delta v0.4“, vollständig inkl. Abschnitte 14–15, Seitenstand 16.10.2026 11:42 UTC) als Lesefassung in `docs/PRODUCT_DECISIONS_DELTA_V04_2026-10-16.md` dokumentiert. Abgeglichen: `docs/PROJECT.md`, `docs/PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md` (Verweis), `docs/DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md` (Verweis; Inhalt unverändert), `.planning/REQUIREMENTS.md` (38 statt 25 Anforderungen, Traceability), `.planning/ROADMAP.md` (Phasenzuordnung, Abnahmefälle), `.planning/PROJECT.md`, `.planning/STATE.md`. Die Premium-Grenze „nach V1“ ist präzisiert: Plus Alpha als manueller achtwöchiger Testzugang; Billing nicht autorisiert.
- 2026-10-23: Startpaket unter `docs/startpaket/` aufgenommen. Architekturentscheidungen und weiterhin offene Punkte sind in `docs/startpaket/01-architektur.md` festgehalten; es wurde keine Entwicklung begonnen.
- 2026-10-23: Entwicklungsfreigabe durch den Founder erteilt; Umfang siehe `AGENTS.md`.
- Keine Umsetzung, keine Softwaretests; die Abnahmefälle D01–D15 sind Papierspezifikationen. Entwicklungsfreigabe siehe `AGENTS.md`.

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

**Nicht geprüft:** echte Organizer-Materialien/Nutzerverständnis, Softwarelaufzeit, Auth, Datenbank, Medienverarbeitung, Analytics, SEO-Ausgabe, Deployment und externe Dienste.

## Nächste autorisierte Aufgabe

Entwicklung ist ausschließlich im in `AGENTS.md` freigegebenen Umfang zulässig. Nächste fachliche Aufgabe: Gesamtdurchsicht des Datenvertrags v0.3 zusammen mit dem Produktdelta v0.4 und Discovery-Suchdetails; danach Rest-Specs (S9, Aufbewahrungsmatrix, Vorlagen-/Nachrichten-/Feedbackzustände) und Designs (Publishing-Flow, Profileditor D9, Eventgestaltung, Follow-/Einladungszustände D10, Besucher-Merkliste).

## Übergabeformat

Am Sessionende tatsächlichen Diff und passende Prüfungen dokumentieren, diesen Status knapp aktualisieren und Branch sowie Commit-/Push-/PR-Stand nennen. Notion nur gezielt für betroffene Produktentscheidungen abgleichen; dieses Dokument nicht zur zweiten Produktaufgabenliste ausbauen.
