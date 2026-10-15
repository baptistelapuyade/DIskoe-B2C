# DISKOE B2C — Scope-Erweiterung Profil und Follow (Stand 2026-10-15)

**Herkunft:** Nutzerübergabe aus dem Developer-Chat vom 15.10.2026. Es gab keinen direkten Notion-Abgleich und es gibt keinen Auto-Sync. Die Notion-Seiten wurden laut Nutzer in einem anderen Chat aktualisiert; ihr aktueller Inhalt wurde in dieser Session nicht unabhängig geprüft (Zugriff lieferte 404). Ein gezielter Abgleich mit Notion bleibt **offen**.

**Kennzeichnung:** **[Richtung]** = vom Nutzer übergebene verbindliche Produktrichtung. **[Vorschlag]** = Diskussionsvorschlag, keine Freigabe. **[Offen]** = zu entscheiden. **[Schätzung]** = ungeprüfte Planungshypothese.

Dieses Dokument ergänzt `docs/PROJECT.md` und überschreibt keine früheren Entscheidungsprotokolle. Überholte Aussagen sind in den jeweiligen Dokumenten als „überholt durch" markiert, nicht gelöscht.

## 1. Produktrichtung [Richtung]

- DISKOE soll eine persönliche digitale Heimat für unabhängige Kulturveranstalter, Kollektive und Reihen werden: eigene Identität, Musik, kulturelle Inhalte und Verbindungen. Inspiration ist MySpace, umgesetzt als zeitgemäßes, mobiles, klar strukturiertes Produkt.
- Profilgestaltung ist Kernbestandteil. Organizer sollen die Seite freiwillig als zentralen öffentlichen Link verwenden.
- Der Aufbau eines bestätigten aktuellen Eventkatalogs bleibt gleichrangiges Ziel. Die Katalognutzung wird vor Veröffentlichung verständlich erklärt. Zusätzliche Reichweite durch die spätere Discovery-Webapp ist ein zukünftiger Nutzen ohne Garantie.
- Bestehende Anforderungen gelten weiter, soweit hier nicht ausdrücklich angepasst.

## 2. Überholte Grenzen

| Frühere Aussage | Neuer Stand |
|---|---|
| „Eine Vorlage mit drei Farbthemes" | Überholt durch begrenzte modulare Profile (Abschnitt 3). |
| „Follow/Updates erst nach V1" (pauschal) | Überholt: früher Follow-Test ist vorgesehen; konkreter Alpha-Umfang offen (Abschnitt 4). |
| „Seiteneditor/freies Layout" ausgeschlossen | Bleibt ausgeschlossen: kein freier Canvas, kein HTML/CSS, kein Website-Builder. Begrenzte Module sind davon unterschieden. |

Unverändert: Consumer-Discovery, persönliche Consumer-Sammlungen, Polls/Pläne, Teamrechte, externe Events in privaten Shortlists, eigenes Ticketing, eigenes Audio-/Videohosting, Social-Autopublishing.

## 3. Begrenzte modulare Profile [Richtung, Ausgestaltung Vorschlag]

**Vorschlag, keine Detailfreigabe:**

- drei deutlich unterschiedliche Gestaltungsrichtungen;
- anpassbare Farben, vorgegebene Schriftkombinationen, begrenzte Hintergrundoptionen;
- optionale Module aktivieren/deaktivieren und innerhalb definierter Bereiche umsortieren;
- einfache Bearbeitung mit mobiler Vorschau; gute Defaults bei wenigen Inhalten; Logo und Cover optional;
- Gestaltung bei neuen Events wiederverwenden.

**Modulkandidaten [Vorschlag]:** Identität und Vorstellung; kommende Events und hervorgehobener nächster Termin; Archiv; Musik über offiziellen externen Anbieter; kleine Bild-/Flyerauswahl; offizielle Links und Kontakt; persönliche Empfehlungen mit eigenem Kommentar; optionaler Hintergrundtext bzw. Manifest.

