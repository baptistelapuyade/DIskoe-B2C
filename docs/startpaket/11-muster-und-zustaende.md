# 11 — Muster und Zustandsmatrix (Stand 10.11.2026)

**Status:** Entwurf, vom Founder noch nicht abgenommen. Ziel: Übersicht behalten. **Muster** werden einmal definiert und gelten für jeden Schritt, die **Zustandsmatrix** zeigt je Screen, welche Zustände gezeichnet sind, über ein Muster abgedeckt werden oder fehlen. Quelle der Screens: `10-flow-karte.md`. Eingeführt auf Wunsch des Founders am 10.11.2026 (Punkte 1 und 2 der Organisationsvorschläge).

## Muster (Figma Seite 20, Section „MUSTER · Speichern, Laden, Fehler“, Knoten 3113:35519)
Jedes Muster hat eine Referenz in Figma (Desktop und Mobil). Schritte in Profil und Event bekommen **keine eigenen Frames** für diese Zustände.

| Nr. | Muster | Verhalten | Referenz |
|---|---|---|---|
| M1 | Speichert | Hauptbutton gesperrt, Text „Speichere …“, Info-Hinweis; zweite Aktion gesperrt | `EVT-09a` |
| M2 | Speichern fehlgeschlagen (Serverfehler) | Fehlerhinweis über dem Formular, Eingaben bleiben, „Noch einmal versuchen“, „Später weitermachen“ | `EVT-09` |
| M3 | Keine Verbindung | Warnhinweis, Eingaben bleiben, gleiche Aktionen wie M2 | `EVT-09b` |
| M4 | Verlassen ohne Sichern | Bestätigungsseite statt Dialog: zurück und noch einmal versuchen oder verlassen; Eingaben des Schritts bleiben in diesem Browser | `EVT-09c` |
| M5 | Datei hochladen | lädt, zu groß, zu klein, falsches Format, zu viele Bilder | `ORG-05b`–`g`, `EVT-05c`–`f`, `EVT-00i`/`j` |
| M6 | Sitzung abgelaufen | eigene Seite, Eingaben bleiben in diesem Browser, nach Anmeldung zurück zum Schritt | `ERR-01` |
| M7 (Vorschlag) | Feldfehler | Hinweis über dem Formular („Eine Angabe stimmt noch nicht“), Fehlertext und roter Rahmen am Feld, Eingabe bleibt | `EVT-01b`, `EVT-07m-g` |
| M8 (Vorschlag) | Link kopieren | Erfolg inline („Link kopiert“) oder Fehler mit „Noch einmal kopieren“ | `LIV-02`/`03` |
| M9 (Vorschlag) | Bestätigungsseite: Aktion fehlgeschlagen | bleibt auf der Bestätigungsseite, Fehlerhinweis, „Noch einmal versuchen“, Abbrechen | `EVA-01c`, `EVB-04c`, `PRF-03c` |
| M11 (Vorschlag 10.11.) | Aktion gilt, Mail nicht übergeben | Die Aktion (Sperre, Entsperren, Ausblenden, Login-Änderung) ist erledigt; Warnung `Z15` oben, Aktion „Mail erneut senden“, Mail wird vor der Übergabe neu geprüft; Stand und Protokoll unverändert | `FDB-04d`, `06g`, `15d` |
| M10 (Vorschlag) | Liste | leer, keine Treffer, lädt, lädt nicht („Noch einmal laden“), Pager | `EVL-01b`–`g` |

