# Requirements: DISKOE B2C V1

**Defined:** 2026-10-14; extended 2026-10-15 (Scope-Erweiterung, Q29–Q36/S3, Notion-Handoff); extended 2026-10-16 with Produktdelta v0.4 (Plus Alpha, Besucheridentität, Eventänderungsabo, eigene Nachrichten, Feedback, Vorlagen, Assistentenkontingent, Messung, Fristen). Product decisions only; no implementation authorized.
**Core Value:** Organizer veröffentlichen, teilen und pflegen bestätigte Events mit weniger Aufwand; DISKOE gewinnt nachvollziehbare Katalogdaten.

## v1 Requirements

### Angebot und Transparenz

- [ ] **OFFER-01**: Organizer versteht heutigen Seiten-/Publishing-/Sharing-Nutzen, eigenen Aufwand und die Grenzen der Alpha.
- [ ] **OFFER-02**: Organizer bestätigt vor Publikation den erklärten Daten-/Medienumfang für Seiten, Sharing und spätere DISKOE-Discovery.

### Paket, Testzugang und Rechte (Delta v0.4, Abschnitte 1–3, 13)

- [ ] **PLAN-01**: Plus Alpha ist ein achtwöchiger, manuell durch den Founder freigegebener Testzugang je Projekt (möglichst zwei echte Durchläufe, manuelle Verlängerung). Organizerbereich zeigt Testumfang, Enddatum und vorgesehenen Preis; Hinweis sieben Tage vor Ende und am Enddatum. Keine automatische Zahlung, keine automatische Umwandlung; Anfrage und manuelle Rechnung genügen. Preis 19 EUR/Monat bleibt Hypothese.
- [ ] **PLAN-02**: Zahlungs-, Buchungs-, Testfreigabe- und effektiver Funktionszustand sind getrennt. Downgrade auf Free erhält öffentliche Inhalte, Free-Funktionen, Kommunikationspakete und lesbare Plus-Auswertungen; pausiert neue Plus-Funktionen (Vorlagen, eigene Nachrichten, neue Befragungen, detaillierte Messung, neue Generierung), ohne Inhalte zu löschen.
- [ ] **ACCESS-04**: Ein gemeinsamer E-Mail-Code-Login für Besucher und Organizer. Organizerbereich nur bei bestehender berechtigter Zuordnung; Besucherregistrierung erzeugt kein Profil und keine Organizerrechte. Lokale Merkungen werden nach Login zur Übernahme angeboten und dedupliziert.

### Zugang und Rechte (Bestand)

- [ ] **ACCESS-01**: Organizer kann sich per verifizierter E-Mail anmelden und private eigene Entwürfe verwalten.
- [ ] **ACCESS-02**: Die erste Publikation erfordert eine redaktionelle Organizer-/Inhaltsfreigabe; fremde Inhalte bleiben unzugänglich.
- [ ] **ACCESS-03**: Ein freigegebener Organizer kann gültige eigene Stände bestätigen, veröffentlichen, absagen und zurücknehmen.

### Profil und Events

- [ ] **PUBLIC-01**: Eine responsive Organizerseite zeigt Identität, Programm, optionale Reihe/Kuration, Archiv und ehrliche Leerzustände.
- [ ] **PUBLIC-02**: Eine responsive Eventseite zeigt bestätigte Entscheidungsinformationen, Herkunft/Aktualität und korrekte Aktiv-/Änderungs-/Absage-/Archivzustände.
- [ ] **PUBLIC-03**: Öffentliche Seiten besitzen stabile URLs und deterministische SEO-/strukturierte Daten aus dem sichtbaren bestätigten Stand.

### Erfassung und Publikation