**[Offen]:** Modulzahl, Limits, Anbieter, genaue Gestaltungsoptionen.

**Regeln [Richtung]:**

- Profile erhalten den größten Gestaltungsraum. Eventseiten übernehmen die Identität bei stabiler Informationshierarchie: Datum, Ort, Kosten, Zugang und Ticket-/RSVP-Aktion bleiben zuverlässig auffindbar.
- Eventdaten und Publikationsregeln bleiben designunabhängig. Spätere Discovery-Karten können einheitlich sein.
- KI-basierte Gestaltung aus vorhandenem Material ist eine spätere Möglichkeit, keine beschlossene Alpha-Anforderung.
- Profilgestaltung erzeugt keinen zusätzlichen Pflichtfragebogen beim Eventpublizieren.

## 4. Früher Follow-Test [Richtung, Umfang offen]

**Vorschlag:** ein Organizerprojekt abonnieren; E-Mail als erster zu prüfender Kanal; klarer Abonnementzweck; Bestätigung, Verwaltung, Abmeldung; neue veröffentlichte Events als erster Update-Anlass; Änderungen, Absagen und Versandhäufigkeit separat spezifizieren.

**Grenzen [Richtung]:** kein umfassendes Consumerkonto vorausgesetzt; Abonnenten erhalten keine Organizerrechte; private Abodaten getrennt von öffentlichen Inhalten; kein Social Feed, Freundesgraph, Chat, Gästebuch oder komplexes Empfehlungsmodell. Follow erzeugt keinen zusätzlichen Pflichtfragebogen beim Eventpublizieren.

## 5. Persönliche Empfehlungen [Richtung]

Die bestehende betreute Organizer-Kuration (`CURATE-01`) wird weiterverwendet. Auswahl und persönliche Kommentare werden ausdrücklich bestätigt, Urheberschaft wird gezeigt, eigene Angebote werden von fremden Empfehlungen getrennt, der leere Zustand ist sinnvoll. Empfehlungen anderer Organizerprofile zusätzlich zu bestehenden DISKOE-Events sind **[Offen]** (Q34); keine neue Empfehlungslogik gilt als beschlossen.

## 6. Erhaltener Kern [Richtung]

Materialbasierte Eventerfassung, editierbare KI-Entwürfe, relevante Rückfragen mit Beratung und manuellem Fallback, Vorschau/Bestätigung/Publikationsprüfung, Änderungen/Absagen/Entfernung/Duplizieren, Sharing, Katalogtransparenz, crawlbare Seiten und strukturierte Daten bleiben. Die 32 Eventfragen (B01–B12, L01–L06, O01–O07, F01–F07) und die vier fiktiven Auswahlfälle in `docs/QUESTION_POOL_B2C_V1.md` bleiben unverändert.

## 7. Monetarisierungsrichtung [Richtung; nichts beschlossen]

- Kostenloser Kern: eigenständiger Kulturauftritt, Publishing, grundlegende Verbindungen.
- Plus/Pro hauptsächlich für Automatisierung, Kommunikation, Publikumsbeziehung, Analytics, Integrationen, Teamarbeit. Erweiterte Gestaltung/eigene Domain können ergänzende Paid-Optionen sein.
- Zusätzliche Reichweite und bezahlte organische Platzierung sind kein vorgesehener Kern der Organizerabonnements.
- Besucher-Premium (individuelle Planung, intelligente Alerts) ist unvalidiert.
- Tarife, Preise, Limits, Billing und Premium-Implementierung sind **nicht beschlossen** und nicht Alpha-Scope.

## 8. Ergänzende Erfolgskriterien [Richtung]

