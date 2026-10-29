# Slice 4: Manueller Evententwurf mit konkreter Lückenprüfung

Stand: 2026-10-29 (UI nach Figma neu gebaut). Drei kleine PRs: #21 (Domänenlogik), #22 (Migration Eventbild-Pfad), dieser PR (App).

## Was gebaut ist

- **Domäne** (`lib/domain/`): `answers.ts` (fünf Antwortzustände), `money.ts` (Cent, kein Float), `time.ts` (Europe/Berlin über `Intl`, nicht existente und doppelte Ortszeit werden gemeldet), `event-publication.ts` (Eingabe, Formate ohne „Sonstiges“, Atmosphäre, Zugang, Lücken), `event-slug.ts`.
- **Datenbank:** Migration `20261028180000_event_image_path.sql` (Pfad `events/<event>/<use>.<ext>` bei Bestätigung eines Eventbilds, Alt-Text Pflicht). Auf dem Dev-Projekt angewendet am 2026-10-28.
- **App nach den Figma-Screens** (Datei `4wtHBUljZkvFetSA9ZujjY`): `/organizer/events/new` (Eventstart `2533:3824`, nur „Manuell eingeben“), `…/[eventId]/edit` (Eventeditor `2496:1261`, mobil `2496:2540`), `…/atmosphere` (`2498:1534`, `2496:1744`), `…/access` (Preis und Zugang `2688:10292`, `2688:12129`, `2688:10777`, `2688:13223`), `…/preview` (Veröffentlichungscheck `2496:1925`, `2496:2079`, `2533:4219`), `…/image` (Eventbild `2533:4121`). Liste „Deine Events“ auf der Organizer-Startseite. Gespeichert wird pro Seite (`saveEventSection`: Grundlagen, Zugang, Atmosphäre), die gesendeten Felder liegen über dem gespeicherten Entwurf. Bausteine in `components/ui/` (Button, Feld, Chip, Karten, Seitenrahmen), nur über Tokens. Persistenz in `lib/event/` (`draft.ts`, `load.ts`, `values.ts`, `summary.ts`).
- **Tests:** Unit-Tests für Domäne, Slug, Abbildung Datenbank/Formular und Zusammenfassungstexte; `e2e/event.spec.ts` (läuft über alle Figma-Seiten, nimmt Screenshots auf: Artefakt `event-screens`); RLS-Tests für den Eventbild-Pfad.

## Abdeckung der P-Fälle

Vollständig geführt: P01, P03, P04, P07, P08, P11, P12, P13, P50. Teilweise: P02, P09. P05 ist eine Durchstich-Abweichung (Bild nur Pflicht zum Veröffentlichen). Nicht geführt: P10, P14, P15, P17, P18, P49.

## Entscheidungen und Annahmen (Vorschläge, keine Produktentscheidungen)

- Slug aus Titel plus sechs Zufallszeichen, nach dem Anlegen fest.
- Event-Entwürfe sind für jeden Organizer mit Profil möglich, auch bevor das Profil live ist (das Veröffentlichen eines Events verlangt ein veröffentlichtes Profil, Slice 5). Abweichung von der Planung, die „erst wenn das Profil live ist“ vorsah.
- Ein halb ausgefüllter Ort wird als Fehler gemeldet, weil die Datenbank einen Ort nur mit Name und Adresse speichert.
- Das Ende ist optional; „Das Ende steht noch nicht fest“ ist ein bewusstes `unknown`.
- Längenlimits und Texte sind `TODO(spec)`.

## Offen für Slice 5

- Der Link eines Online-Zugangs (P08) wird von der Datenbank nicht geprüft (`access_url` kommt nur aus der App-Logik). Der Veröffentlichungsschritt muss `eventGapCodes` mit ausführen.
- Storage-Policy für das öffentliche Bucket kennt nur Profilbilder; Eventbilder werden erst bei der Veröffentlichung kopiert.
- Vorschau, Freigabe, Veröffentlichung, Absage, Verschiebung. Ob Events dem Ablauf „Variante B“ folgen, ist zu entscheiden.
- Der Abgleich der schon gebauten Profil- und Founder-Seiten mit Figma steht aus (eigener Schritt, nur Abweichungsliste).
- KI-Erfassung (Text, Flyer, Link im Eventstart) ist ein eigener späterer Slice mit eigener Freigabe.

## Abweichungen von Figma (bewusst, im PR genannt)

1. **Ein Preis für das ganze Event** statt Preis je Zugangsweg (Vertrag `02-durchstich.md`, Datenbank). Gebühren, Verfügbarkeit, „ab“, „von bis“, Spende und „Zusätzlicher Preishinweis“ fehlen (P10, kein Feld).
2. **„Programm und Besuch“** (Reiter, Zusammenfassung, Einlass, Alter, Programm, Musik) fehlt: nicht im Durchstich (B09 bis B12, P49), keine Spalten.
3. **Eventgestaltung** (Farbpalette, Schrift, Farben, „Profilgestaltung übernehmen“) und „Hochgeladenen Flyer verwenden“ fehlen: nicht im Durchstich bzw. Teil der KI-Erfassung.
4. **Atmosphäre-Begriffe nach Vertrag** („Alternativ/unabhängig“, „Community-geprägt“), nicht nach dem Wireframe.
5. **Ort in vier Feldern** (Name, Straße, PLZ, Stadt) statt einem Feld, weil die Datenbank sie getrennt führt.
6. **Datum und Uhrzeit** als ein Feld je Beginn/Ende mit dem Browser-Auswahlfeld statt formatiertem Text; „Das Ende steht noch nicht fest“ als zusätzliche Auswahl (Antwortzustand `unknown`).
7. **Expliziter Speichern-Knopf** („Grundlagen speichern“) statt Autosave; die Badge „Entwurf · gespeichert“ steht fest.
8. **Eventbild:** Alternativtext und Rechte-Bestätigung zusätzlich (Pflicht laut Vertrag/Datenbank).
9. **Eventstart:** Felder für Text, Flyer und Link fehlen (KI-Erfassung später); statt der Figma-Erklärung steht ein ehrlicher Hinweis, dass die Erfassung noch nicht freigeschaltet ist.
10. **Vorschau:** „Mobile Vorschau“ und „Zum Ticketanbieter“ (Prototyp) fehlen; „Zur Prüfung einreichen“/„Weiter zur Bestätigung“ sind gesperrt (Einreichen ist Slice 5). Neutraler Hinweis ersetzt die Prototyp-Fußnoten.
11. **Zugangs-Bezeichnungen** nach Figma („Ohne Anmeldung“, „Abendkasse“, „Online-Ticket“, „Online-Anmeldung“); Werte im Code bleiben `walk_in`, `door`, `online_ticket`, `online_registration`.
12. Die neutrale Füllfarbe der getönten Blöcke (`neutral/100`) ist kein Token; es wird `--surface` verwendet.