### Regeln dazu (Entscheidungen des Founders 10.11.2026; Umsetzungsdetails sind Vorschlag)
- **Eingaben bleiben (M4, M6).** Die Eingaben des aktuellen Schritts werden in diesem Browser zwischengehalten (nur Formularwerte dieses Schritts, keine Tokens und keine E-Mail-Adressen von Besuchern), bis der Schritt gespeichert wird, der Organizer sich abmeldet oder den Schritt bewusst verwirft. Das ersetzt den früheren Vorschlag „nichts gesichert, Eingaben gehen verloren“. Datenschutztext muss die Zwischenspeicherung nennen.
- **Rückfrage korrigieren (`RFG-02`).** Kein eigener Screen je Feldtyp. Eine Rückfrage verweist auf ein Feld und einen Grund; `RFG-02` zeigt für dieses Feld dieselbe Eingabekomponente wie der Schritt, in dem das Feld liegt. Validierung, Fehler und Speicherzustände kommen aus den Mustern M1 bis M3. Festlegung im Datenvertrag bzw. im Code, nicht in Figma. Den Eintrag im Datenvertrag nimmt der Founder vor oder gibt ihn frei; die alten Verträge werden nicht still überschrieben.
- **Event ausgeblendet während der Bearbeitung (entschieden 10.11., 11:20).** Der Organizer kann weiter bearbeiten; Änderungen bleiben privat, Veröffentlichen ist gesperrt, mit Hinweis auf die Nachricht von DISKOE (`SPR-01b`).
- **Grenzen (entschieden 10.11., 11:20):** zehn Minuten Wartezeit nach zu vielen falschen Codes (`ORG-02b`); Eventbild mindestens 400 × 400 Pixel (`EVT-05e`); Material JPG, PNG oder WebP bis 5 MB, höchstens drei Bilder (`EVT-00i`/`j`). Die Zahlen gehören in den Datenvertrag bzw. die Konfiguration, nicht in Figma.

## Zustandsmatrix Flow 1 (F1 bis F5)
Legende: **✓** gezeichnet (Kennung), **M** über Muster abgedeckt, **–** nicht zutreffend, **✗** fehlt, **neu** seit 10.11.

| Screen | Leer | Ausgefüllt | Validierung | Speichert / lädt | Fehlgeschlagen | Offline | Sonst |
|---|---|---|---|---|---|---|---|
| ORG-01 E-Mail | ✓ `ORG-01` | – | ✓ `ORG-95` | ✓ `ORG-96` | ✓ `ORG-01b` neu | M3 | Link abgelaufen `ORG-99` |
| ORG-02 Code | ✓ `ORG-02` | – | ✓ `ORG-97` | M1 | M2 | M3 | zu viele Versuche `ORG-02b` neu; neuer Code `ORG-98` |
| ORG-102 Einladung | ✓ | – | – | – | ✓ `ORG-102c` | M3 | `102a`, `102b` |
| ORG-03/04 Angaben | ✓ `03a` | ✓ `04` | ✓ `03b`–`d` | M1 | M2 | M3 | |
| ORG-05 Profilbild | ✓ `05a` | ✓ `05c` | ✓ Fehler/zu klein `05d`, `05f` | ✓ `05b` | M2 | M3 | Ausschnitt `05e`, `05g` |
| ORG-07 bis 09 Venue | ✓ | ✓ | ✓ `08b` | M1 | M2 | M3 | Adresse vergeben `07b` |
| EVT-00 Material | ✓ `00b` | ✓ `00c` | ✓ Datei `00i` neu, zu viele Bilder `00j` neu | ✓ `00d` | ✓ `00e`, `00f` | M3 | Ergebnis `00g`, `00h` |
| EVT-01 Grundlagen | ✓ `01a` | ✓ `01c` | ✓ `01b` | M1 (`09a`) | ✓ `09` | ✓ `09b` neu | Vorschläge `01d` |
| EVT-02 Datum | ✓ `02a` | ✓ `02c` | ✓ `02b` | M1 | M2 | M3 | Vorschläge `02d` |
| EVT-03 Ort | ✓ `03a` | ✓ `03c` neu | ✓ `03b` | M1 | M2 | M3 | Venue-Verknüpfung W5 |
| EVT-04 Preis | ✓ `04a`–`c` | ✓ `04f`–`n` | ✓ `04d` | M1 | M2 | M3 | Vorschläge `04e` |
| EVT-05 Eventbild | ✓ `05a` | ✓ `05b` | ✓ zu groß `05c`, zu klein `05e` neu, Format `05f` neu | ✓ `05d` neu | M2 | M3 | |
| EVT-06 Atmosphäre | ✓ `06a` | ✓ `06b` | – | M1 | M2 | M3 | |
| EVT-07 Bausteine | ✓ `07m-e`, `07` | ✓ `07m-a` | ✓ Pflicht `07m-d`, Feld `07m-g` neu | M1 | M2 | M3 | entfernen `07m-f` neu, hinzufügen `07m-b` |
| EVT-08 gesichert | – | ✓ `08` | – | – | – | – | |
| EIN-01/02 Prüfliste, Bestätigung | ✓ | ✓ | ✓ `01b`, `02d` | ✓ | ✓ `02e` | M3 | |
| PRF-01 bis 03 | – | ✓ | – | – | ✓ `03c` | M3 | schon entschieden `03d` |
| RFG-01 bis 04 | – | ✓ | ✓ `02b` | M1 | M2 | M3 | Korrektur je Feld: siehe Regel oben |
| LIV-01 bis 03 | – | ✓ | – | – | ✓ `03` | M3 | |
| ERR-01 bis 05 | – | – | – | – | – | – | `ERR-01` Text angepasst (Eingaben bleiben) |
| LPA-01 bis 06 (F5) | ✓ | ✓ | ✓ `01b` | M1 | ✓ `01c`; Verwerfen `06`: M9 | M3 | |

