# Systemmails: Einrichtung und Betrieb

Stand 2026-10-27. Gilt für die Alpha. Erlaubt sind nur Systemmails zum Organizer-Ablauf (Anmeldecode, „Profil ist live“, Rückfrage zur Prüfung), siehe `AGENTS.md`. Keine Werbung, kein Newsletter, keine Mails an Besucher.

## Was wann verschickt wird
- **Anmeldecode:** schickt Supabase Auth selbst über SES (Einrichtung in `supabase-auth-setup.md`).
- **„Dein Profil … ist jetzt live“ und „Eine Frage zu deinem Profil …“:** schickt die App serverseitig, direkt nachdem du auf der Prüfseite freigibst oder eine Rückfrage stellst. Der Weg: `claim_profile_mail` (Datenbank prüft den Zustand und gibt die Adresse nur dir heraus) → Versand per SMTP → `finish_profile_mail` (Ergebnis). Je Profil, Revision und Art gibt es genau eine Zeile in `profile_mails`; eine angenommene Mail wird nie ein zweites Mal gesendet.
- Die Mail enthält keinen Token, keine Adresse und nur einen Link direkt auf die Seite des Profils (`/organizer/profiles/<id>/status`); wer nicht angemeldet ist, wird nach der Anmeldung dorthin zurückgeleitet. Der Fragetext steht nicht in der Mail, nur in der App.

## Umgebungsvariablen (Namen; Werte trägst du selbst ein)
| Name | Bedeutung |
| --- | --- |
| `MAIL_SMTP_HOST` | SES: `email-smtp.eu-central-1.amazonaws.com` |
| `MAIL_SMTP_PORT` | `587` (STARTTLS) |
| `MAIL_SMTP_USER` | SMTP-Benutzername des IAM-Benutzers (nur `ses:SendRawEmail`), sieht aus wie ein Zugriffsschlüssel (`AKIA…`) |
| `MAIL_SMTP_PASSWORD` | **SMTP-Passwort** aus „Create SMTP credentials“ in der SES-Konsole (Frankfurt), einmalig angezeigt. Nicht das AWS-Passwort und nicht der „Secret Access Key“ aus IAM |
| `MAIL_FROM` | Absender, eine in SES verifizierte Adresse oder Domain, nur die Adresse ohne Anzeigenamen (`hello@diskoe.world`) |

Eintragen: Amplify → App → *Hosting → Environment variables* (für Preview/Produktion) beziehungsweise `.env.local` (lokal). Nie in Git, Chat oder Logs. Den SMTP-Zugang kannst du wiederverwenden, den du für Supabase Auth angelegt hast, oder einen zweiten IAM-Benutzer nur für die App anlegen (sauberer: ein Zugang pro Zweck, einzeln widerrufbar).

Ohne diese Variablen sendet die App nichts. Auf der Prüfseite steht dann „Der Mailversand ist hier nicht eingerichtet“, und „Mail senden“ bleibt möglich, sobald die Variablen gesetzt sind. Ein entfernter Server ohne Zugangsdaten gilt als nicht eingerichtet.

## Produktionszugang
Der SES-Produktionszugang ist seit 2026-10-28 erteilt (`ses-production-access.md`). Mails gehen damit an beliebige Organizer-Adressen. Wäre ein Konto oder eine Region wieder in der Sandbox, gingen Mails nur an verifizierte Adressen; an andere meldet der Server „fehlgeschlagen“, und die Prüfseite bietet „Mail erneut senden“ an.

## Lesen der Ergebnisse
- Prüfseite zeigt je Profil „Mail vom Anbieter angenommen“, „Mail fehlgeschlagen“ oder „Mail wird gesendet“. **Angenommen heißt nicht zugestellt.** Zustellung, Bounces und Beschwerden zeigt SES.
- Bleibt ein Versuch auf „wird gesendet“ stehen (Server abgebrochen), lässt die Datenbank nach 5 Minuten einen neuen Versuch zu.
- Fehler werden ohne Adresse und ohne Meldungstext protokolliert, nur Art und Fehlercode.

## Lokal und in der CI
Der lokale Supabase-Stack fängt Mails ab (`supabase/config.toml`, SMTP-Port 54325, Weboberfläche 54324). Für Tests: `MAIL_SMTP_HOST=127.0.0.1`, `MAIL_SMTP_PORT=54325`, `MAIL_FROM=hello@example.test`, keine Zugangsdaten. Es verlässt keine Mail den Rechner.

## Fehlersuche
- `535 Authentication Credentials Invalid` (Code `EAUTH`): SES lehnt die Zugangsdaten ab. Häufigste Ursache: der IAM-Schlüssel steht statt des SMTP-Passworts in `MAIL_SMTP_PASSWORD`, oder der Zugang wurde für eine andere Region erzeugt. Abhilfe: in der SES-Konsole (Frankfurt) neue SMTP-Zugangsdaten anlegen und beide Werte neu eintragen. Danach den Server neu starten, damit er die Datei neu liest. Ein `#` oder Leerzeichen im Passwort gehört in Anführungszeichen.
- `554` oder „not verified“ beim Senden: Absender nicht verifiziert oder Konto in dieser Region noch in der Sandbox.
- Den Zugang ohne die App prüfen: ein kurzes Node-Skript außerhalb des Repos mit `nodemailer` und `transport.verify()`, das nur Fehlercode und SES-Antwortzeile ausgibt, nie die Werte.
