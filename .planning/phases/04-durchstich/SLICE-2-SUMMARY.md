# Slice 2 — Zusammenfassung (Login, Organizerzuordnung)

Stand: 2026-10-26. Branch `feat/slice-2-login`. Kein Requirement ist dadurch als erfüllt markiert.

## Was entstanden ist

| Bereich | Inhalt |
|---|---|
| DB | Migration `20261026140000_my_profiles_view.sql`: `public.my_profiles` (security_invoker, Filter `owns_profile`, nur `authenticated`). Nötig, weil `owner_id` für Clients unlesbar ist. 11 neue SQL-Zusicherungen (209 gesamt). |
| Logik | `lib/auth/guards.ts` (`resolveAccess`, `safeNextPath`), `lib/auth/input.ts`, `lib/auth/origin.ts`, `lib/auth/server.ts` (`requireAccess`, `requireOwner`) |
| Sitzung | `middleware.ts` (Node-Runtime) frischt die Sitzung auf und leitet Anonyme aus `/organizer` um; die Seiten prüfen selbst erneut |
| UI | `/login` (E-Mail → 6-stelliger Code), `/auth/callback` (Link, PKCE), `/auth/signout` (POST, Origin-Prüfung), `/organizer` (neutrale Ansicht ohne Zuordnung, sonst Profilliste) |
| Monitoring | Scrubbing um Codes, Token-Hashes, JWTs, URL-Query und `extra` erweitert; `npm run sentry:synthetic` |
| Tests | Vitest: Guards, Redirect-Prüfung, Eingaben, Scrubbing. Playwright `e2e/auth.spec.ts` gegen lokalen Supabase-Stack |
| CI | Jobs `rls-supabase` (gleiche SQL-Tests gegen den echten Supabase-Stack) und `e2e-auth`; Smoke-Job nur noch `home.spec.ts` |

## Wie geprüft wurde

- CI auf Draft-PR #5 (Stand nach den Korrekturen): Lint/Typecheck/Unit, Audit, `rls` (209 Zusicherungen auf PG 16 mit Shim), `rls-supabase` (gleiche Datei gegen den lokalen Supabase-Stack), Smoke und `e2e-auth` grün. Erste Runde fand drei Fehler in meinem Code bzw. den Tests (Alias in Vitest, Middleware ohne Supabase-Variablen, Locator auf die Next-Route-Ansage); alle behoben.
- E2E-Fälle: Anonyme werden zu `/login?next=…` geleitet; Besucher ohne Zuordnung und Founder ohne eigenes Profil sehen die neutrale Ansicht ohne Anlegen-Schaltfläche; Owner A sieht nur sein Profil; API-Zugriff mit echten Tokens liefert A nur eigene Daten, Besucher kann weder Profil einfügen noch `provision_profile_owner` ausführen; Link-Login; kaputter Callback leitet nicht aus der Site hinaus; Abmelden.
- Gegenprobe der Guard-Logik (Kopie, per Node ausgeführt): Entfernen der Organizerbereich-Prüfung in `safeNextPath` lässt `/login` und `/organizerx` durch; Entfernen der Anonym-Prüfung und „Founder ist Owner“ in `resolveAccess` werden beide erkannt. Die Vitest-Fälle prüfen dieselben Eingaben.

## Abnahme am Dev-Projekt (2026-10-26)

- Sentry: synthetisches Ereignis kam in der EU an; E-Mail, Token und Code als `[Filtered]`, kein `user`, keine Cookies/Header (geprüft über den Sentry-Connector).
- Login: Der Link-Login scheiterte zuerst, weil der Link in einem anderen Browser geöffnet wurde (fehlender PKCE-Schlüssel); dazu kam das Mail-Limit des Standardversands. Nach der SES-Einrichtung klappte der Code-Login im Browser: danach 1 Nutzer, 1 Sitzung, 0 Profile, 0 Rollen, Ansicht „Noch kein Organizer-Profil zugeordnet“. Zusätzlich leitet die Middleware einen verirrten Code von `/` an den Callback weiter.
- SES siehe `docs/runbooks/supabase-auth-setup.md`.

## Grenzen und offene Punkte

- Texte der Login- und „keine Zuordnung“-Ansicht sind Vorschläge (`TODO(spec)`), es gibt keinen Figma-Screen.
- SES läuft im Sandbox-Modus; Produktionszugang nicht beantragt (Freigabe offen).
- Node-Middleware auf Amplify ist unbestätigt bis zum ersten Preview. Rückfall: Sitzungsauffrischung über eine Route ohne Middleware.
- In der Entwicklungssitzung war die npm-Registry gesperrt: Lint, Typecheck, Vitest und Playwright liefen nicht lokal. Die erste echte Ausführung ist die CI.
- Nicht enthalten: Merkliste/Abos, Profil anlegen durch Owner, Profilwechsel-UI, Google-Login, eigenes Rate-Limit.
