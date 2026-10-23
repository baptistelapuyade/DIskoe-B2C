# 02 — Durchstich (erster Bauabschnitt)

Ziel: ein echter Ablauf von Anmeldung bis öffentliche Eventseite, ohne KI, E-Mail-Versand, Plus und Besucherfunktionen. Danach erweitern wir Schicht für Schicht.

## Umfang
1. **Anmeldung** per E-Mail-Code; Organizerbereich nur für zugeordnete Profile. (Delta v0.4 §14.1)
2. **Profil anlegen** als Typ *Veranstalter* (Venue und Artist später): Name, Kurzvorstellung, Slug, ein offizieller Link oder Kontakt, Profilbild. Als privater Entwurf speichern, mit „Veröffentlichen“ öffentlich. (v0.3 §3, v0.5 §4.1)
3. **Event manuell anlegen**: Titel, Hauptformat (7 Formate), Beschreibung, Start (mit Zeitzone), Ort als Text mit Adresse, Preis (`free/fixed/unknown`), Zugangsweg, Eventbild (Pflicht zur Veröffentlichung), Atmosphäre (1–3 Tags oder eigene Beschreibung). Pflichtlücken konkret anzeigen. (v0.3 §4–§7, P01–P08)
4. **Veröffentlichen** mit Vorschau und ausdrücklicher Bestätigung. Veröffentlichter Stand getrennt vom Entwurf.
5. **Öffentliche Eventseite** `/e/[slug]` ohne Login: Kopf mit Format-Tag, Faktenblock, „Gut zu wissen“ (Balken), Beschreibung, Atmosphäre, Organizer-Link, Herkunftszeile. Strukturierte Daten (JSON-LD `Event`), Meta-Tags, Sitemap. Entwurf nicht erreichbar. (R07, R11, v0.5 §6.7)
6. **Öffentliche Profilseite** `/[profil-slug]` mit kommenden Events (nächster hervorgehoben), Leerzustand „Neue Termine folgen“. Standard-Theme (DISKOE Default), keine Gestaltungsanpassung noch.
7. **Event absagen / verschieben** mit Statusanzeige auf der Seite (ohne E-Mail). (v0.3 §4, Zustände-Screens)

## Nicht im Durchstich
KI-Erfassung, Follow und E-Mail, Merken, Plus/Reservierung, Profilgestaltung (Editor), Module (Musik, Galerie, Empfehlungen, Archiv), Venue-Bestätigung, Künstlerseiten, Briefing-Link, Analytics, Feedback.

## Abnahme (Auszug, als Playwright-Flows)
- Ohne Bild: Veröffentlichen blockiert, Entwurf und private Vorschau möglich (P05).
- Unbekannter Preis wird nie als „Frei“ angezeigt (P07).
- Entwurfs-URL liefert für Fremde 404/403, nicht nur `noindex`.
- Eventseite zeigt `Europe/Berlin`-Zeit korrekt für Ende nach Mitternacht (P11).
- Absage ändert Seitenstatus sofort, ohne andere private Änderungen zu veröffentlichen.
- JSON-LD enthält kein erfundenes `endDate` und keinen Preis 0 bei unbekanntem Preis.

## Reihenfolge der Folgeschichten (Vorschlag)
Profilgestaltung und Module → KI-Erfassung → Follow/E-Mail → Venue/Künstler/Briefing (Netzwerk-Bausteine) → Plus-Reservierung → Besucher (Merken, Kalender).
