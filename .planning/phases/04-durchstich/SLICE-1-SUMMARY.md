# Slice 1 — Zusammenfassung (Migrationen, Publikationsmodell, RLS)

Stand: 2026-10-23. Branch `feat/slice-1-alpha-core`. Plan: `PLAN.md`, Abschnitt „SQL-Datenmodell und Zugriffsentwurf“. Kein Requirement ist dadurch als erfüllt markiert.

## Was entstanden ist

| Datei | Inhalt |
|---|---|
| `supabase/migrations/20261023120000_alpha_core_schema.sql` | Typen, 8 Tabellen, zyklische Revisions-FKs (zusammengesetzt), Antwortzustands-Constraints, Invarianten-Trigger |
| `supabase/migrations/20261023120100_alpha_core_security.sql` | Grants, RLS-Policies, `public_profiles`/`public_events`, 7 privilegierte Funktionen |
| `supabase/tests/rls_alpha_core.sql` | 198 Zusicherungen inkl. Grant-Snapshot und Objektinventur |
| `supabase/tests/support/local-shim.sql` | Nachbildung der Supabase-Teile (Rollen, `auth.uid()`, Default-Rechte) nur für lokale Läufe |
| `scripts/test-rls.sh`, `npm run test:rls` | Wegwerf-Postgres-Cluster, Shim → Migrationen → Tests |
| `.github/workflows/ci.yml` | Job `rls` |
| `docs/runbooks/founder-bootstrap.md` | Einmaliger Founder-Bootstrap je Projekt |

## Wie geprüft wurde

- `npm run test:rls` gegen PostgreSQL 16.15 mit Shim: 198 Zusicherungen grün.
- **Gegenprobe:** 25 absichtlich eingebaute Sicherheitslücken in Kopien der Migrationen (zum Beispiel Selbstfreigabe-Prüfung entfernt, Bindung der Erstpublikation an die freigegebene Revision entfernt, `cancel_event` veröffentlicht den Draft, `coalesce` im Preis-Constraint entfernt, Trigger entfernt, zusätzliche Policy/Tabelle/Funktion, `owner_id` freigegeben). Alle 25 ließen die Suite fehlschlagen.
- Beim Schreiben der Tests fielen drei Testfehler auf (falsch interpolierte Variable, leere Unterabfrage, falsche Erwartung bei 0 betroffenen Zeilen). Sie lagen in den Tests, nicht in den Migrationen.

## Abnahme gegen echtes Supabase (2026-10-26)

Dev-Projekt `lbttgzffhvxvtqocyvao` (Frankfurt `eu-central-1`, Postgres 17.11, neu und leer; kein Produktions- oder MVP-Projekt). Beide Migrationen wurden unverändert angewendet (über den Supabase-Connector, daher dort mit eigenen Zeitstempeln `20261026112133` und `20261026112231`).

- **Rechteinventur:** `anon`/`authenticated` haben nur SELECT; keine sensiblen Spalten für `anon`; kein EXECUTE für `anon`/`PUBLIC` auf Funktionen in `public`/`app_private`; RLS auf allen Tabellen. Die Standardrechte von `supabase_admin` in `public` (gewähren an `anon`/`authenticated`) betreffen nur Objekte, die `supabase_admin` anlegt, nicht die der Migrationsrolle `postgres`.
- **Live-Prüfblock:** 50 Prüfungen, keine Abweichung (Direktzugriffe, Rollenangriffe, Selbstfreigabe, Freigabe/Veröffentlichung, Einfrieren der freigegebenen Revision, Entwurfsschutz, Audit append-only). Der Block endete absichtlich mit einem Fehler und wurde zurückgerollt; danach 0 Zeilen in Nutzer-, Profil-, Rollen-, Audit- und Medientabellen.
- **Sicherheits-Advisor:** 7× `authenticated_security_definer_function_executable` (gewollt: die sieben privilegierten Funktionen prüfen den Aufrufer selbst). Keine weiteren Funde.
- **Generierte Typen:** `lib/db/types.ts` aus diesem Schema.