## Zustandsmatrix Flow 2 (F6 bis F9)
Zustände je Typ. **Formular:** Normal, Validierung (M7), Speichert (M1), fehlgeschlagen (M2), Offline (M3). **Bestätigungsseite:** Bestätigen, Haken fehlt, fehlgeschlagen (M9), erledigt. **Liste:** M10. Legende wie oben.

| Screen | Typ | Normal | Variante / Validierung | Fehlgeschlagen | Erledigt | Sonst |
|---|---|---|---|---|---|---|
| EVL-01 Eventliste | Liste | ✓ `01a` | leer `01b`, keine Treffer `01c`, alle Zustände `01d` | lädt nicht `01e` | – | lädt `01f`, Seite `01g` (M10) |
| EVM-01 Eventverwaltung | Detail | ✓ je Status `01a`–`f` | – | Link kopieren: M8 | – | nicht gefunden: `ERR-02` |
| EVM-02 Als neues Event kopieren | Bestätigung | ✓ `02a` | – | M9 | ✓ `02b` | |
| EVB-01 Live-Event bearbeiten | Formular | ✓ `01a` | ✓ `01b` | ✓ `01c`; Offline M3 | ✓ `EVB-02` | Speichert M1 |
| EVB-03 Änderungen prüfen | Seite | ✓ `03a`, `03b` | – | – | – | keine Änderungen `03c` |
| EVB-04 Veröffentlichen bestätigen | Bestätigung | ✓ `04a` | Haken fehlt `04b` | ✓ `04c` | ✓ `EVB-05` | |
| EVB-06 Änderungen verwerfen | Bestätigung | ✓ `06a` | – | M9 | ✓ `06b` | |
| EVB-07 Entwurf verwerfen | Bestätigung | ✓ `07a` | – | M9 | ✓ `07b` | |
| EVV-01 Verschieben, Ersatztermin | Formular | ✓ `01a` | Datum in der Vergangenheit `01b`; leer: M7 | M2 | ✓ `EVV-04a` | |
| EVV-02 Verschieben ohne Termin | Bestätigung | ✓ `02a` | – | ✓ `02b` | ✓ `EVV-04b` | |
| EVV-05 Ersatztermin eintragen | Formular | ✓ `05a` | M7 | M2 | ✓ `05b` | |
| EVV-06 Absage zurücknehmen | Formular | ✓ `06a` | M7 | M2 | ✓ `06b` | |
| EVA-01 Event absagen | Bestätigung | ✓ `01a` | Haken fehlt `01b` | ✓ `01c` | ✓ `EVA-02` | |
| HNW-01 Veröffentlichen mit Hinweis | Seite | ✓ `01a`–`g` (sieben Fälle) | – | über `EVB-04c` | ✓ `HNW-02a`–`c` | |
| HNW-03 Verlauf | Liste | ✓ `03a` | leer `03b` | nicht übergeben `03c`; lädt nicht: M10 | – | |
| HLP-01 Hilfeseite | statisch | ✓ `01a` | – | – | – | |
| MAIL-08a–d | Mail | ✓ | – | über `HNW-03c` sichtbar | – | |

**Ergebnis Flow 2:** Es fehlt kein Frame, wenn M7 bis M10 gelten. Ohne diese Muster wären es sieben Stellen (Kopieren, Verwerfen, Entwurf verwerfen, Verschieben, Ersatztermin, Absage zurücknehmen, Verlauf lädt nicht). Auch in Flow 1 betrifft das `LPA-06` (Verwerfen).

