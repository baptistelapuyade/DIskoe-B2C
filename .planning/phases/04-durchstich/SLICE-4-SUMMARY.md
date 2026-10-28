# Slice 4: Manueller Evententwurf mit konkreter Lückenprüfung

Stand: 2026-10-28. Drei kleine PRs: #21 (Domänenlogik), #22 (Migration Eventbild-Pfad), dieser PR (App).

## Was gebaut ist

- **Domäne** (`lib/domain/`): `answers.ts` (fünf Antwortzustände), `money.ts` (Cent, kein Float), `time.ts` (Europe/Berlin über `Intl`, nicht existente und doppelte Ortszeit werden gemeldet), `event-publication.ts` (Eingabe, Formate ohne „Sonstiges“, Atmosphäre, Zugang, Lücken), `event-slug.ts`.
- **Datenbank:** Migration `20261028180000_event_image_path.sql` (Pfad `events/<event>/<use>.<ext>` bei Bestätigung eines Eventbilds, Alt-Text Pflicht). Auf dem Dev-Projekt angewendet am 2026-10-28.
- **App:** `/organizer/events/new` (Titel, legt privaten Entwurf an), `/organizer/events/[eventId]/edit` (alle Pflichtangaben, Speichern auch unvollständig, Eventbild), Liste „Deine Events“ auf der Organizer-Startseite. Persistenz in `lib/event/` (`draft.ts`, `load.ts`, `values.ts`).
- **Tests:** Unit-Tests für Domäne, Slug und Abbildung Datenbank/Formular; `e2e/event.spec.ts`; RLS-Tests für den Eventbild-Pfad.

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
- Figma-Abgleich (Eventeditor `2686:10021`, Flow `2496:2924`) wurde in diesem PR nicht durchgeführt; das Formular ist ein schlichtes Formular ohne Gestaltung nach Figma.
