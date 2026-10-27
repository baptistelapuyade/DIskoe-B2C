# Systemmails: Einrichtung und Betrieb

Stand 2026-10-27. Gilt für die Alpha. Erlaubt sind nur Systemmails zum Organizer-Ablauf (Anmeldecode, „Profil ist live“, Rückfrage zur Prüfung), siehe `AGENTS.md`. Keine Werbung, kein Newsletter, keine Mails an Besucher.

## Was wann verschickt wird
- **Anmeldecode:** schickt Supabase Auth selbst über SES (Einrichtung in `supabase-auth-setup.md`).
- **„Dein Profil … ist jetzt live“ und „Eine Frage zu deinem Profil …“:** schickt die App serverseitig, direkt nachdem du auf der Prüfseite freigibst oder eine Rückfrage stellst. Der Weg: `claim_profile_mail` (Datenbank prüft den Zustand und gibt die Adresse nur dir heraus) → Versand per SMTP → `finish_profile_mail` (Ergebnis). Je Profil, Revision und Art gibt es genau eine Zeile in `profile_mails`; eine angenommene Mail wird nie ein zweites Mal gesendet.
- Die Mail enthält keinen Token, keine Adresse und nur einen Link auf die Startseite des Organizers (nach Anmeldung). Der Fragetext steht nicht in der Mail, nur in der App.

## Umgebungsvariablen (Namen; Werte trägst du selbst ein)
| Name | Bedeutung |
| --- | --- |
| `MAIL_SMTP_HOST` | SES: `email-smtp.eu-central-1.amazonaws.com` |
| `MAIL_SMTP_PORT` | `587` (STARTTLS) |
| `MAIL_SMTP_USER` | SMTP-Benutzername des IAM-Benutzers (nur `ses:SendRawEmail`) |
| `MAIL_SMTP_PASSWORD` | SMTP-Passwort desselben Benutzers |
| `MAIL_FROM` | Absender, eine in SES verifizierte Adresse oder Domain, nur die Adresse ohne Anzeigenamen (`hello@diskoe.world`) |

Eintragen: Amplify → App → *Hosting → Environment variables* (für Preview/Produktion) beziehungsweise `.env.local` (lokal). Nie in Git, Chat oder Logs. Den SMTP-Zugang kannst du wiederverwenden, den du für Supabase Auth angelegt hast, oder einen zweiten IAM-Benutzer nur für die App anlegen (sauberer: ein Zugang pro Zweck, einzeln widerrufbar).

Ohne diese Variablen sendet die App nichts. Auf der Prüfseite steht dann „Der Mailversand ist hier nicht eingerichtet“, und „Mail senden“ bleibt möglich, sobald die Variablen gesetzt sind. Ein entfernter Server ohne Zugangsdaten gilt als nicht eingerichtet.

## Sandbox und Produktionszugang
Solange SES in der Sandbox ist, gehen Mails nur an verifizierte Adressen; an andere Organizer meldet der Server „fehlgeschlagen“, und die Prüfseite bietet „Mail erneut senden“ an. Antrag: `ses-production-access.md`.

## Lesen der Ergebnisse
- Prüfseite zeigt je Profil „Mail vom Anbieter angenommen“, „Mail fehlgeschlagen“ oder „Mail wird gesendet“. **Angenommen heißt nicht zugestellt.** Zustellung, Bounces und Beschwerden zeigt SES.
- Bleibt ein Versuch auf „wird gesendet“ stehen (Server abgebrochen), lässt die Datenbank nach 5 Minuten einen neuen Versuch zu.
- Fehler werden ohne Adresse und ohne Meldungstext protokolliert, nur Art und Fehlercode.

## Lokal und in der CI
Der lokale Supabase-Stack fängt Mails ab (`supabase/config.toml`, SMTP-Port 54325, Weboberfläche 54324). Für Tests: `MAIL_SMTP_HOST=127.0.0.1`, `MAIL_SMTP_PORT=54325`, `MAIL_FROM=hello@example.test`, keine Zugangsdaten. Es verlässt keine Mail den Rechner.
