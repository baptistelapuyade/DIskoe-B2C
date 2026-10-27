# Slice 3 — Zusammenfassung (Veranstalterprofil)

Stand: 2026-10-26. Drei kleine PRs laut Plan: 3a Medienbasis, 3b Owner-Editor und private Vorschau, 3c Founder-Freigabe und Veröffentlichung. Kein Requirement ist als erfüllt markiert, bevor alle drei gemergt und geprüft sind.

## 3a — Medienbasis (Branch `feat/slice-3a-media-storage`)

Migration `20261026160000_media_storage.sql`:

- Buckets `private-media` (privat) und `public-media` (öffentlich lesbar), je 5 MiB, nur JPEG/PNG/WebP. `media_assets.mime_type` ist auf dieselben Typen beschränkt.
- `storage.objects`-Policies, genau vier: privater Upload nur unter `<user-id>/`; privates Lesen nur im eigenen Präfix (Founder lesend); öffentliches Lesen im Public-Bucket; Schreiben im Public-Bucket nur auf den Pfad, den die **veröffentlichte** Revision eines eigenen, veröffentlichten Profils reserviert (`app_private.is_publishable_media_path`). Keine UPDATE-/DELETE-Policy.
- Beim Bestätigen einer Profilbild-Nutzung verlangt die Datenbank Alt-Text und reserviert `public_object_path` (`profiles/<profile>/<use>.<ext>`). Das ist ein Pfad, keine Datei: `profile_gaps` gilt damit als erfüllt, die Datei entsteht erst nach `publish_profile` per Kopie in 3c. Eventbilder bleiben unverändert (Slice 4/5).

Prüfung: `npm run test:rls` lokal 242 Zusicherungen grün (Postgres 16 mit Shim, dessen `storage`-Teil nur die Tabellen nachbildet). Gegenprobe: acht absichtliche Fehler in Migrationskopien (Pfadprüfung entfernen, Präfix entfernen, Owner-Prüfung entfernen, Entwurfsrevision als veröffentlicht zählen, Alt-Text-Pflicht entfernen, privates Lesen öffnen, Public-Lesen auf alle Buckets, Endung ignorieren); jeder wurde erkannt. Zusätzlich läuft dieselbe Datei im CI-Job `rls-supabase` auf dem echten lokalen Supabase-Stack (grün). Die echte Storage-API (Kopie zwischen Buckets mit der Session des Owners) wird erst in 3c end-to-end gezeigt; die Policies sind hier mit direktem SQL und im CI-Job `rls-supabase` gegen den lokalen Supabase-Stack geprüft.

Offen: Rückfall auf einen serverseitigen Secret-Key nur, falls die Cross-Bucket-Kopie per Policy in 3c nicht trägt.

## 3b — Owner-Editor, private Vorschau, Einreichen (Branch `feat/slice-3b-profile-editor`, Draft-PR #8)

Migration `20261026180000_profile_submit_for_review.sql` (auf dem Dev-Projekt **noch nicht angewendet**): `public.submit_profile_for_review(profile, erwartete Entwurfsrevision, Rechte, Nutzung)`. Nur der zugeordnete Owner; beide Erklärungen müssen `true` sein (22023); Stand muss der aktuelle Entwurf sein (DK001), vollständig (DK002 mit Lückencodes), noch nicht erstfreigegeben (DK003). Ergebnis ist ausschließlich ein Audit-Eintrag `submit_for_review` für genau diese Revision. „In Prüfung“ wird daraus abgeleitet; es gibt keine neue Statusspalte.

App:

- Reine Regeln: `lib/domain/profile-publication.ts` (Eingaben, Lückentexte, Status, Bildprüfung per Magic Bytes, 5 MB). Längenlimits sind Vorschläge (`TODO(spec)`).
- Seiten `/organizer/profiles/[profileId]/edit` und `/preview` (privat, `no-store`; fremde oder ungültige ID liefert 404; ohne Zuordnung Weiterleitung auf `/organizer`). Server Actions für Speichern, Bild hochladen (Alt-Text und Rechte-Bestätigung Pflicht, Original unverändert nach `private-media`) und Einreichen.
- Ein eingefrorener Entwurf (bestätigt, erstfreigegeben oder bereits eingereicht) wird nie verändert: Bearbeiten legt eine neue Revision an (Bild wird übernommen) und setzt sie als Entwurf. Dadurch endet auch eine laufende Einreichung.

