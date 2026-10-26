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

## Grenzen und offene Punkte

- Texte der Login- und „keine Zuordnung“-Ansicht sind Vorschläge (`TODO(spec)`), es gibt keinen Figma-Screen.
- Code-Mail im Dev-Projekt erst nach SES/Custom SMTP; bis dahin Link-Login.
- Node-Middleware auf Amplify ist unbestätigt bis zum ersten Preview. Rückfall: Sitzungsauffrischung über eine Route ohne Middleware.
- In der Entwicklungssitzung war die npm-Registry gesperrt: Lint, Typecheck, Vitest und Playwright liefen nicht lokal. Die erste echte Ausführung ist die CI.
- Nicht enthalten: Merkliste/Abos, Profil anlegen durch Owner, Profilwechsel-UI, Google-Login, eigenes Rate-Limit.
