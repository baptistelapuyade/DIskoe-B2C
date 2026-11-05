# Flow 1 — Von der Anmeldung bis zum live geschalteten Profil: Inventar

Stand: 2026-11-05. Schritt 1 des neuen Ablaufs (Founder, 05.11., 14:55): **erst Inventar, dann fehlende Screens erstellen, dann alle Screens nacheinander gemeinsam durchgehen.** Dieses Dokument ist Schritt 1 für Flow 1.

## Umfang von Flow 1 (Vorschlag)
Anmelden → Profil bearbeiten (Angaben, Bild) → Vorschau → Einreichen → Prüfung durch den Founder (Freigabe oder Rückfrage) → Profil live, inklusive der drei Systemmails (Anmeldecode, „Profil freigegeben und live“, „Rückfrage zur Prüfung“) und der Organizer-Startseite. Nicht enthalten: Events (Flow 2), Profilgestaltung und Module, Venue/Artist.

## Grundlage und Grenzen
- **Figma:** Frames der Sections ORG-A (Seite 20), NACH-A (Seite 30) und INT-A (Seite 50) nach Struktur gelesen; ORG-02, ORG-03, ORG-10 auch inhaltlich. Inhalte von NACH-A, INT-A und den übrigen ORG-A-Frames wurden **nicht** Text für Text geprüft (folgt im gemeinsamen Durchgang, Schritt 3).
- **Code:** Routen und Komponenten gelesen, nicht ausgeführt.
- **Wireframes vom 27.10.:** Die vom Founder freigegebenen Wireframes (Artifact „Profilablauf Wireframes“) ersetzen laut `STATUS.md` die fehlenden Figma-Screens für Profil-Erstfreigabe, Rückfrage und Startseite. Ich konnte sie in dieser Sitzung nicht öffnen; die Spalte „Wireframe“ ist deshalb nicht geprüft.

## Legende
✓ vorhanden · ✗ fehlt · ? nicht geprüft / unklar · n. a. nicht zutreffend

## 1. Screens und Zustände
| Nr. | Screen / Zustand | Figma Desktop | Figma Mobil | Code | Anmerkung |
|---|---|---|---|---|---|
| 1 | Einladung annehmen / Profil übernehmen (neuer Organizer kommt zum ersten Mal) | ✗ | ✗ | ✗ | Im Code legt der Founder Profile an und ordnet sie zu („Organizer-Profil zugeordnet“); in Figma legt der Organizer das Profil selbst an. Alpha-Welle 2 sieht „Zuordnung eines vorab angelegten Profils“ vor. **Der Einstieg ist im Flow nicht definiert.** |
| 2 | Anmelden: E-Mail eingeben | ✓ ORG-01 | ✗ | ✓ | |
| 3 | Anmelden: Fehler (Adresse ungültig, Versand läuft, zu viele Anfragen) | ✗ | ✗ | ✓ (Fehlertext, Wartezustand am Button) | |
| 4 | Anmelden: Code eingeben | ✓ ORG-02 | ✗ | ✓ | Figma: „Code erneut anfordern“ und „Andere E-Mail verwenden“; Code: beides fehlt |
| 5 | Code: falsch, abgelaufen, Link ungültig | ✗ | ✗ | ✓ (Fehlertext, Link-Fehler) | |
| 6 | Code erneut gesendet / Wartezeit | ✗ | ✗ | ✗ | |
| 7 | Angemeldet, aber kein Profil zugeordnet | ✗ | ✗ | ✓ | |
| 8 | Organizer-Startseite „Deine Profile“ mit nächstem Schritt je Status | ✗ (Wireframe) | ✗ | ✓ | Sechs Statusvarianten im Code: unvollständig, bereit, in Prüfung, Rückfrage, Änderungen bereit, veröffentlicht |
| 9 | Profiltyp wählen | ✓ ORG-52 | ✗ | n. a. | Nicht im Durchstich; hängt an Nr. 1 |
| 10 | Profileditor Angaben, leer | ✓ ORG-03 | ✓ ORG-88 | ✓ | |
| 11 | Profileditor Angaben, ausgefüllt | ✓ ORG-04 | ✗ | ✓ | |
| 12 | Editor: Feldfehler (Pflicht fehlt, Link ungültig) | ✗ | ✗ | ✓ | |
| 13 | Editor: speichert / gespeichert | ✗ | ✗ | ✓ (Button-Text, Statusmeldung) | |
| 14 | Editor: Liste „Das fehlt noch“ | ✗ | ✗ | ✓ | konkrete Lücken (UX-05) |
| 15 | Profilbild: Auswahl | ✓ ORG-05, 51, 49 | ✗ | ✓ | |
| 16 | Profilbild mit Bildbeschreibung | ✓ ORG-93 | ✗ | ✓ | |
| 17 | Bild: Fehler (zu groß, falsches Format, Rechte nicht bestätigt) | ✗ | ✗ | ✓ | |
| 18 | Bild: lädt hoch | ✗ | ✗ | ✓ | |
| 19 | Bild konnte nicht veröffentlicht werden / erneut versuchen | ✗ | ✗ | ✓ | |
| 20 | Vorschau (privat) | ✓ ORG-09 | ✗ | ✓ | |
| 21 | Vorschau mit Lücken (Einreichen nicht möglich) | ✗ | ✗ | ✓ | |
| 22 | Einreichen: Bestätigungen | ✓ ORG-10 bis 13 | ✗ | ✓ | Zustände 1 bis 3 nicht einzeln geprüft |
| 23 | Einreichen: Fehler (Bestätigung fehlt) | ? | ✗ | ✓ | |
| 24 | In Prüfung | ✓ ORG-14 | ✗ | ✓ | |
| 25 | Eingereichte Fassung ansehen | ✓ ORG-41 | ✗ | ✓ | |
| 26 | Prüfung zurückziehen und bearbeiten (Hinweis: Prüfung beginnt von vorn) | ✗ | ✗ | ✓ | |
| 27 | Rückfrage des Founders ansehen und Angabe korrigieren | ✓ NACH-02 bis 04 | ✗ | ✓ (Freitext) | Figma-Beispiel ist „Ortsangabe unklar“ eines Events, im Code ist die Rückfrage ein Freitext zum Profil |
| 28 | Freigabe: Profil ist live, nächster Schritt (Teilen) | ✓ NACH-01 | ✗ | ✓ (Status „Veröffentlicht“) | Figma-Titel: „Profil und erstes Event öffentlich“, Code gibt das Profil allein frei (Variante B). Ein Teilen-Moment (PP-04) ist nicht belegt |
| 29 | Live-Profil ändern: Änderungen bleiben privat, „Änderungen veröffentlichen“ | ? NACH-06 bis 08 | ✗ | ✓ | Figma „Text ändern“ vermutlich Events; klären |
| 30 | Veröffentlichen bestätigen („Jetzt veröffentlichen?“) | ✗ | ✗ | ✓ | |
| 31 | Founder: Prüfungen offen (Liste) | ✓ INT-01 | n. a. | ✓ | Figma zeigt Ortsbindungen und Artist-Anfragen, Code die Profil-Erstprüfungen |
| 32 | Founder: Profil prüfen (Angaben, Bild, Login-Adresse) | ✓ INT-03 | n. a. | ✓ | Figma gemeinsam mit erstem Event |
| 33 | Founder: Rückfrage eingeben | ✓ INT-04 | n. a. | ✓ | |
| 34 | Founder: Freigeben, Mail erneut senden bei Fehlschlag | ✗ | n. a. | ✓ | |
| 35 | Systemmail: Anmeldecode | ✓ NACH-19 (Textentwurf) | n. a. | ✓ | Inhalt nicht geprüft |
| 36 | Systemmail: „Profil freigegeben und live“ | ✓ NACH-19 | n. a. | ✓ | |
| 37 | Systemmail: „Rückfrage zur Prüfung“ | ✓ NACH-19 | n. a. | ✓ | |
| 38 | Abmelden | ✗ | ✗ | ✓ (Route `/auth/signout`) | sichtbarer Knopf nicht geprüft |
| 39 | Fehlerseiten (kein Zugriff, nicht gefunden) | ✗ | ✗ | ? | |
| 40 | Rechtliches: Impressum, Datenschutz | ✗ | ✗ | ✓ | Rechtstexte gehören zu Welle 0 |

