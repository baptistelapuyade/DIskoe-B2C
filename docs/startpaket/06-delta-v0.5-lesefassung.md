# 06 — Delta v0.5, Lesefassung (Stand 23.10.2026)

Kurze Fassung der gültigen Regeln aus Delta v0.5 (Notion, 22./23.10.2026) und der Alpha-Featurematrix. Bei Zweifel gilt der Volltext in Notion. Logische Objekte, keine finalen Feldnamen und keine Tabellen. v0.3 und v0.4 bleiben Basis, dieses Delta ergänzt nur.

## 1. Neue Bausteine (alle Free)
Verknüpfte Felder (Venue, Line-up, Co-Hosts), gemeinsame Events, minimale Künstlerseiten, Briefing-Link. Regel: frei ist, was Verbreitung oder Netzwerk erzeugt.

## 2. EventLink
Verbindung Event ↔ Place / Person / Organizer mit `role` ∈ `venue | lineup | cohost`. Besitzer bleibt `event.organizer_id`. `confirmation_state` (`not_requested | open | confirmed | declined | withdrawn`) nur bei `venue`. `program.participants` behält `name` (Pflicht, Aussage des Organizers), `role?`, `official_url?` und bekommt optional `person_ref`. Keine stille Zuordnung zu bestehenden Personen; Editor schlägt vor, Organizer entscheidet. Co-Hosts: Liste von Organizer-Refs, keine Bestätigung, keine Rechte, keine Hinweise an deren Follower. Verlinkt wird nur, wenn die Zielseite veröffentlicht ist (Person: `released` oder `claimed`); sonst reiner Text.

## 3. Venue-Bestätigung
1. Reihe wählt Ort. Ist er an ein Venue-Profil gebunden, kann sie zur Bestätigung einladen (`open`).
2. Event ist sofort veröffentlichbar, Ort erscheint als „unbestätigt“.
3. Venue bestätigt oder lehnt ab. Bestätigt: Ort verlinkt, Event im Venue-Programm.
4. Rückzug später möglich. Ablehnung/Rückzug: Ort wird reiner Text, Programmeintrag entfällt, kein Hinweis an Follower, Reihe sieht es und prüft.

| Aktion | Reihe | Venue |
|---|---|---|
| Event anlegen/ändern/absagen, Ort wählen | ja | nein |
| Orts-Zuordnung bestätigen/ablehnen/zurücknehmen | nein | ja, nur diese Verknüpfung |
| Plus-Nachrichten, Feedback, Analytics | ja | nein |
| Event im Venue-Programm | – | sobald bestätigt |

Ort geändert → neue Bestätigung für den neuen Ort. Nur `area`/`entry_note` geändert → Bestätigung bleibt. Absage erscheint in beiden Programmen.

## 4. Orte, Profiltypen, Gestaltung
- Ein Ort gehört höchstens einem Organizer-Profil (`claimed_by`). Bindung in der Alpha nur über Einladung plus **manuelle Bestätigung durch den Founder** (PlaceClaim: `in_review | confirmed | rejected`, Ziel 2 Werktage, Begründung bei Ablehnung). Während `in_review`: Profil darf veröffentlicht werden, keine Annahme fremder Events.
- Interne Prüfseite (D8), nur Founder: offene PlaceClaim- und ClaimRequest-Anfragen, Aktionen mit Zeitstempel. Keine Notion-Liste als Datenquelle.
- Profiltypen und Köpfe: siehe `05-module-und-gestaltung.md` (§4.1). Gestaltung §4.2 und Eventgestaltung §4.3: siehe ebenda und `04-design-tokens.md`.

## 5. Einladungen
`invitation.kind` ∈ `recommendation | venue_confirmation | artist_claim`. Regeln wie v0.3 §9: Link 30 Tage, ein Zielobjekt, neuer Link deaktiviert den alten, Widerruf sofort. **DISKOE speichert keine Empfängeradresse und versendet nichts**; die Reihe teilt den Link selbst (Abweichung von F6, Option „Versand an Adresse“ später mit eigener Einwilligung). Zuordnung erst nach Annahme **und** Founder-Bestätigung. Anmeldung per E-Mail-Code; Bestandsprofil nutzen statt zweitem.

