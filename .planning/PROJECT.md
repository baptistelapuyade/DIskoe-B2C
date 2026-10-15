# DISKOE B2C V1

## What This Is

Eine mobile-first Arbeitsgrundlage für kleine Berliner Kulturveranstalter: eigene Organizer-/Eventseiten, leichteres wiederholtes Publishing und teilbare Materialien. Bestätigte Events bilden zugleich den verlässlichen Katalog für eine spätere DISKOE-Discovery-Webapp.

Seit 2026-10-15 (Nutzerübergabe, kein direkter Notion-Abgleich) richtet sich die Produktrichtung auf eine persönliche digitale Heimat mit begrenzten modularen Profilen und frühem E-Mail-Follow-Test; der bestätigte Eventkatalog bleibt gleichrangig. Siehe `docs/SCOPE_EXTENSION_B2C_2026-10-15.md`.

## Core Value

Organizer können einen bestätigten Eventstand mit deutlich weniger Pflegeaufwand veröffentlichen, teilen und aktuell halten, während DISKOE nachvollziehbare Katalogdaten gewinnt.

## Requirements

### Validated

(None yet — no application has shipped.)

### Active

- [ ] Organizer können Profil und Evententwürfe geschützt vorbereiten und bestätigen.
- [ ] Der erste öffentliche Stand wird redaktionell freigegeben; spätere gültige Stände können selbst veröffentlicht werden.
- [ ] Öffentliche Organizer-/Eventseiten zeigen bestätigte Entscheidungsinformationen und korrekte Statuszustände.
- [ ] Text/Flyer und manuelle Eingabe führen über adaptive Rückfragen zu einem editierbaren Entwurf.
- [ ] Veröffentlichung, Änderung, Absage, Entfernung und Duplizieren bleiben versioniert und nachvollziehbar.
- [ ] Sharing über Link, Vorschau, Nachrichtentext und QR basiert auf bestätigten Daten.
- [ ] Kuration, Redaktion, Messung und SEO-/GEO-Grundlagen folgen den beschlossenen Grenzen.
- [ ] Organizer gestalten ein begrenzt modulares Profil als eigenen öffentlichen Auftritt (Ausgestaltung offen, Q29–Q31, Q35). *(Vorschlag, nicht freigegeben)*
- [ ] Besucher können einem Organizerprojekt per E-Mail folgen (kleiner Alpha-Test; Umfang offen, Q32–Q33, Q36). *(Vorschlag, nicht freigegeben)*

### Out of Scope

- Consumer-Discovery, persönliche Consumer-Sammlungen und Polls/Pläne — nach V1. (Pauschale Follow-Grenze durch Scope-Erweiterung 2026-10-15 überholt.)
- Teamrechte, Premium, externe Events in privaten Shortlists — nach V1.
- Freier Seiteneditor/Canvas/Website-Builder (begrenzte Module sind kein Seiteneditor), Universalimport, Social-Autopublishing, eigenes Ticketing und eigenes Audio-/Videohosting — ausdrücklich ausgeschlossen.
- Anwendungscode, Abhängigkeiten, Datenbank, Deployment und Live-Dienste — für die aktuelle Einrichtungsaufgabe nicht autorisiert.

## Context

Notion hält den aktuellen Outcome-, Scope- und Spec-Stand. Q01–Q21 enthalten weitgehend festgelegte Produktprinzipien, während Rest-Specs, vollständiger Fragenpool, Designs, S7-Architektur und S8-Pilot offen bleiben. Figma enthält wiederverwendbare Eventseiten/Komponenten/Tokens, aber keinen fertigen Publishing-Flow. DMO und n8n sind Fachreferenzen, keine vorhandene B2C-Laufzeit.

## Constraints

- **Authority:** Planung darf nicht automatisch in Implementierung übergehen.
- **Trust:** keine öffentlichen Entwürfe oder ungeprüften KI-Fakten.
- **Source of truth:** Produkt in Notion; Technik und Belege im Repo; kein automatischer Sync.
- **Greenfield:** Stack, Datenmodell, Auth, Hosting und Anbieter sind noch nicht gewählt.
- **Pilot:** geschlossene/betreute Berlin-Alpha; Zielwerte und Beobachtungsfenster noch zu prüfen.

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Frische B2C-Codebasis; DMO bleibt Referenz | Keine DMO-Ziele oder alten Phasen übernehmen | — Pending implementation |
| Ein bestätigter Stand für Seite, Katalog und Sharing | Konsistenz und nachvollziehbare Pflege | — Pending implementation |
| KI unterstützt, manueller Weg bleibt vollständig | Robustheit und Faktenkontrolle | — Pending implementation |
| Story-Grafik zuerst manuell validieren | Nutzung vor Automatisierung belegen | — Pending validation |
| GSD grob, interaktiv und ohne Auto-Advance | Planung unterstützen, Implementierungsfreigabe schützen | ✓ Configured |

## Evolution

Dieses Dokument wird an Phasen- und Milestone-Grenzen überprüft. Anforderungen werden erst nach Implementierung und echter Prüfung als validiert geführt; neue Produktentscheidungen werden zuerst in Notion und danach gezielt hier abgeglichen.

---
*Last updated: 2026-10-15 after scope extension documentation sync (user handover, no Notion comparison)*
