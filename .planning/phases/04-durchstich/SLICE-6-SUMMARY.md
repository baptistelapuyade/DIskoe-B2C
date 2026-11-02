# Slice 6: Öffentliche Seiten

Stand 2026-11-02. Zwei Draft-PRs: I (Datenschicht und Eventseite), J (Profilseite, Sitemap, robots).

## PR I: Eventseite `/e/[slug]`
- **Eine Quelle:** `lib/public/dto.ts` macht aus den Views `public_events` und `public_profiles` (nur bestätigter, veröffentlichter Stand) ein `PublicEvent`. Seite, Meta-Tags (`lib/public/metadata.ts`) und JSON-LD (`lib/public/json-ld.ts`) lesen nur dieses Objekt. Lesen als `anon` ohne Cookies (`lib/public/client.ts`).
- **Zugriff:** Entwürfe, nie veröffentlichte oder zurückgezogene Events und unbekannte Adressen enden im selben 404. Es gibt keine Vorschau-URL für Entwürfe.
- **Regeln, getestet in `tests/unit/public-event.test.ts`:** unbekannter Preis → „Preis noch offen“, kein `offers`, nie „Frei“ oder 0; nicht gefragter Preis → keine Zeile; „Frei“ nur bei bestätigt kostenlos; Nacht über Mitternacht zeigt „23:00 → 04:00“ mit „Bis So., …“ in Berliner Ortszeit; unbekanntes Ende erzeugt weder Anzeige noch `endDate`; abgesagt → `EventCancelled`, kein Ticketlink, kein `offers`; verschoben ohne Datum → `EventPostponed`, kein Datum, kein `startDate`; nur http/https-Links.
- **E2E:** `e2e/public-pages.spec.ts` (live, abgesagt, verschoben ohne Datum, Entwurf und Unbekanntes 404, Meta, JSON-LD), in der CI beim Job mit lokalem Supabase eingetragen.

### Abweichungen von Figma (`PUB-01`, Mobil 2652:7621)
1. **Weggelassen (Alpha-Ausschluss):** Merken, Teilen-Schalter, Kalender-Link, „Bei Änderungen benachrichtigt werden“, Änderungs-Karte, Follow-Karte in „Veranstaltet von“. Der Block zeigt Profilbild, Name, Kurzvorstellung und „Zum Profil ↗“.
2. **Weggelassen (keine Daten in der Alpha):** Programm, Musikalische Richtung, Einlass, Alter, Vor Ort, Zugänglichkeit, „Route öffnen“. „Gut zu wissen“ hat nur den Balken „Eintritt“ (Preis und Zugangswege), der nur erscheint, wenn es Angaben gibt.
3. **Farben:** Die Figma-Bänder nutzen Werte ohne Token (`#f5f3f0`, `#2b2a29`, `#bf8bf3`, `#181817`). Umgesetzt mit Tokens: Kopf `secondary`, Beschreibung und Veranstalter `foreground`, Atmosphäre `brand-lavender`. Die Profilpalette (Rollen) wird nicht angewendet, es gilt das Standard-Theme (Durchstich Punkt 6).
4. **Texte der Statusvarianten** („Neuer Termin“, „Neuer Termin folgt“, „Abgesagt“ mit je einem Satz) sind Vorschläge; die Figma-Texte (`PUB-19`, `23`, `24`) sind laut Index noch nicht vom Founder bestätigt.
5. **Überschrift der Beschreibung** „Über das Event“ statt des Beispieltitels „Die Nacht“. Das Eventbild wird mit `object-contain` gezeigt (Figma „Fit“).
6. Der Ticketlink steht nur, wenn ein Zugangsweg eine Adresse hat; Button „Zum Ticketanbieter ↗“ bzw. „Zur Anmeldung ↗“. Abgesagte Events zeigen keinen Ticketlink.

## PR J: Profilseite `/[profileSlug]`, Sitemap, robots
- `app/[profileSlug]/page.tsx`: Name, Profilbild, Kurzvorstellung, „Kommende Events“ (nicht abgesagt, `start_at` bzw. bekanntes Ende nicht vorbei, aufsteigend; das nächste farbig hervorgehoben; ab dem vierten Eintrag „Mehr anzeigen (n)“ als `<details>`, ohne Skript), sonst „Neue Termine folgen.“, darunter offizieller Link und Kontakt. Feste Routen (`/e`, `/organizer`, `/login`, `/auth`) haben Vorrang, die Datenbank hält reservierte Wörter aus den Profil-Slugs, alles Unbekannte ist 404.
- `app/sitemap.ts`: veröffentlichte Profile und ihre nicht abgesagten Events (auch vergangene und „Termin folgt“), Basis `NEXT_PUBLIC_SITE_URL`. `app/robots.ts`: sperrt `/organizer`, `/internal`, `/auth`, `/login`, `/api`, nennt die Sitemap.
- **Annahmen:** Ein ohne neuen Termin verschobenes Event steht ohne Datum hinter den datierten in der Liste (es existiert noch, hat aber keinen Termin). Abgesagte Events stehen nicht in Sitemap und Profilliste, ihre Seite bleibt erreichbar. Vergangene Events stehen in der Sitemap, nicht in der Profilliste.
- **Weggelassen:** Follow-Section „Nichts verpassen“, Profilmodule, Profilgestaltung/Palette (Standard-Theme), Teilen, „Programm ansehen“ (Alpha-Ausschluss bzw. nicht im Durchstich). Leertext nach Figma-Index im alten Stil („Keine kommenden Events · Neue Termine folgen“); hier der Wortlaut „Neue Termine folgen.“ aus dem Durchstich.
- E2E erweitert: Profilseite, Sitemap (nur Öffentliches), robots, Leerzustand, `/impressum` als 404.

### Nicht geprüft
Kein Vergleich mit einem gerenderten Figma-Screenshot (Download aus der Umgebung gesperrt); Abgleich nur gegen den Figma-Code. Typecheck, Lint, Unit- und E2E-Tests laufen lokal nicht (Registry gesperrt), nur in der CI.
