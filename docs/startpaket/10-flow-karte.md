# 10 — Flow-Karte (Stand 09.11.2026)

**Status:** Entwurf, vom Founder noch nicht abgenommen. Stand 09.11.2026 abends: Die fehlenden Screens aus der ersten Lückenliste sind gezeichnet (Zeilen mit **neu 09.11.**). Die Karte beschreibt, wie die Screens der „ENTWURF v2“-Sections in Figma (Seite 20) zusammenhängen. Sie ist aus Frame-Namen, Beschriftungen der Schaltflächen und den Entscheidungen in `docs/STATUS.md` abgeleitet, **nicht** aus Prototyp-Verknüpfungen (die v2-Frames haben keine). Alles mit **⚠** ist in Figma nicht gezeichnet oder aus der Beschriftung nur vermutet und wird im Review entschieden. Die Karte ist Arbeitsgrundlage für Planung und Bauen, kein Vertrag; bei Widerspruch gelten die Entscheidungen in `STATUS.md` und die Verträge (`README.md`, Quellenrangfolge).

## So liest du die Karte
- **Eine Zeile ist ein Screen in einem Zustand.** Die Knoten-ID ist die des Desktop-Frames; der Mobil-Frame hat denselben Namen mit „Mobil“ (Founder-Bereich: nur Desktop).
- **Aktionen:** `Beschriftung → Ziel`. „Zurück“ (Navigationszeile) führt zum vorherigen Screen oder Schritt und steht nur, wenn es davon abweicht. Fehlerzustände behalten die Eingaben; „Noch einmal versuchen“ wiederholt die Aktion.
- **Bestätigen statt Dialoge:** Sperren, Absagen, Verwerfen, Einreichen sind eigene Seiten mit Bestätigung (UX-Framework), keine Dialoge.
- **Welle** nach `08-alpha-matrix.md`: W1 Kernflow, W2 KI-Erfassung, W3 Publikum, W4 Plus-Reservierungstest, W5 Netzwerk, W6 Profil-Editor. Die Founder-Bereiche werden in der Reihenfolge der Wellen gebaut.
- **Folgen** nennt Mails, Protokolleinträge und Regeln, die an dem Übergang hängen. Mails an Organizer und Besucher nur im Rahmen der Freigaben in `AGENTS.md`; „vom Anbieter angenommen“ heißt nie „zugestellt“.
- **Externe Ziele** (nicht v2, bleiben wie in Figma Seite 40): Eventseite `PUB-01a` (2643:9417), abgesagt `PUB-01b`, vorbei `PUB-01e`, Veranstalterprofil `PUB-06a` (2632:7096), nicht verfügbar `PUB-SPR-01` (3035:23979).

## Übergreifende Regeln für Übergänge
| Regel | Gilt für |
|---|---|
| **Zur Startseite** führt zur Organizer-Startseite im passenden Stand: Profil in Arbeit `ORG-103a`, Profil fertig ohne Event `103b`, bereit zum Einreichen `103c`, in Prüfung `103d`, Rückfrage `103e`, live `103f`, live mit Änderungen `103g`. | alle Organizer-Flows |
| **Später weitermachen** sichert den Entwurf und führt zur Startseite (Profil) bzw. `EVT-08` (Event). | Schrittfolgen Profil und Event |
| **Fehler beim Speichern oder Senden** bleibt auf dem Screen, Eingaben bleiben, „Noch einmal versuchen“. Es gibt nie einen stillen Verlust. | alle |
| **Antwortzustände** bleiben getrennt (`provided / unknown / not_applicable / skipped / unanswered`); ein unbekannter Preis wird nie „Frei“. | Event-Schritte, Eventseite |
| **Entwürfe sind nie öffentlich**; „teilen“ und „ansehen“ führen nur zu veröffentlichten Seiten. | Vorschau, Live |
| **Founder-Aktionen** haben Grund oder Bestätigung, einen Protokolleintrag und, wo Mail, eine Prüfung unmittelbar vor der Übergabe an SES (Abo, Stand, bisheriger Versand). | Founder-Bereich, Sperren |

---

## F1 · Zugang und Startseite (Block 1, W1)
Section „Flow 1 Block 1“ (2965:6020). ORG-01 und ORG-02 sind seit 09.11. in v2 gezeichnet (unteres Band der Section, Desktop und Mobil).

| Kennung | Knoten | Zustand | Aktionen → Ziel | Folgen |
|---|---|---|---|---|
| ORG-01 (neu 09.11.) | 3095:107 (Mobil 3095:122) | E-Mail eingeben | Code senden → `ORG-96`; Fehler → `ORG-95` | Anmeldecode per `MAIL-01` |
| ORG-95 | 2965:6022 | E-Mail ungültig | Code senden → `ORG-96` | Eingabe bleibt |
| ORG-96 | 2966:6134 | Code wird gesendet | (Warten) → `ORG-02` | |
| ORG-02 (neu 09.11.) | 3095:136 (Mobil 3095:153) | Code eingeben | Anmelden → Startseite je Stand, oder `ORG-100` ohne Profil; falsch → `ORG-97` | Sitzung beginnt |
| ORG-01b (neu 10.11.) | 3113:32849 (Mobil 3113:33084) | Code senden fehlgeschlagen | Noch einmal versuchen → `ORG-96` | Muster M2/M3 |
| ORG-02b (neu 10.11., Vorschlag) | 3113:33228 (Mobil 3113:33400) | Zu viele falsche Codes | Neuen Code senden → `ORG-98`; Andere E-Mail-Adresse → `ORG-01` | zehn Minuten (Founder 10.11.); Sperrlogik im Code |
| ORG-97 | 2965:6380 | Code falsch oder abgelaufen | Anmelden → Startseite; Neuen Code senden → `ORG-98`; Andere E-Mail-Adresse → `ORG-01` | |
| ORG-98 | 2966:6588 | Neuer Code gesendet | wie `ORG-97` | neue `MAIL-01` |
| ORG-99 | 2966:7038 | Link abgelaufen | Neuen Code senden → `ORG-96` | Link aus `MAIL-01` |
| ORG-100 | 2966:7314 | Angemeldet, noch kein Profil | Profil anlegen → `ORG-52` | |
| ORG-101 | 2966:7498 | Einladung vor der Anmeldung | Code senden → `ORG-96`, danach `ORG-02` → `ORG-102` | Einladungsmail ist nicht freigegeben, der Founder schickt den Link selbst |
| ORG-102 | 2965:6806 | Einladung: Entwurf übernehmen | Profil prüfen und ergänzen → `ORG-04` (Veranstalter) oder `ORG-07` (Venue); Das ist nicht mein Projekt → `ORG-102a` | Profil wird dem Login zugeordnet (`FDB-07`) |
| ORG-102a (neu 09.11.) | 3096:48599 (Mobil 3096:48635) | Nicht dein Projekt: bestätigen (Seite, kein Dialog) | Ja, das ist nicht mein Projekt → `ORG-102b`; Fehler → `ORG-102c`; Zurück zur Einladung → `ORG-102` | Rückmeldung an DISKOE; Protokolleintrag; DISKOE löscht den Entwurf (Vorschlag) |
| ORG-102b (neu 09.11.) | 3096:48669 (Mobil 3096:48705) | Rückmeldung gesendet | Eigenes Profil anlegen → `ORG-52`; Abmelden | Zugang bleibt bestehen, Profil wird nicht verknüpft |
| ORG-102c (neu 09.11.) | 3096:48739 (Mobil 3096:48775) | Senden fehlgeschlagen | Noch einmal versuchen → `ORG-102b`; Zurück zur Einladung | |
| ORG-103a | 2966:7696 | Startseite: Profil in Arbeit | Angaben ergänzen → `ORG-04` | |
| ORG-103b | 2966:7908 | Profil fertig, erstes Event fehlt | Erstes Event anlegen → `EVT-00a`; Profil ansehen → `ORG-06` | |
| ORG-103c | 2966:8194 | Bereit zum Einreichen | Vorschau ansehen und einreichen → `EIN-01a` | |
| ORG-103d | 2966:8406 | In Prüfung | Eingereichtes ansehen → `PRF-02` | |
| ORG-103e | 2966:8648 | Rückfrage von DISKOE | Angabe korrigieren → `RFG-01a`/`b` | |
| ORG-103f | 2965:7079 | Live | Profil teilen → `LIV-02`; Profil ansehen → `PUB-06a`; Weiteres Event anlegen → `EVT-00a` | |
| ORG-103g | 2966:8862 | Live, Änderungen bereit | Vorschau ansehen und veröffentlichen → `LPA-03a`; Profil ansehen → `PUB-06a` | |

