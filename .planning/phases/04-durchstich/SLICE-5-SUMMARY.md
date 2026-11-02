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
- Dev-Durchlauf (2026-11-02, Projekt `lbttgzffhvxvtqocyvao`, Datenbank- und RLS-Ebene, mit den vorhandenen Testkonten, als SQL mit simulierten Nutzern in einer Transaktion, die am Ende bewusst zurückgerollt wurde; danach 0 Events, 2 Profile, keine Event-Objekte im Speicher). Migrationen bis `first_publication` waren angewendet. Ergebnis: Event-Entwurf mit Bild ohne Beschreibung bestätigt; Veröffentlichen ohne beide Bestätigungen abgelehnt (22023); Bildkopie vor der Veröffentlichung abgelehnt (42501), danach am reservierten Pfad erlaubt, an einem anderen Pfad abgelehnt (42501); Besucher sieht das veröffentlichte Event, einen Entwurf nicht; zweites Testprofil: Organizer kann sich nicht selbst freigeben (42501), gemeinsame Einreichung gelingt, vor der Freigabe ist nichts öffentlich, der Founder gibt Profil und Event gemeinsam frei und kopiert beide Bilder, danach sehen Besucher beides.
- Nicht geprüft auf Dev: die App-Oberfläche im Browser (kein Deployment), echte Dateien im Speicher (es wurden nur die Zeilen und Policies geprüft), Mailversand (die `MAIL_*`-Variablen liegen nicht vor).

## Abweichungen von Figma und Beobachtungen

1. Die betroffene Stelle (S5-D) ist ein Auswahlfeld mit sechs Werten, im Vertrag nicht definiert; gespeichert als Textzeile.
2. Mailtexte (S5-E) folgen den Figma-Entwürfen; „Event verwalten“ ist ein zweiter Link in der Live-Mail. Die Mails sind minimal gehalten.
3. Die Founder-Seite folgt S5-A in Aufbau und Texten, ist aber mit den vorhandenen Tailwind-Bausteinen der Founder-Seite gebaut, nicht mit den neuen `components/ui`-Bausteinen der Organizer-Seiten. Ein Screenshot-Vergleich mit Figma ist nicht erfolgt.
4. Einreichen nur des Profils (ohne Event) ist weiterhin möglich; die Founder-Seite zeigt dann „Zu diesem Profil wurde kein Event eingereicht.“ und gibt wie bisher nur das Profil frei.

## Nicht gebaut

Änderungen am Ort eines live Events (`NACH-09`, `NACH-10`), Veröffentlichen von Änderungen an einem live veröffentlichten Event, öffentliche Eventseiten (Slice 6), KI-Erfassung, Programm und Besuch. „Weiteres Event anlegen“ in der Eventverwaltung ist UX-seitig noch zu überdenken.

## Rest von Slice 5: Absagen und Verschieben (PR F, PR G)

Gebaut (Figma `NACH-11`, `NACH-12`, `NACH-15`, `NACH-16`):
- PR F (Datenbank, `20261102120000_postpone_event.sql`): `postpone_event` (nur Status „Termin folgt“, fasst die veröffentlichte Revision nie an), `reschedule_event` auch aus „Termin folgt“, Audit-Aktion `postpone`. 399 SQL-Prüfungen lokal grün.
- PR G (Oberfläche): Eventverwaltung mit „Event verschieben“ / „Ersatztermin eintragen“ und „Event absagen“; Seite `…/cancel` (`NACH-15`), Seite `…/reschedule` mit Umschalter „Ersatztermin steht (noch nicht) fest“ (`NACH-11`/`NACH-12`); der Zustand nach der Absage (`NACH-16`) ist die Verwaltungsseite mit Titel „Event abgesagt“. Reine Regeln in `lib/event/status.ts`, Aktionen in `app/(organizer)/organizer/events/status-actions.ts`.

Abweichungen von Figma (bewusst):
1. Kein Freitext „Grund für die Absage“ / „Kurzer Hinweis“ (Founder, 2.11.2026); kommt mit den öffentlichen Seiten (Slice 6).
2. Alle Sätze zu Abonnenten, Benachrichtigung, Merkungen, Ticket- und Kalenderaktionen entfallen (nicht Teil der Alpha, noch nicht gebaut). Die Zeile „Absagebenachrichtigung … vorbereitet“ und „Öffentliche Absage ansehen“ entfallen; es gibt noch keine öffentliche Seite.
3. „Bisher“ zeigt den Termin im Format der übrigen Seiten („… bis …“), nicht „→“.
4. Verschieben mit Ersatztermin ändert nur den Termin der öffentlichen Fassung (PR H, `reschedule_event_date`): Die Datenbank baut die neue öffentliche Revision aus der Live-Revision, privater Entwurf und andere Änderungen bleiben privat; der Entwurf übernimmt den neuen Termin, damit eine spätere Veröffentlichung ihn nicht zurückdreht. Die in PR G gebaute Sperre bei weiteren Entwurfsänderungen entfällt. `reschedule_event` (ganzer Entwurf) bleibt in der Datenbank, die Oberfläche nutzt sie nicht mehr.
5. Die Texte der Seitenkarten sind gekürzt auf das, was gebaut ist („Gleicher Eventlink“, „Öffentliche Folgen“, „Folgen der Absage“).

Geprüft: SQL (lokal), CI (Lint, Typecheck, Unit `tests/unit/event-status.test.ts`, E2E `e2e/event-status.spec.ts`). Nicht geprüft: Screenshot-Vergleich mit Figma, Durchlauf im Browser auf Dev durch den Founder. Die öffentliche Statusanzeige entsteht erst mit Slice 6.

## Offen

- Notion-Abgleich (2026-11-02, nur lesend): Die Seite „Umsetzungsstand B2C V1 (Repo)“ (29.10.) ist überholt (Slice 5 als offen, Frage „Variante B auch für Events?“ unbeantwortet, „Event veröffentlichen“ als nicht gebaut). Die Entscheidung „Ein Event bei Erstfreigabe, weitere selbst“ ist in Notion nicht als eigene Seite festgehalten. Notion ist nicht geändert; die Seite sollte nachgezogen werden.
- Figma: doppelte Styles/About auf der Kit-Seite zusammenführen; verbleibende Unterschiede alter Event-Zustände zu Review NEW vergleichen.
- Durchlauf auf dem Dev-Projekt (siehe oben).