- [ ] **PUBLISH-01**: Organizer kann ein Event per Text, bis zu drei unterstützten Flyerbildern oder vollständig manuell als privaten Entwurf anlegen.
- [ ] **PUBLISH-02**: Extraktion und adaptive Rückfragen markieren Pflichtlücken, Unsicherheit und Widersprüche ohne Fakten zu erfinden. Atmosphäre ist Publikationspflicht (mindestens ein bestätigter Begriff oder eigene Beschreibung); Listening-Session braucht musikalisches Konzept und Besuchsmodus (Fragenpool B13, Nachtrag 2026-10-15).
- [ ] **PUBLISH-03**: Organizer kann bei KI-Fehlern ohne Datenverlust manuell weiterarbeiten und eine Vorschau korrigieren.
- [ ] **PUBLISH-04**: Nur ein bestätigter vollständiger Versionsstand wird atomar öffentlich; Speichern oder Login publiziert nicht.
- [ ] **PUBLISH-05**: Änderung, Verschiebung, Absage, Entfernung und Archivierung folgen dem B2C-Datenvertrag.
- [ ] **PUBLISH-06**: Duplizieren erzeugt eine neue private Eventidentität und verlangt erneute Prüfung eventabhängiger Angaben.
- [ ] **ASSIST-01**: Der KI-Assistent ist Plus-Funktion mit **50 erfolgreichen Läufen je Organizerprojekt in 30 Tagen** (gemeinsam über alle Events, Testverlängerung ohne Reset). Zwei Varianten aus einem Auftrag zählen als ein Lauf; Fehlschläge, manuelle Bearbeitung, Kopieren, Download und QR-Erstellung verbrauchen nichts. Erreichtes Limit pausiert nur die Generierung (Delta 9).

### Profilgestaltung, Follow und Einladungen (Produktentscheidungen 2026-10-15; Designs und Technik offen)

- [ ] **PROFILE-01**: Organizer gestaltet ein begrenzt modulares Profil: feste Identität und kommende Events, fünf optionale Module (Musik, Bilder/Flyer, Über uns/Manifest, Von uns empfohlen, vergangene Events; je eine Instanz, umsortierbar), Links/Kontakt am Ende, drei Richtungen (Poster, Editorial, Mixtape) mit kuratierten Paletten/Schriftkombinationen, nur einfarbige Hintergründe, mobile Vorschau (Q29/Q30). Musikslot SoundCloud oder Spotify mit Aktivierung und Linkfallback, kein Autoplay, kein Upload (Q31).
- [ ] **PROFILE-02**: Profil ist erst mit Projektname, Kurzvorstellung, eindeutiger URL, mindestens einem offiziellen Link oder Kontakt und einem Cover oder Anzeigebild veröffentlichbar; Änderungen bleiben privater Entwurf bis zur expliziten Veröffentlichung; Offline-Nehmen ist eine eigene Aktion ohne automatische Eventabsage (Q35). Sonderfälle offen.
- [ ] **EVENTDESIGN-01**: Eventseiten besitzen eine vom Profil unabhängige Gestaltung (Palette, vorgegebene Schriftkombination, optionaler Flyer/Cover) bei fester Informationshierarchie ohne Event-Moduleditor; „Profilgestaltung übernehmen" ist nur Starthilfe; Profiländerungen verändern bestehende Events nicht; Duplizieren übernimmt die Gestaltung; der verantwortliche Organizer ist verlinkt (Q35).
- [ ] **TPL-01**: Plus-Organizer können bis zu **fünf benannte Eventvorlagen je Projekt** aus eigenem Event oder neuem Entwurf anlegen und anwenden. Vorlagen enthalten wiederkehrende Angaben, Gestaltung und Medien; Datum, Titel, eventbezogene Angaben und Medien werden bei jeder Nutzung neu geprüft und bestätigt; Vorlagenänderung ändert keine bestehenden Events; alte Absagen, Freigaben, Empfänger und Feedback werden nicht übernommen. Free-Duplizieren bleibt unverändert (Delta 2, 13).
- [ ] **FOLLOW-01**: Besucher kann einem Organizerprojekt per E-Mail-Adresse folgen (Bestätigungslink, Verwaltung über zeitlich begrenzten Link, Abmeldung in jeder Mail, Missbrauchsbegrenzung); kein Consumerkonto, keine Organizerrechte, getrennt von DISKOE-Newsletter; Organizer sehen nur die bestätigte Aboanzahl (Q32).
- [ ] **FOLLOW-02**: Aktive Abonnenten erhalten neue veröffentlichte Events gebündelt (höchstens eine reguläre Ankündigung je Organizer in 24 Stunden, je Event und Abo einmal), gesonderte Updates bei Änderung von Datum/Beginn/Ort und bestätigter Absage; Tippfehler lösen nichts aus; Entwürfe, zurückgezogene und gesperrte Veröffentlichungen lösen nichts aus (Q33). Versand regulär 10:00 Europe/Berlin, 15-Minuten-Fenster für kurzfristige Events und wichtige Änderungen (Nachtrag 2026-10-15); Zustellmechanik, Deduplizierung und Zustellversuche offen.
- [ ] **FOLLOW-03**: Besucher kann ein einzelnes Event über „Über Änderungen informieren“ mit bestätigter E-Mail abonnieren (Eventänderungsabo). Es umfasst nur Termin, Beginn, Ort, Verschiebung und Absage; keine Erinnerung, kein Feedback, keine Organizerwerbung. Getrennt von Organizerabo und Merken; Beitritt ist eine bewusste Handlung und kein automatischer Eventalarm (Delta 5, Präzisierung Q33).

