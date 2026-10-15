# DISKOE B2C V1 — technischer Übergabestand

**Stand:** 2026-10-15
**Phase:** Repository-Grundlage, S3-Fragenpool, Scope-Erweiterung und Produktbeschlüsse Q29–Q36/S3 dokumentiert.
**Implementierung:** nicht begonnen und nicht autorisiert.

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

## Gelesene und geprüfte Quellen

- Notion: Outcome Brief, Build/Specs/LLM-Übergabe und strategischer Hintergrund, jeweils Stand 2026-10-14.
- DMO-Referenz: lokales `AGENTS.md`, `.cursor/rules/documentation.mdc`, `docs/PROJECT.md`, `docs/STATUS.md` und `.planning/`-Struktur; DMO-Arbeitsbaum blieb unverändert.
- Bestandsprüfung: Build-Q22 und Draft-PR-Link; der GitHub-Webabruf war in dieser Sitzung nicht direkt verfügbar, der lokale DMO-Stand und die Notion-Auditfassung waren zugänglich.
- Figma: Metadaten des Screen-Canvas `7:13`, der Foundations `4:11` und ein Übersichtsscreenshot. Keine vollständige Library-/Designabnahme.

## Bestätigt, offen und ungeprüft

**Bestätigt/dokumentiert:** V1-Scope R01–R12; zahlreiche Regeln Q01–Q21; separate Datenvertragslesefassung; manuelle Storyvalidierung; frische Codebasis.

**Beschlossen (2026-10-15):** Q29–Q36 (Module, Gestaltungsrahmen, Musik SoundCloud/Spotify, Follow, Versand-/Änderungs-/Absageregeln, Empfehlungen/Einladungen, Profilminimum mit Bildpflicht und unabhängiger Eventgestaltung, offene Alpha ohne Testerlimit) und die fünf S3-Detailentscheidungen. Produktentscheidungen, keine Entwicklungsfreigabe.

**Offen:** Discovery-Eignung und typisierter B2C-Datenvertrag, Follow-Spec S9, D1–D10 mobile Designs, Versandzeiten/Zeitzone/Kurzfristfälle, Einladungszuordnung, Offline-/Entfernungszustände, Medien-/Einwilligungs-/Freigabetexte, Aufbewahrung, technische Architektur Q23–Q25, Messschema/Betrieb, Pilotorganisation und neu zu schätzender Aufwand.

**Nicht geprüft:** echte Organizer-Materialien/Nutzerverständnis, Softwarelaufzeit, Auth, Datenbank, Medienverarbeitung, Analytics, SEO-Ausgabe, Deployment und externe Dienste.

## Nächste autorisierte Aufgabe

Keine Entwicklung starten. Nächste fachliche Aufgabe: Discovery-Eignung und separaten typisierten B2C-Datenvertrag ausarbeiten; danach Rest-Specs und Designs (Publishing-Flow, Profileditor D9, Eventgestaltung, Follow-/Einladungszustände D10).

## Übergabeformat

Am Sessionende tatsächlichen Diff und passende Prüfungen dokumentieren, diesen Status knapp aktualisieren und Branch sowie Commit-/Push-/PR-Stand nennen. Notion nur gezielt für betroffene Produktentscheidungen abgleichen; dieses Dokument nicht zur zweiten Produktaufgabenliste ausbauen.