Abweichungen zum Plan: Slug nur angezeigt; keine eigene `setup`-Seite (Startseite verlinkt auf „Bearbeiten“); Gestaltung/Module nicht enthalten. Bei Teilfehlern bleiben unbenutzte private Dateien liegen (Clients dürfen nicht löschen).

Prüfung: SQL-Tests lokal grün (Abschnitt 7c), sechs Mutationsproben (Erklärungen ignoriert, jeder darf einreichen, freigegebenes Profil erneut einreichbar, unvollständig akzeptiert, veraltete Revision akzeptiert, anon darf ausführen) wurden erkannt. Unit-Tests und `e2e/profile.spec.ts` (Editor, ungültige Eingabe, Bild-Prüfungen, Einreichen, neue Revision nach Einreichen, Zugriff anderer Konten) laufen in der CI; lokal nicht ausführbar (Registry gesperrt).

## 3c — Founder-Freigabe, Veröffentlichen, öffentliches Bild (Branch `feat/slice-3c-approval-publish`, Draft-PR #9)

Keine neue Migration. Die Migration aus 3b ist inzwischen auf dem Dev-Projekt angewendet.

- `requireFounder()` (404 für Nicht-Founder, Anmeldung für Anonyme). Seiten `/internal/approvals` (Warteschlange, abgeleitet: aktueller Entwurf wurde eingereicht und hat keine Erstfreigabe) und `/internal/approvals/[profileId]` (exakte private Vorschau mit signierter Bild-URL). Die Freigabe schickt die angezeigte Revisions-ID an `approve_first_profile`; die Datenbank lehnt Änderungen (DK001), Lücken (DK002), Doppelfreigabe (DK003) und Selbstfreigabe (42501) ab. Der Founder liest die Basistabelle `profiles`, nicht `my_profiles` (diese Sicht zeigt nur eigene Profile).
- Owner: „Veröffentlichen“ mit zweiter Bestätigung über `publish_profile`. Danach kopiert die Sitzung des Owners das Original von `private-media` nach `public-media` an den reservierten Pfad (idempotent). Schlägt das fehl, zeigt die Seite „Bild noch nicht öffentlich“ mit Wiederholen-Knopf. Ein Secret-Key war nicht nötig: die Cross-Bucket-Kopie mit Owner-Sitzung ist in der CI gegen echtes Storage belegt (öffentliche URL liefert 200, das private Original nicht).
- Zwischen Erstfreigabe und erster Veröffentlichung ist Bearbeiten pausiert, weil die erste Veröffentlichung nur die freigegebene Revision akzeptiert (sonst Sackgasse). Danach erzeugt Bearbeiten wie bisher eine neue Revision; der öffentliche Stand bleibt, bis „Änderungen veröffentlichen“ bestätigt wird.
- Nicht enthalten: öffentliche Seite `/[slug]` (Slice 6), Ablehnen/Rückfrage durch den Founder, Benachrichtigung des Organizers (keine echten E-Mails), Zurückziehen.

Prüfung: Lint, Typecheck, Unit-Tests, RLS-Suiten und Playwright (`e2e/approval.spec.ts`: nur Founder erreicht die Seiten, Owner kann weder freigeben noch vorzeitig veröffentlichen, veralteter Stand nicht freigebbar, Veröffentlichung ist explizit, Daten und Bild werden öffentlich, Original bleibt privat, Bearbeiten ändert den öffentlichen Stand nicht) in der CI grün. Lokal nicht ausführbar (Registry gesperrt). Da keine SQL-Änderung, entfallen Mutationsproben.

Slice 3 ist damit funktional komplett, aber noch nicht von dir am Dev-Projekt mit echtem Browser abgenommen.

## Entscheidung nach der Abnahme am Dev-Projekt (27.10.2026)

Das Durchspielen mit zwei Testkonten (Organizer und Founder) funktionierte technisch (Daten und Bild öffentlich, Original privat, Audit-Verlauf vollständig). Die Bedienung war zu wenig geführt. Beschlossen (Founder):