- tatsächliche Verwendung/Teilung des Profils als öffentlicher Auftritt;
- Gestaltungswiederverwendung beim nächsten realen Event;
- bestätigte Abos und Wiederkehr bei weiteren Terminen;
- Empfehlungen führen zu Besuchen bzw. Abos anderer Projekte;
- vertretbarer Bearbeitungs- und Betreuungsaufwand.

Ticketklicks sind keine Verkäufe. Reichweite, Wiederkehr und mögliche Netzwerkeffekte werden getrennt ausgewertet.

## 9. Neue offene Entscheidungen Q29–Q36 [Offen]

| ID | Gegenstand |
|---|---|
| Q29 | Module, Pflicht-/optionale Bereiche, Medienlimits, Reihenfolgegrenzen; kleinstes Profilangebot. **Nächste gemeinsame Entscheidung.** |
| Q30 | Drei Gestaltungsrichtungen; Farb-, Schrift- und Hintergrundoptionen. |
| Q31 | Erster Musikanbieter, Link/Player, externe Inhalte, Rechte, Fallback. |
| Q32 | Follow-Zweck, Kanal, Bestätigung, Verwaltung, Missbrauchsschutz. |
| Q33 | Versandfrequenz, Bündelung, Duplikate; Änderungen/Absagen/Entfernung. |
| Q34 | Empfehlungen nur für Events oder auch Organizerprofile; Bestätigung und Pflege. |
| Q35 | Profilminimum, private/öffentliche Bearbeitungsstände, Auswirkung von Stiländerungen auf bestehende Events. |
| Q36 | Alpha-Messung, Schwellen/Nenner, Aufbewahrung von Abodaten, neu geprüfter Aufwand. |

Weiter offen bleiben die fünf S3-Entscheidungen (`docs/QUESTION_POOL_B2C_V1.md`, Abschnitt 8): Karten/Abschnitte/Mischform, erneute Nachfrage bei bewusst unbekannten Angaben, Zugänglichkeitsdetailtiefe, Mischformate, Anpassung anhand von Alpha-Signalen.

## 10. Neue Spec- und Designreferenzen

Lokal existierte kein Register mit diesen Kennungen; die IDs waren damit frei und es gibt keinen lokalen Konflikt. Ob Notion abweichende Belegungen führt, ist ungeprüft.

- **S9 — Follow-Spec:** Zweck, Kanal, Zustände, Datenschutz, Versandregeln. Status: offen, abhängig von Q32/Q33/Q36.
- **D9 — Profileditor:** Modul-/Stil-Bearbeitung mit mobiler Vorschau. Status: offen, abhängig von Q29/Q30/Q35.
- **D10 — Follow-Zustände:** Abonnieren, Bestätigung, Verwaltung, Abmeldung, Leer-/Fehlerzustände. Status: offen, abhängig von S9.

## 11. Kleinster Alpha-Vorschlag und Schätzungen [Vorschlag / Schätzung]

**Vorschlag:** gemeinsame Komponenten mit drei Gestaltungsrichtungen, begrenzte optionale Module, mobile Vorschau, bestehende betreute Kuration, kleiner bestätigter E-Mail-Follow-Test für neue Events. Ein Musikslot, bis zu sechs Galeriebilder und SoundCloud als erster Kandidat sind ausschließlich Diskussionsvorschläge.

**Schätzungen (ungeprüft, nicht abgenommen):**

- modulare Profile: +40–70 Arbeitsstunden einschließlich Design/Prüfung;
- einfacher E-Mail-Follow-Test: separat grob +24–40 Stunden;
- zusätzliche Empfehlungslogik und Billing nicht enthalten;
- die frühere 6–8-Wochen-Schätzung ist für den erweiterten Scope neu zu prüfen.

## 12. Nicht freigegeben

Keine Module, Anbieter, Limits, Versandregeln, Tarife oder Detailoptionen sind durch dieses Dokument freigegeben. Es beginnt keine Anwendungsentwicklung; es entstehen keine Datenbank, Abhängigkeiten oder Implementierungspläne.