### Sharing und Kuration

- [ ] **SHARE-01**: Ein veröffentlichter Eventstand liefert stabilen Link, bestätigte Linkvorschau, editierbaren Nachrichtentext und QR-Code.
- [ ] **SHARE-02**: Manuelle Story-Muster können mit realen freigegebenen Events getestet werden, ohne automatische Generierung vorauszusetzen.
- [ ] **CURATE-01**: Organizer kann eine bestätigte kleine Auswahl vorhandener DISKOE-Events mit eigener Urheberschaft zeigen; inaktive Empfehlungen verschwinden aus aktiven Flächen. Persönliche Kommentare werden ausdrücklich bestätigt und von eigenen Angeboten getrennt (Q34).
- [ ] **CURATE-02**: Organizer kann bis zu drei veröffentlichte DISKOE-Events oder -Organizerprofile mit erforderlichem Kommentar empfehlen; vergangene, abgesagte und entfernte Ziele werden ausgeblendet; für fehlende Ziele entstehen ein privater Vormerk und ein selbst zu versendender Einladungslink, die Verknüpfung nach Registrierung bestätigt der Empfehlende (Q34). Einladungslink 30 Tage gültig; erneuerter Link deaktiviert den alten. Kein DISKOE-Versand an Fremde, keine Erinnerungen, keine Belohnungen.
- [ ] **MSG-01**: Plus-Organizer können eigene Nachrichten (Einladung, Erinnerung, Programminformation) zu einem eigenen veröffentlichten Event an berechtigte Projektabonnenten oder frühere Empfänger eines Events senden: Vorschau mit Empfängerzahl, bewusstes „Jetzt senden“, keine Terminplanung, keine Fremdwerbung. Limits: **max. eine Nachricht je Projekt und 24 Stunden, max. zwei je Event**; Zwecke und Empfängergruppen teilen das Kontingent. Automatische Eventhinweise und wichtige Änderungen zählen nicht (Delta 6).
- [ ] **FEED-01**: Plus-Organizer können je Event eine Befragung starten: Gesamtbewertung 1–5 (Pflicht), Freitext „beibehalten/verbessern“ (optional), optional eine Zusatzfrage (Freitext oder max. fünf Optionen). Nicht gelisteter Link ohne Login; Laufzeit sieben Tage ab erster Öffnung, max. 30 Tage, Fragen fest nach erster Antwort; Ergebnisse privat, Antworten zwölf Monate nach Schließung gelöscht; Feedbackanfrage als Ausnahme nach Eventende zählt zu MSG-01 (Delta 7, 10).

### Besuchsidentität und Merkungen

- [ ] **VISIT-01**: Besucher kann Events auf der Eventseite privat merken (ohne Dublette, ohne Login lokal mit Gerätehinweis, nach Login geräteübergreifend). Merkungen sind jederzeit entfernbar; vergangene und abgesagte Events werden markiert; Organizer erhalten keine Merker-Personenliste. Merken ist keine Marketingeinwilligung und keine Teilnahmezusage (Delta 4, 11).
- [ ] **VISIT-02**: Besucher kann ein einzelnes Event als Kalenderdatei exportieren; spätere Änderungen aktualisieren eine heruntergeladene Datei nicht automatisch (Delta 4).