## 6. Künstlerseiten (Person)
- Objekte: `Person(id, display_name, display_role?, page_state, created_from_event_ref)`, `page_state` ∈ `internal | released | claimed | removed`; `PageSuppression(normalized_name, created_at, reason)`.
- Öffentlich in der Alpha: Name, Rolle, kommende Events und vergangene der letzten 12 Monate (nur veröffentlicht, öffentlich, nicht abgesagt). Archiv zeigt höchstens 3, weitere hinter „Mehr anzeigen“. Keine Bilder/Beschreibung/Links, kein Folgen.
- Freigabe ohne Kanzlei: Seiten erreichbar, **nicht indexierbar (noindex)**; Organizer bestätigt „Person informiert“; Quelle genannt; Link „Das bin ich · Seite entfernen“ wirkt sofort. `page_visibility_flag` als globaler Notschalter.
- Entfernen: sofort, ohne Identitätsprüfung, mit Bestätigungsabfrage; Sperreintrag auf normalisiertem Namen (Unicode-Casefold, ohne Leerraum). Name bleibt als Text im Line-up. Unscharfe Namen werden nicht erkannt (bekannte Grenze). Rückgängig nur über Support.
- Übernahme: Person fragt „Das bin ich“ an (E-Mail) → `ClaimRequest(offen|verschickt|verworfen)` → Founder prüft → Einladung `artist_claim`. E-Mail nur für diese Bestätigung. Abgeschlossene Anfragen nach 30 Tagen löschen.
- Kopfzeile (berechnet, nicht gespeichert): „n kommende Events · Zuletzt bei X“. X = Besitzer-Organizer des letzten Events (letzte 12 Monate, veröffentlicht, nicht abgesagt, Profil veröffentlicht). Beide Teile leer → Zeile entfällt. Zeitzone Europe/Berlin.
- „Gespielt bei“: Besitzer-Organizer der Events (kommend plus 12 Monate), nur veröffentlichte Profile, nach Anzahl sortiert, max. 3 sichtbar.

## 7. Briefing-Link
Ein Link je Event, nicht gelistet, nicht indexierbar, ohne Login. Inhalt (vom Organizer bewusst eingetragen): Zeiten, Ort inkl. Zugang, Technik/Material, eine Ansprechperson. **Keine Gästeliste, keine Daten Dritter.** Begriffe eventart-neutral, Empfänger = „Mitwirkende“. Zustände `not_created | active | revoked | expired` (Ablauf 24 h nach Eventende). Inhalt 30 Tage nach Ablauf löschen. Kein Plus-Kontingent. Änderungen am Event aktualisieren den Link nicht automatisch; Abweichungen werden angezeigt.

## 8. Abos und Versand bei gemeinsamen Events
- Deduplizierung auf (Kontakt, Event, Anlass, Inhaltsversion); Abos bleiben getrennt (`delivery.items` führt die Abo-Refs).
- Absender: Besitzerprojekt (Reihe), Mail nennt die Venue. Venue-Follower erst nach Bestätigung informiert; wer beiden folgt und schon informiert wurde, bekommt nichts Zweites. Ankündigung zählt gegen das Kontingent der Reihe.
- Absage/wichtige Änderung an alle berechtigten früheren Empfänger beider Seiten, einmal je Person.
- Einwilligungstext Folgen muss „Events anderer Veranstalter an diesem Ort“ abdecken, sonst keine Venue-Follower-Mail:
  „Ich möchte E-Mails von [Profil] zu neuen Events und wichtigen Änderungen erhalten. Bei Venues gehören auch Events anderer Veranstalter an diesem Ort dazu. Abmelden jederzeit über den Link in jeder E-Mail.“
- Plus-Reservierung: „Informiert mich, wenn Plus startet. DISKOE speichert dafür meine E-Mail-Adresse und meine Funktionsauswahl. Keine Zahlung, keine Verpflichtung, jederzeit zurückziehbar.“ Löschung 3 Monate nach der Entscheidung, wenn kein Abo daraus wird. (Rechtlich nicht geprüft.)

## 9. Eventseite: „Gut zu wissen“ (§6.7)
Schmale Balken in voller Breite, einer je Information, Trennlinien 1 px. Balken: Label mit Icon, Wert, optionale Pills, Detailzeile rechts (mobil gestapelt). Fehlende Information → Balken entfällt, übrige rücken zusammen.

