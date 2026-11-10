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

**Nicht geprüft:** Founder-Bereich (F10, F11) und F12 (Plus-Warteliste) sowie F13 (Besucher, Alt-Stil).

## Pflege
- Neue Screens bekommen in der Flow-Karte eine Zeile und hier eine Zelle; ein fehlender Zustand wird als **✗** geführt, bis er gezeichnet oder als Muster markiert ist.
- Ein neuer Zustand, der sich in mehreren Schritten wiederholt, wird zuerst als Muster (M-Nummer) aufgenommen.