### Redaktion und Messung

- [ ] **OPS-01**: Interne Redaktion sieht Status/Datenlücken, kann Erstfreigabe bearbeiten und problematische Veröffentlichungen sperren/zurücknehmen.
- [ ] **OPS-02**: Messung trennt Aktivierung, tatsächliches Teilen, Wiederveröffentlichung, Katalogbestand/-tiefe, Aufwand und Besucheraktionen mit ihren Grenzen. Ergänzend (Q36 beschlossen): Profilverwendung über den Testpost hinaus, Gestaltungswiederverwendung, zweites reales Event, Veröffentlichung ohne persönliche Hilfe, bestätigte Abos/Abmeldungen/Rückkehr, Einladung→Registrierung→Veröffentlichung, Betreuungsaufwand; Richtwerte nur als Lernsignale, Nenner sichtbar, Organizer sehen nur Aggregate; Reichweite, Wiederkehr und Netzwerkeffekte getrennt. Fragenpool-Lernen (S3): wöchentliche qualitative Prüfung, Antworten/Überspringen/Korrekturen/Abbruch/Zeit je Frage.
- [ ] **DIST-01**: Organizer sehen Free-Grundzählungen (Aufrufe, Ticketlink-Klicks, bestätigte Abos) und Plus-Auswertungen (Verlauf, Quellen, Abo-Bewegungen, Linkklicks, angenommene Sendungen, Befragungsergebnisse, Filter Zeitraum/Event/Quelle). Keine Unique-Personen, kein Öffnungstracking, Ticketklick ≠ Kauf, Merken ≠ Teilnahme, Feedback ≠ verifizierter Besuch; Downgrade pausiert neue Detailmessung ohne rückwirkende Rekonstruktion (Delta 12).
- [ ] **DEL-01**: Aufbewahrung und Löschung folgen den beschlossenen Produktfristen (Delta 13 und Datenvertrag v0.3, Abschnitt 13): unbestätigte Abos 7 Tage, Erfassungsrohmaterial 30 Tage, private Entwürfe 90 Tage Inaktivität plus 30 Tage nach Erinnerung, verworfene Einladungen 30 Tage, Fehlerlogs 30 Tage, individuelle Analytics 90 Tage, Befragungsantworten 12 Monate, Backupziel höchstens 30 Tage. Endgültige Event- und Kontolöschung über Founder-Support; öffentliches Zurücknehmen ist keine Löschung.

## v2 / Later

- **DISC-01**: Öffentliche Consumer-Discovery und kontextuelle Suche (Webapp als eigene spätere Phase; Katalogvorbereitung ist V1).
- **CONSUMER-01**: Persönliche Consumer-Sammlungen und Polls/Pläne. Umfassendes Follow-/Updates-Konsumerprodukt bleibt später; mehrere benannte Merklisten und öffentliches Teilen der gesamten Auswahl sind nicht Teil der Alpha.
- **SUB-01**: Reihenabo mit eigener Oberfläche (Modell erweiterbar, keine vollständige Funktion in V1; Delta 5).
- **TEAM-01**: Mehrere Teamrollen pro Organizer; Pro-Team, Mehrtermin und Automationsfolgen.
- **EXT-01**: Externe Events in privaten Shortlists.
- **PREMIUM-01**: Pro-Stufe und Monetarisierung nach validierter Wiederkehr. **Präzisiert (Delta 1):** Plus Alpha als achtwöchiger manueller Testzugang ist V1-Produktentscheidung (PLAN-01); Pro bleibt Roadmap mit Hypothesenpreis 39 EUR/Monat; Billing-Umsetzung, Preisvalidierung und Steuer-/Rechnungsausgestaltung sind nicht autorisiert.
- **PUSH-01**: Automatische Bildgenerierung für Story-Grafiken, Ticketing, direktes WhatsApp, Social-Autopublishing (ausdrücklich nicht Teil der Alpha).

