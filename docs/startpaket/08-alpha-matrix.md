# DISKOE B2C — Alpha-Entscheidungsmatrix

2026-11-05 · Baptiste Lapuyade

## Kurzfassung

Dieses Dokument legt fest, was in die Alpha kommt, was schon gebaut ist und in welcher Reihenfolge wir bauen.

**Stand 05.11.2026:** Der Founder hat die Matrix gelesen, dem Umfang und der Wellenfolge zugestimmt und die erweiterte Entwicklungsfreigabe erteilt (Umfang und Grenzen: `AGENTS.md`, „Erweiterung 05.11.2026“; Übergabe: `docs/STATUS.md`). **Die Alpha wird erst nach Welle 6 geöffnet.** Die Matrix wird Punkt für Punkt mit dem Founder durchgegangen; die Spalten „Code-Stand“ und „Figma“ sind Bestandsaufnahmen vom 05.11., keine Abnahme. Dieselbe Fassung liegt in Notion unter „Build, Specs & LLM-Übergabe“. Bei Abweichung gilt das Repo (siehe `CLAUDE.md`).

Der Abschnitt „Neue Entscheidungen“ zeigt, was seit den Notion-Beschlüssen vom 22.10. dazugekommen ist. Die Matrix führt jede Funktion mit Quelle, Alpha-Status, Code-Stand, Figma-Stand und Voraussetzung. Der letzte Teil legt die Bau-Reihenfolge fest, die dem Weg des ersten echten Organizers folgt.

Kennzeichnung: **Beschlossen** = Entscheidung des Founders mit Quelle. **Vorschlag** = Empfehlung von Claude, noch zu bestätigen. **Offen** = braucht eine Entscheidung oder Prüfung.

## Neue Entscheidungen vom 05.11.2026

Der Founder hat heute entschieden, dass die Alpha das ganze Produktversprechen trägt: Netzwerk, Profil-Editor, Publikumsaufbau, KI-Erfassung und Plus-Test. Eingetragen in `AGENTS.md` und `docs/STATUS.md` am 05.11.2026.

| Entscheidung | Stand | Folge für Bau und Freigabe |
|---|---|---|
| Venue-Profil, Artist-Seiten, Einladungen und Profil-Editor (Module, Gestaltung) gehören in die Alpha. | Beschlossen, 05.11. | Das Datenmodell wächst um Person, Verknüpfung, Einladung, Ortsbindung, Module und Gestaltung. Braucht eine erweiterte Entwicklungsfreigabe. |
| Follow (Organizer-Abo), Änderungsabo pro Event, Kalenderexport und Merken gehören in die Alpha. | Beschlossen, 05.11. Notion nennt sie am 22.10. schon „Free in der Alpha“. | Die Sperre für Mails an Besucher ist am 05.11. für die Systemmails des Besucherablaufs aufgehoben (`AGENTS.md`). Dazu kommen Double-Opt-in, Abmeldelink, Einwilligungstexte und die Versandregeln (10:00 Uhr, gebündelt). |
| KI-Erfassung aus Flyer, Text und Link gehört in die Alpha. | Beschlossen, 05.11. Notion: einmal je Event, Free. | Freigegeben am 05.11. für Flyerbilder über das Google-Modell: Google-Startup-Guthaben 2.000 €, kein eigenes Kostenlimit (erwartet: wenige Euro), Region Frankfurt oder die beste wählbare EU-Region. Text- und Link-Import folgen später. Die Wahl des Google-Angebots (Region, Trainingsnutzung) bestimmt den Datenschutztext; Claude prüft sie beim Einrichten in Welle 2. |
| Go-to-Market: Seiten für Kollektive vorab per KI anlegen, das Kollektiv übernimmt sie. | Beschlossen als Weg, 05.11. | Passt zum bestehenden Modell: privater Entwurf, Zuordnung durch den Founder, Bestätigung durch den Organizer. Die Ansprache macht der Founder selbst, nicht das System. |
| Plus-Reservierungstest (D16–D18) gehört in die Alpha. Monetarisierung ist kein Nebengedanke. | Beschlossen, 05.11. Notion: gleich seit 22.10. | Keine Zahlung. Gespeichert werden E-Mail und Funktionsauswahl. Schwelle „4 von 20 aktiven Organizern“ ist nur ein Arbeitswert: Der Founder wirbt nicht auf eine bestimmte Zahl an Organizern hin und legt die Schwellen nach der tatsächlichen Zahl neu fest. |
| Impressum und Datenschutz werden erstellt, nicht ausgelassen. | Beschlossen, 05.11. | Claude entwirft sie aus den tatsächlichen Datenflüssen. Eine Prüfung vor dem ersten echten Organizer ist ein Vorschlag. |
| Die Bau-Reihenfolge folgt dem Weg des ersten echten Organizers. | Beschlossen, 05.11. | Siehe Abschnitt „Bau-Reihenfolge“. |
| Amazon SES ist im Produktionsmodus. | Fakt, seit 28.10. (Runbook `ses-production-access.md`) | Mails an beliebige Adressen sind technisch möglich. Offen bleibt die Zustellbarkeit (DMARC, Postfächer wie GMX). |

