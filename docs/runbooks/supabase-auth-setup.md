# Supabase-Auth einrichten (Dev-Projekt)

Stand: 2026-10-26. Gilt für das Dev-Projekt (Frankfurt). Produktion ist nicht autorisiert.

## Grundsatz

Jeder kann sich per E-Mail anmelden (offene Alpha, kein Testerlimit). Die Anmeldung erzeugt weder Profil noch Rolle. Organizerrechte entstehen nur durch die Zuordnung des Founders (`provision_profile_owner`, siehe `founder-bootstrap.md`).

## Dashboard (Authentication)

1. **Sign In / Providers → Email:** E-Mail-Provider an lassen, Registrierung **nicht** abschalten.
2. **URL Configuration:**
   - Site URL: `http://127.0.0.1:3000`
   - Redirect URLs: `http://127.0.0.1:3000/**` und `http://localhost:3000/**` (Cookies gelten je Host, deshalb beide Schreibweisen).
   - Spätere Preview-/Produktions-URLs erst bei dem jeweiligen Deployment ergänzen.
3. **Mailversand:** Ohne eigenes SMTP ist die Vorlage nicht editierbar und es kommen nur Mails an Team-Adressen an. Bis zur SES-Einrichtung funktioniert deshalb der **Link**-Login (Standardvorlage), der Code-Login braucht die Vorlage mit `{{ .Token }}`.
4. **Nach der SES-/SMTP-Einrichtung:** Vorlagen aus `supabase/templates/magic_link.html` und `confirmation.html` in **Email Templates** (Magic link und Confirm sign up) übernehmen. Beide enthalten `{{ .Token }}` und `{{ .ConfirmationURL }}`.

## `.env.local`

Variablennamen siehe `.env.example`. `NEXT_PUBLIC_SITE_URL` ist nur der Rückfall, wenn eine Anfrage keinen brauchbaren Host trägt. Werte gehören nie in Git oder Chat.

## Lokal und in der CI

`supabase/config.toml` setzt Registrierung an, die Redirect-URLs, Code-Länge 6 und die Vorlagen. Der lokale Stack fängt Mails ab (Port 54324), es wird nichts versendet. Die Playwright-Tests lesen Codes und Links dort aus.

## Prüfen

- `npm run typecheck && npm test`
- `npx playwright test e2e/auth.spec.ts` (braucht den lokalen Stack und die Variablen `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` aus `supabase status -o env`)
- `npm run sentry:synthetic` sendet ein synthetisches Ereignis mit Fake-E-Mail, -Token und -Code; alles muss in Sentry als `[Filtered]` erscheinen.
