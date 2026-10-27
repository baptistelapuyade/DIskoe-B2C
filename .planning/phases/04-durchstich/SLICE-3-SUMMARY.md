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
