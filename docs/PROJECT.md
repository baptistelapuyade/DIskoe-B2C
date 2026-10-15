# DISKOE B2C V1 — Projektgrundlage

**Stand:** 2026-10-15 (Scope-Erweiterung, Beschlüsse Q29–Q36/S3 sowie Notion-Übergabe mit Nachtrag und Datenvertrag-v0.3-Entwurf gegen Notion-Seiten des 15.10.2026 abgeglichen; kein Auto-Sync)
**Status:** Dokumentations- und Spec-Phase; Implementierung nicht begonnen.

## Ziel und Nutzer

DISKOE B2C V1 gibt kleinen Berliner Kulturveranstaltern und Kollektiven eine attraktive öffentliche Heimat, erleichtert wiederholtes Publishing und liefert sofort nutzbare Sharing-Mittel. Bestätigte Events bilden zugleich den Katalog für eine spätere Discovery-Webapp.

Primär richtet sich V1 an regelmäßig oder halbregelmäßig veranstaltende Kollektive, Offspaces sowie unabhängige Musik-, Film-, Ausstellungs- und Pop-up-Formate ohne überzeugende eigene Event-Website. Sekundär profitieren Besucher, die über geteilte Organizer-/Eventlinks kommen und klare Entscheidungsinformationen benötigen.

## Scope-Erweiterung 2026-10-15

Quelle zunächst Nutzerübergabe, danach direkt gelesene Notion-Beschlussseite vom 15.10.2026: DISKOE wird als persönliche digitale Heimat für unabhängige Kulturveranstalter ausgerichtet; begrenzte modulare Profile und ein früher E-Mail-Follow-Test sind vorgesehen, der bestätigte Eventkatalog bleibt gleichrangig. Q29–Q36 und die fünf S3-Entscheidungen sind **beschlossen** (Produktentscheidung, keine Entwicklungsfreigabe): [`PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md`](PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md). Vorschlagshistorie: [`SCOPE_EXTENSION_B2C_2026-10-15.md`](SCOPE_EXTENSION_B2C_2026-10-15.md). Die Abschnitte „Bestätigter V1-Scope" und „Festgelegte Grenzen" gelten weiter, soweit unten nicht als überholt markiert.

## Bestätigter V1-Scope

- Angebots-/Einstiegsseite mit heutigem Nutzen, kostenloser Alpha, Einrichtungshilfe, transparenter Katalogaufnahme und ehrlichem Webapp-Teaser.
- Sicherer Organizer-Zugang, Profilbearbeitung, Eventliste, Erstellen und Duplizieren; erste Publikation nach redaktioneller Prüfung.
- Öffentliche Organizer- und Eventseiten mit festen responsiven Vorlagen, drei Themes, Fallbacks und korrekten Status-/Leerzuständen. *(Überholt durch begrenzte modulare Profile mit drei Richtungen und einfarbigen Hintergründen, Q29/Q30; die Eventgestaltung ist unabhängig vom Profil, Q35; konkrete Designs offen.)*
- Erfassung aus Text und/oder bis zu drei Flyerbildern sowie manuelles Formular; editierbarer KI-Entwurf, adaptive Rückfragen, manuelle Korrektur und Bestätigung.
- Vorschau, Pflichtprüfung, Veröffentlichung, Änderung, Absage, Entfernung, Archivierung und konsistenter Katalogstand.
- Sharing über stabilen Link, Linkvorschau, Nachrichtentext und QR-Code. Story-Muster zunächst manuell testen.
- Kleine, bestätigte Organizer-Kuration vorhandener DISKOE-Events, zunächst betreut. *(Erweitert durch Q34: bis zu drei Events oder Organizerprofile mit persönlichem Kommentar und private Einladungen.)*
- Schlanke interne Redaktion und Messung von Aktivierung, Wiederveröffentlichung, Katalogbestand/-tiefe, Aufwand und Besucheraktionen.
- Automatische SEO-/GEO-Grundlagen für öffentliche Seiten und ein optionaler Reihenblock; keine Reichweiten- oder Rankinggarantie.

Der Kernflow lautet: berechtigter Organizer → Material/Angaben → Entwurf und gezielte Rückfragen → Korrektur/Vorschau → Bestätigung/Publikation → Teilen → Aktualisieren/Absagen → nächstes Event duplizieren.

## Festgelegte Grenzen

