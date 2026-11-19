# Datenschutz: Entwurf der Bausteine (Claude, Stand 19.11.2026)

**Status:** Entwurf von Claude, **nicht freigegeben**. Der Founder gibt die Rechtstexte vor der Alpha-Öffnung frei (`AGENTS.md`, Erweiterung 05.11.). Kein Rechtsrat. Die Seite `/datenschutz` (`lib/legal/texts.ts`) bleibt ein Platzhalter, bis der Gesamttext steht.

Dieses Dokument sammelt die Bausteine, die aus dem gebauten Stand folgen, damit beim Schreiben des Gesamttextes nichts fehlt. Fertig formuliert ist bisher nur Baustein 1.

## Baustein 1: Zwischenspeicherung im Browser (Slice 5, EVT-09c)

Grundlage: Beschluss Founder 10.11. (Eingaben bleiben bei Fehlern und abgelaufener Sitzung erhalten), UX-Framework UX-12.

**Was technisch passiert:** Schlägt das Speichern eines Event-Schritts fehl, schreibt die App die Eingaben dieses einen Schritts in den lokalen Speicher des Browsers (`localStorage`, Schlüssel `diskoe:event-step:…` mit Event- oder Profil-ID und Schritt, ohne Namen oder E-Mail-Adresse). Der Eintrag wird gelöscht, sobald der Schritt gespeichert ist, und beim Abmelden. Die Daten werden nicht an einen Server gesendet. Genauer: es sind nur Texte des Schritts (zum Beispiel Titel, Beschreibung, Datum, Ort).

**Deutsch (Vorschlag):**
> Wenn das Speichern eines Schritts fehlschlägt, behalten wir deine Eingaben dieses Schritts im lokalen Speicher deines Browsers, bis du das Speichern wiederholst oder dich abmeldest. Sie verlassen dein Gerät dabei nicht. Du kannst sie jederzeit löschen, indem du dich abmeldest oder die Website-Daten in deinem Browser entfernst.

**English (proposal):**
> If saving a step fails, we keep what you entered in that step in your browser's local storage until you try saving again or sign out. It does not leave your device. You can delete it at any time by signing out or by clearing the site data in your browser.

**Zu klären (Founder/Rechtsprüfung):**
- Ob der Speicher als „unbedingt erforderlich“ (Wunsch der Person, Funktion des Dienstes) gilt und deshalb ohne Einwilligungsbanner auskommt. Mein Vorschlag: ja, weil er nur auf Fehlerfälle reagiert und nichts übermittelt; das ist eine rechtliche Einschätzung, die ich nicht treffe.
- Ob der Hinweis zusätzlich an der Stelle selbst steht. Er steht bereits in EVT-09c („Nur in diesem Browser behalten.“).

## Weitere Bausteine (nur Liste, nicht formuliert)

Aus dem Platzhalter in `lib/legal/texts.ts` und dem gebauten Stand:

- Verantwortlicher und Kontakt (Impressumsdaten, vom Founder).
- Anmeldung per E-Mail-Code (E-Mail-Adresse, Code, Wartezeit nach falschen Eingaben).
- Session-Cookies und das Cookie `lang` (Sprachwahl).
- Supabase (Frankfurt): Konto, Profile, Events, Bilder.
- Amazon SES: Systemmails (Anmeldecode, Profil live, Rückfrage); Hinweis „vom Anbieter angenommen“ heißt nicht „zugestellt“.
- AWS Amplify: Server-Logs.
- Google-Modell für die KI-Erfassung von Flyern (Welle 2; Region Frankfurt, sonst beste EU-Region).
- Rechte der Betroffenen, Speicherdauer, Aufsichtsbehörde.

Jeder Baustein wird gegen den tatsächlichen Stand geprüft, bevor der Text freigegeben wird.