## Zustandsmatrix Founder, Sperren, Plus-Warteliste (F10 bis F12; Prüfung 10.11.2026, Vorschlag)
Grundlage: Frame-Liste der Sections „Founder-Bereich“, „Sperre“, „G — Plus-Warteliste“ und „H — Konto-Sperre“ in Figma sowie Flow-Karte F10 bis F12. Founder-Bereich ist nur Desktop. **✗** = Zustand fehlt und ist nicht durch ein Muster gedeckt.

### F10 · Founder-Bereich
| Screen | Typ | Normal | Variante / Validierung | Fehlgeschlagen | Erledigt | Sonst |
|---|---|---|---|---|---|---|
| FDB-01, 02a, 06a, 07a, 08, 09a, 10, 11, 12, 13 | Liste | ✓ | nichts gefunden `02b`, Filter `02c` | M10 (lädt nicht), `13c` | – | lädt: M10, `13d`; leer: M10 |
| FDB-03a–c, 06b, 10b | Detail | ✓ live / gesperrt / Konto gesperrt | – | M10 (lädt nicht) | – | nicht gefunden: `ERR-02` in der Founder-Shell (Vorschlag) |
| FDB-04 Profil sperren | Formular | ✓ `04a` | Grund fehlt `04b` | ✓ `04e` | ✓ `04c`, Mail nicht übergeben `04d` | Speichert M1, Offline M3 |
| FDB-05 Profil entsperren | Bestätigung | ✓ `05a` | – | M9 | ✓ `05b` | Mail nicht übergeben: M11 |
| FDB-06c Event ausblenden | Formular | ✓ `06c` | Grund fehlt: M7 | M2 | ✓ `06d` | Mail nicht übergeben: M11 |
| FDB-06e Event einblenden | Bestätigung | ✓ `06e` | – | ✓ `06h` | ✓ `06f`, Mail nicht übergeben `06g` | |
| FDB-07 Profil zuordnen | Formular | ✓ `07b` | Adresse ungültig: M7 | M2 | ✓ `07c` | keine Mail |
| FDB-09 Ortsbindung | Prüfen | ✓ `09b` | Rückfrage leer: M7 | M9 | ✓ `09c`, `09e`, `09g` | Formulare `09d`, `09f` |
| FDB-13 System, Mails | Liste | ✓ `13b` | – | `13c` | ✓ Ergebnis nach „Erneut senden“ `13e` | lädt `13d` |
| FDB-14 Login-Adresse | Formular | ✓ `14a` | ungültig `14b` | M2 | ✓ `14c` | Mail nicht übergeben: M11 |
| FDB-17 Antwort | Formular | ✓ `17a` | Nachricht fehlt `17b` | ✓ `17d` | ✓ `17c` | |

### F11 · Sperren (Profil, Event, Konto)
| Sperre | Sperren: Formular · Grund fehlt · fehlgeschlagen | Mail übergeben · nicht übergeben | Entsperren: Bestätigen · erledigt · fehlgeschlagen | Organizer sieht | Antworten |
|---|---|---|---|---|---|
| Profil | `04a` · `04b` · `04e` | `04c` · `04d` | `05a` · `05b` · M9; nicht übergeben M11 | `SPR-01a`, mit Antworten `01c`, `SPR-03` | `SPR-02a`–`d` |
| Event | `06c` · M7 · M2 | `06d` · M11 | `06e` · `06f` · `06h`; nicht übergeben `06g` | `SPR-01b`, mit Antworten `01d`, `SPR-03` | `SPR-02a`–`d` |
| Konto | `15a` · `15b` · `15e` | `15c` · `15d` | `16a` · `16b` · M9; nicht übergeben M11 | `SPR-04a`, `04b`, mit Antworten `04e`, `04d` | `SPR-04c`; gesendet `04f` |
| Besucher | `PUB-SPR-01` bei jeder der drei Sperren | | | | |
Mails: `MAIL-04`, `05`, `06`, `07`, `09`, `10`, `11` sind gezeichnet. Mischfall (Profil und Konto gesperrt): Konto geht vor Profil, Regel steht in der Flow-Karte, kein eigener Frame.