## Matrix

Die Gruppen folgen dem Weg des ersten Organizers. Alpha: **Ja** heißt in der Alpha, die Quelle steht dahinter. Code-Stand: „gebaut“ ist durch die Slice-Zusammenfassungen und `docs/STATUS.md` belegt, heute nicht neu geprüft. „Nicht belegt“ heißt: In den Repo-Dokumenten nicht gefunden. Figma nennt die Frame-Gruppe und den Status.

### 1. Zugang und Profil

| Funktion | Quelle | Alpha | Code-Stand | Figma | Offen oder Voraussetzung |
|---|---|---|---|---|---|
| E-Mail-Code-Login für Organizer | ACCESS-01, Slice 2 | Ja | gebaut, im Preview bestätigt | ORG-A, GELTEND | Zustellbarkeit (DMARC, GMX-Verzögerung vom 28.10.) |
| Organizerrechte nur durch Zuordnung des Founders | Delta v0.4 §14.1, Slice 1–3 | Ja | gebaut | INT-A, GELTEND | Für den Go-to-Market: Ablauf für vorab angelegte Profile prüfen |
| Profil „Veranstalter“ anlegen (Name, Kurzvorstellung, Slug, Link oder Kontakt, Bild) | PROFILE-02, Slice 3 | Ja | gebaut | ORG-A, GELTEND | Alpha bietet genau eine Bildart im Kopf (Delta v0.4) |
| Einreichen, Founder-Prüfung, Rückfrage, Freigabe, Systemmails | Slice 3, Erweiterung 27.10. | Ja | gebaut | ORG-D, NACH-A, GELTEND | Zustellbarkeit der Mails |
| Besucher-Login (gleicher E-Mail-Code) | ACCESS-04, Delta v0.4 | Ja | nicht gebaut | nicht belegt | Gehört zum Publikumsaufbau, siehe Gruppe 4 |

### 2. Event erfassen

