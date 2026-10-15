# DISKOE B2C V1 — Datenvertrag-Ergänzung A1 (Profil und Follow)

> **Hinweis (Dokumentationsabgleich 2026-10-15):** Die aktuelle Feld-Lesefassung ist [`DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md`](DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md). Diese Ergänzung bleibt als Historie erhalten; wo sie abweicht, gilt v0.3 bzw. die [Beschlussdatei](PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md).

**Stand:** 2026-10-15
**Status:** Entwurf zur Prüfung; am 2026-10-15 an die Beschlüsse Q29–Q36/S3 angepasst, aber weiterhin kein typisierter Vertrag; Ergänzung zu `docs/DATA_CONTRACT_B2C_V1.md` (v0.1, unverändert erhalten). Kein DB-Schema, keine Implementierung.
**Herkunft:** zunächst Nutzerübergabe aus dem Developer-Chat vom 15.10.2026, danach gegen die direkt gelesene Notion-Beschlussseite vom 15.10.2026 abgeglichen (kein Auto-Sync). Produktkontext: [PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md](PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md); Vorschlagshistorie: `docs/SCOPE_EXTENSION_B2C_2026-10-15.md`.

Diese Ergänzung ersetzt v0.1 nicht. Q29–Q36 sind inzwischen als Produktentscheidungen beschlossen; als Datenvertrag bleibt diese Ergänzung ein Entwurf, bis der typisierte B2C-Datenvertrag vorliegt.

## Berührte Zeilen von v0.1

| v0.1-Bereich | Wirkung der Ergänzung |
|---|---|
| Organizer („Logo/Cover/Akzentfarbe optional"; „Profilminimum noch offen") | Profilgestaltung ist Kernbestandteil. **Profilminimum beschlossen (Q35):** Projektname, Kurzvorstellung, eindeutige Profil-URL, mindestens ein offizieller Link oder Kontakt und ein Cover oder Anzeigebild; die frühere Bildoptionalität gilt für Profile nicht mehr. Für die Eventpublikation bleibt Gestaltung nicht verpflichtend. Details: [PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md](PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md). |
| Kuration | Wiederverwendet; bis zu drei Events oder Organizerprofile mit persönlichem Kommentar, ausdrücklich bestätigt, Urheberschaft sichtbar, eigene Angebote getrennt (Q34 beschlossen). Private Einladung für fehlende Ziele kommt hinzu. |
| „Consumer-Discovery nicht Teil V1" | Unverändert. Follow ist kein Discovery. |

## Neue logische Konzepte [Entwurf; fachlich durch Q29–Q36 gedeckt, technisch offen]

| Konzept | Angaben | Regel |
|---|---|---|
| Profilgestaltung | gewählte Gestaltungsrichtung, Farben, Schriftkombination, Hintergrund | Designunabhängige Eventdaten; Gestaltung ändert keine Publikationsregeln. Drei Richtungen, sechs Paletten je Richtung plus eigene Farben, drei Schriftkombinationen je Richtung, nur einfarbige Hintergründe (Q30). |
| Profilmodule | aktivierte Module, Reihenfolge innerhalb definierter Bereiche, Modulinhalte | Fünf optionale Module, je eine Instanz, Limits aus Q29 (u. a. bis sechs Bilder, bis drei Empfehlungen, bis fünf Links, sechs Archiv-Events). Kein freies HTML/CSS/Canvas. |
| Externe Musik-/Linkinhalte | offizieller externer Link/Player | Kein eigenes Audio-/Videohosting; Anbieter, Rechte, Fallback offen (Q31). |
| Profil-Bearbeitungsstand | privater Stand und öffentlich bestätigter Stand | Wie bei Events nicht still überschreiben; Auswirkung auf bestehende Events offen (Q35). |
| Abonnement | Organizerbezug, Kanal, Zweck, Bestätigungsstand, Verwaltung/Abmeldung | Privat; getrennt von öffentlichen Inhalten; keine Organizerrechte; kein Consumerkonto vorausgesetzt (Q32). |
| Update-Anlass | neues veröffentlichtes Event; Änderung/Absage separat | Versandregeln offen (Q33); keine Versandregel beschlossen. |

## Grundsätze [Richtung]

- Entwürfe und Abodaten erscheinen nie öffentlich.
- Eventdaten und Publikationsregeln bleiben designunabhängig; Datum, Ort, Kosten, Zugang und Ticket-/RSVP-Aktion bleiben auf Eventseiten stabil auffindbar.
- Ein Abonnement beweist weder Teilnahme noch Reichweite; Ticketklicks sind keine Verkäufe.
- Unbestätigte Anmeldungen werden nach sieben Tagen gelöscht; Aufbewahrung notwendiger Sperr-/Versandinformationen ist offen (Q36).

## Nach den Beschlüssen vom 2026-10-15 zu typisierende Konzepte (keine Felder festgelegt)

- **Eventgestaltung** je Event, unabhängig von der Profilgestaltung; „Profilgestaltung übernehmen" ist nur Starthilfe ohne Bindung; Duplizieren übernimmt sie (Q35).
- **Profil-Offline-Zustand** als eigene Aktion mit Wirkung auf Events/Abos, ohne automatische Eventabsage (Q35).
- **Abonnement-Lebenszyklus:** unbestätigt (Löschung nach sieben Tagen), aktiv, abgemeldet; je Adresse und Projekt höchstens ein aktives Abo; getrennt von DISKOE-Newsletter (Q32/Q36).
- **Ankündigungs-Dedup:** ein Event je Abo einmal als neu angekündigt; Änderung/Absage als separate Update-Anlässe an die damalige Empfängergruppe (Q33).
- **Persönliche Einladung:** privater Vormerk (externer Link, optional Projektname), Einladungslink, spätere bestätigte Verknüpfung mit einem registrierten Profil (Q34).
- **Musikreferenz:** Anbieter SoundCloud oder Spotify, Inhaltstyp, Überschrift/Kommentar, Aktivierungs-/Fallbackzustand (Q31).
- **Mischformat:** Hauptformat plus Ergänzungen; verlinkte Einträge für unabhängig besuchbare Teile (Art der Verlinkung offen) (S3).
- **Zugänglichkeit:** Bereichszugang mit Folgeangaben zu WC, Aufzug/Rampe, Hilfe, Kontakt (S3-Entscheidung 3; erweitert B10, ändert die 32 Fragen nicht).

Der typisierte separate B2C-Datenvertrag mit Discovery-Eignung ist die nächste fachliche Aufgabe und ersetzt diese Liste.

## Offen

Feldnamen, Enums, Modul-/Medienlimits, Doppel-Opt-in-Form, Versand-Deduplizierung, Aufbewahrung, Rechtstexte und Messschema bleiben offen und werden nicht von dieser Ergänzung festgelegt.

**Verifikationsstand:** redaktionell aus der Nutzerübergabe und der direkt gelesenen Notion-Beschlussseite konsolidiert; keine Softwaretests, keine Laufzeitprüfung.
