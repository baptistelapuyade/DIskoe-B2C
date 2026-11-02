# Slice 5: Veröffentlichung von Profil und erstem Event

Stand: 2026-10-30. Vier Draft-PRs nacheinander (A bis D); A bis C sind gemergt, D ist als Draft-PR offen. Gemergt wird nur durch den Founder.

## Entschieden (Founder, 29./30.10.2026)

- Das erste Event wird zusammen mit dem Profil eingereicht; die Freigabe des Founders veröffentlicht beides in einer Transaktion.
- Weitere Events veröffentlicht der Organizer selbst, mit denselben zwei Bestätigungen (Rechte, Verwendung), ohne Founder-Prüfung.
- Eventbilder gehen nach der Veröffentlichung in den öffentlichen Bucket (`events/<event_id>/<use_id>.<ext>`). Ersetzte Bilder bleiben per URL erreichbar (kein Update, kein Delete).
- Die Bildbeschreibung ist freiwillig; leer heißt „Bild zählt als Dekoration“.

## Was gebaut ist

- **PR A:** Bildbeschreibung freiwillig (Migration `20261030120000_alt_text_optional.sql`, Formulare, Tests).
- **PR B:** Migration `20261030140000_first_publication.sql`: `submit_first_publication`, `approve_first_publication`, `request_profile_changes` mit Eventrevision, `publish_event` mit Bestätigungen und Selbstveröffentlichung, `review_requests.event_revision_id`, Event-Zweig in `is_publishable_media_path`; RLS-/SQL-Tests.
- **PR C:** Organizer-Oberfläche: Vorschau, Einreichen mit zwei Bestätigungen, „in Prüfung“, Frage des Founders, Selbstveröffentlichung weiterer Events, Eventverwaltung (nur Liste und „Weiteres Event anlegen“), Bildkopie `lib/event/publish.ts`.
- **PR D (dieser Stand):**
  - Founder-Seite `/internal/approvals/[profileId]` zeigt zusätzlich das erste Event (alle Angaben, Eventbild, Bildbeschreibung) und die Lücken des Events. „Freigeben und veröffentlichen“ ruft bei gemeinsamer Einreichung `approve_first_publication`, sonst weiter `approve_first_profile`. Danach werden beide Bilder mit der Founder-Session in den öffentlichen Bucket kopiert; „Bilder erneut veröffentlichen“ wiederholt das.
  - „Rückfrage stellen“ mit betroffener Stelle (Profil, Event, Ort, Termin, Bild, Kosten und Zugang). Die Stelle steht als erste Zeile der Nachricht („Betroffen: Ort“), weil die Datenbank keine eigene Spalte hat. Zeichenlimit 500 gilt inklusive dieser Zeile.
  - Eine Frage zu einem Paar (Profil, Event) zählt nur, solange der Evententwurf noch der gefragte ist (`loadQuestionForRevision`).
  - Mails: „Profil live“ nennt das Event und verlinkt „Event verwalten“; die Rückfragemail verlinkt bei einem Paar auf die Event-Prüfseite. Ohne Event bleibt der Text wie zuvor.
  - Tests: Unit-Tests für Mail und `questionWithArea`; `e2e/first-publication.spec.ts` (Einreichen, Founder sieht beide Bilder, Rückfrage, Korrektur und erneutes Einreichen, Freigabe, Mails, Event-Bild öffentlich, zweites Event selbst veröffentlicht), in der CI-Liste der Playwright-Specs.

## Geprüft

- In der Sitzung lokal nicht ausführbar (`npm ci` scheitert, Registry nicht erreichbar): Typecheck, Lint, Unit- und E2E-Tests laufen nur in der CI. Ergebnis der CI steht im PR.
- Nicht gemacht: Durchlauf auf dem Dev-Projekt mit Testkonten (Mail an eine in SES verifizierte Adresse, öffentlicher und privater Bildzugriff).

## Abweichungen von Figma und Beobachtungen

1. Die betroffene Stelle (S5-D) ist ein Auswahlfeld mit sechs Werten, im Vertrag nicht definiert; gespeichert als Textzeile.
2. Mailtexte (S5-E) folgen den Figma-Entwürfen; „Event verwalten“ ist ein zweiter Link in der Live-Mail. Die Mails sind minimal gehalten.
3. Die Founder-Seite folgt S5-A in Aufbau und Texten, ist aber mit den vorhandenen Tailwind-Bausteinen der Founder-Seite gebaut, nicht mit den neuen `components/ui`-Bausteinen der Organizer-Seiten. Ein Screenshot-Vergleich mit Figma ist nicht erfolgt.
4. Einreichen nur des Profils (ohne Event) ist weiterhin möglich; die Founder-Seite zeigt dann „Zu diesem Profil wurde kein Event eingereicht.“ und gibt wie bisher nur das Profil frei.

## Nicht gebaut

Absagen und Verschieben (`NACH-09` bis `NACH-16`), Veröffentlichen von Änderungen an einem live veröffentlichten Event, öffentliche Eventseiten (Slice 6), KI-Erfassung, Programm und Besuch. „Weiteres Event anlegen“ in der Eventverwaltung ist UX-seitig noch zu überdenken.

## Offen

- Notion-Abgleich der Entscheidung „Ein Event bei Erstfreigabe, weitere selbst“: nicht durchgeführt, bleibt offen.
- Figma: doppelte Styles/About auf der Kit-Seite zusammenführen; verbleibende Unterschiede alter Event-Zustände zu Review NEW vergleichen.
- Durchlauf auf dem Dev-Projekt (siehe oben).