- **Variante B:** Einreichen enthält die Zustimmung zur Veröffentlichung; die Founder-Freigabe veröffentlicht direkt. Der separate Organizer-Schritt „Veröffentlichen“ aus 3c entfällt für die erste Veröffentlichung.
- **Rückfrage** des Founders (Freitext, nur Profil) mit Korrektur und erneutem Einreichen durch den Organizer.
- **Systemmails** bei Freigabe und Rückfrage (siehe `AGENTS.md`, Erweiterung vom 27.10.2026).
- **Startseite** zeigt pro Profil Status, nächsten Schritt und „Wie geht es weiter“.

Umsetzung in drei PRs: Datenbank (neue `approve_first_profile`, `request_profile_changes`, Mail-Protokoll, Storage-Policy für den Founder), App (Ablauf, Rückfrage, Startseite), Mails (SMTP über SES, Versandprotokoll). Offene Text- und Fachpunkte bleiben als `TODO(spec)` markiert: Bearbeitungszeit, Rechte-Erklärungen, Absenderadresse.

## Umbau auf Variante B, Teil 1: Datenbank (PR 1)

Migration `20261027160000_review_flow.sql`, noch nicht auf dem Dev-Projekt angewendet (erst nach Review und grüner CI).

- `approve_first_profile` verlangt jetzt, dass genau diese Revision eingereicht wurde (Audit-Zeile `submit_for_review`, sonst `DK003`). Sie setzt Erstfreigabe und Veröffentlichung in einer Transaktion. Bestätigender Nutzer der Revision ist der Einreicher. Audit: `approve_first` und `publish` (Akteur beide Male der Founder). Danach ist der Versuch des Owners, dieselbe Revision erstmals zu veröffentlichen, mit `DK001` abgewiesen; `publish_profile` bleibt für spätere Revisionen.
- Neue Tabelle `review_requests` und Funktion `request_profile_changes` (nur Founder, 1 bis 500 Zeichen, eine Frage je eingereichter Revision, Audit `request_changes`). Der Owner liest die Frage zum eigenen Profil, nicht den Autor. `submit_profile_for_review` weist eine Revision mit offener Frage ab (`DK003`); der Owner ändert zuerst, dadurch entsteht eine neue Revision.
- Neue Tabelle `profile_mails` plus `claim_profile_mail` und `finish_profile_mail` (nur Founder). Je Profil, Revision und Art genau eine Zeile. Der Claim prüft den Zustand direkt vor dem Versand (Profil live mit dieser Revision bzw. offene Frage), liefert die Empfängeradresse nur an den Founder und nie ein zweites Mal, wenn schon `sent` oder ein frischer Versuch (unter 5 Minuten) läuft. Die Tabelle speichert weder Adresse noch Text noch Fehlertext.
- Storage: `is_publishable_media_path` erlaubt zusätzlich dem Founder, die öffentliche Bildkopie zu schreiben, weiterhin nur auf den reservierten Pfad einer veröffentlichten Revision.

Prüfung: `npm run test:rls` lokal gegen PostgreSQL 16, 325 Zusicherungen (vorher 198 plus die 3b-Tests). Der Ablauf Einreichen, Rückfrage, Korrektur, erneut Einreichen, Freigabe ist durchgespielt. 19 gezielt eingebaute Fehler (fehlende Einreichungsprüfung, keine Veröffentlichung bei Freigabe, falscher bestätigender Nutzer, fehlende Founder-Prüfungen, doppelter Mailclaim, offene Policies, sichtbarer Autor) werden alle von den Tests erkannt. Nicht geprüft: echter Supabase-Lauf (CI-Job `rls-supabase`) und Dev-Projekt. `lib/db/types.ts` wird mit der App-Änderung nach dem Anwenden neu generiert.

## Umbau auf Variante B, Teil 2: App (PR 2)

Baut auf der Migration aus Teil 1 auf (gestapelter PR, Basis `feat/review-flow-db`). Ohne diese Migration funktioniert die App nicht.