## Out of Scope

| Feature | Reason |
|---|---|
| Freier Seiteneditor/Canvas/HTML-CSS/Website-Builder | Begrenzte Gestaltungsrichtungen und Module sind vorgesehen (PROFILE-01), freies Layout nicht. |
| Social Feed, Freundesgraph, Chat, Gästebuch, komplexes Empfehlungsmodell | Nicht Teil des Follow-Tests. |
| Hintergrundmuster, ganzseitiges Hintergrundbild, Schriftuploads, Modulstile, Animationen/Autoplay | In der Alpha ausgeschlossen (Q30); Muster höchstens spätere unbeschlossene Premiumoption. |
| Audio-Uploads, beliebige Embed-Codes, Musik auf Eventseiten, andere Anbieter als SoundCloud/Spotify als Player | Nicht beschlossen (Q31); andere Anbieter nur als normale Links. |
| Kontaktimport, DISKOE-Mails an fremde Organizer, Einladungserinnerungen/-belohnungen, Adressliste/Export für Organizer | In der Alpha ausgeschlossen (Q32/Q34). |
| Automatische Zahlung, Autoumwandlung, jährliche Vorauszahlung im ersten Test, Buchungsbutton für Pro | Delta 1, 13 (manuelle Rechnung; Pro nur geplant). |
| Zukünftige Terminplanung eigener Nachrichten, Kampagnen-Builder, Mailbuilder | Delta 6 (nur „Jetzt senden“). |
| Universalimport/Instagram-Automation | Verlässlichkeit und Rechte sind für V1 nicht geklärt. |
| Social-Autopublishing | Sharing bleibt explizite Organizerhandlung. |
| Eigenes Ticketing | Bestehende Ticket-/RSVP-Ziele bleiben Hauptaktion. |
| Eigenes Audio-/Videohosting | Offizielle externe Links genügen für V1. |
| Anwendung/DB/Deployment in der Einrichtungsphase | Noch nicht autorisiert. |

## Startvoraussetzungen vor produktiver Verarbeitung (keine Requirements, nicht beschlossen)

Diese Punkte sind vor einer produktiven Verarbeitung echter Organizer- oder Besucherdaten zu klären. Sie werden hier nicht stellvertretend entschieden.

