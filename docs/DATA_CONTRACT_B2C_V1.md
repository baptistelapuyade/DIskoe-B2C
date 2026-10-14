# DISKOE B2C V1 — Datenvertrag v0.1

**Stand:** 2026-10-14
**Status:** Lesefassung beschlossener Produkt-/Publikationsregeln; S2 insgesamt noch in Ausarbeitung. Kein DB-Schema und keine Implementierung.

Diese B2C-Fassung ersetzt oder überschreibt keinen früheren Consumer- oder DMO-Vertrag. Sie gilt zunächst für einzelne datierte Berliner Präsenz-Kulturveranstaltungen an einem Ort: Live-/DJ-Abend, Offspace-/Vernissage-Abend und Filmabend.

## Verbindliche Grundsätze

- Herkunft, KI-Verarbeitung, Prüfstatus, Organizer-Bestätigung und öffentlicher Stand bleiben unterscheidbar.
- Nur der ausdrücklich bestätigte öffentliche Inhaltsstand wird veröffentlicht. KI-Vorschläge und Interpretationen sind keine Fakten.
- Unbekannt, unbearbeitet fehlend und nicht zutreffend sind verschiedene Zustände.
- Änderungen überschreiben den veröffentlichten bestätigten Stand nicht still. Duplizieren erzeugt einen neuen privaten Entwurf.
- Private Zugangsdaten, Rohmaterial und interne Prüfnotizen sind nicht öffentlich.
- Entwürfe erscheinen weder auf öffentlichen Seiten noch in Empfehlungen oder späterer Discovery.

## Logische Feldgruppen

| Bereich | Angaben | Beschlossene Regel |
|---|---|---|
| Organizer | Name, Vorstellung, Logo/Cover/Akzentfarbe, offizielle Links, privater Verantwortlicher | Name und berechtigter Verantwortlicher sind für Eventpublikation nötig; Gestaltungsangaben optional. Eigenständiges Profilminimum noch offen. |
| Ort | Name, eindeutige Adresse, Eingang/Anreise, räumliche Zugänglichkeit; optional Bezirk/Koordinaten | Bestätigter Ort und Adresse für normale V1-Events. Eventbezogene Regeln nicht still vom Ort übernehmen. |
| Reihe | Name, Konzept, Format-/Text-/Medienvorlage | Optional; Vorschlagsquelle, keine automatische Terminserie. |
| Eventidentität | stabile Identität/URL, Organizerbezug, Titel, Format, Beschreibung | Titel, Format und verständliche bestätigte Beschreibung erforderlich. |
| Zeit | Beginn mit Datum/Zeitzone; optional Einlass, Ende, Besuchsfenster/letzter Einlass | Bestätigter Beginn erforderlich; Berlin nutzt `Europe/Berlin`. Ende nie erfinden und muss nach Beginn liegen. |
| Kosten | kostenlos, konkreter Preis, ab-Preis, Spanne, Spende oder bestätigt unbekannt | Explizite Kostenangabe erforderlich. Fehlend ist niemals automatisch kostenlos. |
| Zugang | ohne Anmeldung, Abendkasse oder Anmeldung/Ticket; Einschränkungen | Zugangsweg erforderlich. Notwendige Online-Anmeldung verlangt einen funktionierenden bestätigten Link. |
| Formatinhalt | Musik/Programm; Offspace-Thema/Besuchsmodus; Film/Screening und Sprache/Untertitel | Formatabhängige Mindestregeln gelten; zulässiges Unbekannt muss ausdrücklich bestätigt werden. |
| Medien/Belege | Artwork, Logo/Fallback, offizielle Audio-/Videolinks, weitere Belege | Artwork optional; keine erfundenen/fremden Eventfotos. Externe Links statt eigenem Audio-/Videohosting. |
| Kontext | Ablauf, späterer Einstieg, Indoor/Outdoor, Zugänglichkeit, Beteiligung, Mood/Vibe | Ergänzend und formatabhängig. Interpretationen kennzeichnen; keine ungeprüften KI-Behauptungen. |
| Herkunft/Freigabe | Eingabe-/Referenzbezug, Verarbeitung/Prüfstatus, Verantwortlicher, Zeitpunkt, bestätigte Version | Herkunft und Bestätigung sind nachvollziehbar zu halten; keine numerischen KI-Scores als Wahrheitssignal. |
| Pflege/Status | privater Entwurf, öffentlicher Stand, aktiv, abgesagt, verschoben, zurückgenommen, vergangen | Bearbeitungsstand, Publikationsberechtigung und öffentlicher Eventstatus getrennt modellieren; konkrete Enums offen. |
| Kuration | Sammlung, Eventreferenzen, Reihenfolge, Kommentar, Organizer als Urheber | Eigene Events und Empfehlungen trennen; keine Eventkopien; inaktive Events nicht aktiv empfehlen. |

## Veröffentlichungsminimum

Eine Publikation benötigt:

- öffentlichen Organizernamen und verknüpften berechtigten Verantwortlichen;
- Titel, Format und verständliche freigegebene Beschreibung;
- bestätigtes Datum, Beginn und Zeitzone;
- bestätigten eindeutigen Ort und Adresse;
- explizite Kostenangabe, einschließlich zulässigem „noch nicht bekannt“;
- expliziten Zugangsweg und bei notwendiger Online-Anmeldung einen funktionierenden Link;
- zutreffende formatabhängige Pflichtantworten;
- aufgelöste kritische Widersprüche;
- ausdrückliche Bestätigung des Inhalts sowie des erklärten Daten-/Medienumfangs.