Die Aktionen der Startseite stehen in Block 1 in Karten; die Beschriftungen oben stammen aus der Vorgängerfassung (ORG-A+) und sind im Review zu bestätigen. **Einstiege (neu 09.11.):** Auf allen sieben Startseiten-Zuständen steht unter der Profilkarte die Karte „Dein Bereich“ mit Zeilen: **Events** → `EVL-01a` (ab `103c`), **Profil bearbeiten** → `LPA-01a` (nur `103f`, `103g`), **Preise und Warteliste** → `PLS-01a` (alle Zustände, bei vorhandenem Eintrag `PLS-01b`). Beschriftungen sind Vorschläge.

## F2 · Profil anlegen (Block 2a, W1; Venue-Verknüpfung W5)
Section „Flow 1 Block 2a“ (2993:9017). Adresse nach der Freigabe nicht mehr änderbar (Hinweis in `ORG-03a`, `ORG-07`).

| Kennung | Knoten | Zustand | Aktionen → Ziel | Folgen |
|---|---|---|---|---|
| ORG-52 | 2993:14049 | Profiltyp wählen | Veranstalter-Profil anlegen → `ORG-03a`; Venue-Profil anlegen → `ORG-07` | |
| ORG-03a | 2993:10593 | Angaben, leer | Weiter zum Profilbild → `ORG-05a` (Fehler: `03b`, Adressformat `03c`, Adresse reserviert `03d`); Weiteren Link hinzufügen (bis fünf Links); Später weitermachen → Startseite `103a` | Entwurf gesichert, privat |
| ORG-03b / c / d | 2993:11019 / 3024:20262 / 3024:20394 | Fehler / Adresse falsch / reserviert | wie `03a` | Adresse reserviert aus Reservierungsliste |
| ORG-04 | 2993:11533 | Angaben, ausgefüllt | Weiter zum Profilbild → `ORG-05a` | |
| ORG-05a | 2993:11959 | Profilbild leer | Datei wählen → `05b` → Ausschnitt `05e` → gewählt `05c`; Weiter zur Vorschau → `ORG-06`; Zurück zu den Angaben → `ORG-04` | JPG/PNG/WebP bis 5 MB, mind. 400 × 400 |
| ORG-05b–g | 2993:12185, 12556, 12798, 3000:12572, 3004:15345, 15779 | lädt / gewählt / Fehler / Ausschnitt wählen (− +, Ausschnitt übernehmen) / zu klein / Ausschnitt nicht gespeichert | je nach Zustand weiter zu `05c`, `05e` oder wieder `05a`; „Noch einmal versuchen“ bei `05g` | Bildbeschreibung freiwillig |
| ORG-06 | 2993:13810 | Vorschau Profil | Weiter zum ersten Event → `EVT-00a`; Profil ohne Event einreichen → `EIN-01c`; Seite in voller Größe ansehen → `VOR-01a`; Profil teilen → im Entwurf nicht klickbar (Entwürfe sind privat) | Follow in der Vorschau nicht klickbar |
| ORG-07 / 07b | 2996:9943 / 3024:20526 | Venue Schritt 1 / Adresse vergeben | Weiter zu Ort und Zugang → `ORG-08a` | |
| ORG-08a / b | 2996:10473 / 10831 | Venue Schritt 2 leer / Fehler | Weiter zum Titelbild → `ORG-09a` | |
| ORG-09a–d | 2996:11382, 11626, 3000:12838, 3004:16521 | Titelbild leer / gewählt / Bildmitte / zu klein | Weiter zur Vorschau → `ORG-10` | |
| ORG-10 | 2996:11868 | Venue Vorschau | Weiter zum ersten Event → `EVT-00a`; Profil ohne Event einreichen → `EIN-01c` | |

## F3 · Erstes Event anlegen (Block 2b, W1; Material und KI W2)
Section „Flow 1 Block 2b“ (3010:11350). Weiter-Buttons sind nie deaktiviert; fehlende Pflichtangaben prüft erst `EIN-01`.

