# DISKOE B2C V1 — Projektgrundlage

**Stand:** 2026-10-15 (Scope-Erweiterung aus Nutzerübergabe, siehe unten; Notion nicht direkt abgeglichen)
**Status:** Dokumentations- und Spec-Phase; Implementierung nicht begonnen.

## Ziel und Nutzer

DISKOE B2C V1 gibt kleinen Berliner Kulturveranstaltern und Kollektiven eine attraktive öffentliche Heimat, erleichtert wiederholtes Publishing und liefert sofort nutzbare Sharing-Mittel. Bestätigte Events bilden zugleich den Katalog für eine spätere Discovery-Webapp.

Primär richtet sich V1 an regelmäßig oder halbregelmäßig veranstaltende Kollektive, Offspaces sowie unabhängige Musik-, Film-, Ausstellungs- und Pop-up-Formate ohne überzeugende eigene Event-Website. Sekundär profitieren Besucher, die über geteilte Organizer-/Eventlinks kommen und klare Entscheidungsinformationen benötigen.

## Scope-Erweiterung 2026-10-15

Nutzerübergabe aus dem Developer-Chat vom 15.10.2026, kein direkter Notion-Abgleich: DISKOE wird als persönliche digitale Heimat für unabhängige Kulturveranstalter ausgerichtet; begrenzte modulare Profile und ein früher E-Mail-Follow-Test sind vorgesehen, der bestätigte Eventkatalog bleibt gleichrangig. Details, Vorschläge und offene Fragen Q29–Q36: [`SCOPE_EXTENSION_B2C_2026-10-15.md`](SCOPE_EXTENSION_B2C_2026-10-15.md). Die Abschnitte „Bestätigter V1-Scope" und „Festgelegte Grenzen" gelten weiter, soweit unten nicht als überholt markiert.

## Bestätigter V1-Scope

- Angebots-/Einstiegsseite mit heutigem Nutzen, kostenloser Alpha, Einrichtungshilfe, transparenter Katalogaufnahme und ehrlichem Webapp-Teaser.
- Sicherer Organizer-Zugang, Profilbearbeitung, Eventliste, Erstellen und Duplizieren; erste Publikation nach redaktioneller Prüfung.
- Öffentliche Organizer- und Eventseiten mit festen responsiven Vorlagen, drei Themes, Fallbacks und korrekten Status-/Leerzuständen. *(Überholt durch begrenzte modulare Profile, siehe Scope-Erweiterung; Ausgestaltung offen, Q29/Q30.)*
- Erfassung aus Text und/oder bis zu drei Flyerbildern sowie manuelles Formular; editierbarer KI-Entwurf, adaptive Rückfragen, manuelle Korrektur und Bestätigung.
- Vorschau, Pflichtprüfung, Veröffentlichung, Änderung, Absage, Entfernung, Archivierung und konsistenter Katalogstand.
- Sharing über stabilen Link, Linkvorschau, Nachrichtentext und QR-Code. Story-Muster zunächst manuell testen.
- Kleine, bestätigte Organizer-Kuration vorhandener DISKOE-Events, zunächst betreut.
- Schlanke interne Redaktion und Messung von Aktivierung, Wiederveröffentlichung, Katalogbestand/-tiefe, Aufwand und Besucheraktionen.
- Automatische SEO-/GEO-Grundlagen für öffentliche Seiten und ein optionaler Reihenblock; keine Reichweiten- oder Rankinggarantie.

Der Kernflow lautet: berechtigter Organizer → Material/Angaben → Entwurf und gezielte Rückfragen → Korrektur/Vorschau → Bestätigung/Publikation → Teilen → Aktualisieren/Absagen → nächstes Event duplizieren.

## Festgelegte Grenzen

- Consumer-Discovery, persönliche Consumer-Sammlungen, Polls/Pläne, Teamrechte, externe Events in privaten Shortlists und Premium bleiben nach V1. *(Follow/Updates: pauschale Grenze überholt; früher E-Mail-Follow-Test vorgesehen, Umfang offen, siehe Scope-Erweiterung.)*
- Kein freier Seiteneditor/Website-Builder (begrenzte Module sind davon unterschieden), kein Universalimport, Social-Autopublishing, eigenes Ticketing oder eigenes Audio-/Videohosting.
- Mehrtägige Ausstellungsöffnungszeiten, Festivals, mehrere Orte und komplexe Terminserien sind nicht der normale erste Eventausschnitt.
- Entwürfe sind nicht öffentlich. Keine Veröffentlichung ohne vollständige zutreffende Pflichtangaben, geklärte kritische Widersprüche und Bestätigung.
- Ein Ticketklick beweist keinen Kauf, ein Seitenbesuch keine Teilnahme und ein Share-Klick kein tatsächliches Teilen.

## Produkt- und Nachweisstand

- Outcome und V1-Arbeitsumfang sind dokumentiert; Pilotziele von 5–8 Organizern und Beobachtungsfenster sind noch zu prüfen.
- Q01–Q21 enthalten zahlreiche festgelegte Produktprinzipien; Specs S1–S6 bleiben insgesamt in Ausarbeitung, S7/S8 offen. Neu und offen: Q29–Q36, Follow-Spec S9, Designs D9 (Profileditor) und D10 (Follow-Zustände). Die frühere Aufwandsschätzung ist für den erweiterten Scope neu zu prüfen.
- Figma enthält nutzbare Eventseiten, mobile Flows, Komponenten und Foundations, aber keinen fertigen B2C-Publishing-Ablauf.
- Vier n8n-Exporte liefern Fachlogik/Taxonomie, keinen fertigen Organizer-Workflow.
- Das DMO-Repo ist Referenz und enthält keine vorhandene B2C-Webapp.
- Dieses Repository enthält aktuell nur Dokumentation und Planung. Kein Code, Schema, Build, Test oder Deployment ist vorhanden.

## Zuständigkeit und Quellen

Produktentscheidungen, Outcome, Scope, offene Specs und Designs: Notion. Technische Verträge, Architektur, Implementierungsbelege und Arbeitsregeln: Repository. `docs/STATUS.md` ist die kurze technische Übergabe. Es existiert kein automatischer Notion-Sync.

- [Scope-Erweiterung (lokale Lesefassung)](SCOPE_EXTENSION_B2C_2026-10-15.md)
- [Datenvertrag-Ergänzung A1](DATA_CONTRACT_B2C_V1_ADDENDUM_2026-10-15.md)
- [Outcome Brief](https://app.notion.com/p/3f9b1cce8b738139af3aca7cea84bcad)
- [Build, Specs & LLM-Übergabe](https://app.notion.com/p/3f9b1cce8b73813285dcd1df4ab0cbd5)
- [Strategischer Hintergrund](https://app.notion.com/p/3f9b1cce8b7381828767d03d0b310ca7)
- [Figma](https://www.figma.com/design/88JCSs3P0tMB3FsQnwBbrG/Event-Service-UX-UI?node-id=7-13)
- [DMO-Referenzrepo](https://github.com/baptistelapuyade/DISKOE-DMO)
- [Draft-PR zur Bestandsprüfung](https://github.com/baptistelapuyade/DISKOE-DMO/pull/1)

## Nächste Produktarbeit

Q29 gemeinsam entscheiden: Module und kleinstes Profilangebot; danach Q30–Q36 und die fünf offenen S3-Entscheidungen. Anschließend den mobilen Publishing-Ablauf sowie Organizerprofil und Eventseite als zusammenhängenden Flow designen. Anwendung erst nach separater Autorisierung beginnen.
