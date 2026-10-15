# Requirements: DISKOE B2C V1

**Defined:** 2026-10-14; extended 2026-10-15 (Nutzerübergabe, kein direkter Notion-Abgleich)
**Core Value:** Organizer veröffentlichen, teilen und pflegen bestätigte Events mit weniger Aufwand; DISKOE gewinnt nachvollziehbare Katalogdaten.

## v1 Requirements

### Angebot und Transparenz

- [ ] **OFFER-01**: Organizer versteht heutigen Seiten-/Publishing-/Sharing-Nutzen, eigenen Aufwand und die Grenzen der Alpha.
- [ ] **OFFER-02**: Organizer bestätigt vor Publikation den erklärten Daten-/Medienumfang für Seiten, Sharing und spätere DISKOE-Discovery.

### Zugang und Rechte

- [ ] **ACCESS-01**: Organizer kann sich per verifizierter E-Mail anmelden und private eigene Entwürfe verwalten.
- [ ] **ACCESS-02**: Die erste Publikation erfordert eine redaktionelle Organizer-/Inhaltsfreigabe; fremde Inhalte bleiben unzugänglich.
- [ ] **ACCESS-03**: Ein freigegebener Organizer kann gültige eigene Stände bestätigen, veröffentlichen, absagen und zurücknehmen.

### Profil und Events

- [ ] **PUBLIC-01**: Eine responsive Organizerseite zeigt Identität, Programm, optionale Reihe/Kuration, Archiv und ehrliche Leerzustände.
- [ ] **PUBLIC-02**: Eine responsive Eventseite zeigt bestätigte Entscheidungsinformationen, Herkunft/Aktualität und korrekte Aktiv-/Änderungs-/Absage-/Archivzustände.
- [ ] **PUBLIC-03**: Öffentliche Seiten besitzen stabile URLs und deterministische SEO-/strukturierte Daten aus dem sichtbaren bestätigten Stand.

### Erfassung und Publikation

- [ ] **PUBLISH-01**: Organizer kann ein Event per Text, bis zu drei unterstützten Flyerbildern oder vollständig manuell als privaten Entwurf anlegen.
- [ ] **PUBLISH-02**: Extraktion und adaptive Rückfragen markieren Pflichtlücken, Unsicherheit und Widersprüche ohne Fakten zu erfinden.
- [ ] **PUBLISH-03**: Organizer kann bei KI-Fehlern ohne Datenverlust manuell weiterarbeiten und eine Vorschau korrigieren.
- [ ] **PUBLISH-04**: Nur ein bestätigter vollständiger Versionsstand wird atomar öffentlich; Speichern oder Login publiziert nicht.
- [ ] **PUBLISH-05**: Änderung, Verschiebung, Absage, Entfernung und Archivierung folgen dem B2C-Datenvertrag.
- [ ] **PUBLISH-06**: Duplizieren erzeugt eine neue private Eventidentität und verlangt erneute Prüfung eventabhängiger Angaben.

### Profilgestaltung und Follow (Scope-Erweiterung 2026-10-15; Ausgestaltung offen, Vorschlagsstatus)

- [ ] **PROFILE-01**: Organizer kann ein begrenzt modulares öffentliches Profil (gewählte Gestaltungsrichtung, optionale Module, mobile Vorschau, gute Defaults) gestalten; Eventseiten übernehmen die Identität bei stabiler Informationshierarchie. Module, Limits und Anbieter sind offen (Q29–Q31, Q35).
- [ ] **FOLLOW-01**: Besucher kann einem Organizerprojekt per E-Mail mit Bestätigung, Verwaltung und Abmeldung folgen; Abodaten bleiben privat, Abonnenten erhalten keine Organizerrechte. Umfang, Versandregeln und Aufbewahrung sind offen (Q32, Q33, Q36).

### Sharing und Kuration

- [ ] **SHARE-01**: Ein veröffentlichter Eventstand liefert stabilen Link, bestätigte Linkvorschau, editierbaren Nachrichtentext und QR-Code.
- [ ] **SHARE-02**: Manuelle Story-Muster können mit realen freigegebenen Events getestet werden, ohne automatische Generierung vorauszusetzen.
- [ ] **CURATE-01**: Organizer kann eine bestätigte kleine Auswahl vorhandener DISKOE-Events mit eigener Urheberschaft zeigen; inaktive Empfehlungen verschwinden aus aktiven Flächen. Persönliche Kommentare werden ausdrücklich bestätigt und von eigenen Angeboten getrennt; Empfehlungen anderer Organizerprofile sind offen (Q34).