| Kennung | Knoten | Zustand | Aktionen → Ziel | Folgen |
|---|---|---|---|---|
| EVT-00a | 3014:14796 | Start: Material oder von Hand | Material hinzufügen → `00b`; Von Hand anlegen → `EVT-01a`; Später weitermachen → Startseite | |
| EVT-00b / c | 3014:15170 / 15532 | Material leer / Flyer und Text | Material auslesen → `00d`; Weiteres Bild hinzufügen (bis drei); Stattdessen von Hand eintragen → `EVT-01a` | Flyer an Google-Modell (Frankfurt), Hinweis zum Dienst |
| EVT-00d | 3013:14603 | Wird gelesen | Von Hand weitermachen → `EVT-01a`; Ergebnis → `00g`/`00h`; Fehler → `00e`/`00f` | |
| EVT-00e | 3013:14892 | Dienst nicht erreichbar | Noch einmal versuchen → `00d`; Von Hand eintragen → `EVT-01a` | |
| EVT-00f | 3013:15238 | Nichts erkannt | Anderes Material wählen → `00b`; Von Hand eintragen → `EVT-01a` | |
| EVT-00g / h | 3013:15586 / 3014:15912 | Ergebnis / Flyer und Text widersprechen sich | Angaben prüfen → `EVT-01d`; Material ändern → `00b` | Vorschläge sind nie bestätigt (kein Grün) |
| EVT-01a / b / c | 3010:11351 / 11815 / 12368 | Grundlagen leer / Fehler / ausgefüllt | Weiter zu Datum und Uhrzeit → `EVT-02a` | |
| EVT-01d | 3013:15981 | Grundlagen, Vorschläge aus Flyer | Passt so, weiter → `EVT-02d` | Bestätigung erst mit „Passt so“ |
| EVT-02a / b / c | 3010:12704 / 13210 / 13804 | Datum leer / Fehler / ausgefüllt | Weiter zum Ort → `EVT-03a` | UTC plus `Europe/Berlin` |
| EVT-02d | 3013:16509 | Datum, Vorschläge | Passt so, weiter zum Ort → `EVT-03a` | |
| EVT-03a / b | 3010:14310 / 14794 | Ort leer / Fehler | Weiter zu Preis und Zugang → `EVT-04a`/`b`/`c` je Auswahl | Venue-Verknüpfung erst W5 |
| EVT-04a / b / c | 3010:15366 / 15810 / 16252 | Festpreis / Preisspanne / Preis unbekannt | Weiter zum Eventbild → `EVT-05a` | Geld in Cent; unbekannt ≠ „Frei“ |
| EVT-04d / e | 3010:16677 / 3013:17125 | Fehler / Vorschläge aus Flyer | wie `04a`; `04e`: Passt so, weiter zum Eventbild | |
| EVT-04f–n (neu 09.11.) | 3100:2, 273, 555, 765, 999, 1257, 1537, 1817, 2097 (je mit Mobil) | weitere Preisformen: `04f` Kostenlos, `04g` Ab-Preis, `04h` Spende, `04i` Mindestspende, `04j` Online-Anmeldung (Link zur Anmeldung), `04k` Online-Ticket ausverkauft, `04l` Pflichtgebühren bekannt, `04m` Pflichtgebühren unbekannt, `04n` Link ungültig | wie `04a`: Weiter zum Eventbild → `EVT-05a` | Kostenlos wird ausdrücklich gewählt (leer ≠ kostenlos); Gebühren „unbekannt“ ist keine Aussage „keine Gebühren“; Verfügbarkeit nur für Online-Ticket; Linkfehler bleibt auf dem Screen |
| EVT-05a / b / c | 3010:17209 / 17434 / 17673 | Eventbild leer / gewählt / Fehler | Weiter zur Atmosphäre → `EVT-06a` | Bild nicht zugeschnitten, Bildbeschreibung freiwillig |
| EVT-06a / b | 3010:17989 / 18278 | Atmosphäre keine / ausgewählt | Weiter zu den freiwilligen Angaben → `EVT-07` | zehn Atmosphärebegriffe |
| EVT-07 | 3010:18544 | Mehr zum Abend (freiwillig) | Format Club, Vernissage oder Filmabend → `EVT-07b`/`c`/`d`; sonst Weiter zur Vorschau → `EIN-01a`; Überspringen → dasselbe | |
| EVT-07m-a (neu 09.11., Vorschlag) | 3109:31869 (Mobil 3109:33214) | Mehr zum Abend, modular: Club mit vorgeschlagenen Bausteinen | Weiteren Baustein wählen → `EVT-07m-b`; Weiter zur Vorschau / Überspringen → `EIN-01a` | ersetzt `EVT-07b`/`e`; Karten je Baustein, aufklappbar, Entfernen |
| EVT-07m-b (neu 09.11., Vorschlag) | 3109:32188 (Mobil 3109:33500) | Weitere Bausteine (Picker, nur vorgefertigte Bausteine) | Hinzufügen / Abbrechen → `EVT-07m-a` | Auswahl der noch nicht gewählten Bausteine |
| EVT-07m-c (neu 09.11., Vorschlag) | 3109:32379 (Mobil 3109:33680) | Vernissage, Pflichtbaustein „Besuchsmodus“ | wie `m-a` | ersetzt `EVT-07c`; Pflicht nicht entfernbar |
| EVT-07m-d (neu 09.11., Vorschlag) | 3109:32651 (Mobil 3109:33941) | Filmabend, Pflichtbaustein „Sprache und Untertitel“ fehlt | wie `m-a` | ersetzt `EVT-07d`; Fehlerhinweis, „Noch nicht bekannt“ erlaubt |
| EVT-07m-e (neu 09.11., Vorschlag) | 3109:33025 (Mobil 3109:34247) | Format ohne Vorschläge | Weiteren Baustein wählen → `EVT-07m-b` | leere Liste |
| EVT-07b / c / d (neu 09.11., Vorschlag) | 3102:2 / 3102:979 / 3102:1633 (je mit Mobil) | Zusatzfragen je Format: Club (5 freiwillige Fragen) / Vernissage (Besuchsmodus Pflicht, Besuchsfenster, Zeitbedarf) / Filmabend (Sprache und Untertitel Pflicht, Gesamtdauer) | Weiter zur Vorschau → `EIN-01a`; Überspringen → dasselbe | ersetzt die 12 Einzelfragen-Screens von `ORG-C`; Pflichtfragen mit „Noch nicht bekannt“ erlaubt, Überspringen erfüllt sie nicht (prüft `EIN-01`) |
| EVT-07e (neu 09.11.) | 3102:2307 (Mobil 3102:2735) | Club: „Teilweise stufenlos“ ohne Erklärung | wie `EVT-07b` | Ohne Erklärung bleibt die Frage offen |
| EVT-08 | 3010:19017 | Entwurf gesichert | Zum Entwurf → Schritt, an dem er stand (`EVT-01a` ff.); Zur Startseite → `103a`/`103b` | Entwurf privat, 90 Tage Inaktivität |
| EVT-09 | 3010:19342 | Speichern fehlgeschlagen (Serverfehler; gilt als Muster für alle Schritte) | Noch einmal versuchen → wiederholt; Später weitermachen → `EVT-09c` | |
| EVT-09a (neu 10.11.) | 3111:32643 (Mobil 3111:33387) | Speichert (Button „Speichere …“ gesperrt, Info-Hinweis) | Erfolg → nächster Schritt bzw. `EVT-08`; Fehler → `EVT-09`/`09b` | gilt als Muster für alle Schritte |
| EVT-09b (neu 10.11.) | 3111:33062 (Mobil 3111:33635) | Keine Verbindung (Warnhinweis, Eingaben bleiben) | Noch einmal versuchen → wiederholt; Später weitermachen → `EVT-09c` | |
| EVT-09c (neu 10.11., Vorschlag) | 3111:33192 (Mobil 3111:33723) | Ohne Sichern verlassen (Bestätigungsseite) | Zurück und noch einmal versuchen → Schritt; Trotzdem verlassen → Startseite | ehrlich: Eingaben des Schritts gehen verloren, keine lokale Browser-Sicherung |
| EVT-00i / j (neu 10.11.) | 3113:33505 / 3113:33711 (Mobil 3113:33612 / 3113:33886) | Material: Datei nicht verwendbar / zu viele Bilder | wie `EVT-00b`/`c` | Muster M5; Grenzen 5 MB, drei Bilder |
| EVT-03c (neu 10.11.) | 3113:35334 (Mobil 3113:35425) | Ort ausgefüllt | Weiter zu Preis und Zugang → `EVT-04a`/`b`/`c` | |
| EVT-05d / e / f (neu 10.11.) | 3113:34005 / 34306 / 34468 (Mobil 3113:34200 / 34391 / 34553) | Eventbild: lädt hoch / zu klein / falsches Format | wie `EVT-05a` | „zu klein“: 400 × 400 Pixel (Founder 10.11.) |
| EVT-07m-g (neu 10.11., Vorschlag) | 3113:34630 (Mobil 3113:34944) | Feld in Baustein fehlerhaft | wie `EVT-07m-a` | Muster Feldfehler |
| EVT-07m-f (neu 10.11., Vorschlag) | 3111:33877 (Mobil 3111:34036) | Baustein entfernt, Rückgängig | Rückgängig → Karte kehrt zurück | Schutz vor Datenverlust beim Entfernen |

## F4 · Einreichen, Prüfung, Rückfrage, Live (Block 2c, W1)
Section „Flow 1 Block 2c“ (3018:14952). Profil und erstes Event werden gemeinsam geprüft; Profil allein einreichen ist erlaubt.

| Kennung | Knoten | Zustand | Aktionen → Ziel | Folgen |
|---|---|---|---|---|
| EIN-01a | 3024:17561 | Prüfliste vollständig | Profil ändern → `ORG-04`; Event ändern → `EVT-01a`; Weiter zur Bestätigung → `EIN-02a`; Vorschau der Seiten ansehen → `VOR-01a` (Profil) und `VOR-01b` (Event) | |
| EIN-01b | 3024:18268 | Prüfliste mit Lücken (Badge „Fehlt“) | Profil/Event ändern; Atmosphäre ergänzen → `EVT-06a`; Nur das Profil einreichen → `EIN-01d` | |
| EIN-01c | 3018:16283 | Nur Profil (kein Event) | Profil ändern; Weiter zur Bestätigung → `EIN-02a`; Erstes Event anlegen → `EVT-00a` | |
| EIN-01d | 3024:18923 | Event nicht mitgeschickt | Profil ändern; Weiter zur Bestätigung → `EIN-02a` | |
| VOR-01a (neu 09.11.) | 3095:45904 (Mobil 3095:46270) | Vorschau Profil (privat) | Tab Event → `VOR-01b`; Zurück zur Prüfliste → `EIN-01x` bzw. Herkunft (`EVT-07`, `ORG-06`, `LPA-03a`) | Rahmen aus Hinweisleiste und Tabs um die echte Profilseite (`PUB-06a`); Follow, Teilen und Ticketlinks nicht klickbar; nur für den angemeldeten Organizer |
| VOR-01b (neu 09.11.) | 3095:46106 (Mobil 3095:46390) | Vorschau Event (privat) | Tab Profil → `VOR-01a`; Zurück → Herkunft | wie `VOR-01a`, um `PUB-01a` |
| EIN-02a / b / c | 3018:16738 / 16998 / 17238 | Bestätigung leer / ein Haken / beide | Zur Prüfung einreichen → `PRF-01a`/`b` (bei fehlenden Haken `EIN-02d`); Zurück zur Prüfliste → `EIN-01x` | zwei bewusste Bestätigungen; Eintrag in `publication_audit`; erscheint in `FND-01a` |
| EIN-02d / e | 3018:17482 / 17810 | Haken fehlen / Einreichen fehlgeschlagen | wie `02a`; `02e`: Noch einmal versuchen | |
| PRF-01a / b | 3020:15622 / 15898 | In Prüfung (Profil+Event / nur Profil) | Eingereichte Fassung ansehen → `PRF-02`; Einreichung zurückziehen → `PRF-03a`; `01b`: Erstes Event anlegen → `EVT-00a` | |
| PRF-02 | 3020:16224 | Eingereichte Fassung (privat) | Zurück zum Stand → `PRF-01`; Einreichung zurückziehen → `PRF-03a` | |
| PRF-03a | 3020:16731 | Zurückziehen bestätigen | Ja, zurückziehen → `PRF-03b`; Nein, in Prüfung lassen → `PRF-01`; Fehler → `03c`; schon entschieden → `03d` | Protokolleintrag |
| PRF-03b / c / d | 3020:17056 / 17452 / 17781 | erledigt / fehlgeschlagen / schon entschieden | `03b`: Profil bearbeiten → `ORG-04`, Event bearbeiten → `EVT-01a`, Zur Prüfliste → `EIN-01a`; `03d`: Zum Überblick → Startseite | |
| RFG-01a / b | 3021:16737 / 16973 | Rückfrage zum Event / Profil | Angabe korrigieren → `RFG-02a`; Eingereichte Fassung ansehen → `PRF-02` | Einstieg aus `MAIL-03` oder Startseite `103e` |
| RFG-02a / b | 3021:17209 / 17799 | Korrigieren (Ort) / Fehler | Weiter → `RFG-03a`; Zurück zur Rückfrage → `RFG-01` | |
| RFG-03a | 3021:18502 | Erneut einreichen | Erneut einreichen → `RFG-04` | zurück in `FND-01a` |
| RFG-04 | 3021:18732 | Erneut eingereicht | Eingereichte Fassung ansehen → `PRF-02` | |
| LIV-01a / b | 3021:18989 / 19365 | Live (Profil+Event / nur Profil) | Link kopieren → `LIV-02`/`03`; Profil ansehen → `PUB-06a`; Event ansehen → `PUB-01a`; Erstes Event anlegen (`01b`) → `EVT-00a` | `MAIL-02a`/`b` an den Organizer |
| LIV-02 / 03 | 3021:19669 / 20129 | Link kopiert / Kopieren fehlgeschlagen | wie `LIV-01`; `03`: Noch einmal kopieren | |
| ERR-01 … 05 | 3021:22158, 22274, 22390, 22574, 22758 | Sitzung abgelaufen / nicht gefunden / kein Zugriff / Serverfehler / abgemeldet | Neu anmelden, Wieder anmelden → `ORG-01`; Zur Startseite; Mit anderer Adresse anmelden → `ORG-01`; Noch einmal versuchen | |