- Aufbewahrung und Löschung: Einwilligungs-, Sperr- und Versandnachweise nach Aboende; nie veröffentlichte oder verwaiste Uploads; alte Inhaltsversionen; minimale Sperrinformationen; Löschkonzept für Befragungsschutzdaten.
- Backup: tatsächliche Anbieterfähigkeit für höchstens 30 Tage Rotation und Löschung nach Restore.
- Rechte- und Einwilligungstexte für Medien, Galerie, Eventbild, Follow, Besucherlogin und Eventänderungsabo.
- Anbieter und Betrieb: Geocoding mit Genauigkeitskriterium, E-Mail-Versand mit Zustellung und Deduplizierung, Medien-Verarbeitung, KI-Anbieter mit Kontingent- und Kostengrenzen, Kalenderdatei-Erzeugung.
- Steuer, Rechnung und Testangebot: Wirtschaftlichkeit, Angebotsbedingungen, Brutto/Netto (Plus 19 EUR, Pro 39 EUR nur Hypothesen).
- Technische Vertragsnormalisierung (Feldnamen, Enums, Längen- und Dateigrenzen, Tokens) und Gesamtabnahme des Datenvertrags v0.3 inkl. Delta v0.4.
- Architektur, Sicherheit, Betrieb, Messschema und Aufwandsschätzung (alte 6–8 Wochen keine Zusage; Follow-Schätzung 24–40 h nicht mehr belastbar).

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| OFFER-01 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |
| OFFER-02 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |
| PLAN-01 | Phase 1 — Produktvertrag und Fragenpool | Product rules decided (Delta 1, 13); billing/tax open; implementation unauthorized |
| PLAN-02 | Phase 1 — Produktvertrag und Fragenpool | Product rules decided (Delta 2, 3); technical entitlement model open |
| ACCESS-04 | Phase 1 — Produktvertrag und Fragenpool | Product rules decided (Delta 4, 13); login/token mechanics open |
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
| ASSIST-01 | Phase 1 — Produktvertrag und Fragenpool | Product rules decided (Delta 9); counting/cost/rate limits open; implementation unauthorized |
| SHARE-01 | Phase 2 — Zusammenhängendes Experience Design | Pending; implementation unauthorized |
| SHARE-02 | Phase 2 — Zusammenhängendes Experience Design | Pending; implementation unauthorized |
| CURATE-01 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |
| CURATE-02 | Phase 1 — Produktvertrag und Fragenpool | Product rules decided; assignment/states open; implementation unauthorized |
| MSG-01 | Phase 1 — Produktvertrag und Fragenpool | Product rules decided (Delta 6); recipient mechanics and quotas open; implementation unauthorized |
| FEED-01 | Phase 1 — Produktvertrag und Fragenpool | Product rules decided (Delta 7, 10); protection data and retention technical; implementation unauthorized |
| FOLLOW-01 | Phase 1 — Produktvertrag und Fragenpool | Product rules decided; designs/technical details open; implementation unauthorized |
| FOLLOW-02 | Phase 1 — Produktvertrag und Fragenpool | Product rules decided incl. send times (Nachtrag 2026-10-15); delivery mechanics open; implementation unauthorized |
| FOLLOW-03 | Phase 1 — Produktvertrag und Fragenpool | Product rules decided (Delta 5); designs open; implementation unauthorized |
| PROFILE-01 | Phase 2 — Zusammenhängendes Experience Design | Product rules decided; designs open; implementation unauthorized |
| PROFILE-02 | Phase 1 — Produktvertrag und Fragenpool | Product rules decided; special cases open; implementation unauthorized |
| EVENTDESIGN-01 | Phase 2 — Zusammenhängendes Experience Design | Product rules decided; designs open; implementation unauthorized |
| TPL-01 | Phase 2 — Zusammenhängendes Experience Design | Product rules decided (Delta 2, 13); designs open; implementation unauthorized |
| VISIT-01 | Phase 2 — Zusammenhängendes Experience Design | Product rules decided (Delta 4, 11); designs open; implementation unauthorized |
| VISIT-02 | Phase 2 — Zusammenhängendes Experience Design | Product rules decided (Delta 4); designs open; implementation unauthorized |
| OPS-01 | Phase 3 — Architektur und Lieferplanung | Pending; implementation unauthorized |
| OPS-02 | Phase 1 — Produktvertrag und Fragenpool | Pending; implementation unauthorized |
| DIST-01 | Phase 1 — Produktvertrag und Fragenpool | Product rules decided (Delta 12); granularity and provider open; implementation unauthorized |
| DEL-01 | Phase 3 — Architektur und Lieferplanung | Product deadlines decided (Delta 13, v0.3 Abschnitt 13); backup, provider and deletion concept open; implementation unauthorized |

**Coverage:** 38/38 v1 requirements (25 bisher + PLAN-01, PLAN-02, ACCESS-04, ASSIST-01, MSG-01, FEED-01, FOLLOW-03, TPL-01, VISIT-01, VISIT-02, DIST-01, DEL-01) are mapped exactly once. No plan may execute automatically, and no implementation is authorized.

**Verifikation:** Dokumentationsabgleich gegen Notion-Delta v0.4 (Lesefassung). Keine Softwaretests, keine Umsetzung.

---
*Requirements defined: 2026-10-14 from current Notion build and outcome documents; PROFILE-01/02, EVENTDESIGN-01, FOLLOW-01/02, CURATE-02 added 2026-10-15; Nachtrag 2026-10-15 präzisiert PUBLISH-02 und FOLLOW-02; Produktdelta v0.4 (2026-10-16) ergänzt PLAN-01/02, ACCESS-04, ASSIST-01, TPL-01, MSG-01, FEED-01, FOLLOW-03, VISIT-01/02, DIST-01, DEL-01 und präzisiert PREMIUM-01. Lesefassung: `docs/PRODUCT_DECISIONS_DELTA_V04_2026-10-16.md`.*