### Redaktion und Messung

- [ ] **OPS-01**: Interne Redaktion sieht Status/Datenlücken, kann Erstfreigabe bearbeiten und problematische Veröffentlichungen sperren/zurücknehmen.
- [ ] **OPS-02**: Messung trennt Aktivierung, tatsächliches Teilen, Wiederveröffentlichung, Katalogbestand/-tiefe, Aufwand und Besucheraktionen mit ihren Grenzen. Ergänzend (Q36 offen): Profilverwendung/-teilung, Gestaltungswiederverwendung, bestätigte Abos/Wiederkehr, Empfehlungswirkung, Betreuungsaufwand; Reichweite, Wiederkehr und Netzwerkeffekte getrennt.

## v2 / Later

- **DISC-01**: Öffentliche Consumer-Discovery und kontextuelle Suche.
- **CONSUMER-01**: Persönliche Consumer-Sammlungen und Polls/Pläne. (Follow-Test siehe FOLLOW-01; umfassendes Follow/Updates-Konsumerprodukt bleibt später.)
- **TEAM-01**: Mehrere Teamrollen pro Organizer.
- **EXT-01**: Externe Events in privaten Shortlists.
- **PREMIUM-01**: Monetarisierung/Premium nach validierter Wiederkehr. Richtungsnotiz: kostenloser Kern; Plus/Pro für Automatisierung, Kommunikation, Publikumsbeziehung, Analytics, Integrationen, Teamarbeit; keine Tarife, Preise, Limits oder Billing beschlossen.

## Out of Scope

| Feature | Reason |
|---|---|
| Freier Seiteneditor/Canvas/HTML-CSS/Website-Builder | Begrenzte Gestaltungsrichtungen und Module sind vorgesehen (PROFILE-01), freies Layout nicht. |
| Social Feed, Freundesgraph, Chat, Gästebuch, komplexes Empfehlungsmodell | Nicht Teil des Follow-Tests. |
| Universalimport/Instagram-Automation | Verlässlichkeit und Rechte sind für V1 nicht geklärt. |
| Social-Autopublishing | Sharing bleibt explizite Organizerhandlung. |
| Eigenes Ticketing | Bestehende Ticket-/RSVP-Ziele bleiben Hauptaktion. |
| Eigenes Audio-/Videohosting | Offizielle externe Links genügen für V1. |
| Anwendung/DB/Deployment in der Einrichtungsphase | Noch nicht autorisiert. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| OFFER-01 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |
| OFFER-02 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |
| ACCESS-01 | Phase 3 — Architektur und Lieferplanung | Pending; implementation unauthorized |
| ACCESS-02 | Phase 3 — Architektur und Lieferplanung | Pending; implementation unauthorized |
| ACCESS-03 | Phase 3 — Architektur und Lieferplanung | Pending; implementation unauthorized |
| PUBLIC-01 | Phase 2 — Zusammenhängendes Experience Design | Pending; implementation unauthorized |
| PUBLIC-02 | Phase 2 — Zusammenhängendes Experience Design | Pending; implementation unauthorized |
| PUBLIC-03 | Phase 3 — Architektur und Lieferplanung | Pending; implementation unauthorized |
| PUBLISH-01 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |
| PUBLISH-02 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |
| PUBLISH-03 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |
| PUBLISH-04 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |
| PUBLISH-05 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |
| PUBLISH-06 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |
| SHARE-01 | Phase 2 — Zusammenhängendes Experience Design | Pending; implementation unauthorized |
| SHARE-02 | Phase 2 — Zusammenhängendes Experience Design | Pending; implementation unauthorized |
| CURATE-01 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |
| FOLLOW-01 | Phase 1 — Produktvertrag und Fragenpool | Pending; proposal, details open; implementation unauthorized |
| PROFILE-01 | Phase 2 — Zusammenhängendes Experience Design | Pending; proposal, details open; implementation unauthorized |
| OPS-01 | Phase 3 — Architektur und Lieferplanung | Pending; implementation unauthorized |
| OPS-02 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |

**Coverage:** 21/21 V1 requirements (19 ursprünglich + PROFILE-01, FOLLOW-01) are mapped exactly once. No plan may execute automatically, and no implementation is authorized.

---
*Requirements defined: 2026-10-14 from current Notion build and outcome documents; PROFILE-01/FOLLOW-01 added 2026-10-15 from user handover (not compared with Notion)*