**Founder-Seite der Prüfung (W1):** Kennzahlen und Zu-tun-Liste in `FDB-01`, Prüfungen in `FND-01a`/`FDB-08`.

| Kennung | Knoten | Zustand | Aktionen → Ziel | Folgen |
|---|---|---|---|---|
| FND-01a / b | 3021:20528 / 20728 | Prüfungen offen / leer | Prüfen → `FND-02a`/`b`; Zurück zur Startseite → `FDB-01` | |
| FND-02a / b | 3021:20790 / 21027 | Prüfen: Profil+Event / nur Profil (Entwürfe nicht lesbar) | Freigeben → `FND-04a`; Rückfrage stellen → `FND-03a`; Zur Liste → `FND-01a` | |
| FND-03a / b / c | 3021:21216 / 21361 / 21551 | Rückfrage stellen / Fehler / gesendet | Rückfrage senden → `FND-03c`; Abbrechen → `FND-02` | `MAIL-03` an den Organizer |
| FND-04a | 3021:21652 | Freigeben bestätigen | Jetzt freigeben → `FND-04b`; Noch nicht → `FND-02` | Profil und Event live, `MAIL-02a`/`b`; Adresse ab jetzt fix |
| FND-04b / c / d | 3021:21786 / 21887 / 22023 | Mail übergeben / fehlgeschlagen / nicht mehr möglich | `04c`: Mail erneut senden → `04b`; sonst Zur Liste → `FND-01a` | „übergeben“ ≠ „zugestellt“ |

Mails des Blocks: `MAIL-01` Anmeldecode (3021:22879, Direkt anmelden → Startseite), `MAIL-02a`/`b` Live (3021:22975 / 23069, Zu deinem Profil → `LIV-01`), `MAIL-03` Rückfrage (3021:23161, Rückfrage ansehen → `RFG-01`).

## F5 · Live-Profil ändern und veröffentlichen (Block 3, W1)
Section „Flow 1 Block 3“ (3027:18219). Änderungen an einem live Profil gehen ohne Prüfung durch; Adresse ist schreibgeschützt.

| Kennung | Knoten | Zustand | Aktionen → Ziel | Folgen |
|---|---|---|---|---|
| LPA-01a / b / c | 3027:18220 / 19061 / 19726 | Bearbeiten / Fehler / Speichern fehlgeschlagen | Änderungen speichern → `LPA-02`; Abbrechen → Startseite `103f` | Änderungen privat bis zur Veröffentlichung |
| LPA-02 | 3027:20358 | Gespeichert, privat | Vorschau ansehen und veröffentlichen → `LPA-03a`; Weiter bearbeiten → `LPA-01a` | |
| LPA-03a / b | 3027:20683 / 21131 | Änderungen ansehen / keine Änderungen | Ändern → `LPA-01a`; Änderungen veröffentlichen → `LPA-04a`; Änderungen verwerfen → `LPA-06a`; `03b`: Profil bearbeiten, Zur Startseite | |
| LPA-04a / b / c / d | 3027:21399 / 21609 / 21907 / 22209 | Bestätigen / Haken fehlen / fehlgeschlagen / Bild noch nicht öffentlich | Jetzt veröffentlichen → `LPA-05`; `04d`: Bild noch einmal veröffentlichen | zwei Bestätigungen; Protokolleintrag |
| LPA-05 | 3027:22510 | Veröffentlicht | Profil ansehen → `PUB-06a`; Zur Startseite → `103f` | |
| LPA-06a / b | 3027:22781 / 23053 | Verwerfen bestätigen / verworfen | Ja, verwerfen → `LPA-06b`; Nein, behalten → `LPA-03a` | |

## F6 · Eventliste und Eventverwaltung (Flow 2 A, W1)
Section (3045:32021). ⚠ Der Einstieg zur Eventliste von der Startseite ist nicht gezeichnet.

| Kennung | Knoten | Zustand | Aktionen → Ziel | Folgen |
|---|---|---|---|---|
| EVL-01a | 3045:32022 | Kommende Events | Verwalten → `EVM-01x` je Zustand des Events; Weiter bearbeiten → `EVT-01a` (Entwurf); Neues Event anlegen → `EVT-00a` | Suche, Filter, 25 je Seite |
| EVL-01b | 3045:32730 | Noch kein Event | Erstes Event anlegen → `EVT-00a` | |
| EVL-01c | 3045:32856 | Keine Treffer | Filter zurücksetzen → `EVL-01a` | |
| EVL-01d | 3045:33098 | Alle Zustände | wie `01a`; Nachricht ansehen → `SPR-01b` | |
| EVL-01e / f / g | 3045:33952 / 34330 / 34551 | Lädt nicht / lädt / Seite 1 von 3 | Noch einmal laden; Pager | |
| EVM-01a | 3045:35268 | Live | Eventseite ansehen → `PUB-01a`; Bearbeiten → `EVB-01a`; Verschieben → `EVV-01a`; Absagen → `EVA-01a`; Link kopieren (inline); Als neues Event kopieren → `EVM-02a`; Hinweise an Follower → `HNW-03a` | Plus: „Gespeicherte Eventvorlagen“ ⚠ nicht gezeichnet |
| EVM-01b | 3045:35850 | Live mit privaten Änderungen | Änderungen prüfen und veröffentlichen → `EVB-03a`/`b`/`c`; Änderungen verwerfen → `EVB-06a`; Hinweise → `HNW-03a` | |
| EVM-01c | 3045:36319 | Privater Entwurf | Weiter bearbeiten → `EVT-01a`; Entwurf verwerfen → `EVB-07a` | |
| EVM-01d | 3045:36818 | Abgesagt | Neuen Termin setzen → `EVV-06a`; Eventseite ansehen → `PUB-01b` | |
| EVM-01e | 3045:37108 | Von DISKOE ausgeblendet | Nachricht ansehen und antworten → `SPR-01b` | siehe F11 |
| EVM-01f | 3045:37381 | Vorbei | Als neues Event kopieren → `EVM-02a`; Eventseite ansehen → `PUB-01e` | |
| EVM-02a / b | 3045:37593 / 37840 | Kopieren bestätigen / Entwurf angelegt | Entwurf anlegen → `EVM-02b`; Abbrechen → `EVM-01`; Datum setzen → `EVT-02a`; Zur Eventliste → `EVL-01a` | Kopie ist privater Entwurf (Free) |

## F7 · Live-Event bearbeiten (Flow 2 B, W1; Hinweise W3)
Section (3072:265).