### F12 · Plus-Warteliste
| Screen | Typ | Normal | Variante / Validierung | Fehlgeschlagen | Erledigt | Sonst |
|---|---|---|---|---|---|---|
| PLS-01 Preise | Seite | ✓ `01a`, `01b` | – | – | – | nicht angemeldet ✓ `01c` |
| PLS-02 Eintragen | Formular | ✓ `02a`, `02b` | `02c`, `02d` | ✓ `02e` | ✓ `PLS-03a` | Speichert M1, Offline M3 |
| PLS-04 Angaben ändern | Formular | ✓ `04a` | M7 (wie `02c`/`02d`) | M2 | ✓ `04b` | |
| PLS-05 Austreten | Bestätigung | ✓ `05a` | – | ✓ `05c` | ✓ `05b` | |

### Ergebnis F10 bis F12
- **Neues Muster M11 (Vorschlag):** „Mail nicht übergeben“ ersetzt vier einzelne Frames (`05`, `06`, `14`, `16`). Ohne M11 wären es vier neue Frames.
- **Gezeichnet am 10.11. (Review ausstehend):** `FDB-13e` (Ergebnis nach „Erneut senden“: 5 übergeben, 2 nicht mehr nötig), `SPR-01d` (Event ausgeblendet, mit Antworten), `SPR-04e` (Konto gesperrt, mit Antworten), `SPR-04f` (Antwort auf Kontosperre gesendet), `PLS-01c` (Preise, nicht angemeldet). M11 braucht keinen eigenen Frame (Referenzen `FDB-04d`, `06g`, `15d`).
- **Warteliste nur mit Anmeldung (Vorschlag, Founder-Frage 10.11.):** Die Preise-Seite ist ohne Anmeldung sichtbar, der Button heißt dort „Anmelden und eintragen“ und führt über die Anmeldung (Code per E-Mail) zurück zu `PLS-02a`. Eintragung nur für angemeldete Konten, ein Eintrag je Konto, serverseitig erzwungen (nicht nur in der Oberfläche). Das hindert nicht jeden Mehrfachwunsch: Wer mehrere E-Mail-Adressen hat, kann mehrere Konten anlegen. Deshalb sieht der Founder in `FDB-10` jede Eintragung mit Adresse und Zeitpunkt; Auffälligkeiten (viele Einträge in kurzer Zeit, gleiche Anmerkung) werden dort von Hand erkannt. Die Plus-Schwelle zählt Konten, nicht Funktionswünsche.
- **Texte der Antwortseiten:** `SPR-02a` bis `02c` tragen den Wortlaut für Profilsperren. Für Event-Ausblendungen gilt derselbe Screen mit `{Objekt}` („dieses Event“ statt „dein Profil“), für Konten `SPR-04c`/`04f`. Der Hinweis in `SPR-02c` sagte bisher „Du kannst dein Profil in der Zwischenzeit weiter bearbeiten.“ und widersprach der Regel „ein gesperrter Organizer ändert nichts“ (Founder, 09.11.); jetzt „Du siehst dein Profil weiter. Ändern kannst du gerade nichts.“
- **Bestand aufgeräumt (10.11.):** Die alten freistehenden `PLS-01a`/`PLS-01b` sind archiviert (Seite 90).

## Zustandsmatrix Gäste (F13; Prüfung 10.11.2026, Muster und „Entfernen“ vom Founder bestätigt 14:05, Rest Review ausstehend)
Typen und Legende wie oben. Prüfung gegen die Frames der Section „ENTWURF v2 · F13 Gäste“ (Desktop und Mobil, Maße und Hinweisnamen per Skript, Rest durch Lesen). **Entschieden (Founder, 10.11., 14:05):** Die Muster M1 (Speichert → „Wird gesendet …“, Z02) und M3 (Keine Verbindung, Z04) gelten auch für Gäste-Formulare; sie bekommen dort keine eigenen Frames. Die Muster-Referenzen (`EVT-09a`, `EVT-09b`) liegen im Organizer-Bereich; Gäste-Texte kommen aus demselben Katalog.