| Balken | Erscheint wenn | Wert | Detail |
|---|---|---|---|
| Einlass | `doors_at` oder `last_entry`; bei Besuchsmodus flexibel/kombiniert „Zeitfenster“ aus `visit_window` | Zeit bzw. Fenster | Beginn, letzter Einlass |
| Eintritt | Kostenantwort `provided`; bei bestätigt unbekannt „Preis noch offen“ (P07) | Frei / Betrag / ab / von–bis / Spende | Zugangswege als Pills (Online, Abendkasse, ausverkauft, Warteliste), Gebührenhinweis, `pricing.note` |
| Alter | `minimum_age` oder `special_rule`; `no_restriction` → „Für alle Altersgruppen“; unbekannt → kein Balken | Ab 18 / Sondertext | Zusatz |
| Vor Ort | `setting` oder `entry_note` | Indoor / Outdoor / Drinnen und draußen | `entry_note` |
| Sprache | nur Film, wenn Sprache/Untertitel gesetzt | Sprache(n) | Untertitel |
| Zugänglichkeit | **immer sichtbar** | Stufenlos erreichbar / Teilweise stufenlos / Nur über Stufen / „Noch keine Angaben“ | `area_note`, Rollstuhl-WC, `support_note`; ohne Angaben Hinweis, dass fehlende Angaben nicht „nicht zugänglich“ heißen, plus „Veranstalter fragen“ nur wenn `public_contact` existiert |

Zugänglichkeit-Zustände: unbekannt (neutral), bestätigt (grün-getönt), teilweise (orange-getönt). Fehlende Daten nie als „unzugänglich“. `access.conditions` als Textzeile unter den Balken (noch nicht gestaltet). Detailfeld im Formular max. **160 Zeichen** mit Zähler; Text bricht auf bis zu 3 Zeilen um. Kein eigenes Siegel „vom Veranstalter bestätigt“, die Herkunftszeile unten genügt.

## 10. Aufbewahrung (Ergänzungen)
Verworfene/abgelaufene Einladungen 30 Tage; EventLink bleibt mit dem Event; PageSuppression unbegrenzt (nur normalisierter Name); Person ohne öffentliche Seite wie ihr Event; BriefingLink-Inhalt 30 Tage nach Ablauf; ClaimRequest 30 Tage nach Abschluss; PlaceClaim bleibt, Begründung 12 Monate; Plus-Reservierung 3 Monate.

## 11. Pakete und Alpha-Umfang (Featurematrix, Beschluss 22.10.)
- Free in der Alpha: Profile, Events, Gestaltung, Erfassung mit KI (**einmal je Event**), Sharing per Link, Follow, Merken, Kalenderexport, automatische Hinweise, Basis-Analytics, die vier Netzwerk-Bausteine.
- Plus: Alpha nur **Reservierungstest** (Preis- und Funktionsseite D16, Auswahl der drei wichtigsten Funktionen D17, Bestätigung D18; keine Zahlung). Schwelle: mind. 4 Reservierungen von 20 aktiven Organizern, Entscheidung vier Wochen nach Alpha-Start. Testzugang, Checkout und Plus-Funktionen erst danach. Aus Delta v0.4 bleiben als Zielbild: 50 Assistentenläufe je Projekt und 30 Tage, bis zu 5 Vorlagen, eigene Nachrichten (max. 1 je Projekt/24 h, 2 je Event), Befragung je Event, 19 €/Monat als Hypothese.
- Nicht in Alpha: siehe `AGENTS.md`.

## 12. Prüffälle
E23–E36 (Featurematrix) und E37–E47 (Delta v0.5 §11, §6.5) sowie P01–P50 (v0.3) und E01–E22 (Delta v0.4). IDs sind lokal je Dokument; bei Kollision Präfix mit Dokument nennen. Alle sind schriftliche Fälle, keine ausgeführten Tests.

## 13. Offen (nicht bauen, nicht raten)
Technische Typisierung/Enums/Feldnamen, Einwilligungs- und Rechtetexte (Rechtsprüfung Künstlerseiten bei Budget), Messung des Briefing-Links, Versandanbieter und Zeiten im Detail, Aufbewahrung Nachweise/Backups, Providerfähigkeit, Kontingentzahlen und Wirtschaftlichkeit von Plus, Design-Register-Abgleich, Schriftpaar-Konkretisierung.