| Kennung | Knoten | Zustand | Aktionen → Ziel | Folgen |
|---|---|---|---|---|
| EVB-01a / b / c | 3047:24850 / 25639 / 26348 | Bearbeiten / Angabe fehlt / Speichern fehlgeschlagen | Änderungen speichern → `EVB-02`; Abbrechen → `EVM-01a` | |
| EVB-02 | 3047:26976 | Gespeichert | Änderungen prüfen → `EVB-03a`/`b`/`c`; Weiter bearbeiten → `EVB-01a` | |
| EVB-03a / b / c | 3047:27301 / 27615 / 27915 | „Das ändert sich“: mit Hinweis an Follower / nur Text und Bild / keine Änderungen | Weiter zur Bestätigung → `EVB-04a` bzw. bei Hinweis und Followern `HNW-01a`–`g`; Weiter bearbeiten → `EVB-01a`; `03c`: Zur Eventverwaltung → `EVM-01a` | |
| EVB-04a / b / c | 3047:28183 / 28427 / 28755 | Bestätigen / Haken fehlen / fehlgeschlagen | Jetzt veröffentlichen → `EVB-05`; Zurück zur Prüfung → `EVB-03` | Protokolleintrag; bei Hinweis: Follower-Mail nach Regel F9 |
| EVB-05 | 3047:29091 | Veröffentlicht | Eventseite ansehen → `PUB-01a`; Zur Eventverwaltung → `EVM-01a` | |
| EVB-06a / b | 3047:29359 / 29663 | Änderungen verwerfen bestätigen / verworfen | Änderungen verwerfen → `EVB-06b`; Abbrechen → `EVM-01b`; `06b` → `EVM-01a` | |
| EVB-07a / b | 3047:29867 / 30139 | Entwurf verwerfen bestätigen / verworfen | Entwurf verwerfen → `EVB-07b`; Abbrechen → `EVM-01c`; `07b` → `EVL-01a` | |

## F8 · Verschieben und Absagen (Flow 2 C, W1; Hinweise W3)
Section (3072:266).

| Kennung | Knoten | Zustand | Aktionen → Ziel | Folgen |
|---|---|---|---|---|
| EVV-01a / b | 3061:25924 / 26651 | Verschieben, Ersatztermin steht fest / Datum in der Vergangenheit | Termin verschieben → `EVV-04a`; Termin steht noch nicht fest → `EVV-02a` | Hinweis an Follower, `MAIL-08a` |
| EVV-02a / b | 3061:27298 / 27588 | Ohne neuen Termin / fehlgeschlagen | Ohne Termin verschieben → `EVV-04b`; Ersatztermin steht fest → `EVV-01a`; `02b`: Noch einmal versuchen | `MAIL-08d` |
| EVV-04a / b | 3061:28154 / 28462 | Ersatztermin veröffentlicht / Neuer Termin folgt | Zur Eventverwaltung → `EVM-01a`; Eventseite ansehen → `PUB-01c`/`d`; `04b`: Ersatztermin eintragen → `EVV-05a` | |
| EVV-05a / b | 3061:28738 / 29221 | Ersatztermin eintragen / eingetragen | Termin eintragen → `EVV-05b`; Zur Eventverwaltung → `EVM-01a` | `MAIL-08a` |
| EVV-06a / b | 3061:29421 / 29966 | Absage zurücknehmen, neuen Termin setzen / Event wieder geöffnet | Event wieder öffnen → `EVV-06b`; Zur Eventverwaltung → `EVM-01a` | |
| EVA-01a / b / c | 3061:30166 / 30490 / 30810 | Absagen bestätigen / Haken fehlt / fehlgeschlagen | Event absagen → `EVA-02`; Nicht absagen → `EVM-01a` | `MAIL-08c` |
| EVA-02 | 3061:31134 | Abgesagt, veröffentlicht | Zur Eventverwaltung → `EVM-01d`; Neuen Termin setzen → `EVV-06a` | Eventseite zeigt „Abgesagt“ (`PUB-01b`) |

## F9 · Hinweise an Follower, Hilfe, Mails (Flow 2 E, W3)
Section (3072:267). Regeln (STATUS 09.11.): Standard gebündelt um 10:00 Uhr `Europe/Berlin`; mehrere Änderungen ergeben einen Hinweis, eine zurückgenommene Änderung keinen; dringend (Beginn unter 24 h, Arbeitswert) sofort nach 15 Minuten Puffer; Wahl „Stattdessen sofort senden“; höchstens ein Sofort-Hinweis je Event in 24 h; Ruhezeit 22:00 bis 07:00 → 07:00; Absagen naher Events sind von der Grenze ausgenommen (Vorschlag).

| Kennung | Knoten | Zustand | Aktionen → Ziel | Folgen |
|---|---|---|---|---|
| HNW-01a–g | 3067:27082, 27504, 28003, 28429, 28888, 29330, 29768 | Veröffentlichen mit Hinweis: 10:00 / sofort gewählt / Termin nah (automatisch sofort) / Sofort-Hinweis verbraucht / Ruhezeit nachts / schon geplant / noch keine Follower | Änderungen veröffentlichen → `HNW-02a`/`b`/`c`; Zurück zur Prüfung → `EVB-03a`; Wann bekommen Follower Bescheid? → `HLP-01a` | Hinweis wird geplant; Prüfung unmittelbar vor SES (Abo, Stand, bisheriger Versand) |
| HNW-02a / b / c | 3067:30158 / 30503 / 30815 | Veröffentlicht: 10:00 / sofort / nach der Ruhezeit | Zur Eventverwaltung → `EVM-01a`; Hilfe → `HLP-01a` | |
| HNW-03a / b / c | 3067:31127 / 31413 / 31681 | Verlauf (Zeitleiste) / leer / nicht übergeben | Zur Eventverwaltung → `EVM-01a`; Hilfe → `HLP-01a` | Einstieg aus `EVM-01a`/`b` |
| HLP-01a | 3067:32028 | Hilfeseite „Wann bekommen Follower Bescheid?“ | Zur Eventverwaltung → `EVM-01a` | Teil der Alpha (Support) |
| MAIL-12 (neu 09.11.) | 3102:14987 (Mobil 3102:15002) | an Besucher: Login-Code | Direkt öffnen → Merken-/Follow-Verwaltung (`PUB-18.07a`) | Besucher-Login-Code, Systemzweck (Freigabe 05.11.) |
| MAIL-13 (neu 09.11.) | 3102:15017 (Mobil 3102:15031) | an Besucher: Follow bestätigen | Follow bestätigen → `PUB-18.03c` (orgactive) bzw. `PUB-18.02c` | Double-Opt-in; ohne Klick passiert nichts; Hinweise auf neue Events sowie Termin-, Absage- und Ortsänderungen (Freigabe 09.11.; Text in Figma noch anzupassen, siehe Lücke 5) |
| MAIL-08a / b / c / d | 3072:17 / 75 / 153 / 207 | an Follower: Termin verschoben / Beginn und Ort geändert / Absage / Neuer Termin folgt | Zum Event, Zur Eventseite → `PUB-01x` | nur Systemzweck, Besucher-Mail-Freigabe vom 05.11.; Follow selbst ist W3 |

## F10 · Founder-Bereich (nur Desktop, Reihenfolge der Wellen)
Section (3032:22070). Seitenleiste: Heute `FDB-01`, Profile `FDB-02a`, Events `FDB-06a`, Anmeldungen `FDB-07a`, Prüfungen `FDB-08`, Netzwerk `FDB-09a`, Plus `FDB-10`, Zahlen `FDB-11`, Protokoll `FDB-12`, System `FDB-13`. Listenstandard: Suche, Filter, sortierbare Spalten, 25 je Seite, Zustände leer, lädt, Ladefehler. E-Mail-Adressen in Listen gekürzt, Entwürfe nie lesbar.