| Funktion | Quelle | Alpha | Code-Stand | Figma | Offen oder Voraussetzung |
|---|---|---|---|---|---|
| Event manuell anlegen: Titel, Format, Beschreibung, Termin mit Zeitzone, Ort als Text, Preis, Zugang, Bild, Atmosphäre, konkrete Lückenprüfung | PUBLISH-01, Slice 4 | Ja | gebaut | ORG-B, GELTEND | Die Editor-UX-Punkte 1–8 aus dem Test stehen für die Design-Runde noch aus |
| Zusatzfragen je Format (Club, Vernissage, Film, Zugänglichkeit) | S3-Fragenpool, B13 | Ja | nicht belegt | ORG-C, GELTEND | Prüfen, was davon im Editor schon steckt |
| KI-Erfassung aus bis zu drei Flyern, Text und Link, mit adaptiven Rückfragen und manuellem Fallback | PUBLISH-01 bis 03, Featurematrix 22.10. | Ja, bestätigt 05.11. | nicht gebaut | ORG-B (Erfassung), GELTEND | Freigabe, Kostengrenze, Anbieter. Link-Import ist laut Notion der erste Kandidat zum Streichen |
| Duplizieren mit erneuter Prüfung | PUBLISH-06 | Ja | nicht belegt | nicht belegt | Slice 5 nennt „Weiteres Event anlegen“ als UX-seitig zu überdenken |
| Eventbild mit Bildbeschreibung (Pflicht zur Veröffentlichung) | Slice 4, Delta v0.4 | Ja | gebaut | ORG-94, GELTEND | – |

### 3. Veröffentlichen, pflegen, teilen

| Funktion | Quelle | Alpha | Code-Stand | Figma | Offen oder Voraussetzung |
|---|---|---|---|---|---|
| Vorschau, ausdrückliche Bestätigung, Veröffentlichen (nur ein bestätigter Stand wird öffentlich) | PUBLISH-04, Slice 5 | Ja | gebaut | ORG-D, GELTEND | – |
| Absagen, Verschieben mit und ohne neuen Termin, Datum ändern | PUBLISH-05, Slice 5 | Ja | teilweise: Absagen und Verschieben gebaut | NACH-C, GELTEND | Änderung von Ort und von Texten an einem live Event (NACH-B) ist laut Slice 5 nicht gebaut |
| Öffentliche Eventseite `/e/[slug]` mit Statuszuständen, JSON-LD, Sitemap | PUBLIC-02, PUBLIC-03, Slice 6 | Ja | gebaut, optisch noch nicht wie Figma | PUB-01, GELTEND | Screen-für-Screen-Abgleich mit dem Founder |
| Öffentliche Profilseite `/[slug]` mit kommenden Events und Leerzustand | PUBLIC-01, Slice 6 | Ja | gebaut | PUB-06, GELTEND | `PUB-06b` ist noch im alten Stil |
| Teilen per Systemdialog oder Link kopieren | SHARE-01 | Ja | gebaut | PUB-01 m–o, GELTEND | QR-Download und Textvarianten sind laut Notion Plus |
| Impressum und Datenschutzerklärung | Founder 05.11. | Ja, vor dem ersten Organizer | Platzhalterseiten | nicht belegt | Claude entwirft die Texte aus den echten Datenflüssen |

### 4. Publikum aufbauen

| Funktion | Quelle | Alpha | Code-Stand | Figma | Offen oder Voraussetzung |
|---|---|---|---|---|---|
| Follow: Besucher folgt einem Organizer per E-Mail, mit Bestätigungslink, Verwaltung und Abmeldung in jeder Mail | FOLLOW-01, Q32 | Ja, bestätigt 05.11. | nicht gebaut | PUB-17, GELTEND (Platzierung), Profilköpfe mit Follow | Freigabe für Mails an Besucher, Einwilligungstext, Missbrauchsbegrenzung |
| Automatische Hinweise: neue Events gebündelt, Änderung von Datum, Beginn und Ort, Absage | FOLLOW-02, Q33 | Ja, bestätigt 05.11. | nicht gebaut | Texte der Statusspalten im Design noch zu füllen | Versand 10:00 Uhr Europe/Berlin, 15-Minuten-Fenster, Entdopplung, Zustellprotokoll |
| Änderungsabo für ein einzelnes Event | FOLLOW-03, Delta v0.4 §5 | Ja, bestätigt 05.11. | nicht gebaut | PUB-18, ENTWURF | Wirkt wie Follow nur für ein Event. Geringer Hebel, deshalb spät bauen |
| Merken (privat, lokal, nach Login geräteübergreifend) | VISIT-01 | Ja, bestätigt 05.11. | nur deaktivierter Platzhalter auf der Eventseite | PUB-18, ENTWURF | Lokale Merkungen und Login-Sync |
| Kalenderexport (Datei für ein Event) | VISIT-02 | Ja, bestätigt 05.11. | nicht gebaut | PUB-18, ENTWURF | Ohne Mail, ohne Einwilligung, deshalb billig |
| Free-Grundzählungen: Aufrufe, Ticketlink-Klicks, bestätigte Abos | DIST-01 | Ja | nicht gebaut | nicht belegt | Datenschutzarme Messung, keine Unique-Personen |
| Mail-Grundlagen: Double-Opt-in, Abmeldelink, Versandprotokoll, Bounce- und Beschwerdebehandlung | Q32, `AGENTS.md` | Ja, Teil von Follow | nicht gebaut | – | DMARC, Zustellkennzahlen aus SES |