## Grenzen (ausdrücklich)

- Die vollständige Testdatei (198 Zusicherungen) lief **nicht** auf Supabase, nur die 50 Prüfungen oben. Sie nutzt `psql`-Befehle und legt Hilfsschema und Hilfsrolle an. Vollständig geht das erst mit `supabase test db` (CLI/Docker).
- Lokal getestet gegen PostgreSQL 16 mit Shim; echtes Supabase läuft auf 17.
- Der im Plan genannte Befehl `supabase test db` wurde durch `npm run test:rls` ersetzt (kein pgTAP verfügbar).

## Bewusst nicht enthalten

- **Storage-Buckets und -Policies.** Das `storage`-Schema gibt es jetzt auf dem Dev-Projekt; Policies bleiben ein Folge-PR. Bis dahin setzt die künftige kontrollierte Promotion `media_uses.public_object_path`; Publizieren verlangt einen gesetzten Pfad. `TODO(spec)`: Promotionsmechanismus, Bestätigungstext, MIME-/Größenlimits, Alt-Text-Pflicht.
- TS-Konstante der Reserved-Slugs (Slice 3), UI, Server Actions, Seeds.

## Abweichungen vom Plan (alle strenger)

1. `authenticated` hat keinen SELECT auf `profiles.owner_id` und `approved_by`; sonst könnte jeder eingeloggte Nutzer die Konto-IDs veröffentlichter Organizer lesen. **Folge für Slice 2:** Für „welche Profile gehören mir“ braucht der Guard eine eigene Abfrageoberfläche (kleine Ansicht oder Funktion). Das ist bewusst offen.
2. Founder haben Lesezugriff, aber kein direktes UPDATE; jede Founder-Änderung läuft über eine Funktion.
3. Hilfsprädikate liegen im nicht exponierten Schema `app_private`.
4. `actor_id` der Audit-Tabelle ist für Clients nicht lesbar (sonst sähe jeder Owner die Founder-Konto-ID).
5. Revisionen sind eingefroren, sobald sie einmal bestätigt wurden (nicht nur, solange sie aktuell veröffentlicht sind). Die veröffentlichte Historie bleibt damit unverändert.
6. Zwei statt einer Migrationsdatei.

## Festlegungen, die der Plan offen ließ

- **Preis:** `price_state='unknown'` ⇔ `price_model='unknown'`; `provided` ⇒ `free` (ohne Betrag) oder `fixed` (Betrag > 0). Unbekannt ist nie 0 und nie kostenlos.
- **Slug:** ASCII, 3–40 Zeichen, Reserved-Liste als Constraint. Umlaute werden in der Anwendung transliteriert.
- **Mindestvollständigkeit** beim Freigeben/Publizieren in SQL; die ausführliche Lückenanzeige bleibt Aufgabe von Slice 3/4. Fehlercode `DK002` mit Lückencodes im `DETAIL`.
- **Fehlercodes:** `DK001` veraltete Erwartung, `DK002` unvollständig, `DK003` ungültiger Zustand, `DK005` unbekannter Zielnutzer; `42501` nicht erlaubt.
- **`reschedule_event`:** veröffentlicht den privaten Draft mit geändertem Start und setzt `rescheduled`. Ein `postponed_undated`-Pfad existiert nicht (PLAN.md, offene Frage 9).
- Medien-Bestätigung: Der Owner setzt `confirmed_at`; Zeitpunkt und Nutzer stempelt die Datenbank, Rücknahme ist nicht möglich.

## Offen

- Audit-Eintrag für den Founder-Bootstrap (siehe Runbook).
- Rate Limits für Anmeldung (`01-architektur.md`, Q32) sind nicht Teil dieses Slices.

## Nächster Schritt

Review dieses PRs, danach Abnahme gegen echtes Supabase, dann Slice 2 (Login, Organizerzuordnung). Kein Auto-Advance.
