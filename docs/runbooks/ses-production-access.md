# SES: Produktionszugang und Zustellbarkeit

Stand 2026-10-28. Region `eu-central-1`, Domain `diskoe.world` (verifiziert). **Der Produktionszugang ist erteilt** (Founder, 2026-10-28); Mails gehen an beliebige Adressen, nicht mehr nur an verifizierte. Am selben Tag bestätigt: Versand aus der App über den SMTP-Zugang an eine GMX-Testadresse. Der Antrag und die Hinweise unten bleiben als Nachweis und für eine weitere Region oder ein weiteres Konto stehen. Beantragen kann den Zugang nur der Founder im AWS-Konto.

## Zwischenlösung für die ersten Tester (nur nötig, solange SES in der Sandbox ist)
Jede Testadresse einzeln in SES verifizieren (*Verifizierte Identitäten → Identität erstellen → E-Mail-Adresse*, Bestätigungslink in der AWS-Mail anklicken).

## Antrag auf Produktionszugang (Textvorschlag, vor dem Absenden prüfen)
In der SES-Konsole: *Kontoübersicht → Produktionszugang anfordern*. Mail-Typ „Transaktional“, Website `https://diskoe.world`.

> DISKOE ist eine Plattform, auf der Veranstalter:innen aus der Kulturszene ihr Profil und ihre Events veröffentlichen. Wir senden ausschließlich transaktionale Mails an Personen, die sich selbst bei uns angemeldet haben: Anmeldecodes, die Nachricht „Dein Profil wurde geprüft und ist live“ und Rückfragen zur Prüfung. Es gibt keine Werbung und keinen Newsletter. Adressen stammen nur aus der eigenen Anmeldung. Das Volumen liegt in der Alpha unter 200 Mails pro Tag. Bounces und Beschwerden beobachten wir über SES und stellen den Versand an betroffene Adressen sofort ein. Jede Mail nennt den Grund des Versands und eine Kontaktadresse.

## Zustellbarkeit
- Die Login-Mail an GMX landete zunächst im Spam-Ordner. Ursache ist meist ein fehlender DMARC-Eintrag. Beim Domain-Anbieter einen TXT-Eintrag `_dmarc.diskoe.world` anlegen, zum Beispiel `v=DMARC1; p=none; rua=mailto:<Adresse des Founders>`. Erst später auf `quarantine` verschärfen.
- DKIM (drei CNAME-Einträge) ist gesetzt. SPF kommt über die SES-Absenderdomain (Custom MAIL FROM optional).
- Tester bitten, den Absender als „kein Spam“ zu markieren.