### 5. Netzwerk

Die Datenbank kennt heute nur das Profil „Veranstalter“. Alles in dieser Gruppe braucht neue Tabellen, Zugriffsregeln und Tests.

| Funktion | Quelle | Alpha | Code-Stand | Figma | Offen oder Voraussetzung |
|---|---|---|---|---|---|
| Verknüpfte Felder: Venue, Line-up und Co-Hosts auswählen oder neu anlegen | Delta v0.5 §2 | Ja, bestätigt 05.11. | nicht gebaut | D11, ENTWURF | Keine stille Zuordnung zu bestehenden Personen |
| Venue-Profil: Cover-Kopf, Ort und Zugang, Programm | Delta v0.5 §4 | Ja, bestätigt 05.11. | nicht gebaut | PUB-11, ENTWURF | Profiltyp nur durch den Founder wechselbar |
| Venue-Bestätigung des Orts (offen, bestätigt, abgelehnt, zurückgezogen) und Ortsstatus auf der Eventseite | Delta v0.5 §3 | Ja, bestätigt 05.11. | nicht gebaut | D12, PUB-07, ENTWURF | Ablehnung macht den Ort zu reinem Text |
| Ortsbindung per Einladung plus manuelle Bestätigung des Founders, Prüfseite | Delta v0.5 §4 | Ja, bestätigt 05.11. | Founder-Prüfseite für Profile gebaut, für Orte nicht | INT-B, ENTWURF | Ziel 2 Werktage |
| Einladungen als Link: Venue-Bestätigung, Artist-Übernahme, Empfehlung. 30 Tage gültig, kein Versand durch DISKOE | Delta v0.5 §5, Q34 | Ja, bestätigt 05.11. | nicht gebaut | D12, ENTWURF | Zuordnung erst nach Annahme und Founder-Bestätigung |
| Artist-Seiten: Name, Rolle, Termine, noindex, Entfernen-Link mit Sperreintrag | Delta v0.5 §6 | Ja, bestätigt 05.11. | nicht gebaut | PUB-08, PUB-09, ENTWURF | Seiten über Personen ohne deren Zustimmung: Schutzmaßnahmen laut Delta und Datenschutztext nötig |
| Artist-Übernahme („Das bin ich“) | Delta v0.5 §6 | Ja, bestätigt 05.11. | nicht gebaut | PUB-09, ENTWURF | Mail nur für diese Bestätigung |
| Briefing-Link je Event für Mitwirkende (Zeiten, Ort, Technik, ein Kontakt) | Delta v0.5 §7 | Ja, bestätigt 05.11. | nicht gebaut | D15, ENTWURF | Keine Gästeliste, läuft 24 Stunden nach Eventende ab |
| Hinweise an Venue-Follower bei bestätigten Venue-Events | Delta v0.5 §8 | Ja, nach Follow | nicht gebaut | nicht belegt | Hängt an Follow und am Einwilligungstext |

### 6. Profil-Editor

