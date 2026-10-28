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
3. **Mailversand:** Ohne eigenes SMTP ist die Vorlage nicht editierbar, es kommen nur Mails an Team-Adressen an und das Limit ist sehr niedrig. Deshalb läuft das Dev-Projekt über SES (siehe unten).
4. **Vorlagen:** Vorlagen aus `supabase/templates/magic_link.html` und `confirmation.html` in **Email Templates** (Magic link und Confirm sign up) übernehmen. Beide enthalten `{{ .Token }}` und `{{ .ConfirmationURL }}`.

## Amazon SES (eingerichtet am 2026-10-26)

- Region `eu-central-1` (Frankfurt). Domain-Identität `diskoe.world` per Easy DKIM (drei CNAME-Einträge bei United Domains) verifiziert; DMARC als TXT `_dmarc` mit `v=DMARC1; p=none;` (nur Beobachtung).
- SMTP-Zugang über einen IAM-Benutzer (`ses-smtp-user…`, nur `ses:SendRawEmail`), **nicht** über Mail Manager (kostenpflichtig). Benutzername und Passwort liegen nur im Passwort-Manager und in Supabase.
- Supabase → Authentication → Emails → SMTP: Host `email-smtp.eu-central-1.amazonaws.com`, Port `587`, Absender `login@diskoe.world`, Name `DISKOE`.
- SES läuft im Sandbox-Modus: Mails gehen nur an in SES bestätigte Adressen. Der Antrag auf Produktionszugang ist **nicht** gestellt, weil Versand echter E-Mails an Dritte nach `AGENTS.md` noch nicht freigegeben ist.
- Vorlagen „Magic link“ und „Confirm sign up“ im Dashboard sind mit `supabase/templates/*.html` identisch und enthalten Code und Link.

## `.env.local`

Variablennamen siehe `.env.example`. `NEXT_PUBLIC_SITE_URL` ist nur der Rückfall, wenn eine Anfrage keinen brauchbaren Host trägt. Werte gehören nie in Git oder Chat.

## Lokal und in der CI

`supabase/config.toml` setzt Registrierung an, die Redirect-URLs, Code-Länge 6 und die Vorlagen. Der lokale Stack fängt Mails ab (Weboberfläche Port 54324, SMTP Port 54325), es wird nichts versendet. Die Systemmails der App stehen in `system-mails.md`. Die Playwright-Tests lesen Codes und Links dort aus.

## Wichtig beim Testen

Anmeldung immer im selben Browser und unter derselben Adresse beenden, in der sie begonnen wurde (`127.0.0.1`). Ein Link, der in einem anderen Browser oder unter `localhost` geöffnet wird, scheitert, weil dort der PKCE-Schlüssel fehlt; der Code in der Mail hat dieses Problem nicht.

## Prüfen

- `npm run typecheck && npm test`
- `npx playwright test e2e/auth.spec.ts` (braucht den lokalen Stack und die Variablen `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` aus `supabase status -o env`)
- `npm run sentry:synthetic` braucht Node 24; mit Node 20: `npx -y node@24.22.1 --env-file-if-exists=.env.local scripts/sentry-synthetic.mjs`. Es sendet ein synthetisches Ereignis mit Fake-E-Mail, -Token und -Code; alles muss in Sentry als `[Filtered]` erscheinen.