- Consumer-Discovery, persönliche Consumer-Sammlungen, Polls/Pläne, Teamrechte, externe Events in privaten Shortlists und Premium bleiben nach V1. *(Follow/Updates: pauschale Grenze überholt; E-Mail-Follow für neue Events mit Bestätigung/Abmeldung beschlossen, Q32/Q33; kein Consumerkonto, kein Feed.)*
- Kein freier Seiteneditor/Website-Builder (begrenzte Module sind davon unterschieden), kein Universalimport, Social-Autopublishing, eigenes Ticketing oder eigenes Audio-/Videohosting.
- Mehrtägige Ausstellungsöffnungszeiten, Festivals, mehrere Orte und komplexe Terminserien sind nicht der normale erste Eventausschnitt.
- Entwürfe sind nicht öffentlich. Keine Veröffentlichung ohne vollständige zutreffende Pflichtangaben, geklärte kritische Widersprüche und Bestätigung.
- Ein Ticketklick beweist keinen Kauf, ein Seitenbesuch keine Teilnahme und ein Share-Klick kein tatsächliches Teilen.

## Produkt- und Nachweisstand

- Outcome und V1-Arbeitsumfang sind dokumentiert; der frühere Hinweis „Pilotziele 5–8 Organizer, Beobachtungsfenster noch zu prüfen" ist durch Q36 präzisiert (erste betreute Lerngruppe, vier Wochen Beobachtung, keine Testerobergrenze).
- Q01–Q21 enthalten zahlreiche festgelegte Produktprinzipien; Specs S1–S6 bleiben insgesamt in Ausarbeitung, S7/S8 offen. Q29–Q36 und die fünf S3-Detailentscheidungen sind beschlossen. Offen bleiben Follow-Spec S9, Designs D1–D10 (u. a. D9 Profileditor, D10 Follow-/Einladungszustände), Discovery-Suchdetails, Gesamtabnahme des Datenvertrags v0.3, Betriebs-/Technikdetails und der neu zu schätzende Aufwand (alte 6–8 Wochen keine Zusage). Pilot: offene Registrierung ohne Testerlimit; 5–8 Organizer sind nur die erste betreute Lerngruppe (Q36).
- Figma enthält nutzbare Eventseiten, mobile Flows, Komponenten und Foundations, aber keinen fertigen B2C-Publishing-Ablauf.
- Vier n8n-Exporte liefern Fachlogik/Taxonomie, keinen fertigen Organizer-Workflow.
- Das DMO-Repo ist Referenz und enthält keine vorhandene B2C-Webapp.
- Dieses Repository enthält aktuell nur Dokumentation und Planung. Kein Code, Schema, Build, Test oder Deployment ist vorhanden.

## Zuständigkeit und Quellen

Produktentscheidungen, Outcome, Scope, offene Specs und Designs: Notion. Technische Verträge, Architektur, Implementierungsbelege und Arbeitsregeln: Repository. `docs/STATUS.md` ist die kurze technische Übergabe. Es existiert kein automatischer Notion-Sync.

- [Produktbeschlüsse Q29–Q36/S3 (lokale Lesefassung)](PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md)
- [Scope-Erweiterung (Vorschlagshistorie)](SCOPE_EXTENSION_B2C_2026-10-15.md)
- [Datenvertrag v0.3 (Entwurf, Lesefassung)](DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md)
- [Datenvertrag-Ergänzung A1](DATA_CONTRACT_B2C_V1_ADDENDUM_2026-10-15.md)
- [Outcome Brief](https://app.notion.com/p/3f9b1cce8b738139af3aca7cea84bcad)
- [Build, Specs & LLM-Übergabe](https://app.notion.com/p/3f9b1cce8b73813285dcd1df4ab0cbd5)
- [Strategischer Hintergrund](https://app.notion.com/p/3f9b1cce8b7381828767d03d0b310ca7)
- [Figma](https://www.figma.com/design/88JCSs3P0tMB3FsQnwBbrG/Event-Service-UX-UI?node-id=7-13)
- [DMO-Referenzrepo](https://github.com/baptistelapuyade/DISKOE-DMO)
- [Draft-PR zur Bestandsprüfung](https://github.com/baptistelapuyade/DISKOE-DMO/pull/1)

## Nächste Produktarbeit

Den Datenvertrag v0.3 gesamt durchsehen und die Discovery-Suchdetails ausarbeiten (Grundlogik beschlossen), danach Rest-Specs (u. a. S9, Aufbewahrungsmatrix). Anschließend den mobilen Publishing-Ablauf sowie Organizerprofil und Eventseite als zusammenhängenden Flow designen. Anwendung erst nach separater Autorisierung beginnen.