Artwork, externe Event-URL, KI-Umschreiben, Mood-Tags, Decision Snippet, Kartenkoordinaten, vollständiges Line-up und Hörbeispiel sind keine pauschale Publikationspflicht.

## Formatabhängige Regeln

- **Live/DJ:** musikalischer Inhalt muss über angekündigte Künstler oder bestätigtes Musik-/Live-/DJ-Konzept verständlich sein. Vollständiges Line-up/Hörbeispiel optional. Bekannte Einlass-/Altersregeln sichtbar; nichts erfinden.
- **Offspace/Vernissage:** Thema bzw. Programmkonzept und Besuchsmodus bestätigen. Bei flexiblem Besuch das Besuchsfenster erfragen; bestätigt unbekanntes/offenes Ende darf transparent bleiben.
- **Filmabend:** konkreten Film oder verständliches Screening-Konzept sowie Sprache/Untertitel explizit abfragen. Bestätigt unbekannt ist zulässig. Dauer/Nachgespräch nicht aus externem Filmwissen ergänzen.

## Zeit und Lebenszyklus

- Ein Termin pro Event; mehrere Termine sind einzelne Events. Über-Mitternacht-Termine zeigen beide Kalendertage eindeutig.
- Bei unbekanntem Ende gilt intern 12:00 Uhr am Kalendertag nach dem Beginn als Archiv-Cutoff. Daraus wird keine öffentliche Endzeit oder laufende Besuchbarkeit abgeleitet.
- Eine wesentliche Änderung erzeugt einen privaten Bearbeitungsstand; der öffentliche Stand bleibt bis zur erneuten Bestätigung unverändert.
- Absage wirkt sofort, bleibt am bestehenden Link sichtbar und entfernt Ticketaktion sowie aktive Empfehlungen/Discovery.
- Entfernung nimmt öffentliche Details/Medien zurück; der alte Link zeigt nur einen neutralen Nicht-verfügbar-Zustand. Entfernung ist keine Zusage vollständiger Sofortlöschung aus Backups oder fremden Caches.
- Vergangene Events bleiben als gekennzeichnetes Archiv ohne aktive Ticketaktion; frühere Absage/Verschiebung wird nicht verdeckt.

## Daten- und Mediennutzung

Beschlossen ist die Nutzung bereitgestellter Texte und freigegebener Bilder für Organizer-/Eventseiten, Sharing-Anpassungen und spätere DISKOE-Discovery. Erlaubte Anpassungen umfassen Größenänderung, Bildausschnitt und Kombination mit bestätigten Eventdaten. Keine automatische API-/Partnerweitergabe. Der Organizer sieht die Vorschau und bestätigt den konkreten Umfang; konkrete Rechtstexte und Aufbewahrungsfristen bleiben offen.

## Discovery-Vorbereitung

Ein bestätigter veröffentlichter Stand ist notwendige Grundlage, aber kein automatischer Nachweis jeder Suchpassung. Unbekannter Preis ist keine Budgetpassung; fehlende Koordinaten keine Radiussuche; unbekanntes Ende keine laufende Besuchbarkeit. Abgesagte, entfernte, vergangene oder unbestimmt verschobene Events werden nicht aktiv empfohlen. Die abschließenden Discovery-Regeln und Schwellen bleiben offen; Consumer-Discovery ist nicht Teil der V1-Implementierung.

## Offene technische Details

- technische Feldnamen, Datentypen, Enums, IDs und Speichergrenzen;
- Auth-/Rechte- und Versionsmodell, Aufbewahrung/Löschung und Medien-Caches;
- eigenständiges Organizerprofilminimum;
- geheime/TBA-/ungefähre Orte und weitere Zugangswege;
- endgültige Discovery-Eignung, Suchfälle und Messschema;
- vollständiger adaptiver Fragenpool sowie konkrete Bestätigungs-/Freigabetexte.

## Spätere Abnahmefälle

- Fehlender Titel, Beginn oder eindeutige Adresse blockiert Publikation und zeigt die konkrete Lücke.
- Freier Eintritt ohne Ticketlink blockiert nicht; erforderliche Online-Anmeldung ohne gültigen Link blockiert.
- Fehlendes Artwork nutzt typografischen Fallback; unbekannter Preis bleibt unbekannt, nie `0` oder kostenlos.
- Unbearbeitete Film-Sprache erzeugt Rückfrage; bestätigt unbekannt darf transparent veröffentlicht werden.
- KI-Erfindungen zu Preis, Line-up, Zugang oder URL werden nicht als Fakten publiziert.
- Änderung im Entwurf verändert den öffentlichen bestätigten Stand nicht.
- Nachttermin, unbekanntes Ende, Absage, Entfernung und Archivierung folgen den obigen Regeln.

**Verifikationsstand:** redaktionell aus dem aktuellen Build-Dokument konsolidiert; keine Softwaretests, Livepublikation oder Prüfung mit echten freigegebenen Organizer-Materialien.