## 2. Zahlen
- **Frames je Zustand und Viewport (Framework §6, B2):** Mobil gibt es in Flow 1 nur für den Profileditor (ORG-88). Alle anderen Screens brauchen einen Mobil-Frame.
- **Fehlende Zustände:** 21 der 40 Zeilen haben keinen Figma-Frame, obwohl der Code sie schon umsetzt (Fehler, Wartezustände, Startseite, Live-Änderungen).
- **Widerspruch Figma ↔ Code im Ablauf selbst:** Nr. 1 (wer legt das Profil an), Nr. 28/32 (Profil allein oder mit erstem Event freigeben).

## 3. Vorschlag für Schritt 2 (fehlende Screens)
Reihenfolge nach Wichtigkeit; jeder Frame in Du-Form, nach Framework, mit Mobil-Variante:
1. **Einstieg klären und zeichnen** (Nr. 1, 7): Einladung oder Übernahme eines vorab angelegten Profils. Braucht zuerst deine Entscheidung zum Ablauf.
2. **Organizer-Startseite** (Nr. 8) mit sechs Statusvarianten.
3. **Login-Zustände** (Nr. 3, 5, 6) und Mobil für ORG-01/02.
4. **Editor-Zustände** (Nr. 12 bis 14, 17 bis 19, 21): Fehler, Speichern, Lückenliste, Upload.
5. **Live-Profil ändern und veröffentlichen** (Nr. 29, 30).
6. **Prüfung zurückziehen** (Nr. 26) und **Founder: Freigeben** (Nr. 34).
7. **Fehlerseiten und Abmelden** (Nr. 38, 39).
8. **Mobil-Frames** für alle übrigen Screens.

Die Vorab-Befunde aus meinem ersten Durchgang liegen in `ORG-A-vorabbefunde.md`; sie fließen in Schritt 3 ein.

## Offene Fragen an den Founder
1. Wer legt in der Alpha das Profil an: der Founder vorab (Code), der Organizer selbst (Figma), oder beides (Einladung mit vorbereitetem Profil)?
2. Wird in Flow 1 das Profil allein freigegeben (Code, Variante B) oder Profil und erstes Event gemeinsam (Figma NACH-01, INT-03)?
3. Gehört die Organizer-Startseite in Flow 1? (Vorschlag: ja.)
