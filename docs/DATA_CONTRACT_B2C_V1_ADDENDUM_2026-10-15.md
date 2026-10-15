# DISKOE B2C V1 — Datenvertrag-Ergänzung A1 (Profil und Follow)

**Stand:** 2026-10-15
**Status:** Entwurf zur Prüfung; Ergänzung zu `docs/DATA_CONTRACT_B2C_V1.md` (v0.1, unverändert erhalten). Kein DB-Schema, keine Implementierung.
**Herkunft:** Nutzerübergabe aus dem Developer-Chat vom 15.10.2026; kein direkter Notion-Abgleich. Produktkontext: `docs/SCOPE_EXTENSION_B2C_2026-10-15.md`.

Diese Ergänzung ersetzt v0.1 nicht. Wo sie v0.1 berührt, gilt sie als Vorschlag, bis die genannten Entscheidungen Q29–Q36 getroffen sind.

## Berührte Zeilen von v0.1

| v0.1-Bereich | Wirkung der Ergänzung |
|---|---|
| Organizer („Gestaltungsangaben optional"; „Profilminimum noch offen") | Profilgestaltung wird Kernbestandteil; Profilminimum bleibt offen (Q35). Gestaltungsangaben bleiben für Eventpublikation nicht verpflichtend. |
| Kuration | Wiederverwendet; Auswahl und Kommentar ausdrücklich bestätigt, Urheberschaft sichtbar, Empfehlungen von eigenen Angeboten getrennt. Organizerprofil-Empfehlungen offen (Q34). |
| „Consumer-Discovery nicht Teil V1" | Unverändert. Follow ist kein Discovery. |

## Neue logische Konzepte [Vorschlag]

| Konzept | Angaben | Regel |
|---|---|---|
| Profilgestaltung | gewählte Gestaltungsrichtung, Farben, Schriftkombination, Hintergrund | Designunabhängige Eventdaten; Gestaltung ändert keine Publikationsregeln. Details Q30. |
| Profilmodule | aktivierte Module, Reihenfolge innerhalb definierter Bereiche, Modulinhalte | Optionale Module; Limits offen (Q29). Kein freies HTML/CSS/Canvas. |
| Externe Musik-/Linkinhalte | offizieller externer Link/Player | Kein eigenes Audio-/Videohosting; Anbieter, Rechte, Fallback offen (Q31). |
| Profil-Bearbeitungsstand | privater Stand und öffentlich bestätigter Stand | Wie bei Events nicht still überschreiben; Auswirkung auf bestehende Events offen (Q35). |
| Abonnement | Organizerbezug, Kanal, Zweck, Bestätigungsstand, Verwaltung/Abmeldung | Privat; getrennt von öffentlichen Inhalten; keine Organizerrechte; kein Consumerkonto vorausgesetzt (Q32). |
| Update-Anlass | neues veröffentlichtes Event; Änderung/Absage separat | Versandregeln offen (Q33); keine Versandregel beschlossen. |

## Grundsätze [Richtung]

- Entwürfe und Abodaten erscheinen nie öffentlich.
- Eventdaten und Publikationsregeln bleiben designunabhängig; Datum, Ort, Kosten, Zugang und Ticket-/RSVP-Aktion bleiben auf Eventseiten stabil auffindbar.
- Ein Abonnement beweist weder Teilnahme noch Reichweite; Ticketklicks sind keine Verkäufe.
- Aufbewahrung von Abodaten ist offen (Q36).

## Offen

Feldnamen, Enums, Modul-/Medienlimits, Doppel-Opt-in-Form, Versand-Deduplizierung, Aufbewahrung, Rechtstexte und Messschema bleiben offen und werden nicht von dieser Ergänzung festgelegt.

**Verifikationsstand:** redaktionell aus der Nutzerübergabe konsolidiert; keine Softwaretests, keine Notion-Prüfung.
