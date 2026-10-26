# Slice 3 — Zusammenfassung (Veranstalterprofil)

Stand: 2026-10-26. Drei kleine PRs laut Plan: 3a Medienbasis, 3b Owner-Editor und private Vorschau, 3c Founder-Freigabe und Veröffentlichung. Kein Requirement ist als erfüllt markiert, bevor alle drei gemergt und geprüft sind.

## 3a — Medienbasis (Branch `feat/slice-3a-media-storage`)

Migration `20261026160000_media_storage.sql`:

- Buckets `private-media` (privat) und `public-media` (öffentlich lesbar), je 5 MiB, nur JPEG/PNG/WebP. `media_assets.mime_type` ist auf dieselben Typen beschränkt.
- `storage.objects`-Policies, genau vier: privater Upload nur unter `<user-id>/`; privates Lesen nur im eigenen Präfix (Founder lesend); öffentliches Lesen im Public-Bucket; Schreiben im Public-Bucket nur auf den Pfad, den die **veröffentlichte** Revision eines eigenen, veröffentlichten Profils reserviert (`app_private.is_publishable_media_path`). Keine UPDATE-/DELETE-Policy.
- Beim Bestätigen einer Profilbild-Nutzung verlangt die Datenbank Alt-Text und reserviert `public_object_path` (`profiles/<profile>/<use>.<ext>`). Das ist ein Pfad, keine Datei: `profile_gaps` gilt damit als erfüllt, die Datei entsteht erst nach `publish_profile` per Kopie in 3c. Eventbilder bleiben unverändert (Slice 4/5).

Prüfung: `npm run test:rls` lokal 240 Zusicherungen grün (Postgres 16 mit Shim, dessen `storage`-Teil nur die Tabellen nachbildet). Gegenprobe: acht absichtliche Fehler in Migrationskopien (Pfadprüfung entfernen, Präfix entfernen, Owner-Prüfung entfernen, Entwurfsrevision als veröffentlicht zählen, Alt-Text-Pflicht entfernen, privates Lesen öffnen, Public-Lesen auf alle Buckets, Endung ignorieren); jeder wurde erkannt. Die echte Storage-API (Kopie zwischen Buckets mit der Session des Owners) wird erst in 3c end-to-end gezeigt; die Policies sind hier mit direktem SQL und im CI-Job `rls-supabase` gegen den lokalen Supabase-Stack geprüft.

Offen: Rückfall auf einen serverseitigen Secret-Key nur, falls die Cross-Bucket-Kopie per Policy in 3c nicht trägt.
