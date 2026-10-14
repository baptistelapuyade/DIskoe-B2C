# DISKOE B2C V1 — Architekturstand

**Stand:** 2026-10-14
**Status:** Architektur offen; keine technische Lösung ausgewählt oder implementiert.

## Nachgewiesene Ausgangslage

- Frische Codebasis: bei Einrichtung keine App, Abhängigkeiten, Migrationen, Tests oder Laufzeit vorhanden.
- Figma `7:13` enthält mobile Event-, Sharing-, Poll-, Shortlist- und Auth-Muster; `4:11` enthält Farb-, Abstands-, Radius-, Border-, Text- und Effekt-Foundations. Das sind Referenzen, kein fertiger B2C-Publishing-Flow und keine Codebibliothek.
- Vier n8n-Exporte liefern Fachlogik/Taxonomie, aber keinen fertigen Organizer-Workflow.
- Das DMO-Repo liefert Arbeitsregeln, Fachreferenzen und einen statischen Q22-Audit, jedoch keine bestehende B2C-Webapp.
- Keine bestehende Datenbank, Auth-Lösung, Hostingumgebung oder LLM-Laufzeit ist für dieses Repo nachgewiesen.

## Architekturelle Leitplanken

- Ein bestätigter öffentlicher Inhaltsstand versorgt Organizer-/Eventseiten, Katalog und Sharing; keine still divergierenden Eventkopien.
- Privater Bearbeitungsstand und öffentlicher bestätigter Stand müssen getrennt bleiben.
- Herkunft, Verarbeitung, Prüfung, Bestätigung, Status und Sichtbarkeit sind eigenständige Konzepte.
- Autorisierung wird serverseitig durchgesetzt; private Vorschau und Entwürfe sind zugriffsgeschützt. `noindex` ersetzt keinen Zugriffsschutz.
- KI ist optionaler Assistenzpfad. Manuelles Fertigstellen bleibt möglich, und verspätete KI-Ergebnisse überschreiben keine manuellen Korrekturen.
- Öffentliche SEO-/strukturierte Daten werden deterministisch aus dem bestätigten sichtbaren Stand erzeugt.
- Absage und Entfernung sind sichere, schnelle Statusaktionen; fremde Caches/Downloads werden nicht als synchron beherrschbar behauptet.
- Analytics enthält keine Login-Codes, privaten Rohantworten oder Uploadinhalte.

## Offene Entscheidungen vor Entwicklung

1. Web-Stack, Runtime und Hosting einschließlich Versionen und Lockfile.
2. Datenbank-/Speichermodell für Organizer, Ort, optionale Reihe, Event, Entwurf/Version, Freigabe, Medien, Kuration und Messereignisse.
3. Passwortloser E-Mail-Code, Sitzungen, Ratenbegrenzung und Recovery; erster redaktioneller Freigabeschritt.
4. Rollen-/Rechtematrix und Schutz vor Zugriff auf fremde Organizer oder private Entwürfe.
5. Medien-Upload, Transformation, Rechte-/Freigabebeleg, Entfernung, Cache und Backup-Aufbewahrung.
6. KI-Anbieter/-Grenze, strukturierte Extraktionsausgabe, Unsicherheit, Retry/Timeout, Kostenlimits und manueller Fallback.
7. Versions-/Publikationsatomarität, Absage/Entfernung, Duplizieren und Zeit-/Archivierungsjobs.
8. Analyticschema, Bot-/Testfilter, Attribution und Datenschutzgrenzen.
9. SEO-Metadaten, strukturierte Eventdaten, Sitemap, Crawler-/Trainingszugriff und Statusaktualisierung.
10. Teststrategie, Betriebsbeobachtung, Backup/Recovery und Deploymentweg.

## Vorläufige Systemgrenzen, keine Architekturentscheidung

Die Specs legen Domänengrenzen nahe: öffentliche Weboberfläche, geschützter Organizerbereich, interne Redaktion, Content-/Versionierungsdienst, Medienverarbeitung, optionale KI-Assistenz und Messung. Diese Aufteilung dient nur zur Prüfung von Verantwortlichkeiten. Konkrete Services, Frameworks, Tabellen oder Anbieter werden erst nach S7-Entscheidungen festgelegt.

## Nächster Architektur-Schritt

Erst nach Abschluss des formatabhängigen Fragenpools und der relevanten UI-/Statuszustände S7/Q23–Q25 ausarbeiten: Optionen vergleichen, Entscheidungen als ADR festhalten, Sicherheits-/Fehlerfälle und prüfbare vertikale Lieferpakete definieren. Vorher keine Architektur als fertig darstellen.