| Funktion | Quelle | Alpha | Code-Stand | Figma | Offen oder Voraussetzung |
|---|---|---|---|---|---|
| Fünf optionale Module: Manifest, Galerie (bis 6 Bilder), Musik (SoundCloud oder Spotify), Empfehlungen (bis 3, Kommentar bis 140 Zeichen), Archiv. Je eine Instanz, umsortierbar. Links und Kontakt am Ende | PROFILE-01, Q29, Q31, Q34 | Ja, bestätigt 05.11. | nicht gebaut | ORG-E, PUB-03, ENTWURF | Empfehlungen verlinken nur veröffentlichte Ziele und tragen den Einladungsweg |
| Gestaltung: drei Richtungen (Poster, Editorial, Mixtape), Farben, sechs Schriftpaare, Kontrast im Backend geprüft | PROFILE-01, Q30, Delta v0.5 §4.2 | Ja, bestätigt 05.11. | nicht gebaut | ORG-E, PUB-13, ENTWURF | Nur einfarbige Hintergründe. Erste Streichkandidatin, falls die Zeit knapp wird |
| Eventgestaltung: „wie Profil“ oder eigene Werte, feste Informationshierarchie | EVENTDESIGN-01, Delta v0.5 §4.3 | Ja, bestätigt 05.11. | nicht gebaut | nicht belegt | Hinweiskarte im Editor, Dialog mit Zahl betroffener Events |
| Profilköpfe je Typ: Veranstalter, Venue mit Cover, Artist mit Monogramm | Delta v0.5 §4.1 | Ja | nur Veranstalter gebaut | PUB-12, REGELN | – |

### 7. Monetarisierung

| Funktion | Quelle | Alpha | Code-Stand | Figma | Offen oder Voraussetzung |
|---|---|---|---|---|---|
| Plus-Reservierungstest: Preis- und Funktionsseite, Auswahl der drei wichtigsten Funktionen, Bestätigung, Rückzug, Liste für den Founder | Featurematrix 22.10., Beschluss 22.10. | Ja, bestätigt 05.11. | nicht gebaut | D16–D18, ENTWURF | Keine Zahlung. Schwelle und Frist sind Vorschläge. Einwilligungstext ist rechtlich nicht geprüft. Löschung 3 Monate nach der Entscheidung |
| Plus-Funktionen: Vorlagen, eigene Nachrichten, Befragung, Assistent mit 50 Läufen, QR-Download, Plus-Analytics | Delta v0.4 | Nein, erst nach der Auswertung des Tests | – | – | Notion schätzt 60–100 Stunden, ungeprüft |
| Testzugang, Checkout, Billing | PREMIUM-01, `AGENTS.md` | Nein | – | – | Manuelle Rechnung genügt laut Delta v0.4 |

### 8. Betrieb und Recht

| Funktion | Quelle | Alpha | Code-Stand | Figma | Offen oder Voraussetzung |
|---|---|---|---|---|---|
| Zustellbarkeit der Mails: DMARC-Eintrag, Test mit mehreren Postfachanbietern, SES-Kennzahlen | STATUS 28.10. | Voraussetzung für Follow | offen | – | Der Anmeldecode kam bei GMX erst nach Minuten |
| Produktionsumgebung für echte Organizer (eigenes Supabase-Projekt, eigener Amplify-Zweig, Indexierung per `SITE_INDEXING`) | `AGENTS.md` | Voraussetzung für den ersten Organizer | nur Preview mit Dev-Datenbank | – | Produktions-Deployment ist heute nicht autorisiert |
| Löschfristen und Aufbewahrung (unbestätigte Abos 7 Tage, Entwürfe 90 Tage Inaktivität u. a.) | DEL-01, Delta v0.4 §13 | Ja | nicht gebaut | – | Backup-Rotation des Anbieters prüfen |
| Messung und Alpha-Gate: Aktivierung, zweites Event, Veröffentlichung ohne Hilfe, Abos, Einladung bis Veröffentlichung | OPS-02, Q36 | Ja | nicht belegt | – | Erfolgsschwellen sind noch festzulegen |
| Fehlerüberwachung (Sentry, EU, ohne personenbezogene Daten) | Architektur | Ja | gebaut, im Preview aktiv | – | Fehler nach dem Einreichen eines Events beobachten |
| Rechtstexte: Impressum mit Anbieter, Anschrift und Kontakt, Datenschutz mit allen Datenflüssen (Supabase, Amplify, SES, Sentry, KI-Anbieter, Follow, Artist-Seiten) | Founder 05.11. | Voraussetzung für den ersten Organizer | Platzhalter | – | Angaben zum Anbieter liefert der Founder |