| Kennung | Knoten | Zustand | Aktionen → Ziel | Folgen |
|---|---|---|---|---|
| FDB-01 | 3032:22071 | Heute | Prüfen → `FND-02a`; Ansehen → ⚠ Ziel je Eintrag; Alle 12 anzeigen → `FDB-08` | |
| FDB-02a / b / c | 3033:22190 / 22741 / 3088:29021 | Profile Liste / nichts gefunden / Filter „Konto gesperrt“ | Öffnen → `FDB-03a`/`b`/`c` je Status | Status „Konto gesperrt“ geht vor „Gesperrt“ |
| FDB-03a | 3033:22926 | Profil, live | Öffentliche Seite ansehen → `PUB-06a`; Profil sperren → `FDB-04a`; Login-Adresse ändern → `FDB-14a`; Konto sperren → `FDB-15a` | Konto-Karte mit Login-Adresse und Konto-Status |
| FDB-03b | 3033:23269 | Profil, gesperrt | Entsperren → `FDB-05a`; Antwort schreiben → `FDB-17a`; Login-Adresse ändern → `FDB-14a`; Konto sperren → `FDB-15a` | Antworten des Organizers sichtbar |
| FDB-03c | 3086:28769 | Profil, Konto gesperrt | Antwort schreiben → `FDB-17a`; Login-Adresse ändern → `FDB-14a`; Konto entsperren → `FDB-16a` | |
| FDB-06a / b | 3034:23273 / 23874 | Events Liste / Detail | Öffentliche Seite ansehen → `PUB-01a`; Event ausblenden → `FDB-06c` | |
| FDB-06c / d | 3034:24115 / 24506 | Ausblenden Formular / ausgeblendet | Event ausblenden → `FDB-06d`; Zum Event; Event wieder einblenden → `FDB-06e` | `MAIL-05` |
| FDB-07a / b / c | 3034:24775 / 25076 / 25327 | Anmeldungen / Profil zuordnen / zugeordnet | Profil einem Login zuordnen → `07b`; Zuordnen → `07c`; Zur Anmeldeliste → `07a` | Protokolleintrag |
| FDB-08 | 3034:25529 | Prüfungen | Prüfen → `FND-02a` | = `FND-01a` im Rahmen mit Seitenleiste |
| FDB-09a / b | 3034:25853 / 26202 | Netzwerk / Ortsbindung prüfen (W5) | Prüfen → `09b`; Bestätigen → `FDB-09c`; Ablehnen → `FDB-09d`; Rückfrage stellen → `FDB-09f` | |
| FDB-06e–h (neu 09.11.) | 3098:2 / 335 / 599 / 849 | Event wieder einblenden: Bestätigen / eingeblendet, Mail übergeben / Mail nicht übergeben / fehlgeschlagen | Event einblenden → `06f`/`06g`; Mail erneut senden → `06f`; Abbrechen → `FDB-06b` | `MAIL-11` (3098:3043) „Event wieder öffentlich“; Protokolleintrag; Prüfung unmittelbar vor SES |
| FDB-17a–d (neu 09.11.) | 3098:1107 / 1313 / 1526 / 1718 | Antwort an den Organizer: Formular / Nachricht fehlt / gesendet / Speichern fehlgeschlagen | Antwort senden → `17c`; Abbrechen → `FDB-03b`/`03c` | Antwort erscheint im Hinweis des Organizers (`SPR-01c`, `SPR-04c`); **keine Mail** (Vorschlag, siehe Lücke 5); Protokoll |
| FDB-09c–g (neu 09.11.) | 3098:1934 / 2139 / 2358 / 2563 / 2782 | Ortsbindung: bestätigt / ablehnen (Formular) / abgelehnt / Rückfrage (Formular) / Rückfrage gesendet | `FDB-09b`: Bestätigen → `09c`, Ablehnen → `09d` → `09e`, Rückfrage stellen → `09f` → `09g` | Nachricht an den Organizer in der App, keine Mail (Vorschlag); Protokoll |
| FDB-10 / 10b | 3034:26453 / 3075:41486 | Plus-Reservierungen / Detail (W4) | Zeile öffnen → `10b`; Als CSV exportieren; Adresse kopieren; Zur Liste → `FDB-10` | |
| FDB-11 / 12 | 3034:26718 / 26934 | Zahlen / Protokoll (unveränderlich) | Pager | |
| FDB-13 / b / c / d | 3034:27208 / 3039:31233 / 32096 / 32412 | System / Mails nicht übergeben / Liste lädt nicht / lädt | Erneut senden, Alle 7 erneut senden; In Sentry öffnen (extern); Noch einmal laden | Prüfung unmittelbar vor SES; abgelaufene Codes gehen nicht erneut raus |
| FDB-13e (neu 10.11.) | 3125:1159 | System: Ergebnis nach „Alle 7 erneut senden“ | Liste mit „Übergeben“ und „Nicht mehr nötig“; Hinweis: übergeben ist nicht angekommen | Vorprüfung vor SES |
| FDB-14a / b / c | 3039:32672 / 33043 / 33405 | Login-Adresse ändern / ungültig / geändert | Login-Adresse ändern → `14c`; Abbrechen → `FDB-03`; Zum Profil → `FDB-03a` | `MAIL-07` nur an die alte Adresse; Pflicht-Grund; Protokoll |

## F11 · Sperren: Profil, Event, Konto (Founder und Organizer, W1)
Sections „Founder-Bereich“, „Sperre — Sicht von Organizer und Besucher“ (3035:22106) und „H — Konto-Sperre“ (3082:27793). Gemeinsame Regeln: Grund und Nachricht an den Organizer sind Pflicht, interne Notiz freiwillig, die Mail nennt den Grund nicht, Besucher sehen nur „Diese Seite ist nicht verfügbar“, Entsperren stellt den alten Stand wieder her, mehrere Antworten des Organizers sind möglich.

| Sperre | Founder | Mail | Organizer | Entsperren |
|---|---|---|---|---|
| **Profil** (mit allen Events) | `FDB-03a` → `FDB-04a` (Formular), `04b` Grund fehlt, `04e` fehlgeschlagen → `04c` Mail übergeben / `04d` nicht übergeben (Mail erneut senden) | `MAIL-04` (3035:24087) → Zur Nachricht | `SPR-01a` (3035:22107) Hinweis → Auf die Sperre antworten → `SPR-02a` (3035:22623) → `02b` leer, `02c` gesendet, `02d` fehlgeschlagen; `SPR-01c` (3039:33640) mit Antworten, Noch eine Antwort schreiben | `FDB-03b` → `FDB-05a` → `05b`; Antwort an den Organizer `FDB-17a`–`d`; `MAIL-06` (3035:24275); `SPR-03` (3035:23709) |
| **Event** (Profil bleibt öffentlich) | `FDB-06b` → `06c` → `06d` | `MAIL-05` (3035:24181) | `EVM-01e` / `EVL-01d` → `SPR-01b` (3035:22389), mit Antworten `SPR-01d` (3125:153) → `SPR-02a` | `FDB-06d` → `FDB-06e` bis `06h`; `MAIL-11` (3098:3043) |
| **Konto** (Login, alle Profile und Events) | `FDB-03a`/`b`/`c` → `FDB-15a` (3082:27795), `15b` Grund fehlt, `15e` fehlgeschlagen → `15c` / `15d` | `MAIL-09` (3083:28894) | `SPR-04a` (3083:28419) Hinweis, mit Antworten `SPR-04e` (3125:389), Antwort gesendet `SPR-04f` (3125:589); `SPR-04b` (3083:28533) „Das geht gerade nicht“ bei Änderungsversuch; `SPR-04c` (3083:28729) Antwort (Fehler wie `SPR-02b`–`d`) | `FDB-03c` → `FDB-16a` (3082:28424) → `16b`; `MAIL-10` (3083:28928); `SPR-04d` (3083:28807). Einzelne Profil- oder Event-Sperren bleiben bestehen |
| **Besucher** | `PUB-SPR-01` (3035:23979) bei jeder der drei Sperren | | | |

Ein gesperrter Organizer bleibt angemeldet, sieht alles und antwortet, ändert aber nichts (Vorschlag, Founder 09.11.: „passt“). Konto-Sperrgründe sind noch ein Vorschlag (STATUS).

## F12 · Plus-Warteliste (W4)
Section „G — Plus-Warteliste“ (3075:28000). Wortlaut „Warteliste“ statt „Reservieren“; keine Zahlung; eine Eintragung je Konto; Startmail erst, wenn Plus buchbar ist (`AGENTS.md`, 09.11.), bis dahin weder Versand noch Code; Löschfrist mindestens 12 Monate (Arbeitsstand).

| Kennung | Knoten | Zustand | Aktionen → Ziel | Folgen |
|---|---|---|---|---|
| PLS-01a | 3077:41911 | Preise (Free, Plus hervorgehoben, Pro) | Auf die Warteliste → `PLS-02a` | Einstieg ⚠ nicht gezeichnet (Fußzeile „Preise“, Startseitenkarte) |
| PLS-01c (neu 10.11.) | 3125:1730 (Mobil 3125:1976) | Preise, nicht angemeldet | Anmelden und eintragen → Anmeldung → `PLS-02a` | Eintragung nur mit Konto, ein Eintrag je Konto |
| PLS-01b | 3077:42357 | Preise, bereits eingetragen | Angaben ansehen → `PLS-03a` | |
| PLS-02a–e | 3077:38089, 38496, 38813, 39299, 39698 | leer / drei Funktionen / Funktion und E-Mail fehlen / Anmerkung zu lang, Einwilligung fehlt / Eintragen fehlgeschlagen | Auf die Warteliste → `PLS-03a`; Abbrechen → `PLS-01a`; `02e`: Noch einmal versuchen | Einwilligung zur einmaligen Startmail, Anmerkung bis 500 Zeichen; erscheint in `FDB-10` |
| PLS-03a | 3077:40101 | Auf der Warteliste | Angaben ändern → `PLS-04a`; Zu den Preisen → `PLS-01b`; Von der Warteliste austreten → `PLS-05a` | |
| PLS-04a / b | 3077:40503 / 40820 | Angaben ändern / gespeichert | Änderung speichern → `04b`; Abbrechen → `PLS-03a`; `04b`: Zu den Preisen, Austreten | |
| PLS-05a / b / c | 3077:41130 / 41431 / 41634 | Austreten bestätigen / ausgetreten / fehlgeschlagen | Austreten → `05b` (Auswahl, Anmerkung, Einwilligung werden gelöscht); Auf der Liste bleiben → `PLS-03a`; `05b`: Zu den Preisen → `PLS-01a` | Protokolleintrag |

