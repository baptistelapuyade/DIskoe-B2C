# Preview auf AWS Amplify einrichten (Dev-Supabase)

Stand 2026-11-03. Gilt für das Preview mit Testdaten. Erlaubt laut `AGENTS.md`: Preview-Deployments in `eu-central-1` im Gratis-/Guthabenrahmen. **Nicht** erlaubt: Produktion mit echten Organizern, Einladen echter Organizer ins Dev-Supabase. Werte trägst du selbst in der Amplify-Konsole ein, nie in Git oder Chat.

Diese Anleitung ist vorbereitet, aber noch nicht durchlaufen. Dass Next.js 15.5.28 mit Node-Middleware auf Amplify läuft, ist unbestätigt (Rückfall: `.planning/phases/04-durchstich/SLICE-2-SUMMARY.md`).

## Einrichten
1. AWS-Konsole, Region **Europe (Frankfurt) `eu-central-1`**. Zuerst ein **Budget mit E-Mail-Alarm** anlegen (Billing → Budgets), damit das Guthaben nicht unbemerkt aufgebraucht wird.
2. Amplify → *Create new app* → *Host web app* → GitHub, Repository `DIskoe-B2C`, Branch `main`. Amplify erkennt Next.js (SSR) und nutzt die `amplify.yml` im Repo (Node 24.22.1, `npm ci`, `npm run build`).
3. *Hosting → Environment variables* eintragen (Namen unten). Sie müssen für Build **und** Laufzeit gelten; `amplify.yml` kopiert die serverseitigen in `.env.production`.
4. Erst deployen, dann die Amplify-Adresse (`https://main.<id>.amplifyapp.com`) als `NEXT_PUBLIC_SITE_URL` eintragen und **neu bauen** (der Wert wird beim Build eingesetzt).
5. Supabase (Dev-Projekt) → Authentication → URL Configuration: Amplify-Adresse als *Site URL* und `https://<amplify-adresse>/**` unter *Redirect URLs* ergänzen (siehe `supabase-auth-setup.md`; die lokalen Einträge bleiben).

## Umgebungsvariablen (Namen)
| Name | Preview | Bedeutung |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Pflicht | API-URL des Dev-Projekts (Supabase → Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Pflicht | Publishable Key des Dev-Projekts. Nie einen Service-Role-Key eintragen |
| `NEXT_PUBLIC_SITE_URL` | Pflicht | Adresse des Previews, ohne Schrägstrich am Ende |
| `SITE_INDEXING` | **nicht setzen** | Nur in Produktion `on`; ohne bleibt das Preview für Suchmaschinen zu |
| `MAIL_SMTP_HOST`, `MAIL_SMTP_PORT`, `MAIL_SMTP_USER`, `MAIL_SMTP_PASSWORD`, `MAIL_FROM` | zunächst leer | Systemmails der App (Details: `system-mails.md`). Ohne sie sendet die App nichts; die Prüfseite sagt „Der Mailversand ist hier nicht eingerichtet“. Anmeldecodes verschickt Supabase Auth selbst |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | optional | Monitoring, EU-Projekt; `…ENVIRONMENT=preview` |

## Prüfen nach dem ersten Deploy
1. `/` lädt.
2. `/login`: Anmeldecode kommt per E-Mail an und die Anmeldung gelingt (prüft auch die Node-Middleware und die Redirect-URL).
3. `/robots.txt` zeigt `Disallow: /`, `/sitemap.xml` ist leer, Antworten tragen `X-Robots-Tag: noindex, nofollow`.
4. Ein veröffentlichtes Test-Event unter `/e/<slug>` und das Profil unter `/<profil-slug>` öffnen; Bilder erscheinen (Quelle `public-media` im Dev-Supabase); ein Entwurf liefert 404.
5. Impressum und Datenschutz zeigen den Platzhalter (bis die Texte eingetragen sind).
6. Wenn Schritt 2 mit einem Redirect-Fehler scheitert: Redirect-URLs und `NEXT_PUBLIC_SITE_URL` prüfen. Scheitert nur die Sitzungsauffrischung: Rückfall aus `SLICE-2-SUMMARY.md`.

Ergebnis (was lief, was nicht) bitte an mich zurückmelden; erst dann gilt das Preview als geprüft.

## Grenzen
Das Dev-Supabase enthält Testdaten. Keine echten Organizer einladen, keine echten Mails an Dritte (`AGENTS.md`). Zugangsschutz fürs Preview (Passwort) ist eine Amplify-Funktion unter *Access control* und deine Entscheidung; `SITE_INDEXING` hält nur Crawler fern.