### 9. Nicht in der Alpha

Consumer-Discovery und Suche, eigenes Ticketing, Billing und Checkout, direkter WhatsApp-Versand, automatische Bildgenerierung, Teamrechte, Oberfläche für Reihenabos, freier Canvas oder Page-Builder, Audio- und Video-Hosting, Social-Autopublishing, Besucher-Premium. Quelle: `AGENTS.md`, `REQUIREMENTS.md` (Out of Scope). Der Plus-Funktionsumfang steht in Gruppe 7.

## Widersprüche zwischen den Quellen

Sieben Stellen widersprechen sich. Die Entscheidungen vom 05.11. lösen die ersten vier (Punkt 1 und 2 durch den Eintrag in `AGENTS.md`, Punkt 3 und 4 durch die Wellenfolge; `02-durchstich.md` trägt dafür einen Verweis). Die übrigen drei sind Aufräumarbeit und noch offen.

| Widerspruch | Quellen | Vorschlag zur Auflösung |
|---|---|---|
| Follow, Merken und Kalender sind laut Delta v0.5 §11 „Free in der Alpha“, stehen aber als „nicht im Durchstich“ und in `AGENTS.md` ist jede Mail an Besucher verboten. | Delta v0.5, `02-durchstich.md`, `AGENTS.md` | Durch die Entscheidung vom 05.11. gilt Delta v0.5. `AGENTS.md` wird um Mails an Besucher (Follow) erweitert, mit Umfang und Datum. |
| Live-KI auf Nutzerdaten ist „nicht autorisiert“, die Featurematrix nennt KI-Erfassung aber Free in der Alpha. | `AGENTS.md`, Featurematrix 22.10. | Beschlossen ist sie. Es fehlt nur die Entwicklungsfreigabe mit Kostengrenze. |
| Notion hat einen Stufenplan (Alpha 1, Alpha 2), der noch nicht entschieden ist. Heute kommt alles in die Alpha. | Aufwandsschätzung 22.10. | Die Reihenfolge nach dem Weg des Organizers ersetzt den Stufenplan. Notion wird entsprechend angepasst. |
| Die Reihenfolge der Folgeschichten im Repo (Gestaltung, KI, Follow, Netzwerk, Plus, Besucher) passt nicht zum Organizer-Weg. | `02-durchstich.md` | Neue Reihenfolge siehe nächster Abschnitt. `02-durchstich.md` wird nach der Bestätigung aktualisiert. |
| Figma-Sektionen heißen „nicht im Durchstich“. Das klingt nach „nicht in der Alpha“, meint aber nur „noch nicht gebaut“. | `03-screens-figma.md` | Sektionsnamen nach der Matrix umbenennen (Alpha, Welle, Status). |
| Künstlerseiten: „öffentlich erst nach Rechtsprüfung“ in der Featurematrix, „vorsichtiger Weg ohne Kanzlei“ im späteren Beschluss vom 22.10. | Featurematrix §2, Featurematrix §9 | Der spätere Beschluss gilt: erreichbar, noindex, Entfernen-Link, Bestätigung durch den Organizer. Prüfung bei Budget. |
| `SLICE-2-SUMMARY.md` nennt SES „nicht beantragt“. Das Runbook nennt den Produktionszugang seit 28.10. als erteilt. Notion-Seite „Umsetzungsstand“ vom 28.10. ist ebenfalls überholt. | Slice-Zusammenfassung, Runbook, Notion | Runbook gilt. Die beiden alten Stellen mit „überholt durch“ kennzeichnen. |