---

## F13 · Besucher: Merken, Follow, Kalender, Login (W3, Entwürfe im Alt-Stil)
Sections „PUB-17 Follow-Platzierung“ (2839:47447) und „PUB-18 Besucheraktionen“ (2939:11702) auf Seite 40. Die Frames sind **gezeichnet, aber nicht im v2-Stil** (Dialog-Ausschnitte 954 px, nicht seitenweise). Die Zuordnung unten ist aus den Frame-Namen abgeleitet; Inhalt und Stil sind im Review gegen UX-Framework und Beschluss „Bestätigen statt Dialoge“ zu prüfen. Besucher-Mails: `MAIL-12` Login-Code, `MAIL-13` Follow bestätigen (neu 09.11.), `MAIL-08a`–`d` Hinweise.

| Kennung | Knoten | Zustand | Aktion → Ziel | Folgen |
|---|---|---|---|---|
| PUB-17a | 2839:47448 (Mobil 2839:47459) | Veranstalterprofil mit Follow-Section (Variante B) | Neue Events per E-Mail erhalten → `PUB-18.03a` | ⚠ siehe Lücke 5 (Mailumfang) |
| PUB-17b | 2841:58778 (Mobil 2841:58802) | Merken-Dialog mit Follow-Angebot | Merken → `PUB-18.01a`; Follow → `PUB-18.03a` | |
| PUB-18.01a–e | 2654:7648, 7857, 8036, 8217, 8376 | Merken: gespeichert / E-Mail zum Sichern / Code / zusammenführen / zusammengeführt | Code anfordern → `MAIL-12`; Code eingeben → Verwaltung | Besucher-Login mit E-Mail-Code |
| PUB-18.02a–c | 2654:8470, 8651, 8810 | Event-Abo: E-Mail / bestätigen ausstehend / aktiv | Bestätigen → `MAIL-13` | Double-Opt-in |
| PUB-18.03a–c | 2654:8908, 9097, 9256 | Veranstalter-Follow: E-Mail / ausstehend / aktiv | wie `02` | |
| PUB-18.04a–d | 2654:9354, 9533, 9712, 9871 | Fehler: E-Mail / Code / Link abgelaufen / entfernt | neu anfordern | |
| PUB-18.05a–b, 06a–d, 07a–b, 08a–b | 2658:7978 … 2658:9364 | Verwalten: Event, Veranstalter, alle, abgelaufen/angefordert | Abbestellen, Zweck bestätigen | |
| PUB-18.10a–d | 2661:9020, 9189, 9352, 9513 | Kalender: Auswahl / Download gestartet / fehlgeschlagen / ohne Datum | Datei herunterladen (keine Mail) | |

### F13 in v2: Vorschlag für die Überarbeitung (10.11.2026, nicht abgenommen)
Bestand: `PUB-17`/`PUB-18` mit rund 41 Dialog-Ausschnitten (954 px) und der Klickprototyp auf Seite 60. Vorschlag: **Seiten statt Dialoge** (Beschluss „Bestätigen statt Dialoge“), Mobil zuerst, Desktop danach, Texte aus dem Katalog `12-zustandstexte.md`, Fehler und Laden über die Muster in `11`. Der Bestand ist 1:1 zuordenbar:

| Block | Screens (neu) | Ersetzt | Mails |
|---|---|---|---|
| 0 Gäste-Rahmen (Founder, 10.11., 12:06: „fehlt noch“) | Navigationsleiste für Gäste (Desktop und Mobil) und Bereich „Deine Seite“ (Merkliste, E-Mail-Abos, Anmeldestand, Abmelden); Einstieg aus Kopfzeile und aus den Mails | – | `MAIL-12` Einstieg per Code |
| 1 Follow | `FOL-01` E-Mail und Einwilligung (Fehler: M7, M2), `FOL-02` Bestätigung ausstehend (erneut senden), `FOL-03a` bestätigt, `03b` Link abgelaufen, `03c` schon bestätigt | `PUB-18.03a–c`, `18.04a–c` | `MAIL-13` Bestätigung |
| 2 Merken und Besucher-Login | `MRK-01a` Merkliste (lokal) leer, `01b` befüllt, `MRK-02` Merkliste mitnehmen (E-Mail), `MRK-03a` Code eingeben, `03b` falsch oder abgelaufen, `MRK-04a` zusammenführen, `04b` zusammengeführt | `PUB-18.01a–e`, `18.04b` | `MAIL-12` Code |
| 3 Verwalten | `VWL-01` Übersicht der E-Mail-Abos, `VWL-02` Abo beenden (Bestätigung), `VWL-03` beendet, `VWL-04` alle beenden (Umfang vorher), `VWL-05` alle beendet, `VWL-06` Verwaltungslink abgelaufen, `VWL-07` neuer Link angefordert | `PUB-18.05`–`08` | Abmeldelink in jeder Mail |
| 4 Kalender | `KAL-01` Datei laden, `KAL-02` Download gestartet, `KAL-03` fehlgeschlagen, `KAL-04` Event ohne Datum | `PUB-18.10a–d` | keine |
| 5 Event-Abo (zuletzt) | wie Block 1 mit Bereich „Event“: `FOL-11` bis `FOL-13` | `PUB-18.02a–c`, `18.05` | `MAIL-13` Variante |
| Mails an Gäste | `MAIL-12`, `MAIL-13`; Hinweis auf Termin, Ort oder Absage (`MAIL-08` Stand prüfen); gebündelter Hinweis auf neue Events | | Abmeldelink, Absender, Grund des Empfangs |

Rund 25 Screens in zwei Viewports. **Entschieden (Founder, 10.11., 12:09, alle fünf Punkte):** (1) Organizer-Nachrichten weggelassen, als Plus-Vorhaben in der Alpha-Matrix vermerkt; (2) Seiten statt Dialoge; (3) Gäste-Bereich „Deine Seite“ plus Navigationsleiste (Block 0); (4) Event-Abo als Variante des Follow gezeichnet; (5) Reihenfolge wie in der Tabelle. Ursprüngliche Fragen: (1) Das Häkchen „Zusätzliche Eventnachrichten“ (Organizer-Nachrichten) bleibt **aus den Alpha-Screens** (`AGENTS.md`: weder Code noch Versand ohne eigene Freigabe); (2) Seiten statt Dialoge; (3) ein Gäste-Bereich „Deine Seite“ mit Merkliste und Abos statt getrennter Seiten; (4) Event-Abo jetzt als Variante zeichnen; (5) Reihenfolge der Blöcke wie in der Tabelle.

### F13 in v2: gezeichnet (Block 0 und 1, 10.11.2026, Review ausstehend)
Section „ENTWURF v2 · F13 Gäste — Rahmen, Deine Seite, Follow“ (3132:32606), Seite 20. Frames je Desktop und Mobil. Alle Seiten tragen die Gäste-Kopfzeile `NAV-01` (Wortmarke links, Button „Deine Seite“, mit Zahl der Merkungen in Klammern, sobald es welche gibt).