| Screen | Typ | Normal | Variante / Validierung | Fehlgeschlagen | Erledigt | Sonst |
|---|---|---|---|---|---|---|
| NAV-01 Gäste-Kopfzeile | Komponente | ✓ `01a`/`b` | – | – | – | Mobil nur Symbol: Zugänglichkeitstext „Gemerkt“ im Code; noch keine Komponente auf Seite 10 |
| GST-01 Merkliste und Abos | Liste | ✓ `01a` | leer `01b`, nicht angemeldet `01c`/`d`, mit Status und Vorbei `01e` | „Entfernen“ fehlgeschlagen: Z03 über der Karte, kein eigener Frame (entschieden 10.11., 14:05) | – | lädt: M10 |
| FOL-01 Folgen | Formular | ✓ `01a` | E-Mail passt nicht (Z01) `01b` | ✓ `01c` (Z03); Offline M3 | → `FOL-02a` | Senden: M1 |
| FOL-02 Bestätigung ausstehend | Warteseite | ✓ `02a` | erneut gesendet `02b`, Wartezeit `02c` | M9 (erneutes Senden fehlgeschlagen) | – | |
| FOL-03 Bestätigung per Link | Ergebnisseite | ✓ `03a` | abgelaufen `03b`, schon bestätigt `03c` | M9 | ✓ `03a` | Unbekannter Link: wie `03b` (Vorschlag: gleiche Seite, damit nichts verraten wird) |
| MRK-02 E-Mail für Code | Formular | ✓ `02a` | passt nicht `02b` | ✓ `02c`; Offline M3 | → `MRK-03a` | Senden: M1 |
| MRK-03 Code eingeben | Formular | ✓ `03a` | falsch oder abgelaufen `03b`, zu viele Versuche `03c` | M9 | → `GST-01a` oder `MRK-04a` | Neuer Code: M9 bei Fehler |
| MRK-04 Merkungen zusammenführen | Bestätigung | ✓ `04a` | – | M9 | ✓ `04b` | |
| VWL-01 Abo beenden | Bestätigung | ✓ `01a` | – | ✓ `01b` (Z03, Abo läuft weiter) | ✓ `VWL-02` | Link passt nicht `VWL-03` |
| VWL-04 Alle Abos beenden | Bestätigung | ✓ `04a` | – | M9 | ✓ `VWL-05` | |
| KAL-01 Termin in den Kalender | Bestätigung | ✓ `01` | – | ✓ `03` (Z03) | ✓ `02` | Event ohne Termin `04` |
| FOL-11 Event-Abo | Formular | ✓ `11` | wie `FOL-01b` (M7, Z01) | wie `FOL-01c` (Z03); Offline M3 | → `FOL-12` | Senden: M1 |
| FOL-12 / 13 Event-Abo bestätigen | Warteseite / Ergebnis | ✓ `12`, `13` | Wartezeit, abgelaufen: wie `FOL-02c`, `03b` | M9 | ✓ `13` | Endet mit dem Event (Text) |
| VWL-06 Event-Abo beenden | Bestätigung | ✓ `06a` | – | M9 | ✓ `06b` | |

### Ergebnis F13
- **Neu gezeichnet:** `GST-01e` (Status und Vorbei, Event-Abo endet mit dem Event).
- **Entschieden (Founder, 10.11., 14:05):** „Entfernen“ in der Merkliste bleibt ohne Bestätigung (betrifft nur eine eigene Zeile); der Fehlerfall zeigt Z03 („Das Entfernen hat nicht geklappt.“) über der Karte, kein eigener Frame. Keine offene Lücke mehr in F13 außer den nicht geprüften Punkten unten.
- **Texte:** Hinweise tragen Katalog-IDs (Z01, Z03, Z11, Z14) oder „Einzeltext“ (Leertexte, `FOL-03b`/`c`, Karten in `GST-01`); Einzeltexte werden bei Wellenbeginn als Z20 ff. aufgenommen.
- **Teilen und Profil-Liste (Review 14:10):** `PUB-01q`/`r` (Teilen als Zustände, M8) ersetzen im Vorschlag die Dialoge `PUB-01m`–`o`; `PUB-06c`/`d` geprüft (Merken 44 px, „Mehr anzeigen“ mobil). Offen: Zustand „Gemerkt“ der Eventzeile, Tippgröße 40 px in Follow-Karten und `PUB-06a`. Siehe Flow-Karte.
- **Noch nicht geprüft:** Kontrast, Tastaturreihenfolge, Mails auf Mobil, `PUB-06` Mobil-Zustände außer `06a`/`c`.

## Pflege
- Neue Screens bekommen in der Flow-Karte eine Zeile und hier eine Zelle; ein fehlender Zustand wird als **✗** geführt, bis er gezeichnet oder als Muster markiert ist.
- Ein neuer Zustand, der sich in mehreren Schritten wiederholt, wird zuerst als Muster (M-Nummer) aufgenommen.