## Bau-Reihenfolge

Wir bauen so, wie der erste echte Organizer die Alpha durchläuft (beschlossen 05.11.). Jede Welle endet mit einem Gate, das der Founder am laufenden Preview abnimmt. Die Stunden stammen aus der Notion-Schätzung vom 22.10. (ungeprüft, vor dem Durchstich entstanden) und sind nur eine Größenordnung.

| Welle | Inhalt | Gate | Größenordnung laut Notion |
|---|---|---|---|
| 0. Vorbereitung, parallel | Erweiterte Entwicklungsfreigabe in `AGENTS.md`, Rechtstexte entwerfen, DMARC und Zustellbarkeit, Plan für die Produktionsumgebung, Matrix in das PRD übernehmen | Freigabe mit Datum und Umfang steht in `docs/STATUS.md` | keine Entwicklung |
| 1. Kernflow abnehmen | Screen für Screen mit dem Founder: ORG-A bis ORG-D, PUB-01, PUB-06, NACH-A bis NACH-C. Editor-UX-Punkte, Abnahme-Durchlauf | Founder nimmt den Kernflow ab, jeder Screen mit Figma-Vergleich | in Block A (120–190 h) enthalten |
| 2. KI-Erfassung und vorbereitete Seiten | Flyer, Text, Link zu Entwurf, Richtungsfragen, manueller Fallback, Zuordnung eines vorab angelegten Profils | Ein echter Flyer wird ohne Hilfe zur veröffentlichten Seite. Kostengrenze hält | in Block A enthalten, nicht einzeln geschätzt |
| 3. Publikum | Follow, automatische Hinweise, Kalender, Merken, Besucher-Login, Zählungen. Änderungsabo zuletzt | Follow läuft Ende zu Ende mit echten Postfächern (GMX, Gmail u. a.), Rechtstexte sind live | 50–85 h |
| 4. Plus-Reservierungstest | Preis- und Funktionsseite, Auswahl, Bestätigung, Liste für den Founder | Die vier Wochen Messung können starten | 8–14 h |
| 5. Netzwerk | Verknüpfte Felder, Venue-Profil mit Bestätigung und Ortsbindung, Einladungen, Artist-Seiten, Briefing-Link | Ein Event mit Venue und Line-up läuft vom Einladungslink bis zur Bestätigung | 82–141 h |
| 6. Profil-Editor | Module mit Empfehlungen, dann Gestaltung, dann Eventgestaltung | Ein Profil wird gestaltet, veröffentlicht und auf neue Events angewendet | 48–86 h |

**Beschlossen (Founder, 05.11.):** Die Wellen werden in dieser Reihenfolge umgesetzt. Die Alpha wird trotzdem erst nach Welle 6 geöffnet, weil das Coding meist schneller geht als geplant. Vor der Öffnung müssen Produktionsumgebung, Rechtstexte, Impressumsdaten und Zustellbarkeit stehen; das Produktions-Deployment braucht eine eigene Freigabe. Die Notion-Schätzung nennt selbst, dass sie nach dem ersten Durchstich neu geprüft werden soll. Die Neuschätzung ist fällig und kommt vor Welle 3.

## Entscheidungen und offene Punkte

Antworten des Founders vom 05.11.2026 auf die sieben Punkte der Entwurfsfassung:

- [x] **Reihenfolge der Wellen:** bestätigt, wie dargestellt (Follow vor Netzwerk).
- [x] **Erweiterte Entwicklungsfreigabe:** erteilt am 05.11.2026, Umfang und Grenzen in `AGENTS.md`.
- [x] **Google-KI-Angebot:** Google-Startup-Guthaben 2.000 €, kein Kostenlimit nötig (zu Beginn nur Flyerbilder, erwartet wenige Euro). Region: Frankfurt oder die beste wählbare EU-Region. Claude klärt Region und Trainingsnutzung beim Einrichten und dokumentiert beides für den Datenschutztext.
- [x] **Plus-Test:** Schwelle (Arbeitswert 4 von 20) und Frist werden nicht jetzt fixiert; der Founder legt sie nach der tatsächlichen Zahl aktiver Organizer neu fest. Kein Aktiv-Organizer-Ziel.
- [x] **Start der ersten echten Organizer:** nicht nach Welle 3 oder 4, sondern **erst nach Welle 6**.
- [ ] **Erfolgskriterien der Alpha (Messung nach Q36, Gate für Plus):** offen, später festzulegen. Was genau gemessen wird, wird dann entschieden.
- [x] **PRD:** Es gibt kein eigenes PRD-Cluster. Bild und Dokumente liegen in Notion, die technische Fassung im Repo-Markdown. Beide Stellen halten die Matrix fest: Repo `docs/startpaket/08-alpha-matrix.md`, Notion als Unterseite von „Build, Specs & LLM-Übergabe“.

Ergänzungen von Claude:

1. **Produktionsumgebung.** Das Preview läuft auf dem Dev-Projekt von Supabase. Für echte Organizer brauchen wir ein eigenes Produktionsprojekt, getrennte Zugänge und einen Plan für die Daten. Produktions-Deployment ist heute nicht autorisiert.
1. **Zustellbarkeit vor Follow.** Der Anmeldecode kam bei GMX erst nach Minuten. Bei Follow hängt das Wachstum an der Zustellung. DMARC und ein Test mit mehreren Postfächern kommen vor Welle 3.
1. **Neuschätzung.** Notion plant sie nach dem ersten Durchstich. Der steht, die 318–536 Stunden sind vor dem Bau entstanden.
1. **Ansprache der Kollektive.** Die vorab angelegten Seiten schickt der Founder persönlich. Bei Massenmails an Organisationen gelten eigene Regeln (UWG). Das ist keine Rechtsberatung, aber vor einer Welle von Erstkontakten sollte es geklärt sein.
1. **Vorab angelegte Seiten.** Sie bleiben private Entwürfe, bis der Organizer sie bestätigt. Das ist schon die Regel in `AGENTS.md` und muss im Ablauf der KI-Erfassung erhalten bleiben.
1. **Figma.** Nach der Entscheidung heißen viele Sektionen „nicht im Durchstich“. Sie sollten nach Welle und Alpha-Status umbenannt werden, damit die Screen-Liste je Welle stimmt.

## Quellen

Gelesen am 05.11.2026. Notion-Seiten sind vollständig abgerufen, Stand der Seiten jeweils 22.10.2026. Nicht neu gelesen: Datenvertrag v0.3, Delta v0.4 im Volltext und Delta v0.5 in Notion. Dafür gilt die Lesefassung im Repo.

- [Alpha-Featurematrix v0.1 (Entwurf), Notion](https://app.notion.com/p/401b1cce8b73815fab54c1c96e6bf38f)
- [Aufwandsschätzung Alpha v2, Notion](https://app.notion.com/p/401b1cce8b73810e9f8ae67056d2749d)
- [DISKOE B2C V1 — Build, Specs & LLM-Übergabe, Notion](https://app.notion.com/p/3f9b1cce8b73813285dcd1df4ab0cbd5)
- Repo `docs/startpaket/02-durchstich.md`, `05-module-und-gestaltung.md`, `06-delta-v0.5-lesefassung.md`, `03-screens-figma.md`
- Repo `.planning/REQUIREMENTS.md`, `docs/SCOPE_EXTENSION_B2C_2026-10-15.md`, Slice-Zusammenfassungen 1 bis 6 in `.planning/phases/04-durchstich/`
- Repo `docs/STATUS.md`, `AGENTS.md`, Runbooks `ses-production-access.md` und `system-mails.md`