| Kennung | Knoten (Desktop / Mobil) | Zustand | Aktion → Ziel | Anmerkung |
|---|---|---|---|---|
| NAV-01a / b | 3132:32607, 3132:32695 / 3132:32735, 3132:32775 | Gäste-Kopfzeile ohne / mit Merkungen | „Deine Seite“ → `GST-01a`–`c` | Vorschlag für eine Komponente auf Seite 10; nicht angelegt, bis der Founder zustimmt |
| GST-01a | 3133:257 / 3133:644 | Deine Seite, angemeldet | Entfernen, Beenden, Abmelden, Alle E-Mail-Abos beenden → `VWL-02`/`04` (Block 3) | Merkliste, E-Mail-Abos, Anmeldung (E-Mail) |
| GST-01b | 3135:245 / 3135:571 | angemeldet, noch leer | – | Leertexte sind Einzeltexte, noch ohne Katalog-ID |
| GST-01c | 3135:343 / 3135:669 | nicht angemeldet, lokale Merkungen | Mit E-Mail anmelden → `MRK-02` (Block 2) | Karte „Merkliste mitnehmen“; Hinweis zu Abos über den Mail-Link ist Annahme (TODO(spec) bei Block 3) |
| FOL-01a / b / c | 3136:153 / 3136:1728; 3136:408 / 3136:1877; 3136:711 / 3136:2064 | Folgen: E-Mail eingeben / E-Mail passt nicht (Z01) / Senden fehlgeschlagen (Z03) | Bestätigungslink senden → `FOL-02a`; Zurück → Profil | Einwilligungstext nennt gebündelte Hinweise auf neue Events sowie Termin-, Ort- und Absagehinweise und den Abmeldelink; kein Häkchen. „E-Mail fehlt“ nutzt Z01 mit „Die E-Mail-Adresse fehlt noch.“ (kein eigener Frame) |
| FOL-02a / b | 3136:898 / 3136:2251; 3136:1110 / 3136:2403 | Bestätigung ausstehend / Link erneut gesendet (Z14) | Link noch einmal senden → `FOL-02b`; Andere Adresse eingeben → `FOL-01a`; Klick in `MAIL-13` → `FOL-03a` | „Wir haben dir einen Link geschickt“; Gültigkeitsdauer und Grenze für erneutes Senden sind nicht beschlossen: TODO(spec), nicht gezeichnet |
| FOL-03a / b / c | 3136:1262 / 3136:2555; 3136:1411 / 3136:2704; 3136:1570 / 3136:2863 | Folgen bestätigt (Z11) / Link abgelaufen / schon bestätigt | Zum Profil; Neuen Link anfordern → `FOL-01a`; Folgen beenden → `VWL-02` (Block 3) | 03b und 03c sind Einzeltexte |

## Lücken und offene Zuordnungen (Stand 09.11.2026, abends)
**Seit dem ersten Entwurf gezeichnet (Review ausstehend):** ORG-01/02 in v2; Vorschau `VOR-01a`/`b`; Einstiege „Dein Bereich“ auf der Startseite; `ORG-102a`–`c`; Founder: `FDB-17a`–`d` (Antwort), `FDB-06e`–`h` mit `MAIL-11` (Event einblenden), `FDB-09c`–`g` (Ortsbindung); Preisformen `EVT-04f`–`n`; Zusatzfragen `EVT-07b`–`e` (Vorschlag); Besucher-Mails `MAIL-12`, `MAIL-13`.

**Offen (Entscheidung des Founders nötig):**
1. **`EVT-09` (Vorschlag 10.11.):** „Später weitermachen“ nach einem Fehler führt zu `EVT-09c` (nichts gesichert, Bestätigung zum Verlassen); keine lokale Browser-Sicherung. Dazu `EVT-09a` (Speichert) und `EVT-09b` (Keine Verbindung).
2. **Eventgestaltung und Profilgestaltung** (alt `ORG-43`, `44`, Section `ORG-E`, `PUB-13`) sowie **Plus „Gespeicherte Eventvorlagen“**: nicht in v2. Gehören zu Welle 6 (Profil-Editor) und brauchen zuerst die Entscheidung, was Organizer gestalten dürfen.
3. **`ORG-91` „Programm und Besuch“:** `EVT-07` deckt Einlass, Altersregel, Programm und Musik ab. Es fehlen weitere Teilnahmebedingungen, Beteiligte und breite Musikrichtungen. Streichen oder nachtragen?
4. **Besucher-Entwürfe `PUB-17`/`18`** sind im Alt-Stil (Dialog-Ausschnitte); Anpassung an v2 und an „Bestätigen statt Dialoge“ steht aus.
5. **Mailumfang Follow (entschieden 09.11., 17:55):** `AGENTS.md` erlaubt jetzt auch den gebündelten Hinweis auf neue Events (`FOLLOW-02`), für Free und Plus gleich. Offen: Einwilligungstext der Follow-Section und `MAIL-13` nennen „neue Events“ ausdrücklich (Figma nachziehen). Nachrichten, die der Organizer selbst schreibt (Plus „eigene Nachrichten“), sind nicht freigegeben und brauchen Einwilligungstext, Abmeldekategorie und Entwurf (siehe `docs/STATUS.md` 09.11., 17:55). Eine Mail zur Founder-Antwort (`FDB-17`) bleibt ohne Mail (Vorschlag).
6. **`ORG-102a`:** „DISKOE löscht den Entwurf“ als manueller Schritt des Founders (Vorschlag); die Rückmeldung in der Anmeldeliste `FDB-07a` ist nicht gezeichnet.
7. **Zusatzfragen modular (Vorschlag 09.11., 18:10):** Bausteine statt Formatseiten, `EVT-07m-a`–`e` (Figma Seite 20, Section Flow 1 Block 2b, unterstes Band). `EVT-07b`–`e` bleiben bis zur Abnahme stehen und gehen dann ins Archiv. Pflichtbausteine (Vernissage: Besuchsmodus, Film: Sprache und Untertitel) werden in `EIN-01` geprüft.
8. **Founder-Bereich mobil:** Beschluss steht aus.
9. **Einladungsmail** (nicht freigegeben) und **Plus-Startmail** (erst bei buchbarem Plus) bleiben ohne Screen und Code.

## Fehlende Zustände
Die Prüfung vom 10.11. und die Matrix stehen in `docs/startpaket/11-muster-und-zustaende.md`; Hinweis- und Zustandstexte stehen im Katalog `docs/startpaket/12-zustandstexte.md`. Gezeichnet am 10.11.: `ORG-01b`, `ORG-02b`, `EVT-00i`/`j`, `EVT-03c`, `EVT-05d`–`f`, `EVT-07m-g`, `EVT-09a`–`c`, `EVT-07m-f`. Entschieden: Rückfrage-Korrektur über den Datenvertrag bzw. Code (kein Figma-Screen je Feldtyp), Eingaben bleiben bei abgelaufener Sitzung.

**Archiviert am 10.11.2026 (Founder: „Ja fang bitte damit an“):** alte `ORG-01`/`02`, `ORG-32`/`33`/`56`, `ORG-92a`–`l`, Section `ORG-C` (Zusatzfragen, ersetzt durch die Bausteine `EVT-07m`), Section `ORG-D` (nur Beschriftungen übrig), Section D16–D18 und die alten freistehenden `PLS-01a`/`PLS-01b` („Plus reserviert“). Alles auf Seite 90, Knoten-IDs unverändert. **Noch nicht archiviert:** `ORG-91` (erst nach Klärung von Punkt 3), `EVT-07b`–`e` (bis zur Abnahme der Bausteine).

## Archiv (09.11.2026)
Ersetzte Frames liegen auf Seite 90 „Archiv“, Knoten-IDs unverändert. Die Seiten 30 und 50 sind leer und tragen einen Hinweis.

| Archiviert | ersetzt durch |
|---|---|
| Section `ORG-A+` (2955:5775): ORG-95 bis 103g | Block 1 (ORG-95 bis 103g, dieselbe Menge) |
| `NACH-A` (2945:642) Freigabe, Rückfrage, Systemmails | Block 2c: `FND-02` bis `04`, `RFG`, `MAIL-01` bis `03` |
| `NACH-B` (2945:649) Eventverwaltung, weiteres Event, Text und Ort ändern | Flow 2 A und B: `EVL`, `EVM`, `EVB` |
| `NACH-C` (2945:656) Verschieben und Absage | Flow 2 C: `EVV`, `EVA` |
| Slice-5-Review-Flow (2859:40104) | Block 2c und Founder-Bereich |
| `INT-A` (2945:6270) Founder-Prüfung, `INT-B` (2945:6276) Ortsbindung | `FND-01` bis `04`, `FDB-09b` |
| Einzelframes aus `ORG-A` (17): ORG-03, 04, 05, 06, 09, 10 bis 14, 41, 49, 50, 51, 52, 88, 93 | Block 2a: `ORG-03a` bis `ORG-10`, `EIN-02`, `PRF-01`/`02` |
| Einzelframes aus `ORG-B` (19): ORG-15 bis 21, 30, 31, 39, 40, 45, 53 bis 55, 84, 89, 90, 94 | Block 2b: `EVT-00a` bis `EVT-09` |
| Einzelframes aus `ORG-D` (6): ORG-34 bis 38, 42 | Block 2c: `EIN-02`, `PRF-01`, `PRF-02` |

**Bleibt in den alten Sections (nicht neu gezeichnet):** `ORG-A`: Teststart und Moderationsnotizen. `ORG-B`: ORG-43, 44, 91. Außerdem D11, D12, D15, D20, D21 und `ORG-E` (Wellen 5 und 6) sowie Seite 40 (öffentliche Seiten) und Seite 60 (Besucher-Prototyp). Die Prototyp-Verknüpfungen der archivierten Frames sind unterbrochen.