- **Founder:** Prüfseite zeigt genau den eingereichten Stand, links „Freigeben und veröffentlichen“ (mit zweiter Bestätigung, weil sofort öffentlich), rechts „Rückfrage stellen“ (Freitext bis 500 Zeichen). Nach der Freigabe kopiert die Founder-Sitzung das Bild in den öffentlichen Bucket; schlägt das fehl, gibt es „Bild erneut veröffentlichen“. Die Liste hat die Reiter Offen, Rückfrage gestellt und Erledigt. Sie ist aus Audit-Spur und Profilen abgeleitet, nichts davon wird doppelt gespeichert.
- **Organizer:** Der eigene Veröffentlichen-Schritt für die erste Veröffentlichung und die Bearbeitungssperre entfallen. „Änderungen veröffentlichen“ bleibt für spätere Revisionen. Eine Revision, zu der es eine Rückfrage gibt, kann nicht unverändert erneut eingereicht werden; Speichern einer Änderung legt wie bisher eine neue Revision an.
- **Startseite:** pro Profil eine Karte mit Status, Fortschritt (Angaben, Eingereicht, Geprüft, Live), einem Satz zum nächsten Schritt, einem Hauptknopf und einem Hinweis, was danach passiert. Neue Seite `status` für In Prüfung, Rückfrage und Live (inklusive „Zurückziehen und bearbeiten“). Texte aus den freigegebenen Wireframes; alle sind Vorschläge.
- **Domain:** `reviewStatus` kennt `question` und `update_ready` (statt `approved`), `progressStage` und `parseQuestion` sind getestet.
- `lib/db/types.ts` ist für die neue Migration von Hand ergänzt (Hinweis im Dateikopf), bis sie auf dem Dev-Projekt liegt und neu generiert wird.

Nicht Teil davon: Mailversand (Teil 3). Der Text „Du bekommst eine E-Mail“ stimmt daher erst mit Teil 3. Die öffentliche Profilseite gibt es noch nicht (Slice 6); die Live-Seite sagt das.

Prüfung: lokal nur statische Durchsicht; Lint, Typecheck, Vitest und Playwright laufen erstmals in der CI (npm-Registry von hier nicht erreichbar). E2E angepasst: Rückfrage, Korrektur, erneutes Einreichen, Freigabe mit sofortiger Veröffentlichung und öffentlichem Bild, spätere Änderungen mit eigener Bestätigung.

## Umbau auf Variante B, Teil 3: Mails (PR 3)

Baut auf Teil 2 auf (gestapelter PR, Basis `feat/review-flow-app`).

- **Versand:** `lib/mail/` (Konfiguration, Texte, Versand). Nach „Freigeben und veröffentlichen“ und nach „Rückfrage stellen“ ruft die Founder-Aktion `claim_profile_mail` → SMTP → `finish_profile_mail`. Ein Fehlschlag macht die Entscheidung nicht rückgängig; die Prüfseite zeigt „Mail fehlgeschlagen“ und „Mail erneut senden“ (auch „Mail senden“, wenn noch nie gesendet wurde). Bei „angenommen“ gibt es keinen zweiten Versand.
- **Texte (Vorschlag, `TODO(spec)`):** „Dein Profil „…“ ist jetzt live“ und „Eine Frage zu deinem Profil „…““. Der Fragetext steht nicht in der Mail, nur ein Hinweis, dass die Frage nach der Anmeldung auf der Startseite steht. Der einzige Link führt auf `/organizer`. Abweichung zum Wireframe: der Fragetext fehlt bewusst in der Mail; wenn du ihn in der Mail willst, ist das eine kleine Änderung.
- **Abhängigkeit:** `nodemailer` (+ `@types/nodemailer`), siehe PR-Beschreibung.
- **Konfiguration:** `MAIL_SMTP_HOST`, `MAIL_SMTP_PORT`, `MAIL_SMTP_USER`, `MAIL_SMTP_PASSWORD`, `MAIL_FROM`. Ohne sie wird nichts gesendet. Einrichtung: `docs/runbooks/system-mails.md`.
- **Datenschutz:** Die Adresse kommt nur aus `claim_profile_mail`, wird nicht geloggt, nicht gespeichert und steht in keinem Fehlertext; protokolliert werden nur Art und Fehlercode.

Prüfung: Unit-Tests für Konfiguration und Texte (Escaping, keine Zeilenumbrüche im Betreff, ein Link). E2E gegen den Mail-Fänger des Supabase-Stacks (SMTP-Port 54325): genau eine Mail je Ereignis an den richtigen Empfänger, keine Mail an das andere Profil, Wiederholung nach „fehlgeschlagen“, kein zweiter Versand nach „angenommen“. Nicht geprüft: Versand über echtes SES und Zustellung an einen Posteingang. Das passiert nach dem Merge mit deinen SMTP-Zugangsdaten an verifizierte Testadressen.
