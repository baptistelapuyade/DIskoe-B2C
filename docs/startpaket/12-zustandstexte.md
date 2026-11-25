# 12 — Zustandstexte (Katalog, Stand 10.11.2026)

**Status:** Wortlaut und fünf Grundentscheidungen vom Founder freigegeben am 10.11.2026, 11:34 (Standard „Das {Aktion} hat nicht geklappt.“; „Gäste“ statt „Besucher“; Fehlgeschlagen = Fehler, Mail nicht übergeben = Warnung; „verworfen“; Mail-Zusatz immer). Button-Beschriftungen und Mails folgen. Zweisprachig ab 10.11.2026, 14:46 (siehe „Sprachen“). Einzige Quelle für Hinweisboxen und Zustandstexte in Profil-, Event- und Founder-Flows. Gilt zusammen mit `09-ux-framework.md` §5.1 (du, Doppelpunkt, kurz, aktiv, Fehler: erst was passiert ist, dann was du tun kannst) und den Mustern in `11-muster-und-zustaende.md`.

## Regeln
1. **Zustandstexte kommen aus diesem Katalog.** Frames tragen die Text-ID im Ebenennamen (z. B. `Z03`). Änderungen zuerst hier, dann in den Frames und im Code (gemeinsames Textverzeichnis mit denselben IDs).
2. **Platzhalter** stehen in `{…}`. Ein Schritt braucht einen eigenen Eintrag nur, wenn der Katalog ihn nicht abdeckt; dann mit Begründung.
3. **Art der Hinweisbox:** Fehler = die Aktion wurde nicht ausgeführt. Warnung = die Aktion ist gelaufen oder noch möglich, aber mit Einschränkung. Info = Erklärung. Erfolg = erledigt.
4. **Immer sagen, was nach einem Fehler gilt** (`{Stand danach}`): was bleibt, was ist öffentlich.
5. **Mails:** „an den Versanddienst übergeben“ steht nie ohne den Zusatz, dass das nicht „angekommen“ heißt (`AGENTS.md`).

## Sprachen (Beschluss Founder, 10.11.2026, 14:46)
- **Alpha-Copy in Deutsch und Englisch, zur Auswahl.** Standardsprache ist **Englisch**; Umschalter auf Deutsch an fester Stelle (Kopf- oder Fußzeile), die Wahl wird im Browser gemerkt. Erkennung der Browsersprache ist eine spätere Zugabe.
- **Feste Überschriften der Plattform** (z. B. „Kommende Events“ / „Upcoming events“ auf der Profilseite) kommen aus diesem Katalog und wechseln mit der Sprache. Texte der Organizer (Name, Beschreibung, Eventtitel) bleiben in der Sprache, in der sie geschrieben wurden, und werden nicht übersetzt. Die englischen Überschriften in `PUB-06a` waren Platzhalter; sie werden bei der Aufnahme der Plattform-Überschriften als Z20 ff. sauber in beiden Sprachen geführt.
- **Mails:** Die Sprache wird beim Anlegen gespeichert: am E-Mail-Abo (Sprache der Seite beim Bestätigen), beim Besucher-Login-Code (Sprache der Seite, auf der der Code angefordert wurde), bei Organizern am Konto (in den Einstellungen änderbar). Ohne gespeicherten Wert: Englisch. Einwilligungstexte und Mails gibt es in beiden Sprachen.
- **Rechtstexte:** Impressum und Datenschutz in Deutsch (maßgebliche Fassung) und Englisch (Übersetzung, als solche gekennzeichnet). Rechtliche Prüfung vor der Alpha-Öffnung bleibt beim Founder.
- **Founder-Bereich:** bleibt nur auf Deutsch (Founder, 25.11.2026), weil er ein internes Werkzeug ist; seine Texte brauchen keine englische Fassung.
- **Preisspanne:** das Symbol steht einmal (Founder, 25.11.2026): „8,00–15,00 €“ und „€8.00–15.00“, auch auf der Bestätigungsseite.
- **Pflege:** Die englischen Texte stehen nur in diesem Katalog (gleiche IDs). Änderungen zuerst hier, in beiden Sprachen.

## Begriffe für Gäste-Seiten (Vorschlag 10.11., Founder-Review 13:45)
- **Profil:** „folgen“ (Button „Folgen“, „Du folgst …“, „Wieder folgen“).
- **Event:** „abonnieren“ (Button „Änderungen abonnieren“, „Wieder abonnieren“).
- **Substantiv:** immer „E-Mail-Abo“ (Listen, Titel, Abmeldeseiten); im Satz darf „Abo“ stehen. „Folgen beenden“ und „Follow“ entfallen.
- **Merkliste:** „merken“, „Gemerkt (n)“; die Zahl zählt Events, die nicht vorbei sind. Status-Badges: „Abgesagt“, „Verschoben“, „Vorbei“.
- **Eine Aktion, ein Name:** Der Button im Formular, der Einwilligungstext und die Mail nennen dieselbe Aktion beim gleichen Namen.

## Katalog (Vorschlag)
| ID | Muster | Art | Zeile 1 | Zeile 2 | Platzhalter |
|---|---|---|---|---|---|
| Z01 | Feldfehler | Fehler | Bitte prüfe {eine Angabe / zwei Angaben / n Angaben}. | Ein Feld: `{Grund}` („Der Titel fehlt noch.“). Mehrere fehlend: „Die markierten Felder fehlen noch.“ Mehrere ungültig: „Die markierten Felder passen noch nicht.“ | Anzahl, Grund |
| Z02 | Speichert, lädt hoch, sendet | Info | {Objekt} wird {gespeichert / hochgeladen / gesendet} … | Das dauert einen Moment. Bleib kurz auf dieser Seite. | Objekt, Verb |
| Z03 | Aktion fehlgeschlagen | Fehler | Das {Aktion} hat nicht geklappt. | {Stand danach} Versuche es noch einmal. | Aktion (Speichern, Senden, Hochladen, Laden, Veröffentlichen, Absagen, Verschieben, Eintragen, Austreten, Sperren, Entsperren, Einreichen, Zurückziehen, Löschen) |
| Z03a | wie Z03, Liste lädt nicht | Fehler | Das Laden hat nicht geklappt. | Das liegt nicht an dir. Versuche es noch einmal. | – |
| Z03b | wie Z03, Entwurf wiederholt | Fehler | Das Speichern hat nicht geklappt. | {Stand danach} Versuche es noch einmal. Klappt es weiter nicht, schreib uns. | – |
| Z04 | Keine Verbindung | Warnung | Keine Verbindung. | {Stand danach} Sobald du wieder online bist, versuche es noch einmal. | Stand danach |
| Z05 | Datei zu groß | Fehler | Die Datei ist zu groß. | Erlaubt sind JPG, PNG oder WebP bis {Grenze}. Deine hat {Größe}. | Grenze (5 MB), Größe |
| Z06 | Bild zu klein | Fehler | Das Bild ist zu klein. | Es braucht mindestens {Breite} × {Höhe} Pixel. Deins hat {Breite} × {Höhe} Pixel. | 400 × 400 (Profil, Event), 1600 × 900 (Titelbild Venue) |
| Z07 | Dateiformat | Fehler | Dieses Format geht nicht. | Erlaubt sind JPG, PNG oder WebP bis 5 MB. | – |
| Z08 | Zu viele Dateien | Warnung | Das sind zu viele Bilder. | Du kannst höchstens {n} Bilder hinzufügen. Entferne eins, dann geht es weiter. | n (3) |
| Z09 | Bestätigung fehlt | Fehler | Bitte bestätige {beide Punkte / die Absage / …}. | Setze {den Haken / beide Haken}, dann kannst du {Aktion}. | Aktion |
| Z10 | Nicht rückgängig | Warnung | Das lässt sich nicht rückgängig machen. | {Folge}. | Folge |
| Z11 | Gespeichert / erledigt | Erfolg | Gespeichert. / Veröffentlicht. / {Objekt} {Partizip}. | {Stand für Gäste oder Folge}. | – |
| Z12 | Stand für Gäste | Info / Erfolg | Gäste sehen {noch den bisherigen / jetzt den neuen} Stand. | {Folge}. | Stand |
| Z13 | Hinweis an Follower | Info | Follower bekommen einen Hinweis{ zu {Anlass}}. Er geht {Zeitpunkt} raus. | {n} Gäste folgen deinem Profil. {Option}. | Anlass, Zeitpunkt, n |
| Z14 | Mail übergeben | Erfolg | {Objekt} {Partizip}, Mail übergeben. | Die Mail ist an unseren Versanddienst übergeben. Das heißt noch nicht, dass sie angekommen ist. | – |
| Z15 | Mail nicht übergeben | Warnung | {Die Mail / Der Hinweis} wurde nicht übergeben. | {Stand danach} Sende die Mail erneut. | Stand danach |
| Z16 | Nur in diesem Browser | Warnung | Nur in diesem Browser behalten. | Auf anderen Geräten fehlt dieser Schritt noch. | – |
| Z17 | Verwerfen erledigt | Erfolg | {Objekt} {ist / sind} verworfen. | {Stand} | – |

**Button-Regel:** Wiederholen heißt immer „Noch einmal {versuchen / laden / kopieren}“; zweite Aktion „Später weitermachen“ bzw. „Abbrechen“. Verb plus Objekt bei Hauptaktionen (§5.1).

## Englische Fassung (Wortlaut vom Founder bestätigt 10.11.2026, 14:51)
Gleiche IDs, gleiche Regeln (Ton: du → „you“, kurz, aktiv; Fehler: erst was passiert ist, dann was du tun kannst). Die Gerundien in `{Action}` entsprechen den deutschen Aktionen.

| ID | Line 1 | Line 2 | Placeholders |
|---|---|---|---|
| Z01 | Please check {one entry / two entries / n entries}. | One field: `{reason}` („The title is missing.“). Several missing: „The marked fields are still missing.“ Several invalid: „The marked fields aren't right yet.“ | count, reason |
| Z02 | {Object} is being {saved / uploaded / sent} … | This takes a moment. Stay on this page for a bit. | object, verb |
| Z03 | {Action} didn't work. | {State afterwards} Try again. | Action (Saving, Sending, Uploading, Loading, Publishing, Cancelling, Rescheduling, Signing up, Leaving, Suspending, Unsuspending, Submitting, Withdrawing, Deleting) |
| Z03a | Loading didn't work. | That's not your fault. Try again. | – |
| Z03b | Saving didn't work. | {State afterwards} Try again. If it keeps failing, write to us. | – |
| Z04 | No connection. | {State afterwards} Once you're back online, try again. | state afterwards |
| Z05 | The file is too big. | JPG, PNG or WebP up to {limit} are allowed. Yours is {size}. | limit (5 MB), size |
| Z06 | The image is too small. | It needs at least {width} × {height} pixels. Yours is {width} × {height} pixels. | 400 × 400 (profile, event), 1600 × 900 (venue cover) |
| Z07 | This format isn't supported. | JPG, PNG or WebP up to 5 MB are allowed. | – |
| Z08 | That's too many images. | You can add up to {n} images. Remove one to continue. | n (3) |
| Z09 | Please confirm {both points / the cancellation / …}. | Tick {the box / both boxes}, then you can {action}. | action |
| Z10 | This can't be undone. | {Consequence}. | consequence |
| Z11 | Saved. / Published. / {Object} {participle}. | {State for guests or consequence}. | – |
| Z12 | Guests {still see the previous / now see the new} version. | {Consequence}. | state |
| Z13 | Followers get a notice{ about {reason}}. It goes out {time}. | {n} guests follow your profile. {Option}. | reason, time, n |
| Z14 | {Object} {participle}, email handed over. | The email has been handed over to our sending service. That doesn't mean it has arrived yet. | – |
| Z15 | {The email / The notice} was not handed over. | {State afterwards} Send the email again. | state afterwards |
| Z16 | Kept in this browser only. | This step is still missing on other devices. | – |
| Z17 | {Object} {is / are} discarded. | {State} | – |

**Button rule (EN):** „Try again“ / „Load again“ / „Copy again“; second action „Continue later“ or „Cancel“.

**Begriffe (EN):**
| Deutsch | English | Anmerkung |
|---|---|---|
| Gäste | guests | neutral, wie im Deutschen |
| Profil: folgen („Folgen“, „Du folgst …“, „Wieder folgen“) | follow („Follow“, „You follow …“, „Follow again“) | im Englischen ist „follow“ das übliche Verb; „Follower“ → „followers“ |
| Event: abonnieren („Änderungen abonnieren“) | subscribe („Subscribe to changes“, „Subscribe again“) | Substantiv: „email subscription“ |
| merken, „Gemerkt (n)“ | save, „Saved (n)“ | Entschieden (Founder, 10.11., 14:51): „Save event“ / „Saved“ für die Merkliste, „Save changes“ für Formulare (kein Konflikt: verschiedene Objekte). |
| Abgesagt / Verschoben / Vorbei | Cancelled / Postponed / Past | Status-Badges |
| Veranstalter:in | organizer | |
| E-Mail-Abo | email subscription | |

## Befund vor der Umstellung (Prüfung 10.11.; in den Frames behoben, Stand siehe „Umsetzung“)
| Befund | Beispiele (Kennung: heutiger Text) | Vorschlag |
|---|---|---|
| **Fehlgeschlagen in vier Familien** | „Speichern hat nicht geklappt.“ (`EVB-01c`, `EVV-02b`, `EVA-01c`, `PLS-02e`), „Das Speichern hat nicht geklappt.“ (`LPA-01c`, `EIN-02e`, `PRF-03c`, `FDB-15e`), „Der Ausschnitt konnte nicht gespeichert werden.“ (`ORG-05g`), „Dein Entwurf konnte nicht gespeichert werden.“ (`EVT-09`), „Das hat nicht geklappt.“ (`ORG-102c`) | Z03: „Das {Aktion} hat nicht geklappt.“ |
| **Wiederholen in drei Wendungen** | „noch einmal“, „gleich noch einmal“ (`EVT-00e`, `PLS-02e`, `PLS-05c`) | „noch einmal“ |
| **Stand nach Fehler uneinheitlich** | „Deine Eingaben sind noch da.“, „stehen noch hier.“ (`LPA-01c`), „nichts ist verloren“ (`EIN-02e`, `PRF-03c`) | `{Stand danach}`, Standardsatz „Deine Eingaben sind noch da.“ |
| **Feldfehler L2** | „fehlen noch“ vs. „passen noch nicht“ vs. „sind unten markiert“ (`ORG-08b`); `EVT-07m-g` „Eine Angabe stimmt noch nicht.“; `RFG-02b` „Eine Angabe fehlt noch.“ | Z01; `ORG-08b`, `EVT-07m-g`, `RFG-02b` anpassen |
| **Datei-Fehler** | `ORG-05d` „Das Bild konnte nicht hochgeladen werden. …“, `EVT-05c` „Die Datei ist zu groß. …“, `EVT-00i` „Diese Datei geht nicht.“, `EVT-00j` „Mehr als drei Bilder gehen nicht.“ | Z05 bis Z08 |
| **Lädt-Texte** | `ORG-05b` „Bleib kurz auf dieser Seite.“, `EVT-05d` „Bleib auf dieser Seite.“, `EVT-09a` „Bitte lade die Seite nicht neu.“ | Z02 |
| **Art der Box** | `LIV-03` Kopieren fehlgeschlagen als Warnung, `HNW-03c` nicht übergebener Hinweis als Fehler, `FND-04c` als Warnung | Fehlgeschlagen = Fehler (`LIV-03`); Mail nicht übergeben = Warnung (`HNW-03c`) |
| **Mail-Zusatz fehlt** | `FDB-16b` „Die Mail ist an unseren Versanddienst übergeben.“ ohne „Das heißt noch nicht, dass sie angekommen ist.“ | Z14 |
| **Verwerfen** | „Die Änderungen sind weg.“ (`EVB-06b`), „Der Entwurf ist weg.“ (`EVB-07b`) vs. „Die Änderungen sind verworfen.“ (`LPA-06b`) | Z17: „verworfen“ (wie der Button) |
| **Bestätigung fehlt** | „Dann kannst du veröffentlichen.“ (`EVB-04b`) vs. „Setze den Haken, dann kannst du absagen.“ (`EVA-01b`) | Z09 |
| **„Besucher“ statt Gendern** | mehrere Hinweise („Besucher sehen …“, `EVM-01b`, `EVB-02`, `EVB-05`, `EVV-04a`, `HNW-02a` …); §5.1 verlangt Doppelpunkt oder neutrale Form | „Gäste“ (neutral, kurz) |
| **Alte Wortwahl** | `PLS-01b` zweiter Hinweis „Du hast Plus reserviert.“, Wortlaut seit 09.11. „Warteliste“ | „Du stehst auf der Warteliste für Plus.“ (nur ein Hinweis) |
| **ihr/eure in Venue-Frames** | `D20.V01` bis `V05`, `D11.3`, `D11.6`, `D21.b` | **nicht umgestellt** (Sections „nicht im Durchstich“ wurden nicht gescannt); bei Überarbeitung auf „du“ angleichen |
| **Imperativ** | „trag das Event von Hand ein“ (`EVT-00e`, `EVT-00f`) vs. „Trage …“ | „Trage das Event von Hand ein.“ |

## Umsetzung in den Frames (10.11.2026)
- Gescannt: alle Sections „ENTWURF v2“ (Flow 1 bis 3, Founder-Bereich, Sperre, Flow 2 A/B/C/E, G Plus-Warteliste, H Konto-Sperre), „MUSTER“ und die PLS-01-Frames. **303 Hinweisboxen** (Desktop und Mobil zusammen, 157 verschiedene Texte). Nicht gescannt: ältere Sections „GELTEND“ und „nicht im Durchstich“.
- Geändert: 301 Boxen tragen jetzt die Text-ID im Ebenennamen (`Z03 · Hinweis`). Zwei Boxen entfernt (alter Hinweis „Du hast Plus reserviert.“ in `PLS-01b`, Desktop und Mobil). Vier Boxen von Art gewechselt (`LIV-03` Warnung zu Fehler, `HNW-03c` Fehler zu Warnung, je Desktop und Mobil). „Besucher“ zu „Gäste“ in 38 Boxen; am 10.11. (11:56) auf alle Texte der v2-Sections ausgeweitet (57 Textstellen, auch Mails und Beschriftungen).
- Verteilung nach ID: Z01 38, Z02 6, Z03 36, Z03a 3, Z03b 2, Z04 2, Z05 4, Z06 6, Z07 4, Z08 2, Z09 8, Z10 6, Z11 8, Z12 20, Z13 6, Z14 9, Z15 6, Z16 2, Z17 6, **Einzeltext 127**.
- **Einzeltexte** (127 Boxen) sind Hinweise, die zu genau einem Screen gehören (z. B. Prüfstatus, Sperrgründe, Wartelisten-Erklärung). Sie haben noch keine Katalog-ID. Ihre Quelle ist vorerst der Frame selbst. Offen: im Katalog als Z20 ff. aufnehmen, bevor der Code die Texte in das Textverzeichnis übernimmt (Vorschlag: bei Baubeginn der jeweiligen Welle, damit keine Texte doppelt gepflegt werden).
- Sonderfälle, die bewusst vom Standardsatz abweichen: `EVT-09` (`Z03b`, zusätzlich „Klappt es weiter nicht, schreib uns.“), `EVV-06b` („Die Absage ist aufgehoben.“ statt „weg“), `EVT-07m-d` (Pflichtlücke mit Grund in Zeile 2).
- Stichproben nach dem Umbau per Screenshot geprüft: `EVT-00j`, `FDB-16b`, `PLS-01b`. Die Boxen wachsen mit dem Text, abgeschnittene Boxen gibt es in Frames mit beschnittenem Inhalt nicht. Kein vollständiger Sichtvergleich aller Frames.

## Nicht erfasst (Umfang der Zweisprachigkeit, Founder 10.11., 15:23)
Der Katalog deckt bisher nur Hinweisboxen ab. **Zweisprachig (Deutsch und Englisch) wird die gesamte Copy des Produkts**, nicht nur Mails: Button-Beschriftungen, Feldbeschriftungen und Hilfetexte, Überschriften, Leere Zustände, Dialoge, Fehlertexte, Mails (`MAIL-01` bis `14`), Einwilligungstexte und Rechtstexte. Ausgenommen sind Texte, die Organizer schreiben (Name, Beschreibung, Eventtitel, Bio).
- **Größenordnung (Messung 10.11.):** in den aktuellen Entwurfs-Sections auf Seite 20 und 40 (seit dem Aufräumen vom 10.11. auch auf 30, 50, 60) stehen 13.750 Textebenen mit 1.959 verschiedenen Texten. Darin stecken viele Beispieldaten (Eventnamen, Orte, Uhrzeiten); die echten Oberflächentexte sind weniger, ihre Zahl ermittelt die Bestandsaufnahme beim Aufräumen.
- **Vorgehen:** Texte werden je Welle in den Katalog aufgenommen (IDs ab Z20, nach Bereich gruppiert), jeweils mit Deutsch und Englisch, bevor die Welle gebaut wird. Die Figma-Frames führen Deutsch; die englische Fassung steht nur im Katalog. Mails stehen im Abschnitt „Mails MAIL-01 bis MAIL-14“ am Ende (Deutsch und Englisch, Vorschlag 11.11.2026).

## Plattform-Rahmen (Z20 ff., Welle 1 Block 1, Stand 11.11.2026)
**Status:** Deutsch aus den Figma-Frames (Section „Flow 1 Block 1“, Ready for dev), Englisch ist ein **Vorschlag von Claude** und braucht die Durchsicht des Founders. Gleiche IDs in beiden Sprachen; im Code stehen sie in `lib/i18n/messages.de.ts` und `messages.en.ts` mit derselben ID (Punkte als Schlüsselpfad). Ein Test stellt sicher, dass beide Dateien dieselben IDs führen. Z21 (Anmelden) und Z22 (Startseite) stehen darunter.

| ID | Deutsch | English | Platzhalter / Ort |
|---|---|---|---|
| Z20.weg.title | Dein Weg | Your path | Weg Panel, Überschrift |
| Z20.weg.step1 | Anmelden | Sign in | Weg Panel, Schritt 1 |
| Z20.weg.step2 | Profil und erstes Event anlegen | Create your profile and first event | Weg Panel, Schritt 2 |
| Z20.weg.step3 | Einreichen und freigeben lassen | Submit and get approved | Weg Panel, Schritt 3 |
| Z20.weg.mobile | Schritt {n} von 3 · {name} | Step {n} of 3 · {name} | Weg Panel mobil |
| Z20.progress.mobile | Schritt {n} von {total} · {name} | Step {n} of {total} · {name} | Fortschrittsleiste mobil |
| Z20.lang.label | Sprache | Language | Beschriftung für Screenreader (Umschalter, „EN“ und „DE“ stehen unverändert) |
| Z20.nav.signOut | Abmelden | Sign out | App Header |
| Z20.legal.nav | Rechtliches | Legal | Beschriftung der Fußzeile für Screenreader |
| Z20.legal.imprint | Impressum | Imprint | Fußzeile |
| Z20.legal.privacy | Datenschutz | Privacy policy | Fußzeile (englisch wie in den Mails, `MF-ORG`) |
| Z20.nav.review | Prüfung | Review | App Header, nur für den Founder; die Zahl der offenen Prüfungen steht in Klammern dahinter |
| Z20.back | Zurück | Back | Anmeldeschritte |

### Anmelden (Z21, ORG-01 bis ORG-99)
Deutsch aus den Figma-Frames, Englisch Vorschlag. Die Beispieladresse im Platzhalter ist in beiden Sprachen erfunden.

| ID | Deutsch | English | Ort |
|---|---|---|---|
| Z21.email.eyebrow | Anmelden | Sign in | ORG-01, 95, 96, 01b, Eyebrow; auch Seitentitel |
| Z21.email.title | Dein Kulturauftritt beginnt hier | Your cultural presence starts here | ORG-01 Überschrift |
| Z21.email.lead | Melde dich mit einem Code per E-Mail an. Danach legst du dein Profil an oder übernimmst das Profil, das DISKOE für dich vorbereitet hat. Ein Passwort brauchst du nicht. | Sign in with a code by email. After that you create your profile or take over the profile DISKOE has prepared for you. You don't need a password. | ORG-01 |
| Z21.email.label | E-Mail-Adresse | Email address | Feldbeschriftung |
| Z21.email.placeholder | name@kollektiv.example | name@collective.example | Platzhalter im Feld |
| Z21.email.hint | Wir schicken den Code an diese Adresse. | We'll send the code to this address. | Hilfetext (ORG-01, 01b, 99 ohne) |
| Z21.email.send | Code senden | Send code | Button |
| Z21.email.retry | Noch einmal versuchen | Try again | Button in ORG-01b (Senden fehlgeschlagen), Button-Regel Z03; Founder 13.11.: Variante B statt „Code senden“ des Frames, Frame nachziehen |
| Z21.email.sending | Code wird gesendet … | Sending code … | Button während des Sendens (ORG-96, Z02), deaktiviert |
| Z21.email.invalid | Das ist keine vollständige E-Mail-Adresse. Prüfe sie. | That isn't a complete email address. Check it. | ORG-95, Fehlertext am Feld (Z01 Ein Feld) |
| Z21.send.failed.title | Das Senden hat nicht geklappt. | Sending didn't work. | ORG-01b, Z03 mit Aktion „Senden“ |
| Z21.send.failed.line | Deine Adresse ist noch eingetragen. Versuche es noch einmal. | Your address is still entered. Try again. | ORG-01b, Z03 mit Stand danach |
| Z21.code.eyebrow | Code eingeben | Enter code | ORG-02, 02b, 97 |
| Z21.code.title | Schau in dein Postfach | Check your inbox | ORG-02, 02b, 97, 98 |
| Z21.code.lead | Wir haben dir einen Code an {email} geschickt. Gib ihn hier ein. Es kann einen Moment dauern, bis er ankommt. Er gilt 10 Minuten und nur einmal. Schau auch im Spam-Ordner nach. | We've sent a code to {email}. Enter it here. It can take a moment to arrive. It works for 10 minutes and only once. Check your spam folder too. | ORG-02, 02b, 97; E-Mail-Adresse als Platzhalter |
| Z21.code.label | Code aus der E-Mail | Code from the email | Feldbeschriftung |
| Z21.code.placeholder | 6-stelliger Code | 6-digit code | Platzhalter im Feld |
| Z21.code.submit | Anmelden | Sign in | Button |
| Z21.code.resend | Neuen Code senden | Send a new code | Button, in der Wartezeit von 60 Sekunden deaktiviert; auch ORG-99 |
| Z21.code.otherEmail | Andere E-Mail-Adresse verwenden | Use a different email address | Button, zurück zu ORG-01 |
| Z21.code.wrong | Der Code stimmt nicht oder ist abgelaufen. Prüfe die Zahl oder fordere einen neuen Code an. | The code is wrong or has expired. Check the number or request a new code. | ORG-97, Fehlertext am Feld |
| Z21.code.locked.title | Zu viele falsche Codes. | Too many wrong codes. | ORG-02b, Warnung |
| Z21.code.locked.line | Bitte warte zehn Minuten oder fordere einen neuen Code an. | Please wait ten minutes or request a new code. | ORG-02b, Warnung |
| Z21.resent.pill | Neuer Code gesendet | New code sent | ORG-98, Status über der Überschrift |
| Z21.resent.lead | Wir haben dir einen neuen Code an {email} geschickt. Der vorherige Code gilt nicht mehr. | We've sent a new code to {email}. The previous code is no longer valid. | ORG-98 |
| Z21.resent.hint | Einen weiteren Code kannst du in einer Minute anfordern. | You can request another code in one minute. | ORG-98, Hilfetext unter dem Feld |
| Z21.link.eyebrow | Link abgelaufen | Link expired | ORG-99 |
| Z21.link.title | Dieser Link gilt nicht mehr | This link is no longer valid | ORG-99 |
| Z21.link.lead | Der Link in deiner E-Mail ist abgelaufen oder wurde schon benutzt. Fordere einen neuen Code an, dann kommst du weiter. | The link in your email has expired or was already used. Request a new code and you can continue. | ORG-99 |

### Startseite des Organizers (Z22, ORG-100 und ORG-103a bis g)
Deutsch aus den Figma-Frames, Englisch Vorschlag. Abweichungen vom Frame stehen in der Spalte „Ort“.

| ID | Deutsch | English | Ort |
|---|---|---|---|
| Z22.noProfile.eyebrow | Angemeldet | Signed in | ORG-100 |
| Z22.noProfile.title | Dein Konto hat noch kein Profil | Your account has no profile yet | ORG-100 |
| Z22.noProfile.lead | Du bist angemeldet, aber dein Konto gehört noch zu keinem Profil. Schreib uns, dann ordnen wir es dir zu. | You're signed in, but your account doesn't belong to a profile yet. Write to us and we'll assign one to you. | ORG-100, **Abweichung vom Frame**: Der Frame verweist auf die Einladung und „Profil anlegen“ (`ORG-52`); beides kommt mit Welle 2. Bis dahin legt der Founder Profile an. Vorschlag, braucht Freigabe. Darunter steht die Adresse `hello@diskoe.world` als Mail-Link (Founder 13.11., `lib/contact.ts`) |
| Z22.home.title | Dein Profil | Your profile | ORG-103a bis g, ein Profil |
| Z22.home.titleMany | Deine Profile | Your profiles | mehrere Profile (nicht in Figma, bisheriger Text) |
| Z22.home.lead | Hier siehst du, was als Nächstes zu tun ist und was danach passiert. | Here you can see what to do next and what happens after that. | ORG-103a bis g |
| Z22.pill.draft | Entwurf · privat | Draft · private | ORG-103a bis c |
| Z22.pill.review | In Prüfung · noch nicht öffentlich | In review · not public yet | ORG-103d |
| Z22.pill.question | Rückfrage · noch nicht öffentlich | Question · not public yet | ORG-103e |
| Z22.pill.live | Live | Live | ORG-103f, g |
| Z22.pill.changes | Änderungen noch nicht öffentlich | Changes not public yet | ORG-103g |
| Z22.progress.label | Fortschritt | Progress | Beschriftung für Screenreader |
| Z22.step.profile | Profil | Profile | Fortschritt, Schritt 1 |
| Z22.step.event | Erstes Event | First event | Fortschritt, Schritt 2 |
| Z22.step.submit | Einreichen | Submit | Fortschritt, Schritt 3 |
| Z22.step.review | Prüfung | Review | Fortschritt, Schritt 4 |
| Z22.step.live | Live | Live | Fortschritt, Schritt 5 |
| Z22.gap.name | Name | name | Lücke im Profil (ORG-103a, Liste) |
| Z22.gap.shortIntro | Kurzvorstellung | short introduction | Lücke im Profil |
| Z22.gap.linkOrContact | offizieller Link oder öffentlicher Kontakt | official link or public contact | Lücke im Profil |
| Z22.gap.profileImage | Profilbild | profile picture | Lücke im Profil |
| Z22.gap.revisionMissing | erster Entwurf | first draft | Lücke im Profil |
| Z22.a.message | Dir fehlen noch Angaben: {gaps}. | You're still missing details: {gaps}. | ORG-103a |
| Z22.a.hint | Danach legst du dein erstes Event an. Beides gehst du gemeinsam zur Prüfung. Bis dahin sieht nur du das Profil. | After that you create your first event. You send both to review together. Until then only you can see the profile. | ORG-103a |
| Z22.a.action | Angaben ergänzen | Add details | ORG-103a, auch Profil live mit unvollständiger neuer Fassung |
| Z22.b.message | Dein Profil ist fertig. Als Nächstes legst du dein erstes Event an. | Your profile is done. Next you create your first event. | ORG-103b |
| Z22.b.hint | Profil und Event gehen gemeinsam in die Prüfung. Bis dahin sieht nur du sie. | Profile and event go to review together. Until then only you can see them. | ORG-103b |
| Z22.b.action | Erstes Event anlegen | Create first event | ORG-103b |
| Z22.b.view | Profil ansehen | View profile | ORG-103b, 103f, 103g |
| Z22.c.message | Profil und erstes Event sind vollständig. Schau dir die Vorschau an und reiche beides ein. | Your profile and first event are complete. Look at the preview and submit both. | ORG-103c |
| Z22.c.hint | DISKOE prüft beides zusammen. Mit der Freigabe werden Profil und Event öffentlich. | DISKOE reviews both together. Once approved, profile and event become public. | ORG-103c |
| Z22.c.action | Vorschau ansehen und einreichen | View preview and submit | ORG-103c |
| Z22.d.message | Danke! Wir prüfen Profil und Event gemeinsam, so schnell wir können. Du musst nichts tun. | Thank you! We're reviewing your profile and event together as fast as we can. You don't need to do anything. | ORG-103d |
| Z22.d.hint | Wir schreiben dir per E-Mail, sobald beides freigegeben ist oder wir eine Frage haben. | We'll email you as soon as both are approved or we have a question. | ORG-103d |
| Z22.d.action | Eingereichtes ansehen | View what you submitted | ORG-103d, Ghost-Button |
| Z22.e.fallback | DISKOE hat eine Frage zu deinem Stand. | DISKOE has a question about your submission. | ORG-103e, wenn der Text der Rückfrage fehlt (Rückfall, kein Frame) |
| Z22.e.hint | Das ist keine Absage. Korrigiere die Angabe und reiche Profil und Event danach erneut ein. Bis dahin bleibt alles privat. | This isn't a rejection. Correct the detail and submit profile and event again afterwards. Until then everything stays private. | ORG-103e |
| Z22.e.action | Angabe korrigieren | Correct the detail | ORG-103e |
| Z22.f.message | Dein Profil und dein erstes Event sind live. | Your profile and your first event are live. | ORG-103f |
| Z22.f.profileOnly | Dein Profil ist live. | Your profile is live. | ORG-103f, wenn noch kein Event veröffentlicht ist (kein Frame) |
| Z22.f.hint | Teile den Link, damit Leute dein Programm sehen. Änderungen bleiben privat, bis du sie selbst veröffentlichst. | Share the link so people can see your programme. Changes stay private until you publish them yourself. | ORG-103f, Wortlaut des Frames (Founder 13.11.) |
| Z22.f.share | Profil teilen | Share profile | ORG-103f, Hauptaktion (kopiert den Link) |
| Z22.f.newEvent | Weiteres Event anlegen | Create another event | ORG-103f |
| Z22.g.message | Du hast Änderungen, die noch nicht öffentlich sind. | You have changes that aren't public yet. | ORG-103g |
| Z22.g.incomplete | Dein Profil ist live. Deine neue Fassung ist noch nicht vollständig. | Your profile is live. Your new version isn't complete yet. | Profil live, neue Fassung unvollständig (kein Frame, Text aus dem bisherigen Stand) |
| Z22.g.hint | Bis du sie veröffentlichst, bleibt der bisherige öffentliche Stand sichtbar. | Until you publish them, the previous public version stays visible. | ORG-103g |
| Z22.g.action | Vorschau ansehen und veröffentlichen | View preview and publish | ORG-103g |
| Z22.area.title | Dein Bereich | Your area | ORG-103c bis g |
| Z22.area.events.title | Events | Events | Zeile in Dein Bereich |
| Z22.area.events.text | Deine Events ansehen, verwalten oder ein neues anlegen. | View and manage your events or create a new one. | Zeile in Dein Bereich |
| Z22.area.edit.title | Profil bearbeiten | Edit profile | Zeile in Dein Bereich, nur live |
| Z22.area.edit.text | Änderungen bleiben privat, bis du sie veröffentlichst. | Changes stay private until you publish them. | Zeile in Dein Bereich, nur live |
| Z22.events.heading | Deine Events | Your events | vorläufig auf der Startseite, bis die Eventliste (`EVL-01`, F6) gebaut ist |
| Z22.events.empty | Du hast noch kein Event angelegt. | You haven't created an event yet. | vorläufig, wie bisher |
| Z22.events.untitled | Event ohne Titel | Untitled event | vorläufig, wie bisher |
| Z22.events.published | Veröffentlicht | Published | vorläufig, wie bisher |
| Z22.events.draft | Entwurf – privat | Draft – private | vorläufig, wie bisher |
| Z22.events.inReview | In Prüfung | In review | vorläufig; Event, dessen Profil gerade geprüft wird, nur ansehen (Flow-Karte 103d) |
| Z22.events.question | Rückfrage von DISKOE | Question from DISKOE | vorläufig; wie oben, bei Rückfrage |
| Z22.events.new | Event anlegen | Create event | vorläufig, wie bisher |
| Z22.share.copied | Link kopiert. | Link copied. | Profil teilen, Erfolg (Z11) |
| Z22.share.failed | Das Kopieren hat nicht geklappt. Versuche es noch einmal. | Copying didn't work. Try again. | Profil teilen, Fehler (Z03) |

### Profil, Angaben, Bild und Vorschau (Z23, Welle 1 Block 2a, Stand 17.11.2026)
Deutsch aus den Figma-Frames ORG-03a bis ORG-06 (Section „Block 2a“, Ready for dev), Englisch ist ein **Vorschlag von Claude** und braucht die Durchsicht des Founders. Texte ohne Frame sind mit „kein Frame“ markiert. Fehlertexte nennen die Beispieladresse nicht mehr (Founder, 17.11.2026).

| ID | Deutsch | English | Ort |
|---|---|---|---|
| Z23.details.eyebrow | Angaben · Teil 1 von 3 | Details · Part 1 of 3 | ORG-03a bis 04, Eyebrow |
| Z23.details.title | Erzähl uns von deinem Projekt | Tell us about your project | ORG-03a bis 04 |
| Z23.details.lead | Diese Angaben erscheinen auf deiner Profilseite. Sie bleibt privat, bis DISKOE sie freigegeben hat. | These details appear on your profile page. It stays private until DISKOE has approved it. | ORG-03a bis 04 |
| Z23.details.name.label | Name deines Projekts | Name of your project | Feldbeschriftung |
| Z23.details.name.placeholder | Reihe, Kollektiv oder Label | Series, collective or label | Platzhalter |
| Z23.details.name.hint | So steht er als Überschrift auf deiner Seite. | This is the heading of your page. | Hilfetext |
| Z23.details.name.tooLong | Der Name darf höchstens {max} Zeichen lang sein. | The name can be {max} characters long at most. | Fehlertext am Feld (bisheriger Text, kein Frame) |
| Z23.details.intro.label | Kurzvorstellung | Short introduction | Feldbeschriftung |
| Z23.details.intro.placeholder | Was veranstaltest du? | What do you put on? | Platzhalter |
| Z23.details.intro.hint | Ein bis zwei Sätze: Was veranstaltest du? | One or two sentences: What do you put on? | Hilfetext |
| Z23.details.intro.tooLong | Die Kurzvorstellung darf höchstens {max} Zeichen lang sein. | The short introduction can be {max} characters long at most. | Fehlertext am Feld (bisheriger Text, kein Frame) |
| Z23.details.slug.label | Profiladresse | Profile address | Feldbeschriftung |
| Z23.details.slug.hint | Kleinbuchstaben, Zahlen und Bindestriche. Daraus wird der Link zu deiner Seite. Nach der Freigabe lässt sie sich nicht mehr ändern. | Lowercase letters, numbers and hyphens. This becomes the link to your page. After approval it can't be changed any more. | ORG-03a, bis die Adresse gültig ist |
| Z23.details.slug.hintValid | Deine Seite ist unter /{slug} erreichbar. | Your page is available at /{slug}. | ORG-04, sobald die Adresse gültig ist (steht schon beim Tippen) |
| Z23.details.slug.taken | Diese Adresse ist schon vergeben. Wähle eine andere. | This address is already taken. Choose another one. | ORG-03b; im Frame ohne Beispieladresse (Founder 17.11.) |
| Z23.details.slug.format | Nur Kleinbuchstaben, Zahlen und Bindestriche, mindestens 3 Zeichen. Zum Beispiel nebenraum-berlin. | Only lowercase letters, numbers and hyphens, at least 3 characters. For example nebenraum-berlin. | ORG-03c; das Beispiel zeigt das Format, keine freie Adresse |
| Z23.details.slug.reserved | Diese Adresse ist reserviert. Wähle eine andere. | This address is reserved. Choose another one. | ORG-03d; im Frame ohne Beispieladresse (Founder 17.11.) |
| Z23.details.slug.fixed | Deine Profiladresse ist festgelegt: /{slug}. Sie lässt sich nicht mehr ändern. | Your profile address is fixed: /{slug}. It can't be changed any more. | nach der ersten Freigabe, Feld nur lesbar (kein Frame) |
| Z23.details.where.title | Wo findet man dich? | Where can people find you? | Zwischenüberschrift |
| Z23.details.where.hint | Mindestens ein Link oder ein Kontakt. Du kannst bis zu fünf Links eintragen. | At least one link or a contact. You can add up to five links. | unter der Zwischenüberschrift |
| Z23.details.website.label | Website | Website | Feldbeschriftung |
| Z23.details.website.placeholder | https:// | https:// | Platzhalter |
| Z23.details.instagram.label | Instagram | Instagram | Feldbeschriftung |
| Z23.details.instagram.placeholder | @deinname | @yourname | Platzhalter |
| Z23.details.instagram.invalid | Das ist kein gültiger Instagram-Name. Schreibe zum Beispiel @nebenraum. | That isn't a valid Instagram name. Write something like @nebenraum. | Fehlertext am Feld (kein Frame) |
| Z23.details.link.invalid | Das ist kein gültiger Link. Schreibe zum Beispiel https://nebenraum.example. | That isn't a valid link. Write something like https://nebenraum.example. | ORG-03b, Website und weitere Links |
| Z23.details.more.label | Weiterer Link {n} | Further link {n} | Feldbeschriftung der zusätzlichen Zeile (kein Frame) |
| Z23.details.more.add | Weiteren Link hinzufügen | Add another link | Button, Ghost; verschwindet bei fünf weiteren Links |
| Z23.details.more.remove | Link {n} entfernen | Remove link {n} | Button an der zusätzlichen Zeile (kein Frame) |
| Z23.details.more.max | Mehr als fünf weitere Links gehen nicht. | You can't add more than five further links. | statt des Buttons bei fünf weiteren Links (kein Frame) |
| Z23.details.contact.label | Öffentlicher Kontakt (optional) | Public contact (optional) | Feldbeschriftung |
| Z23.details.contact.placeholder | name@beispiel.de | name@example.com | Platzhalter |
| Z23.details.contact.hint | Diese E-Mail-Adresse steht öffentlich auf deiner Seite. | This email address is public on your page. | Hilfetext |
| Z23.details.contact.tooLong | Der Kontakt darf höchstens {max} Zeichen lang sein. | The contact can be {max} characters long at most. | Fehlertext am Feld (bisheriger Text, kein Frame) |
| Z23.details.next | Weiter zum Profilbild | Continue to profile picture | Hauptaktion; speichert zuerst |
| Z23.details.later | Später weitermachen | Continue later | zweite Aktion; speichert zuerst, dann zur Startseite |
| Z23.check.title.one | Bitte prüfe eine Angabe. | Please check one detail. | Z01, ORG-03c, 03d |
| Z23.check.title.two | Bitte prüfe zwei Angaben. | Please check two details. | Z01, ORG-03b |
| Z23.check.title.many | Bitte prüfe {n} Angaben. | Please check {n} details. | Z01 ab drei Angaben |
| Z23.check.line.one | Das markierte Feld passt noch nicht. | The marked field doesn't fit yet. | Z01 |
| Z23.check.line.many | Die markierten Felder passen noch nicht. | The marked fields don't fit yet. | Z01 |
| Z23.save.failed.title | Das Speichern hat nicht geklappt. | Saving didn't work. | Z03, Angaben und Profilbild |
| Z23.save.failed.line | Deine Eingaben stehen noch im Formular. Versuche es noch einmal. | What you entered is still in the form. Try again. | Z03 mit Stand danach |
| Z23.save.failed.keep | Dein Bild ist noch da. Versuche es noch einmal. | Your picture is still there. Try again. | ORG-05g, Z03 mit Stand danach |
| Z23.image.eyebrow | Profilbild · Teil 2 von 3 | Profile picture · Part 2 of 3 | ORG-05a bis 05d, 05f |
| Z23.image.title | Dein Profilbild | Your profile picture | ORG-05a bis 05d, 05f |
| Z23.image.lead | Ein quadratisches Bild, zum Beispiel dein Logo. Es erscheint oben auf deiner Profilseite. | A square picture, for example your logo. It appears at the top of your profile page. | ORG-05a bis 05d, 05f |
| Z23.image.label | Profilbild | Profile picture | Titel des Bausteins „Bild hochladen“ |
| Z23.upload.hint | JPG, PNG oder WebP, bis 5 MB | JPG, PNG or WebP, up to 5 MB | Hilfetext im Baustein, ohne Bild |
| Z23.upload.choose | Datei wählen | Choose file | Button im Baustein (Ghost); Founder 17.11.: statt des Browser-Buttons „Datei auswählen, keine Datei ausgewählt“ |
| Z23.upload.none | Keine Datei ausgewählt | No file chosen | Text neben dem Button, ohne Bild |
| Z23.upload.another | Du kannst ein anderes Bild wählen. | You can choose a different picture. | Hilfetext im Baustein, mit Bild |
| Z23.upload.crop | Ausschnitt ändern | Change crop | zweiter Button, nur beim Profilbild mit Bild |
| Z23.image.missingHint | Ohne Bild kannst du weiterarbeiten. Zum Einreichen braucht dein Profil ein Profilbild. | You can keep working without a picture. To submit, your profile needs a profile picture. | ORG-05a, 05b, 05d, 05f |
| Z23.image.alt.label | Bildbeschreibung (freiwillig) | Picture description (optional) | ORG-05c, Feldbeschriftung |
| Z23.image.alt.placeholder | Was ist auf dem Bild zu sehen? | What can be seen in the picture? | Platzhalter |
| Z23.image.alt.hint | Beschreibe in einem Satz, was zu sehen ist, zum Beispiel: Vier Personen vor einer Backsteinwand. Das hilft Menschen, die das Bild nicht sehen können. | Describe in one sentence what can be seen, for example: Four people in front of a brick wall. This helps people who can't see the picture. | ORG-05c, Hilfetext |
| Z23.image.alt.tooLong | Die Bildbeschreibung darf höchstens {max} Zeichen lang sein. | The picture description can be {max} characters long at most. | Fehlertext am Feld (bisheriger Text, kein Frame) |
| Z23.image.next | Weiter zur Vorschau | Continue to preview | Hauptaktion |
| Z23.image.back | Zurück zu den Angaben | Back to details | zweite Aktion |
| Z23.upload.busy.title | Dein Bild wird hochgeladen … | Your picture is being uploaded … | ORG-05b, Z02 |
| Z23.upload.busy.line | Das dauert einen Moment. Bleib kurz auf dieser Seite. | This takes a moment. Please stay on this page. | ORG-05b, Z02 |
| Z23.upload.tooBig.title | Die Datei ist zu groß. | The file is too large. | ORG-05d, Z05 |
| Z23.upload.tooBig.line | Erlaubt sind JPG, PNG oder WebP bis {limit}. Deine hat {size}. | JPG, PNG or WebP up to {limit} are allowed. Yours is {size}. | ORG-05d, Z05 |
| Z23.upload.tooSmall.title | Das Bild ist zu klein. | The picture is too small. | ORG-05f, Z06 |
| Z23.upload.tooSmall.line | Es braucht mindestens {min} × {min} Pixel. Deins hat {w} × {h} Pixel. | It needs at least {min} × {min} pixels. Yours has {w} × {h} pixels. | ORG-05f, Z06 |
| Z23.upload.format.title | Dieses Format geht nicht. | This format doesn't work. | Z07 |
| Z23.upload.format.line | Erlaubt sind JPG, PNG oder WebP bis 5 MB. | JPG, PNG or WebP up to 5 MB are allowed. | Z07 |
| Z23.upload.failed.title | Das Hochladen hat nicht geklappt. | Uploading didn't work. | Z03 (kein Frame) |
| Z23.upload.failed.line | Dein bisheriges Bild bleibt, falls du eins hattest. Versuche es noch einmal. | Your previous picture stays, if you had one. Try again. | Z03 mit Stand danach (kein Frame) |
| Z23.crop.title | Wähle den Ausschnitt | Choose the crop | ORG-05e, 05g |
| Z23.crop.lead | Dein Profilbild wird quadratisch. Verschiebe den Rahmen auf die Stelle, die du zeigen willst. | Your profile picture becomes square. Move the frame to the part you want to show. | ORG-05e, 05g; Founder 17.11.: „wird“ statt „ist“ |
| Z23.crop.area | Bildausschnitt | Picture crop | Beschriftung des Rahmens für Screenreader |
| Z23.crop.zoomOut | Verkleinern | Zoom out | Beschriftung für Screenreader, Button „−“ |
| Z23.crop.zoomIn | Vergrößern | Zoom in | Beschriftung für Screenreader, Button „+“ |
| Z23.crop.hint | Ziehe den Ausschnitt oder nutze die Pfeiltasten. Zoom mit + und −. | Drag the crop or use the arrow keys. Zoom with + and −. | ORG-05e, 05g |
| Z23.crop.apply | Ausschnitt übernehmen | Use this crop | ORG-05e, Hauptaktion |
| Z23.crop.other | Anderes Bild wählen | Choose a different picture | ORG-05e, 05g, zweite Aktion |
| Z23.crop.retry | Noch einmal versuchen | Try again | ORG-05g, Hauptaktion (Button-Regel Z03) |
| Z23.preview.eyebrow | Vorschau · Teil 3 von 3 | Preview · Part 3 of 3 | ORG-06 |
| Z23.preview.title | So sieht deine Profilseite aus | This is what your profile page looks like | ORG-06 |
| Z23.preview.lead | Das siehst nur du. Öffentlich wird die Seite erst, wenn du sie einreichst und DISKOE sie freigegeben hat. Mit erstem Event oder ohne. | Only you can see this. The page becomes public only once you submit it and DISKOE has approved it. You can submit it with or without a first event. | ORG-06 |
| Z23.preview.notice.title | Das ist erst der Kopf deiner Seite. | This is only the top of your page. | ORG-06, Hinweis |
| Z23.preview.notice.line | Du siehst die Standardgestaltung. Farben und Schrift passt du an, sobald dein Profil angelegt ist. Die weiteren Angaben, die du später machst, füllen dann die ganze Seite. | You're seeing the default design. You can adjust colours and type once your profile is set up. The details you add later fill the whole page. | ORG-06, Hinweis |
| Z23.preview.next | Weiter zum ersten Event | Continue to your first event | ORG-06, Hauptaktion |
| Z23.preview.submit | Profil ohne Event einreichen | Submit profile without an event | ORG-06, zweite Aktion |
| Z23.preview.gaps | Dir fehlen noch Angaben: {gaps}. | You're still missing details: {gaps}. | ORG-06 bei Lücken (kein Frame, Wortlaut wie Z22.a.message) |
| Z23.preview.badge | Veranstalter | Organizer | Kennzeichen am Profilkopf der Vorschau |
| Z23.preview.saved | Gemerkt | Saved | Anzeige am Profilkopf der Vorschau, nicht bedienbar |
| Z23.preview.share | Profil teilen | Share profile | Anzeige am Profilkopf der Vorschau, nicht bedienbar |
| Z23.preview.follow | Folgen | Follow | Anzeige am Profilkopf der Vorschau, nicht bedienbar |
| Z23.preview.programme | Programm ansehen | View programme | Anzeige am Profilkopf der Vorschau, nicht bedienbar |
| Z23.preview.followNote | Wir bündeln neue Events in einer Mail. In jeder Mail steht ein Link zum Abmelden. | We bundle new events in one email. Every email has an unsubscribe link. | Mikrotext am Profilkopf der Vorschau (Wortlaut des Frames) |
| Z23.preview.static | Das ist nur eine Vorschau. Die Schaltflächen funktionieren erst auf der öffentlichen Seite. | This is only a preview. The buttons only work on the public page. | Hinweis für Screenreader am Profilkopf der Vorschau |

### Event anlegen: Grundlagen, Datum, Ort (Z24, Welle 1 Block 2b, Slice 5, Stand 19.11.2026)
**Status:** Der deutsche Wortlaut ist aus den Frames `EVT-01` bis `EVT-03`, `EVT-08` und `EVT-09` bis `09c` übernommen; Texte ohne Frame sind als „kein Frame“ markiert. Die englische Fassung ist ein **Vorschlag von Claude** und braucht die Durchsicht des Founders. Die Titel des Hinweises („Bitte prüfe zwei Angaben.“) kommen aus `Z23.check.title.*`.

| ID | Deutsch | English | Verwendung |
|---|---|---|---|
| Z24.step.basics.eyebrow | Grundlagen · Teil 1 von 7 | Basics · Part 1 of 7 | EVT-01a bis d, Eyebrow |
| Z24.step.time.eyebrow | Datum und Uhrzeit · Teil 2 von 7 | Date and time · Part 2 of 7 | EVT-02a bis d, Eyebrow |
| Z24.step.place.eyebrow | Ort · Teil 3 von 7 | Place · Part 3 of 7 | EVT-03a bis c, Eyebrow |
| Z24.basics.title | Worum geht es? | What is it about? | EVT-01a bis d |
| Z24.basics.lead | Starte mit Titel, Format und einer kurzen Beschreibung. Alles bleibt privat, bis du es einreichst. | Start with a title, a format and a short description. Everything stays private until you submit it. | EVT-01a bis c |
| Z24.basics.title.label | Titel | Title | Feldbeschriftung |
| Z24.basics.title.placeholder | z. B. Zwischen den Boxen | e.g. Between the Boxes | Platzhalter |
| Z24.basics.title.hint | So heißt dein Event auf der Seite. | This is the name of your event on the page. | Hilfetext |
| Z24.basics.title.missing | Gib deinem Event einen Titel. | Give your event a title. | EVT-01b, Fehlertext am Feld |
| Z24.basics.format.label | Format | Format | Feldbeschriftung |
| Z24.basics.format.placeholder | Format wählen | Choose a format | Platzhalter im Auswahlfeld |
| Z24.basics.format.hint | Wähle das Format, das am besten passt. | Choose the format that fits best. | Hilfetext |
| Z24.basics.format.missing | Wähle ein Format. Passt keins, melde dich bei uns. | Choose a format. If none fits, get in touch. | EVT-01b; es gibt kein „Sonstiges“ (P50) |
| Z24.basics.format.invalid | Wähle eines der angebotenen Formate. | Choose one of the formats offered. | Fehlertext am Feld (kein Frame) |
| Z24.basics.description.label | Beschreibung | Description | Feldbeschriftung |
| Z24.basics.description.placeholder | Worum geht es an dem Abend? | What is the evening about? | Platzhalter, aus EVT-01d |
| Z24.basics.description.hint | Bis zu {max} Zeichen. | Up to {max} characters. | Hilfetext (Frame: „Bis zu 2000 Zeichen.“) |
| Z24.basics.next | Weiter zu Datum und Uhrzeit | Continue to date and time | Hauptaktion EVT-01; speichert zuerst |
| Z24.format.concert | Konzert | Concert | Format im Auswahlfeld |
| Z24.format.djSet | DJ-Set | DJ set | Format im Auswahlfeld |
| Z24.format.clubNight | Party/Club | Party/Club night | Format im Auswahlfeld |
| Z24.format.listeningSession | Listening-Session | Listening session | Format im Auswahlfeld |
| Z24.format.opening | Vernissage | Opening | Format im Auswahlfeld |
| Z24.format.exhibition | Ausstellung | Exhibition | Format im Auswahlfeld |
| Z24.format.screening | Film | Film screening | Format im Auswahlfeld |
| Z24.time.title | Wann findet es statt? | When does it take place? | EVT-02a bis d |
| Z24.time.lead | Die Zeiten gelten in der Ortszeit des Events (Berlin). | Times are in the event's local time (Berlin). | EVT-02a bis c |
| Z24.time.start.title | Beginn | Start | Zwischenüberschrift |
| Z24.time.end.title | Ende | End | Zwischenüberschrift |
| Z24.time.end.hint | Freiwillig. Ohne Ende zeigen wir nur den Beginn. | Optional. Without an end we show only the start. | unter „Ende“ |
| Z24.time.date.label | Datum | Date | Feldbeschriftung |
| Z24.time.date.placeholder | TT.MM.JJJJ | DD/MM/YYYY | Platzhalter; Deutsch 20.11.2026, Englisch 20/11/2026 (Vorschlag, Tag zuerst wie in Berlin) |
| Z24.time.date.open | Kalender öffnen | Open calendar | Beschriftung des Kalender-Buttons für Screenreader (kein Frame) |
| Z24.time.time.label | Uhrzeit | Time | Feldbeschriftung |
| Z24.time.end.nextDay | Ende am Folgetag | Ends the next day | EVT-02c, Hilfetext unter dem Enddatum, wenn das Ende einen Tag nach dem Beginn liegt |
| Z24.time.end.unknown | Das Ende steht noch nicht fest | The end isn't fixed yet | Auswahlfeld; angekreuzt sind die Endfelder leer und gesperrt (Vorschlag, kein Frame) |
| Z24.time.end.beforeStart | Das Ende liegt vor dem Beginn. | The end is before the start. | EVT-02b, Fehlertext am Enddatum und Zeile im Hinweis |
| Z24.time.date.missing | Gib das Datum an. | Enter the date. | Fehlertext am Feld (kein Frame): Uhrzeit ohne Datum |
| Z24.time.time.missing | Gib die Uhrzeit an. | Enter the time. | Fehlertext am Feld (kein Frame): Datum ohne Uhrzeit |
| Z24.time.date.invalid | Das ist kein gültiges Datum. Schreibe zum Beispiel 20.11.2026. | That isn't a valid date. Write something like 20/11/2026. | Fehlertext am Feld (kein Frame) |
| Z24.time.time.invalid | Das ist keine gültige Uhrzeit. Schreibe zum Beispiel 22:00. | That isn't a valid time. Write something like 22:00. | Fehlertext am Feld (kein Frame) |
| Z24.time.time.nonexistent | Diese Uhrzeit gibt es wegen der Zeitumstellung nicht. Wähle eine andere. | This time doesn't exist because of the clock change. Choose another one. | Fehlertext am Feld (kein Frame) |
| Z24.time.time.ambiguous | Diese Uhrzeit gibt es wegen der Zeitumstellung zweimal. Wähle eine andere. | This time happens twice because of the clock change. Choose another one. | Fehlertext am Feld (kein Frame) |
| Z24.time.next | Weiter zum Ort | Continue to place | Hauptaktion EVT-02; speichert zuerst |
| Z24.place.title | Wo findet es statt? | Where does it take place? | EVT-03a bis c |
| Z24.place.lead | Gib den Ort so an, wie Gäste ihn finden. | Give the place the way guests find it. | EVT-03a bis c |
| Z24.place.name.label | Name des Ortes | Name of the place | Feldbeschriftung |
| Z24.place.name.placeholder | Club Nebenraum | Club Nebenraum | Platzhalter, aus EVT-03c |
| Z24.place.name.hint | Zum Beispiel Club, Galerie oder Hinterhof. | For example club, gallery or backyard. | Hilfetext |
| Z24.place.name.missing | Gib den Namen des Ortes an. | Give the name of the place. | Fehlertext am Feld (kein Frame) |
| Z24.place.street.label | Straße und Hausnummer | Street and number | Feldbeschriftung |
| Z24.place.street.placeholder | z. B. Hinterhof 12 | e.g. Hinterhof 12 | Platzhalter, aus EVT-03b |
| Z24.place.street.missing | Gib die Straße mit Hausnummer an, damit Gäste dich finden. | Give the street with the number so guests can find you. | EVT-03b, Fehlertext am Feld |
| Z24.place.postalCode.label | Postleitzahl | Postal code | Feldbeschriftung |
| Z24.place.postalCode.placeholder | 10115 | 10115 | Platzhalter, aus EVT-03c; freiwillig |
| Z24.place.city.label | Stadt | City | Feldbeschriftung |
| Z24.place.city.placeholder | z. B. Berlin | e.g. Berlin | Platzhalter, aus EVT-03b |
| Z24.place.city.missing | Gib die Stadt an. | Give the city. | EVT-03b, Fehlertext am Feld |
| Z24.place.next | Weiter zu Preis und Zugang | Continue to price and access | Hauptaktion EVT-03; speichert zuerst |
| Z24.err.tooLong | Das ist zu lang. Höchstens {max} Zeichen. | That's too long. {max} characters at most. | Fehlertext am Feld (kein Frame): Titel, Beschreibung und Ortsangaben |
| Z24.check.line.missing.one | Das markierte Feld fehlt noch. | The marked field is still missing. | Z01; Titel: Z23.check.title.one |
| Z24.check.line.missing.many | Die markierten Felder fehlen noch. | The marked fields are still missing. | EVT-01b, 03b; Titel: Z23.check.title.two und many |
| Z24.later | Später weitermachen | Continue later | zweite Aktion aller Schritte; speichert zuerst, dann EVT-08 |
| Z24.retry | Noch einmal versuchen | Try again | Hauptaktion nach einem Fehler, Z03 |
| Z24.saving.title | Wir speichern deinen Entwurf … | We're saving your draft … | EVT-09a, Z02 |
| Z24.saving.line | Das dauert einen Moment. Bleib kurz auf dieser Seite. | This takes a moment. Please stay on this page. | EVT-09a (im Katalog bisher: „Bitte lade die Seite nicht neu.“, der Frame gilt) |
| Z24.saving.button | Speichere … | Saving … | EVT-09a, Button während des Speicherns, gesperrt |
| Z24.failed.title | Das Speichern hat nicht geklappt. | Saving didn't work. | EVT-09, Z03 |
| Z24.failed.line | Deine Eingaben sind noch da. Versuche es noch einmal. Klappt es weiter nicht, schreib uns. | What you entered is still here. Try again. If it still doesn't work, write to us. | EVT-09, Sonderfall Z03b |
| Z24.offline.title | Keine Verbindung. | No connection. | EVT-09b |
| Z24.offline.line | Deine Eingaben sind noch da. Sobald du wieder online bist, versuche es noch einmal. | What you entered is still here. Once you're back online, try again. | EVT-09b |
| Z24.leave.eyebrow | Nicht gesichert | Not saved | EVT-09c |
| Z24.leave.title | Dein Entwurf ist nicht gesichert | Your draft isn't saved | EVT-09c |
| Z24.leave.lead | Das Speichern hat nicht geklappt. Wenn du jetzt gehst, behalten wir deine Eingaben dieses Schritts in diesem Browser, bis du weitermachst oder dich abmeldest. | Saving didn't work. If you leave now, we keep what you entered in this step in this browser until you continue or sign out. | EVT-09c |
| Z24.leave.notice.title | Nur in diesem Browser behalten. | Kept in this browser only. | EVT-09c |
| Z24.leave.notice.line | Auf anderen Geräten fehlt dieser Schritt noch. | This step is still missing on other devices. | EVT-09c |
| Z24.leave.back | Zurück und noch einmal versuchen | Go back and try again | EVT-09c, Hauptaktion |
| Z24.leave.leave | Verlassen | Leave | EVT-09c (die Flow-Karte nennt „Trotzdem verlassen“, der Frame gilt) |
| Z24.saved.eyebrow | Entwurf gesichert | Draft saved | EVT-08 |
| Z24.saved.title | Dein Entwurf ist gesichert | Your draft is saved | EVT-08 |
| Z24.saved.lead | Dein Event bleibt privat, bis du es einreichst. Du kannst jederzeit dort weitermachen, wo du aufgehört hast. | Your event stays private until you submit it. You can pick up where you left off at any time. | EVT-08 |
| Z24.saved.notice.title | Gespeichert. | Saved. | EVT-08, Z11 |
| Z24.saved.notice.line | Alle bisherigen Angaben sind in deinem Entwurf. | Everything you've entered so far is in your draft. | EVT-08 |
| Z24.saved.toDraft | Zum Entwurf | To the draft | EVT-08, Hauptaktion: zum ersten Schritt, der noch nicht vollständig ist |
| Z24.saved.toHome | Zur Startseite | To the start page | EVT-08 |

### Event anlegen: Preis, Eventbild, Atmosphäre (Z25, Welle 1 Block 2b, Slice 6, Stand 20.11.2026)
**Status:** Der deutsche Wortlaut ist aus den Frames `EVT-04a` bis `04n`, `EVT-05a` bis `05f` und `EVT-06a`/`06b` übernommen; Texte ohne Frame sind als „kein Frame“ markiert. Die englische Fassung ist ein **Vorschlag von Claude** und braucht die Durchsicht des Founders. Der Upload-Block des Eventbilds und die Bildbeschreibung verwenden die Texte `Z23.upload.*` und `Z23.image.alt.*` (gleicher Wortlaut wie beim Profilbild); Hinweistitel kommen aus `Z23.check.title.*`.

| ID | Deutsch | English | Verwendung |
|---|---|---|---|
| Z25.step.price.eyebrow | Preis und Zugang · Teil 4 von 7 | Price and access · Part 4 of 7 | EVT-04a bis n, Eyebrow |
| Z25.step.image.eyebrow | Eventbild · Teil 5 von 7 | Event image · Part 5 of 7 | EVT-05a bis f, Eyebrow |
| Z25.step.atmosphere.eyebrow | Atmosphäre · Teil 6 von 7 | Atmosphere · Part 6 of 7 | EVT-06a/b, Eyebrow |
| Z25.price.title | Preis und Zugang | Price and access | EVT-04a bis n |
| Z25.price.lead | Ein leeres Feld heißt nicht „kostenlos“. Wenn du den Preis noch nicht kennst, sag es ausdrücklich. | An empty field doesn't mean “free”. If you don't know the price yet, say so explicitly. | EVT-04a bis n |
| Z25.image.title | Zeig dein Event | Show your event | EVT-05a bis f |
| Z25.image.lead | Das Bild steht oben auf der Eventseite. Ein Flyer im Hochformat passt gut. | The image sits at the top of the event page. A portrait flyer works well. | EVT-05a bis f |
| Z25.atmosphere.title | Wie fühlt sich der Abend an? | How does the evening feel? | EVT-06a/b |
| Z25.atmosphere.lead | Wähle bis zu drei Begriffe oder beschreibe die Atmosphäre in eigenen Worten. Das hilft Gästen einzuschätzen, was sie erwartet. | Choose up to three terms or describe the atmosphere in your own words. It helps guests know what to expect. | EVT-06a/b |
| Z25.price.next | Weiter zum Eventbild | Continue to the event image | Hauptaktion EVT-04; speichert zuerst |
| Z25.image.next | Weiter zur Atmosphäre | Continue to atmosphere | Hauptaktion EVT-05; speichert die Bildbeschreibung zuerst |
| Z25.atmosphere.next | Weiter zu den freiwilligen Angaben | Continue to the optional details | Hauptaktion EVT-06; speichert zuerst |
| Z25.access.title | Wie kommen Gäste rein? | How do guests get in? | Zwischenüberschrift EVT-04 |
| Z25.access.hint | Wähle alle Wege, die es wirklich gibt. | Choose every way that really exists. | unter der Zwischenüberschrift |
| Z25.access.walkIn | Ohne Anmeldung | No registration | Zugangsweg |
| Z25.access.door | Abendkasse | At the door | Zugangsweg |
| Z25.access.onlineTicket | Online-Ticket | Online ticket | Zugangsweg |
| Z25.access.onlineRegistration | Online-Anmeldung | Online registration | Zugangsweg |
| Z25.access.invalid | Wähle nur die angebotenen Wege. | Choose only the ways offered. | Fehlertext (kein Frame) |
| Z25.price.section | Preis | Price | Zwischenüberschrift EVT-04 |
| Z25.price.form.label | Preisform | Price type | Feldbeschriftung |
| Z25.price.form.placeholder | Preisform wählen | Choose a price type | Platzhalter (kein Frame) |
| Z25.price.form.fixed | Festpreis | Fixed price | Preisform, EVT-04a |
| Z25.price.form.range | Preisspanne | Price range | Preisform, EVT-04b |
| Z25.price.form.fromPrice | Ab Preis | From price | Preisform, EVT-04g |
| Z25.price.form.free | Kostenlos | Free | Preisform, EVT-04f; wird ausdrücklich gewählt, leer ist nicht kostenlos |
| Z25.price.form.donation | Auf Spendenbasis | Donation-based | Preisform, EVT-04h |
| Z25.price.form.minDonation | Mindestspende | Minimum donation | Preisform, EVT-04i |
| Z25.price.form.unknown | Noch nicht bekannt | Not known yet | Preisform, EVT-04c; ausdrücklich unbekannt, nie „kostenlos“ |
| Z25.price.form.invalid | Wähle eine der angebotenen Preisformen. | Choose one of the price types offered. | Fehlertext (kein Frame) |
| Z25.price.free.hint | Der Eintritt ist frei. Die Eventseite zeigt das ausdrücklich so an. | Entry is free. The event page says so explicitly. | Hilfetext EVT-04f |
| Z25.price.donation.hint | Gäste zahlen, was sie möchten. Die Eventseite zeigt „Eintritt gegen Spende“. | Guests pay what they like. The event page shows “Entry by donation”. | Hilfetext EVT-04h |
| Z25.price.unknown.title | Dein Preis wird als „noch offen“ angezeigt. | Your price is shown as “still open”. | Hinweis EVT-04c, Titel |
| Z25.price.unknown.line | Das ist nicht „kostenlos“. Du kannst den Preis später ergänzen. | That is not “free”. You can add the price later. | Hinweis EVT-04c, Zeile |
| Z25.price.amount.fixed | Preis in Euro | Price in euros | Feldbeschriftung EVT-04a |
| Z25.price.amount.fromPrice | Ab Preis in Euro | From price in euros | Feldbeschriftung EVT-04g |
| Z25.price.amount.minDonation | Mindestspende in Euro | Minimum donation in euros | Feldbeschriftung EVT-04i |
| Z25.price.amount.rangeFrom | Von (Euro) | From (euros) | Feldbeschriftung EVT-04b |
| Z25.price.amount.rangeTo | Bis (Euro) | To (euros) | Feldbeschriftung EVT-04b |
| Z25.price.amount.appliesTo | Gilt für {ways}. | Applies to {ways}. | Hilfetext EVT-04a; {ways} sind die gewählten Wege mit Preis (Abendkasse, Online-Ticket) |
| Z25.price.amount.lowest | Der niedrigste Preis. Gilt für {ways}. | The lowest price. Applies to {ways}. | Hilfetext EVT-04g |
| Z25.price.amount.minDonationHint | Gäste zahlen mindestens diesen Betrag. | Guests pay at least this amount. | Hilfetext EVT-04i |
| Z25.price.ways.all | das ganze Event | the whole event | {ways}, wenn weder Abendkasse noch Online-Ticket gewählt ist (kein Frame) |
| Z25.price.ways.and | {a} und {b} | {a} and {b} | {ways} mit zwei Wegen |
| Z25.price.amount.missing | Gib einen Betrag an, zum Beispiel 12,00. | Enter an amount, for example 12.00. | Fehlertext (kein Frame) |
| Z25.price.amount.invalid | Gib den Preis als Zahl an, zum Beispiel 12,00. | Enter the price as a number, for example 12.00. | Fehlertext EVT-04d |
| Z25.price.amount.tooHigh | Der Betrag ist zu hoch. | The amount is too high. | Fehlertext (kein Frame) |
| Z25.price.amount.zero | Der Betrag muss größer als 0 sein. Für freien Eintritt wähle „Kostenlos“. | The amount must be more than 0. For free entry, choose “Free”. | Fehlertext (kein Frame) |
| Z25.price.amount.rangeOrder | Das Ende der Spanne muss höher sein als der Anfang. | The end of the range must be higher than the start. | Fehlertext (kein Frame) |
| Z25.fees.label | Pflichtgebühren | Mandatory fees | Feldbeschriftung EVT-04l |
| Z25.fees.placeholder | Pflichtgebühren wählen | Choose | Platzhalter (kein Frame) |
| Z25.fees.included | Im Preis enthalten | Included in the price | Auswahl EVT-04l |
| Z25.fees.unknown | Noch nicht bekannt | Not known yet | Auswahl EVT-04m |
| Z25.fees.included.hint | Die Eventseite zeigt „inkl. Gebühren“. | The event page shows “incl. fees”. | Hilfetext EVT-04l |
| Z25.fees.unknown.hint | Die Eventseite sagt dazu nichts. Unbekannt heißt nicht „keine Gebühren“. | The event page says nothing about it. Unknown does not mean “no fees”. | Hilfetext EVT-04m |
| Z25.fees.invalid | Wähle eine der angebotenen Angaben. | Choose one of the options offered. | Fehlertext (kein Frame) |
| Z25.availability.label | Online-Ticket: Verfügbarkeit | Online ticket: availability | Feldbeschriftung EVT-04k |
| Z25.availability.placeholder | Verfügbarkeit wählen | Choose availability | Platzhalter (kein Frame) |
| Z25.availability.available | Verfügbar | Available | Auswahl (kein Frame) |
| Z25.availability.soldOut | Ausverkauft | Sold out | Auswahl EVT-04k |
| Z25.availability.soldOut.hint | Die Eventseite zeigt „Online-Ticket ausverkauft“. Die anderen Wege bleiben sichtbar. | The event page shows “Online ticket sold out”. The other ways stay visible. | Hilfetext EVT-04k (Frame nennt die Abendkasse; hier für jeden gewählten Weg gefasst) |
| Z25.availability.pageLabel | Online-Ticket ausverkauft | Online ticket sold out | Zugangszeile auf der Eventseite (Wortlaut aus dem Hinweis `soldOut.hint`, 25.11.2026) |
| Z25.availability.invalid | Wähle eine der angebotenen Angaben. | Choose one of the options offered. | Fehlertext (kein Frame) |
| Z25.link.ticket.label | Link zum Ticketverkauf | Link to ticket sales | Feldbeschriftung EVT-04a |
| Z25.link.ticket.hint | Nur für das Online-Ticket. | For the online ticket only. | Hilfetext EVT-04a |
| Z25.link.registration.label | Link zur Anmeldung | Link to registration | Feldbeschriftung EVT-04j |
| Z25.link.registration.hint | Nur für die Online-Anmeldung. | For the online registration only. | Hilfetext EVT-04j |
| Z25.link.noScheme | Das ist kein gültiger Link. Er muss mit https:// beginnen. | That isn't a valid link. It must start with https://. | Fehlertext EVT-04n |
| Z25.link.invalid | Das ist kein gültiger Link. Schreibe zum Beispiel https://tickets.example. | That isn't a valid link. Write for example https://tickets.example. | Fehlertext EVT-04d |
| Z25.link.tooLong | Der Link ist zu lang. Höchstens {max} Zeichen. | The link is too long. {max} characters at most. | Fehlertext (kein Frame) |
| Z25.image.label | Eventbild hinzufügen | Add event image | Beschriftung des Upload-Blocks EVT-05a |
| Z25.image.missingHint | Ohne Bild kannst du weiterarbeiten. Zum Einreichen braucht dein Event ein Bild. | You can carry on without an image. To submit, your event needs one. | Hinweis EVT-05a, 05c bis 05f |
| Z25.atmosphere.group | Atmosphärebegriffe | Atmosphere terms | Beschriftung der Begriffe für Screenreader (kein Frame) |
| Z25.atmosphere.count | {n} von {max} gewählt. | {n} of {max} selected. | Zähler EVT-06a/b |
| Z25.atmosphere.needed | Eine Angabe zur Atmosphäre braucht dein Event zum Einreichen. | Your event needs an atmosphere entry to be submitted. | Hinweis EVT-06a, solange nichts gewählt ist |
| Z25.atmosphere.text.label | Eigene Beschreibung (freiwillig) | Your own description (optional) | Feldbeschriftung EVT-06 |
| Z25.atmosphere.text.placeholder | z. B. Kleine Tanzfläche, viel Raum zum Zuhören. | e.g. Small dance floor, plenty of room to listen. | Platzhalter EVT-06 |
| Z25.atmosphere.text.hint | Statt oder zusätzlich zu den Begriffen. Bis zu {max} Zeichen. | Instead of or in addition to the terms. Up to {max} characters. | Hilfetext EVT-06 |
| Z25.atmosphere.invalid | Wähle nur die angebotenen Begriffe. | Choose only the terms offered. | Fehlertext (kein Frame) |
| Z25.atmosphere.tooMany | Wähle höchstens {max} Begriffe. | Choose {max} terms at most. | Fehlertext (kein Frame) |
| Z25.atmo.cozy | Gemütlich | Cozy | Atmosphärebegriff (Wert bleibt deutsch gespeichert) |
| Z25.atmo.intimate | Intim/persönlich | Intimate/personal | Atmosphärebegriff |
| Z25.atmo.relaxed | Entspannt | Relaxed | Atmosphärebegriff |
| Z25.atmo.lively | Lebhaft | Lively | Atmosphärebegriff |
| Z25.atmo.casual | Ungezwungen | Casual | Atmosphärebegriff |
| Z25.atmo.experimental | Experimentell | Experimental | Atmosphärebegriff |
| Z25.atmo.underground | Underground/DIY | Underground/DIY | Atmosphärebegriff |
| Z25.atmo.alternative | Alternativ/unabhängig | Alternative/independent | Atmosphärebegriff |
| Z25.atmo.community | Community-geprägt | Community-driven | Atmosphärebegriff |
| Z25.atmo.immersive | Immersiv | Immersive | Atmosphärebegriff |

### Event anlegen: Mehr zum Abend (Z26, Welle 1 Block 2b, Slice 7, Stand 20.11.2026)
**Status:** Der deutsche Wortlaut ist aus den Frames `EVT-07m-a` bis `07m-k` übernommen; Texte ohne Frame sind als „kein Frame“ markiert (Vorschlag von Claude, Entscheidung beim Founder). Die englische Fassung ist ein **Vorschlag von Claude** und braucht die Durchsicht des Founders. Gebaut sind sechs der elf Bausteine (Einlass und Alter, Besuchsmodus, Sprache und Untertitel, Musik, Beteiligte, Mitbringen und Teilnahme); die Texte der übrigen fünf kommen mit ihren aufgeklappten Frames. Fehler- und Fehlzustände nutzen `Z23.check.title.*`, `Z24.err.tooLong`, `Z24.failed.*`, `Z24.offline.*`, `Z24.saving.*` und `Z24.leave.*`.

| ID | Deutsch | English | Verwendung |
|---|---|---|---|
| Z26.step.more.eyebrow | Mehr zum Abend · Teil 7 von 7 | More about the evening · Part 7 of 7 | EVT-07, 07m-a bis k, Eyebrow |
| Z26.more.title | Was sollen Gäste noch wissen? | What else should guests know? | EVT-07, 07m-a bis k |
| Z26.more.lead.club | Für ein Club-Event schlagen wir diese Bausteine vor. Alles ist freiwillig, Leeres bleibt auf der Seite ausgeblendet. Du kannst Bausteine entfernen oder weitere hinzufügen. | For a club event we suggest these blocks. Everything is optional, and anything left empty stays hidden on the page. You can remove blocks or add more. | EVT-07m-a, Format Party/Club |
| Z26.more.lead.opening | Für eine Vernissage schlagen wir diese Bausteine vor. „Besuchsmodus“ ist Pflicht: Gäste müssen wissen, ob sie pünktlich sein müssen. | For an opening we suggest these blocks. “Visit mode” is required: guests need to know whether they have to be on time. | EVT-07m-c, Format Vernissage |
| Z26.more.lead.screening | Für einen Filmabend schlagen wir diese Bausteine vor. „Sprache und Untertitel“ ist Pflicht. „Noch nicht bekannt“ ist als Antwort erlaubt. | For a film night we suggest these blocks. “Language and subtitles” is required. “Not known yet” is allowed as an answer. | EVT-07m-d, Format Film |
| Z26.more.lead.none | Für dieses Format haben wir keine Vorschläge. Du kannst Bausteine hinzufügen oder direkt zur Vorschau gehen. | We have no suggestions for this format. You can add blocks or go straight to the preview. | EVT-07m-e, Format ohne Vorschläge |
| Z26.more.next | Weiter zur Vorschau | Continue to the preview | EVT-07, Hauptaktion |
| Z26.more.skip | Überspringen | Skip | EVT-07, zweite Aktion |
| Z26.more.add | Weiteren Baustein wählen | Add another block | EVT-07m-a, Aktion |
| Z26.card.edit | Bearbeiten | Edit | Baustein-Karte, zugeklappt mit Angaben |
| Z26.card.fill | Ausfüllen | Fill in | Baustein-Karte, zugeklappt ohne Angaben |
| Z26.card.collapse | Zuklappen | Collapse | Baustein-Karte, aufgeklappt |
| Z26.card.required | Pflicht | Required | Baustein-Karte, Pflichtbaustein |
| Z26.card.empty | Noch keine Angabe | Nothing yet | Baustein-Karte ohne Angaben |
| Z26.card.requiredEmpty | Brauchen wir vor der Veröffentlichung. | We need this before publishing. | EVT-07m-d, Pflichtbaustein ohne Angabe |
| Z26.card.error | Eine Angabe stimmt noch nicht. | One entry doesn't fit yet. | EVT-07m-g, Baustein mit Feldfehler |
| Z26.card.remove | Baustein entfernen | Remove block | Baustein-Karte, aufgeklappt (nicht bei Pflicht) |
| Z26.removed.line | „{name}“ wurde entfernt. Die Angaben darin sind weg, sobald du weitergehst. | “{name}” was removed. What you entered there is gone as soon as you continue. | EVT-07m-f |
| Z26.removed.undo | Rückgängig | Undo | EVT-07m-f |
| Z26.picker.eyebrow | Mehr zum Abend · Bausteine | More about the evening · Blocks | EVT-07m-b, Eyebrow |
| Z26.picker.title | Weitere Bausteine | More blocks | EVT-07m-b |
| Z26.picker.lead | Wähle, was du noch erzählen möchtest. Du kannst Bausteine später jederzeit wieder entfernen. | Choose what else you would like to tell guests. You can remove blocks again at any time. | EVT-07m-b |
| Z26.picker.add | Hinzufügen | Add | EVT-07m-b |
| Z26.picker.cancel | Abbrechen | Cancel | EVT-07m-b |
| Z26.picker.none | Alle Bausteine sind schon auf der Seite. | All blocks are already on the page. | EVT-07m-b, nichts mehr zu wählen (kein Frame) |
| Z26.block.entryAge | Einlass und Alter | Entry and age | Baustein |
| Z26.block.visitMode | Besuchsmodus | Visit mode | Baustein |
| Z26.block.language | Sprache und Untertitel | Language and subtitles | Baustein |
| Z26.block.music | Musik | Music | Baustein |
| Z26.block.participants | Beteiligte | People involved | Baustein |
| Z26.block.bring | Mitbringen und Teilnahme | Bring and take part | Baustein |
| Z26.block.entryAge.desc | Einlasszeit und Altersregel | Door time and age rule | EVT-07m-b, kein Frame |
| Z26.block.visitMode.desc | Gemeinsamer Beginn oder flexibel vorbeikommen | Shared start or drop in | EVT-07m-b |
| Z26.block.language.desc | Sprache des Programms, Untertitel | Language of the programme, subtitles | EVT-07m-b |
| Z26.block.music.desc | Musikalische Präzisierung, Musikrichtungen | Musical detail, music directions | EVT-07m-b, kein Frame |
| Z26.block.participants.desc | Künstler:innen, Gäste, Kuration | Artists, guests, curation | EVT-07m-b |
| Z26.block.bring.desc | Kleidung, Material, Anmeldung, Plätze | Clothing, material, registration, seats | EVT-07m-b |
| Z26.entry.doors.label | Einlass ab | Doors open | EVT-07m-f |
| Z26.entry.doors.placeholder | 21:30 | 21:30 | EVT-07m-f |
| Z26.entry.rule.label | Altersregel | Age rule | EVT-07m-f |
| Z26.entry.rule.hint | Wenn du es nicht weißt, wähle „Noch unbekannt“. | If you don't know, choose “Not known yet”. | EVT-07m-f |
| Z26.entry.rule.choose | Bitte wählen | Please choose | Altersregel ohne Wahl (kein Frame) |
| Z26.entry.rule.minimum | Mindestalter | Minimum age | EVT-07m-f |
| Z26.entry.rule.allAges | Für alle Altersgruppen | All ages | Altersregel (kein Frame) |
| Z26.entry.rule.unknown | Noch unbekannt | Not known yet | Altersregel (kein Frame) |
| Z26.entry.age.label | Mindestalter | Minimum age | EVT-07m-f |
| Z26.visit.mode.legend | Besuchsmodus | Visit mode | EVT-07m-c |
| Z26.visit.mode.fixed | Gemeinsamer Beginn | Shared start | EVT-07m-c |
| Z26.visit.mode.dropIn | Flexibel vorbeikommen | Drop in any time | EVT-07m-c |
| Z26.visit.mode.both | Beides | Both | EVT-07m-c |
| Z26.visit.mode.unknown | Noch nicht bekannt | Not known yet | Besuchsmodus (kein Frame; Antwortzustand „unbekannt“) |
| Z26.visit.window.title | Wann kann man flexibel vorbeikommen? | When can people drop in? | EVT-07m-c |
| Z26.visit.window.hint | Der Beginn des Besuchsfensters ist nötig. Ein offenes Ende geben wir nicht als erfundene Endzeit aus. | The start of the visiting window is needed. If there is no end, we don't make one up. | EVT-07m-c |
| Z26.visit.from.label | Besuchsfenster ab | Visiting window from | EVT-07m-c |
| Z26.visit.to.label | Besuchsfenster bis (freiwillig) | Visiting window until (optional) | EVT-07m-c |
| Z26.visit.to.placeholder | Noch offen | Still open | EVT-07m-c |
| Z26.visit.short.title | Kann man auch kurz vorbeischauen? | Can people also stop by briefly? | EVT-07m-c |
| Z26.visit.short.hint | Freiwillig. Der Zeitbedarf ist eine Orientierung. | Optional. The time needed is a guide. | EVT-07m-c |
| Z26.visit.short.ok | Ja, ein kurzer Besuch genügt | Yes, a short visit is fine | EVT-07m-c |
| Z26.visit.short.longer | Eher eine längere Teilnahme | Rather a longer visit | EVT-07m-c |
| Z26.visit.short.unknown | Noch nicht bekannt | Not known yet | EVT-07m-c |
| Z26.lang.program.title | In welcher Sprache ist das Programm? | What language is the programme in? | EVT-07m-d |
| Z26.lang.subtitles.title | Gibt es Untertitel? | Are there subtitles? | EVT-07m-d |
| Z26.lang.hint.required | Pflichtangabe für dieses Format. | Required for this format. | EVT-07m-d |
| Z26.lang.hint.optional | Freiwillig. | Optional. | Sprache und Untertitel bei einem Format ohne Pflicht (kein Frame) |
| Z26.lang.program.de | Deutsch | German | EVT-07m-d |
| Z26.lang.program.en | Englisch | English | EVT-07m-d |
| Z26.lang.program.original | Originalfassung mit Untertiteln | Original version with subtitles | EVT-07m-d |
| Z26.lang.program.unknown | Noch nicht bekannt | Not known yet | EVT-07m-d |
| Z26.lang.subtitles.yes | Ja | Yes | EVT-07m-d |
| Z26.lang.subtitles.partial | Teilweise | Partly | EVT-07m-d |
| Z26.lang.subtitles.no | Nein | No | EVT-07m-d |
| Z26.lang.subtitles.unknown | Noch nicht bekannt | Not known yet | EVT-07m-d |
| Z26.lang.subtitleLanguage.label | Sprache der Untertitel | Subtitle language | EVT-07m-d |
| Z26.music.precision.label | Musikalische Präzisierung | Musical detail | EVT-07m-h |
| Z26.music.precision.placeholder | z. B. Dub Techno · Experimentelle Elektronik | e.g. Dub techno · Experimental electronic | EVT-07m-h (Beispiel aus dem Frame als Platzhalter) |
| Z26.music.genres.label | Breite Musikrichtungen | Broad music directions | EVT-07m-h |
| Z26.music.genres.hint | Bis zu drei breite Richtungen. Ein verständliches musikalisches Konzept kann bereits in der Beschreibung stehen. | Up to three broad directions. A clear musical concept can go in the description instead. | EVT-07m-h |
| Z26.music.genres.none | Auswählen | Choose | Musikrichtungen ohne Wahl (kein Frame) |
| Z26.music.genres.count | {n} ausgewählt | {n} selected | EVT-07m-i |
| Z26.genre.electronic | Elektronisch | Electronic | Musikrichtung, EVT-07m-i |
| Z26.genre.hiphop | Hip-Hop/Rap | Hip-hop/Rap | Musikrichtung, EVT-07m-i |
| Z26.genre.jazz | Jazz | Jazz | Musikrichtung, EVT-07m-i |
| Z26.genre.soul | Soul/Funk/R&B | Soul/Funk/R&B | Musikrichtung, EVT-07m-i |
| Z26.genre.rock | Rock/Punk | Rock/Punk | Musikrichtung, EVT-07m-i |
| Z26.genre.pop | Pop | Pop | Musikrichtung, EVT-07m-i |
| Z26.genre.classical | Klassik/Neue Musik | Classical/New music | Musikrichtung, EVT-07m-i |
| Z26.genre.folk | Folk/akustisch | Folk/acoustic | Musikrichtung, EVT-07m-i |
| Z26.genre.experimental | Experimentelle Musik/Klangkunst | Experimental music/Sound art | Musikrichtung, EVT-07m-i |
| Z26.participants.label | Beteiligte | People involved | EVT-07m-j |
| Z26.participants.hint | Eine Person pro Zeile: Name — Rolle. | One person per line: name — role. | EVT-07m-j (Beschreibung aus der Flow-Karte) |
| Z26.bring.label | Weitere Teilnahmebedingungen | Further conditions of taking part | EVT-07m-k |
| Z26.bring.placeholder | Zum Beispiel: notwendiger Nachweis oder Begleitregel | For example: proof you need to bring, or a rule about being accompanied | EVT-07m-k |
| Z26.sum.doors | Einlass ab {time} | Doors open {time} | Zusammenfassung Einlass und Alter |
| Z26.sum.minAge | ab {n} Jahren | ages {n}+ | Zusammenfassung Einlass und Alter |
| Z26.sum.allAges | für alle Altersgruppen | all ages | Zusammenfassung Einlass und Alter |
| Z26.sum.ageUnknown | Alter noch unbekannt | age not known yet | Zusammenfassung Einlass und Alter |
| Z26.sum.window | ab {from} | from {from} | Zusammenfassung Besuchsmodus |
| Z26.sum.windowTo | {from} bis {to} | {from} to {to} | Zusammenfassung Besuchsmodus |
| Z26.sum.subtitles | Untertitel: {value} | Subtitles: {value} | Zusammenfassung Sprache und Untertitel |
| Z26.sum.subtitlesIn | Untertitel: {value} ({language}) | Subtitles: {value} ({language}) | Zusammenfassung Sprache und Untertitel |
| Z26.err.time | Gib die Uhrzeit so ein: 21:30. | Enter the time like this: 21:30. | EVT-07m-g |
| Z26.err.ageMissing | Gib das Mindestalter an. | Enter the minimum age. | Einlass und Alter (kein Frame) |
| Z26.err.ageInvalid | Gib ein Alter von 1 bis 99 an. | Enter an age from 1 to 99. | Einlass und Alter (kein Frame) |
| Z26.err.windowFromMissing | Gib an, ab wann man vorbeikommen kann. | Say from when people can drop in. | Besuchsmodus (kein Frame) |
| Z26.err.choice | Wähle eine der angebotenen Antworten. | Choose one of the answers offered. | alle Bausteine (kein Frame) |
| Z26.err.requiredChoice | Wähle eine Antwort. „Noch nicht bekannt“ zählt auch. | Choose an answer. “Not known yet” counts too. | EVT-07m-d, Feld einer Pflichtangabe (kein Frame) |
| Z26.err.genresTooMany | Wähle höchstens {max} Richtungen. | Choose at most {max} directions. | EVT-07m-i (kein Frame) |
| Z26.check.line.required.visitMode | Besuchsmodus fehlt noch. Auch „Noch nicht bekannt“ zählt. | Visit mode is still missing. “Not known yet” counts too. | EVT-07m-d, Hinweis oben |
| Z26.check.line.required.language | Sprache und Untertitel fehlen noch. Auch „Noch nicht bekannt“ zählt. | Language and subtitles are still missing. “Not known yet” counts too. | EVT-07m-d, Hinweis oben |
| Z27.submit.eyebrow | Einreichen · Prüfen | Submit · Check | EIN-01a bis 01e, Eyebrow |
| Z27.submit.title | Prüfe, was öffentlich wird | Check what goes public | EIN-01, Titel |
| Z27.submit.lead | Lies alles noch einmal durch. Bis DISKOE es freigibt, bleibt alles privat. | Read everything once more. Until DISKOE approves it, everything stays private. | EIN-01, Einleitung |
| Z27.ok.title | Alle Pflichtangaben sind da. | All required details are here. | EIN-01a, Hinweis (Erfolg) |
| Z27.ok.line | Du kannst Profil und Event jetzt einreichen. | You can submit your profile and event now. | EIN-01a, Hinweis (Erfolg) |
| Z27.gaps.one | Eine Pflichtangabe fehlt noch. | One required detail is still missing. | EIN-01b/01e, Hinweis (Fehler), Zeile 1 |
| Z27.gaps.two | Zwei Pflichtangaben fehlen noch. | Two required details are still missing. | EIN-01b, Hinweis (Fehler), Zeile 1 |
| Z27.gaps.three | Drei Pflichtangaben fehlen noch. | Three required details are still missing. | EIN-01b, Hinweis (Fehler), Zeile 1 (kein Frame) |
| Z27.gaps.many | Mehrere Pflichtangaben fehlen noch. | Several required details are still missing. | EIN-01b, Hinweis (Fehler), Zeile 1 (kein Frame) |
| Z27.gaps.lineOne | {names}. Ergänze sie oder nimm den Haken raus, dann reichst du nur dein Profil ein. | {names}. Add it or untick the box to submit only your profile. | EIN-01b/01e, Hinweis (Fehler), Zeile 2; {names} = Namen der fehlenden Angaben |
| Z27.gaps.lineMany | {names}. Ergänze sie oder nimm den Haken raus, dann reichst du nur dein Profil ein. | {names}. Add them or untick the box to submit only your profile. | EIN-01b, Hinweis (Fehler), Zeile 2 |
| Z27.list.and | {a} und {b} | {a} and {b} | Aufzählung der fehlenden Angaben (bei drei und mehr: „a, b und c“) |
| Z27.gap.title | Titel | Title | EIN-01b, Name einer fehlenden Angabe |
| Z27.gap.description | Beschreibung | Description | EIN-01b, Name einer fehlenden Angabe |
| Z27.gap.format | Format | Format | EIN-01b, Name einer fehlenden Angabe |
| Z27.gap.start | Beginn | Start | EIN-01b, Name einer fehlenden Angabe |
| Z27.gap.place | Ort | Place | EIN-01b, Name einer fehlenden Angabe |
| Z27.gap.price | Preis | Price | EIN-01b, Name einer fehlenden Angabe |
| Z27.gap.access | Zugang | Access | EIN-01b, Name einer fehlenden Angabe |
| Z27.gap.accessUrl | Link zum Online-Zugang | Link for online access | EIN-01b, Name einer fehlenden Angabe (kein Frame) |
| Z27.gap.atmosphere | Atmosphäre | Atmosphere | EIN-01b, Name einer fehlenden Angabe |
| Z27.gap.image | Eventbild | Event image | EIN-01b, Name einer fehlenden Angabe |
| Z27.gap.visitMode | Besuchsart | Visit mode | EIN-01e, Name einer fehlenden Angabe (kein Frame; Film hat Frame) |
| Z27.gap.language | Sprache der Vorführung | Language of the screening | EIN-01e, Name einer fehlenden Angabe |
| Z27.gap.visitMode.short | Besuchsart | Visit mode | EIN-01e, Button (kein Frame) |
| Z27.gap.language.short | Sprache | Language | EIN-01e, Button |
| Z27.gap.fix | {name} ergänzen | Add {name} | EIN-01b/01e, Hauptbutton: springt zur ersten fehlenden Angabe |
| Z27.profile.heading | Profil | Profile | EIN-01a bis 01d, Kartenkopf; PRF-02 |
| Z27.profile.change | Profil ändern | Change profile | EIN-01a bis 01d, Button |
| Z27.event.heading | Erstes Event | First event | EIN-01a, 01b, 01e, Kartenkopf; PRF-02 |
| Z27.event.change | Event ändern | Change event | EIN-01a, 01b, 01e, Button |
| Z27.row.name | Name deines Projekts | Your project’s name | Zeile, Profil |
| Z27.row.intro | Kurzvorstellung | Short introduction | Zeile, Profil |
| Z27.row.slug | Profiladresse | Profile address | Zeile, Profil |
| Z27.row.links | Links und Kontakt | Links and contact | Zeile, Profil |
| Z27.row.profileImage | Profilbild | Profile picture | Zeile, Profil |
| Z27.row.title | Titel | Title | Zeile, Event |
| Z27.row.format | Format | Format | Zeile, Event |
| Z27.row.description | Beschreibung | Description | Zeile, Event |
| Z27.row.when | Beginn und Ende | Start and end | Zeile, Event |
| Z27.row.place | Ort | Place | Zeile, Event |
| Z27.row.price | Preis | Price | Zeile, Event |
| Z27.row.access | Zugang | Access | Zeile, Event |
| Z27.row.atmosphere | Atmosphäre | Atmosphere | Zeile, Event |
| Z27.row.eventImage | Eventbild | Event image | Zeile, Event |
| Z27.row.more | Mehr zum Abend | More about the evening | Zeile, Event |
| Z27.row.moreNone | Keine Angaben | Nothing added | Zeile „Mehr zum Abend“ ohne Baustein |
| Z27.row.missing | Fehlt | Missing | EIN-01b/01e, Badge |
| Z27.row.notEntered | Noch nicht angegeben | Not entered yet | EIN-01b, Wert einer fehlenden Angabe |
| Z27.row.fix | Ergänzen | Add | EIN-01b/01e, Button in der Zeile |
| Z27.row.visitModeMissing | Besuchsart fehlt | Visit mode is missing | EIN-01e, Wert einer fehlenden Angabe (kein Frame) |
| Z27.row.languageMissing | Sprache der Vorführung fehlt | Language of the screening is missing | EIN-01e, Wert einer fehlenden Angabe |
| Z27.when.range | {start} bis {end} ({zone}) | {start} to {end} ({zone}) | Zeile „Beginn und Ende“; {zone} = Berlin |
| Z27.when.single | {start} ({zone}) | {start} ({zone}) | Zeile „Beginn und Ende“ ohne Ende |
| Z27.when.clock | {day}, {time} | {day}, {time} | Tag und Uhrzeit |
| Z27.price.free | Frei | Free | Zeile Preis |
| Z27.price.donation | Eintritt gegen Spende | Admission by donation | Zeile Preis |
| Z27.price.minDonation | Eintritt gegen Spende, ab {amount} | Admission by donation, from {amount} | Zeile Preis |
| Z27.price.from | ab {amount} | from {amount} | Zeile Preis |
| Z27.price.fees | {price} inkl. Gebühren | {price} incl. fees | Zeile Preis |
| Z27.price.unknown | Preis noch offen | Price not known yet | Zeile Preis |
| Z27.event.include | Erstes Event mit einreichen | Submit the first event too | EIN-01a/01b/01d/01e, Haken |
| Z27.event.includeHint | Nimm den Haken raus, wenn nur dein Profil geprüft werden soll. | Untick the box if only your profile should be reviewed. | EIN-01a/01b/01e, Hinweis unter dem Haken |
| Z27.event.excludedHint | Bis dahin zeigt dein Profil „Neue Termine folgen.“ | Until then your profile shows “New dates to follow.” | EIN-01d, Hinweis unter dem Haken |
| Z27.only.title | Du reichst nur dein Profil ein. | You are submitting only your profile. | EIN-01c/01d, Hinweis (Info) |
| Z27.only.lineNone | Ein Event kannst du jederzeit ergänzen. Bis dahin zeigt deine Seite „Neue Termine folgen.“ | You can add an event at any time. Until then your page shows “New dates to follow.” | EIN-01c, Hinweis (Info), Zeile 2 |
| Z27.only.lineDraft | Das Event bleibt ein privater Entwurf. Du kannst es später einreichen. | The event stays a private draft. You can submit it later. | EIN-01d, Hinweis (Info), Zeile 2 |
| Z27.only.create | Erstes Event anlegen | Create the first event | EIN-01c/PRF-01b, Button |
| Z27.only.submit | Nur das Profil einreichen | Submit only the profile | EIN-01b/01e, Button |
| Z27.next.confirm | Weiter zur Bestätigung | Continue to confirmation | EIN-01a bis 01d, Hauptbutton |
| Z27.next.preview | Vorschau der Seiten ansehen | Preview the pages | EIN-01a/01d, Button; führt bis VOR-01 (Slice 11) zu den einfachen Vorschauseiten |
| Z27.confirm.eyebrow | Einreichen · Bestätigen | Submit · Confirm | EIN-02, Eyebrow |
| Z27.confirm.title | Reiche deinen Stand ein | Submit your version | EIN-02, Titel |
| Z27.confirm.lead | Mit deiner Bestätigung prüfen wir Profil und Event. Öffentlich wird erst, was wir freigeben. | With your confirmation we review your profile and event. Only what we approve goes public. | EIN-02a, Einleitung |
| Z27.confirm.leadProfile | Mit deiner Bestätigung prüfen wir dein Profil. Öffentlich wird erst, was wir freigeben. | With your confirmation we review your profile. Only what we approve goes public. | EIN-02, Einleitung nur Profil (kein Frame) |
| Z27.confirm.heading | Bestätige zwei Dinge | Confirm two things | EIN-02a, Überschrift |
| Z27.confirm.hint | Auf deiner Profilseite und deiner Eventseite. Beide bekommen einen eigenen Link, den du teilen kannst. | On your profile page and your event page. Each gets its own link that you can share. | EIN-02a, Hinweis |
| Z27.confirm.hintProfile | Auf deiner Profilseite. Sie bekommt einen eigenen Link, den du teilen kannst. | On your profile page. It gets its own link that you can share. | EIN-02, Hinweis nur Profil (kein Frame) |
| Z27.confirm.rights | Ich habe die Angaben geprüft und bin berechtigt, für dieses Projekt zu veröffentlichen. | I have checked the details and I’m authorised to publish for this project. | EIN-02a, Haken 1 (Entwurf, rechtliche Prüfung vor der Alpha-Öffnung); gespeichert als „rights“ |
| Z27.confirm.usage | Ich habe die nötigen Rechte an den Texten und Bildern, die öffentlich erscheinen. | I hold the necessary rights to the texts and images that appear publicly. | EIN-02a, Haken 2 (Entwurf, rechtliche Prüfung vor der Alpha-Öffnung); gespeichert als „usage“ |
| Z27.confirm.submit | Zur Prüfung einreichen | Submit for review | EIN-02a, Hauptbutton |
| Z27.confirm.pending | Reicht ein … | Submitting … | EIN-02, Hauptbutton während des Sendens |
| Z27.confirm.back | Zurück zur Prüfliste | Back to the checklist | EIN-02a, Button |
| Z27.retry | Noch einmal versuchen | Try again | EIN-02e/PRF-03c, Hauptbutton |
| Z27.err.confirm.title | Bitte bestätige beide Punkte. | Please confirm both points. | EIN-02d, Hinweis (Fehler), Zeile 1 |
| Z27.err.confirm.second | Setze noch den zweiten Haken, dann kannst du einreichen. | Tick the second box too, then you can submit. | EIN-02d, Hinweis (Fehler), Zeile 2 |
| Z27.err.confirm.first | Setze noch den ersten Haken, dann kannst du einreichen. | Tick the first box too, then you can submit. | EIN-02d, Zeile 2, wenn der erste fehlt (kein Frame) |
| Z27.err.confirm.both | Setze beide Haken, dann kannst du einreichen. | Tick both boxes, then you can submit. | EIN-02d, Zeile 2, wenn beide fehlen (kein Frame; Text vom Founder am 20.11.2026 bestätigt) |
| Z27.err.submit.title | Das Einreichen hat nicht geklappt. | Submitting didn’t work. | EIN-02e, Hinweis (Fehler), Zeile 1 |
| Z27.err.submit.line | Deine Bestätigung ist gespeichert. Versuche es noch einmal. | Your confirmation is kept. Try again. | EIN-02e, Hinweis (Fehler), Zeile 2 |
| Z27.err.changed.title | Dein Stand hat sich geändert. | Your version has changed. | EIN-02, Hinweis (Fehler) bei DK001 (kein Frame) |
| Z27.err.changed.line | Geh zurück zur Prüfliste und prüfe ihn noch einmal. | Go back to the checklist and check it again. | EIN-02, Hinweis (Fehler) bei DK001 (kein Frame) |
| Z27.err.gaps.title | Es fehlen noch Pflichtangaben. | Some required details are still missing. | EIN-02, Hinweis (Fehler) bei DK002 (kein Frame) |
| Z27.err.gaps.line | Geh zurück zur Prüfliste und ergänze sie. | Go back to the checklist and add them. | EIN-02, Hinweis (Fehler) bei DK002 (kein Frame) |
| Z27.err.state.title | Dieser Stand ist schon eingereicht oder entschieden. | This version is already submitted or decided. | EIN-02, Hinweis (Fehler) bei DK003 (kein Frame) |
| Z27.err.state.line | Das Ergebnis findest du im Überblick und in deiner E-Mail. | You’ll find the result in the overview and in your email. | EIN-02, Hinweis (Fehler) bei DK003 (kein Frame) |
| Z27.review.eyebrow | Prüfung | Review | PRF-01 bis 03, Eyebrow |
| Z27.review.title | Wir prüfen deinen Stand | We’re reviewing your version | PRF-01a, Titel |
| Z27.review.titleProfile | Wir prüfen dein Profil | We’re reviewing your profile | PRF-01b, Titel |
| Z27.review.lead | Du hast Profil und Event eingereicht. Wir prüfen von Hand und melden uns per E-Mail, sobald es etwas Neues gibt. Wir schreiben an {email}. | You’ve submitted your profile and event. We review by hand and email you as soon as there’s news. We write to {email}. | PRF-01a, Einleitung; {email} = Login-Adresse (nie in Logs oder Adressen) |
| Z27.review.leadProfile | Du hast dein Profil eingereicht. Wir prüfen von Hand und melden uns per E-Mail, sobald es etwas Neues gibt. Wir schreiben an {email}. | You’ve submitted your profile. We review by hand and email you as soon as there’s news. We write to {email}. | PRF-01b, Einleitung; {email} = Login-Adresse |
| Z27.review.pill | In Prüfung · eingereicht am {date} | In review · submitted {date} | PRF-01a/b, Pill; {date} = „Fr, 6.11.2026, 14:32“ |
| Z27.review.firstEvent | Dein erstes Event | Your first event | PRF-01b, Überschrift |
| Z27.review.firstEventText | Lege es an, wenn du so weit bist. Solange dein Profil in Prüfung ist, bleibt es ein privater Entwurf. Nach der Freigabe geht es von selbst live. Fehlt es noch, zeigt dein Profil „Neue Termine folgen.“ | Create it when you’re ready. While your profile is in review, it stays a private draft. After approval it goes live on its own. If it’s not there yet, your profile shows “New dates to follow.” | PRF-01b, Text |
| Z27.review.until | Bis dahin | Until then | PRF-01a/b, Überschrift |
| Z27.review.untilText | Deine Seiten bleiben privat. Willst du etwas ändern, ziehst du die Einreichung zurück. Dann beginnt die Prüfung von vorn. | Your pages stay private. If you want to change something, withdraw your submission. The review then starts over. | PRF-01a/b, Text |
| Z27.review.viewSubmitted | Eingereichte Fassung ansehen | View submitted version | PRF-01a/b, Button |
| Z27.review.withdraw | Einreichung zurückziehen | Withdraw submission | PRF-01a/b, PRF-02, Button |
| Z27.submitted.title | Deine eingereichte Fassung | Your submitted version | PRF-02, Titel |
| Z27.submitted.lead | So hast du sie am {date} um {time} Uhr eingereicht. Du kannst sie hier nur ansehen. | This is what you submitted on {date} at {time}. You can only view it here. | PRF-02, Einleitung |
| Z27.submitted.notice.title | Diese Fassung wird gerade geprüft. | This version is being reviewed right now. | PRF-02, Hinweis (Info), Zeile 1 |
| Z27.submitted.notice.line | Änderungen sind erst möglich, wenn du die Einreichung zurückziehst. | You can only change it once you withdraw the submission. | PRF-02, Hinweis (Info), Zeile 2 |
| Z27.submitted.back | Zurück zum Stand | Back to the status | PRF-02/PRF-03c, Button |
| Z27.withdraw.title | Einreichung zurückziehen? | Withdraw the submission? | PRF-03a, Titel |
| Z27.withdraw.lead | Deine Seiten bleiben privat. Du kannst danach wieder alles bearbeiten. | Your pages stay private. Afterwards you can edit everything again. | PRF-03a, Einleitung |
| Z27.withdraw.notice.title | Die Prüfung beginnt von vorn. | The review starts over. | PRF-03a, Hinweis (Warnung), Zeile 1 |
| Z27.withdraw.notice.line | Wenn du erneut einreichst, startet sie neu. Deine Angaben bleiben als Entwurf erhalten. | If you submit again, it starts anew. Your details are kept as a draft. | PRF-03a, Hinweis (Warnung), Zeile 2 |
| Z27.withdraw.keep | Nein, in Prüfung lassen | No, keep it in review | PRF-03a, Hauptbutton |
| Z27.withdraw.yes | Ja, zurückziehen | Yes, withdraw | PRF-03a, Button |
| Z27.withdraw.pending | Zieht zurück … | Withdrawing … | PRF-03a, Button während des Sendens |
| Z27.withdrawn.eyebrow | Zurückgezogen | Withdrawn | PRF-03b, Eyebrow |
| Z27.withdrawn.title | Du kannst wieder bearbeiten | You can edit again | PRF-03b, Titel |
| Z27.withdrawn.lead | Die Einreichung ist zurückgezogen. Nichts davon ist öffentlich. | The submission is withdrawn. None of it is public. | PRF-03b, Einleitung |
| Z27.withdrawn.notice.title | Die Einreichung ist zurückgezogen. | The submission is withdrawn. | PRF-03b, Hinweis (Erfolg), Zeile 1 |
| Z27.withdrawn.notice.line | Deine Angaben sind als Entwurf gespeichert. | Your details are saved as a draft. | PRF-03b, Hinweis (Erfolg), Zeile 2 |
| Z27.withdrawn.checklist | Zur Prüfliste | To the checklist | PRF-03b, Hauptbutton |
| Z27.withdrawn.editProfile | Profil bearbeiten | Edit profile | PRF-03b, Button |
| Z27.withdrawn.editEvent | Event bearbeiten | Edit event | PRF-03b, Button (nur mit Event) |
| Z27.withdrawFailed.lead | Das Zurückziehen hat nicht geklappt. | Withdrawing didn’t work. | PRF-03c, Einleitung |
| Z27.withdrawFailed.title | Das Zurückziehen hat nicht geklappt. | Withdrawing didn’t work. | PRF-03c, Hinweis (Fehler), Zeile 1 |
| Z27.withdrawFailed.line | Deine Einreichung ist weiter in Prüfung. Versuche es noch einmal. | Your submission is still in review. Try again. | PRF-03c, Hinweis (Fehler), Zeile 2 |
| Z27.decided.title | Wir haben schon entschieden | We’ve already decided | PRF-03d, Titel |
| Z27.decided.lead | Während du hier warst, haben wir deinen Stand geprüft. | While you were here, we reviewed your version. | PRF-03d, Einleitung |
| Z27.decided.notice.title | Zurückziehen ist nicht mehr nötig. | Withdrawing is no longer needed. | PRF-03d, Hinweis (Info), Zeile 1 |
| Z27.decided.notice.line | Das Ergebnis findest du im Überblick und in deiner E-Mail. | You’ll find the result in the overview and in your email. | PRF-03d, Hinweis (Info), Zeile 2 |
| Z27.decided.overview | Zum Überblick | To the overview | PRF-03d, Hauptbutton |

### Rückfrage, Live und Fehlerseiten (Z28, Welle 1 Block 2c und ERR, Slice 9, Stand 20.11.2026)
Deutsch aus den Figma-Frames RFG-01a bis RFG-04, LIV-01a bis LIV-03 und ERR-01 bis ERR-05; Englisch ist Vorschlag (Review offen). Abweichung von Figma (Founder, 20.11.2026): ERR-01 ohne den Satz „Auch das, was du gerade eingetragen hast, behalten wir in diesem Browser“, weil nichts im Browser gespeichert wird.

| ID | Deutsch | Englisch | Verwendung |
|---|---|---|---|
| Z28.q.eyebrow | Rückfrage | Question | RFG-01a/b, Eyebrow |
| Z28.q.title | Wir haben eine Rückfrage | We have a question | RFG-01a/b, Titel |
| Z28.q.lead | Bevor wir freigeben können, brauchen wir eine Antwort von dir. Bis dahin bleibt alles privat. | Before we can approve, we need an answer from you. Until then everything stays private. | RFG-01a/b, Einleitung |
| Z28.q.card.title | Rückfrage zu: {area} | Question about: {area} | RFG-01, RFG-02, Kartentitel und Hinweis auf den Bearbeiten-Schritten |
| Z28.q.card.titleNone | Rückfrage zu deinem Stand | Question about your version | RFG-01, Kartentitel ohne betroffene Stelle (kein Frame) |
| Z28.area.profile | Profil | Profile | RFG-01b, betroffene Stelle |
| Z28.area.event | Erstes Event | First event | RFG-01a, betroffene Stelle |
| Z28.area.place | Erstes Event · Ort | First event · Place | RFG-01a, RFG-02, betroffene Stelle |
| Z28.area.time | Erstes Event · Termin | First event · Date | betroffene Stelle (kein Frame) |
| Z28.area.image | Erstes Event · Bild | First event · Image | betroffene Stelle (kein Frame) |
| Z28.area.price | Erstes Event · Kosten und Zugang | First event · Price and access | betroffene Stelle (kein Frame) |
| Z28.q.asked | Unsere Frage | Our question | RFG-01/02, Zeile |
| Z28.q.sent | Gesendet am | Sent on | RFG-01/02, Zeile |
| Z28.q.fix | Angabe korrigieren | Correct the detail | RFG-01a/b, Hauptbutton |
| Z28.q.view | Eingereichte Fassung ansehen | View the submitted version | RFG-01a/b, Button |
| Z28.fix.eyebrow | Rückfrage · Korrigieren | Question · Correct | RFG-02a/b, Eyebrow |
| Z28.fix.place.title | Korrigiere den Ort | Correct the place | RFG-02a/b, Titel |
| Z28.fix.place.lead | Deine Antwort gilt für das Event. Am Ende reichst du den Stand erneut ein. | Your answer applies to the event. At the end you submit your version again. | RFG-02a/b, Einleitung |
| Z28.fix.next | Weiter | Continue | RFG-02a/b, Hauptbutton |
| Z28.fix.back | Zurück zur Rückfrage | Back to the question | RFG-02a/b, Button |
| Z28.again.eyebrow | Rückfrage · Erneut einreichen | Question · Submit again | RFG-03a, Eyebrow |
| Z28.again.title | Reiche deine Antwort ein | Submit your answer | RFG-03a, Titel |
| Z28.again.lead | Deine Antwort geht zusammen mit deinem Stand zurück an uns. Die Prüfung beginnt von vorn. | Your answer goes back to us together with your version. The review starts over. | RFG-03a, Einleitung |
| Z28.again.submit | Erneut einreichen | Submit again | RFG-03a, Hauptbutton |
| Z28.again.back | Zurück | Back | RFG-03a, Button |
| Z28.answered.eyebrow | Prüfung | Review | RFG-04, Eyebrow |
| Z28.answered.title | Danke, wir schauen es uns an | Thanks, we’ll take a look | RFG-04, Titel |
| Z28.answered.lead | Deine Antwort ist bei uns. Wir melden uns per E-Mail, sobald es etwas Neues gibt. | Your answer has reached us. We’ll email you as soon as there is news. | RFG-04, Einleitung |
| Z28.answered.notice.title | Deine Antwort ist eingereicht. | Your answer is submitted. | RFG-04, Hinweis (Erfolg), Zeile 1 |
| Z28.answered.notice.line | Alles bleibt privat, bis wir freigeben. | Everything stays private until we approve. | RFG-04, Hinweis (Erfolg), Zeile 2 |
| Z28.answered.view | Eingereichte Fassung ansehen | View the submitted version | RFG-04, Hauptbutton |
| Z28.live.eyebrow | Live | Live | LIV-01 bis 03, Eyebrow |
| Z28.live.title | Dein Profil ist live | Your profile is live | LIV-01 bis 03, Titel |
| Z28.live.lead | Wir haben Profil und Event freigegeben. Teile die Links, damit dich Leute finden. | We’ve approved your profile and event. Share the links so people can find you. | LIV-01a, Einleitung |
| Z28.live.leadProfile | Wir haben dein Profil freigegeben. Teile den Link, damit dich Leute finden. | We’ve approved your profile. Share the link so people can find you. | LIV-01b, Einleitung |
| Z28.live.since | Öffentlich seit {date} | Public since {date} | LIV-01 bis 03, Pille |
| Z28.live.profile | Dein Profil | Your profile | LIV-01, Kartentitel |
| Z28.live.copy | Link kopieren | Copy link | LIV-01, Button auf der Karte |
| Z28.live.viewProfile | Profil ansehen | View profile | LIV-01 bis 03, Button |
| Z28.live.viewEvent | Event ansehen | View event | LIV-01a, Button |
| Z28.live.next.title | Als Nächstes | Next | LIV-01b, Überschrift |
| Z28.live.next.line | Lege dein erstes Event an. Dann erscheint es auf deinem Profil. Bis dahin steht dort „Neue Termine folgen.“ | Create your first event. Then it appears on your profile. Until then it says “New dates to follow.” | LIV-01b, Zeile |
| Z28.live.createEvent | Erstes Event anlegen | Create first event | LIV-01b, Hauptbutton |
| Z28.live.copied.title | Link kopiert. | Link copied. | LIV-02, Hinweis (Erfolg), Zeile 1 |
| Z28.live.copied.line | Du kannst ihn jetzt einfügen, wo du willst. | You can paste it wherever you like now. | LIV-02, Hinweis (Erfolg), Zeile 2 |
| Z28.live.failed.title | Das Kopieren hat nicht geklappt. | Copying didn’t work. | LIV-03, Hinweis (Fehler), Zeile 1 |
| Z28.live.failed.line | Markiere den Link und kopiere ihn von Hand. | Select the link and copy it by hand. | LIV-03, Hinweis (Fehler), Zeile 2 |
| Z28.live.link.profile | Link zu deinem Profil | Link to your profile | LIV-03, Feld |
| Z28.live.link.event | Link zum Event | Link to the event | LIV-03, Feld (Event, kein Frame) |
| Z28.live.retry | Noch einmal kopieren | Copy again | LIV-03, Hauptbutton |
| Z28.err.session.eyebrow | Sitzung | Session | ERR-01, Eyebrow |
| Z28.err.session.title | Du bist abgemeldet | You’re signed out | ERR-01, Titel |
| Z28.err.session.lead | Deine Sitzung ist abgelaufen. Melde dich neu an. Was du schon gespeichert hast, ist noch da. | Your session has expired. Sign in again. What you’ve already saved is still there. | ERR-01, Einleitung (Satz über den Browser gestrichen, Founder 20.11.2026) |
| Z28.err.session.login | Neu anmelden | Sign in again | ERR-01, Button |
| Z28.err.notFound.eyebrow | 404 | 404 | ERR-02, Eyebrow |
| Z28.err.notFound.title | Diese Seite gibt es nicht | This page doesn’t exist | ERR-02, Titel |
| Z28.err.notFound.lead | Der Link stimmt nicht, oder die Seite ist nicht mehr da. | The link is wrong, or the page is gone. | ERR-02, Einleitung |
| Z28.err.home | Zur Startseite | To the start page | ERR-02 bis 04, Button |
| Z28.err.forbidden.eyebrow | 403 | 403 | ERR-03, Eyebrow |
| Z28.err.forbidden.title | Darauf hast du keinen Zugriff | You don’t have access to this | ERR-03, Titel |
| Z28.err.forbidden.lead | Diese Seite gehört zu einem anderen Konto. Wenn du glaubst, dass das nicht stimmt, melde dich mit der Adresse an, mit der du eingeladen wurdest. | This page belongs to another account. If you think that’s wrong, sign in with the address you were invited with. | ERR-03, Einleitung |
| Z28.err.forbidden.other | Mit anderer Adresse anmelden | Sign in with another address | ERR-03, Button |
| Z28.err.server.eyebrow | Fehler | Error | ERR-04, Eyebrow |
| Z28.err.server.title | Bei uns ist etwas schiefgelaufen | Something went wrong on our side | ERR-04, Titel |
| Z28.err.server.lead | Das liegt nicht an dir. Deine Angaben sind sicher. Versuche es gleich noch einmal. | It’s not you. Your details are safe. Try again in a moment. | ERR-04, Einleitung |
| Z28.err.server.retry | Noch einmal versuchen | Try again | ERR-04, Hauptbutton |
| Z28.err.out.eyebrow | Abgemeldet | Signed out | ERR-05, Eyebrow |
| Z28.err.out.title | Du bist abgemeldet | You’re signed out | ERR-05, Titel |
| Z28.err.out.lead | Bis bald. Deine Angaben bleiben gespeichert. | See you soon. Your details stay saved. | ERR-05, Einleitung |
| Z28.err.out.login | Wieder anmelden | Sign in again | ERR-05, Button |

### Live-Profil ändern und veröffentlichen (Z29, Welle 1 Block 3, Slice 10, Stand 23.11.2026)
Deutsch aus den Figma-Frames LPA-01a bis LPA-06b, LPA-01d und LPA-03c (Dev-Status „Ready for dev“ auf der Section); Englisch ist Vorschlag (Review offen). Wiederverwendet werden: Feldnamen und -hinweise aus Z23.details.* (Name, Kurzvorstellung, Profiladresse, Website, Instagram, Kontakt, „Weiteren Link hinzufügen“), die Fehlerzeilen aus Z23.check.*, die beiden Haken aus Z27.confirm.rights und Z27.confirm.usage (derselbe Wortlaut wie beim Einreichen; der Founder prüft ihn vor der Alpha-Öffnung rechtlich), „Zurück“ aus Z20.back, Eyebrow „Live“ aus Z28.live.eyebrow und „Profil ansehen“ aus Z28.live.viewProfile. Founder-Entscheidungen vom 23.11.2026: „Nichts angegeben“ und „Entfernt“ in der Änderungsansicht, neuer Hinweis bei geändertem Entwurf (LPA-03c), Einleitung der Änderungsansicht ohne Versprechen einer Seitenvorschau.

| ID | Deutsch | Englisch | Verwendung |
|---|---|---|---|
| Z29.edit.eyebrow | Profil ändern | Edit profile | LPA-01a bis c und 01d, Eyebrow |
| Z29.edit.title | Ändere dein Profil | Change your profile | LPA-01a bis c, Titel |
| Z29.edit.lead | Hier änderst du die Angaben deiner öffentlichen Seite. | Here you change the details on your public page. | LPA-01a bis c, Einleitung |
| Z29.edit.live.title | Dein Profil ist live. | Your profile is live. | LPA-01a, Hinweis (Info), Zeile 1 |
| Z29.edit.live.line | Änderungen bleiben privat, bis du sie veröffentlichst. Öffentlich ist bis dahin der bisherige Stand. | Changes stay private until you publish them. Until then the public page keeps its current version. | LPA-01a, Hinweis (Info), Zeile 2 |
| Z29.edit.name.required | Gib den Namen deines Projekts ein. | Enter the name of your project. | LPA-01b, Fehler am Feld Name (Text ohne Frame, gleiche Form wie intro.required) |
| Z29.edit.intro.required | Schreibe ein bis zwei Sätze. | Write one or two sentences. | LPA-01b, Fehler am Feld Kurzvorstellung |
| Z29.edit.links.required | Trage mindestens einen Link oder einen Kontakt ein. | Enter at least one link or a contact. | LPA-01b, Fehler am Feld Website (Text ohne Frame, gleiche Form wie intro.required) |
| Z29.edit.fail.title | Das Speichern hat nicht geklappt. | Saving didn’t work. | LPA-01c, Hinweis (Fehler), Zeile 1 |
| Z29.edit.fail.line | Deine Eingaben sind noch da. Versuche es noch einmal. | Your entries are still here. Try again. | LPA-01c, Hinweis (Fehler), Zeile 2 |
| Z29.edit.save | Änderungen speichern | Save changes | LPA-01a/b, Hauptbutton |
| Z29.edit.saving | Speichert … | Saving … | LPA-01a bis c, Hauptbutton während des Sendens |
| Z29.edit.retry | Noch einmal speichern | Save again | LPA-01c, Hauptbutton |
| Z29.edit.cancel | Abbrechen | Cancel | LPA-01a bis c, Button |
| Z29.leave.title | Ohne Speichern verlassen? | Leave without saving? | LPA-01d, Titel |
| Z29.leave.lead | Deine letzten Änderungen sind noch nicht gespeichert. | Your latest changes aren’t saved yet. | LPA-01d, Einleitung |
| Z29.leave.notice.title | Die Änderungen gehen verloren, wenn du jetzt gehst. | The changes are lost if you leave now. | LPA-01d, Hinweis (Warnung), Zeile 1 |
| Z29.leave.notice.line | Öffentlich bleibt der bisherige Stand, wie er ist. | The public page stays as it is. | LPA-01d, Hinweis (Warnung), Zeile 2 |
| Z29.leave.go | Ohne Speichern verlassen | Leave without saving | LPA-01d, Button |
| Z29.keepEditing | Weiter bearbeiten | Keep editing | LPA-01d Hauptbutton; LPA-02, LPA-03a und c, Button |
| Z29.saved.title | Änderungen gespeichert | Changes saved | LPA-02, Titel |
| Z29.saved.lead | Die Änderungen sind noch nicht öffentlich. Prüfe zuerst, was sich ändert. | The changes aren’t public yet. First check what changes. | LPA-02, Einleitung |
| Z29.saved.notice.title | Gespeichert. | Saved. | LPA-02, Hinweis (Erfolg), Zeile 1 |
| Z29.saved.notice.line | Öffentlich ist weiter der bisherige Stand. | The public page still shows its current version. | LPA-02, Hinweis (Erfolg), Zeile 2 |
| Z29.saved.review | Vorschau ansehen und veröffentlichen | View preview and publish | LPA-02, Hauptbutton |
| Z29.changes.eyebrow | Änderungen veröffentlichen | Publish changes | LPA-03a bis c und 04a bis c, Eyebrow |
| Z29.changes.title | Das ändert sich | What changes | LPA-03a und c, Titel |
| Z29.changes.lead | Das ist neu gegenüber deiner öffentlichen Seite. Alles andere bleibt, wie es ist. | This is new compared with your public page. Everything else stays as it is. | LPA-03a und c, Einleitung (Founder, 23.11.2026; die echte Seitenvorschau kommt mit VOR-01) |
| Z29.changes.field.name | Name | Name | LPA-03a, Kartentitel (Name; Figma zeigt dafür kein Beispiel) |
| Z29.changes.field.intro | Kurzvorstellung | Short introduction | LPA-03a, Kartentitel |
| Z29.changes.field.links | Links und Kontakt | Links and contact | LPA-03a, Kartentitel |
| Z29.changes.change | Ändern | Change | LPA-03a, Button auf der Karte |
| Z29.changes.before | Bisher öffentlich | Public so far | LPA-03a, Zeilenname |
| Z29.changes.after | Neu | New | LPA-03a, Zeilenname |
| Z29.changes.empty | Nichts angegeben | Nothing entered | LPA-03a, Wert bei „Bisher öffentlich“, wenn es das Feld noch nicht gab (Founder, 23.11.2026) |
| Z29.changes.removed | Entfernt | Removed | LPA-03a, Wert bei „Neu“, wenn das Feld jetzt leer ist (Founder, 23.11.2026) |
| Z29.changes.unchanged | Unverändert: {fields}. | Unchanged: {fields}. | LPA-03a, Hinweis; {fields} sind nur die wirklich unveränderten Felder, verbunden mit „und“ |
| Z29.changes.unchanged.name | Name | name | LPA-03a, Teil von {fields} |
| Z29.changes.unchanged.slug | Profiladresse | profile address | LPA-03a, Teil von {fields} |
| Z29.changes.unchanged.image | Profilbild | profile image | LPA-03a, Teil von {fields} |
| Z29.changes.unchanged.intro | Kurzvorstellung | short introduction | LPA-03a, Teil von {fields} |
| Z29.changes.unchanged.links | Links und Kontakt | links and contact | LPA-03a, Teil von {fields} |
| Z29.changes.publish | Änderungen veröffentlichen | Publish changes | LPA-03a und c, Hauptbutton |
| Z29.changes.discard | Änderungen verwerfen | Discard changes | LPA-03a und c, Button |
| Z29.changes.stale.title | Dein Entwurf hat sich geändert. | Your draft has changed. | LPA-03c, Hinweis (Info), Zeile 1 (Entwurf in einem anderen Tab oder Gerät geändert; Founder, 23.11.2026) |
| Z29.changes.stale.line | Prüfe ihn noch einmal. | Check it once more. | LPA-03c, Hinweis (Info), Zeile 2 |
| Z29.none.title | Du hast nichts geändert | You haven’t changed anything | LPA-03b, Titel |
| Z29.none.lead | Dein Entwurf ist gleich wie der öffentliche Stand. Es gibt nichts zu veröffentlichen. | Your draft matches the public version. There is nothing to publish. | LPA-03b, Einleitung |
| Z29.none.notice.title | Keine Änderungen vorhanden. | No changes found. | LPA-03b, Hinweis (Info), Zeile 1 |
| Z29.none.notice.line | Ändere etwas im Profil, dann erscheint es hier. | Change something in your profile and it shows up here. | LPA-03b, Hinweis (Info), Zeile 2 |
| Z29.none.edit | Profil bearbeiten | Edit profile | LPA-03b, Hauptbutton |
| Z29.home | Zur Startseite | To the home page | LPA-03b, 05 und 06b, Button |
| Z29.publish.title | Änderungen veröffentlichen? | Publish the changes? | LPA-04a bis c, Titel |
| Z29.publish.lead | Die Änderungen sind danach sofort öffentlich. DISKOE prüft sie nicht noch einmal. | The changes are public right away. DISKOE doesn’t review them again. | LPA-04a bis c, Einleitung |
| Z29.publish.err.title | Bitte bestätige beide Punkte. | Please confirm both points. | LPA-04b, Hinweis (Fehler), Zeile 1 |
| Z29.publish.err.line | Setze beide Haken, dann kannst du veröffentlichen. | Tick both boxes, then you can publish. | LPA-04b, Hinweis (Fehler), Zeile 2 |
| Z29.publish.fail.title | Das Veröffentlichen hat nicht geklappt. | Publishing didn’t work. | LPA-04c, Hinweis (Fehler), Zeile 1 |
| Z29.publish.fail.line | Öffentlich ist weiter der bisherige Stand. Deine Änderungen sind gespeichert. Versuche es noch einmal. | The public page still shows its current version. Your changes are saved. Try again. | LPA-04c, Hinweis (Fehler), Zeile 2 |
| Z29.publish.go | Jetzt veröffentlichen | Publish now | LPA-04a/b, Hauptbutton |
| Z29.publish.pending | Veröffentliche … | Publishing … | LPA-04a bis c, Hauptbutton während des Sendens |
| Z29.publish.retry | Noch einmal versuchen | Try again | LPA-04c, Hauptbutton |
| Z29.publish.back | Zurück zur Vorschau | Back to the preview | LPA-04a bis c, Button |
| Z29.done.title | Deine Änderungen sind live | Your changes are live | LPA-05, Titel (Eyebrow „Live“ aus Z28.live.eyebrow) |
| Z29.done.lead | Deine öffentliche Seite zeigt jetzt den neuen Stand. | Your public page now shows the new version. | LPA-05, Einleitung |
| Z29.done.notice.title | Veröffentlicht. | Published. | LPA-05, Hinweis (Erfolg), Zeile 1 |
| Z29.done.notice.line | Link und Adresse deiner Seite sind gleich geblieben. | The link and address of your page haven’t changed. | LPA-05, Hinweis (Erfolg), Zeile 2 |
| Z29.discard.eyebrow | Änderungen verwerfen | Discard changes | LPA-06a und b, Eyebrow |
| Z29.discard.title | Änderungen verwerfen? | Discard the changes? | LPA-06a, Titel |
| Z29.discard.lead | Dein privater Entwurf wird gelöscht. | Your private draft will be deleted. | LPA-06a, Einleitung |
| Z29.discard.notice.title | Das lässt sich nicht rückgängig machen. | This can’t be undone. | LPA-06a, Hinweis (Warnung), Zeile 1 |
| Z29.discard.notice.line | Öffentlich bleibt der bisherige Stand, wie er ist. | The public page stays as it is. | LPA-06a, Hinweis (Warnung), Zeile 2 |
| Z29.discard.yes | Ja, verwerfen | Yes, discard | LPA-06a, Button |
| Z29.discard.pending | Verwirft … | Discarding … | LPA-06a, Button während des Sendens |
| Z29.discard.no | Nein, behalten | No, keep it | LPA-06a, Hauptbutton |
| Z29.discarded.title | Entwurf verworfen | Draft discarded | LPA-06b, Titel |
| Z29.discarded.lead | Dein Profil ist wieder so wie öffentlich. | Your profile is back to what is public. | LPA-06b, Einleitung |
| Z29.discarded.notice.title | Die Änderungen sind verworfen. | The changes are discarded. | LPA-06b, Hinweis (Erfolg), Zeile 1 |
| Z29.discarded.notice.line | Öffentlich hat sich nichts geändert. | Nothing changed on the public page. | LPA-06b, Hinweis (Erfolg), Zeile 2 |

### Eventliste und Eventverwaltung (Z30, Welle 1 Flow 2 A, Slice 11, Stand 24.11.2026)
Deutsch aus den Figma-Frames EVL-01a bis g, EVM-01a bis f und EVB-07a, b (Dev-Status „Ready for dev“ auf der Section); Englisch ist Vorschlag (Review offen). „Nicht im Frame“ heißt: Text für einen Zustand, den Figma nicht zeichnet; er folgt der Form der gezeichneten Texte und ist Vorschlag.

| ID | Deutsch | Englisch | Verwendung |
|---|---|---|---|
| Z30.list.eyebrow | Events | Events | EVL-01a bis g, Eyebrow |
| Z30.list.title | Deine Events | Your events | EVL-01a bis g, Titel |
| Z30.list.lead | Hier siehst du, was öffentlich ist und was noch privat bleibt. | Here you see what is public and what stays private. | EVL-01a bis g, Einleitung |
| Z30.list.search.label | Suchen | Search | EVL-01, Feldname |
| Z30.list.search.placeholder | Titel oder Ort | Title or place | EVL-01, Platzhalter |
| Z30.list.filter.label | Zustand | Status | EVL-01, Feldname des Filters |
| Z30.filter.upcoming | Kommende | Upcoming | EVL-01, Filter (Standard) |
| Z30.filter.all | Alle Events | All events | EVL-01d und g, Filter |
| Z30.filter.drafts | Entwürfe | Drafts | EVL-01, Filter (Vorschlag: Optionen nicht im Frame) |
| Z30.filter.past | Vorbei | Past | EVL-01, Filter (Vorschlag: Optionen nicht im Frame) |
| Z30.state.live | Live | Live | EVL-01a, Pille |
| Z30.state.changes | Änderungen nicht veröffentlicht | Changes not published | EVL-01a, Pille |
| Z30.state.private | Privater Entwurf | Private draft | EVL-01a, Pille |
| Z30.state.inReview | In Prüfung | In review | EVL-01, Pille (ohne Frame, Text wie Z22.events.inReview) |
| Z30.state.question | Rückfrage von DISKOE | Question from DISKOE | EVL-01, Pille (ohne Frame, Text wie Z22.events.question) |
| Z30.state.postponed | Neuer Termin folgt | New date to follow | EVL-01a, Pille |
| Z30.state.cancelled | Abgesagt | Cancelled | EVL-01d, Pille |
| Z30.state.past | Vorbei | Past | EVL-01d, Pille |
| Z30.row.manage | Verwalten | Manage | EVL-01a, Zeilenbutton |
| Z30.row.continue | Weiter bearbeiten | Keep editing | EVL-01a, Zeilenbutton (privater Entwurf) |
| Z30.row.viewSubmitted | Eingereichtes ansehen | View submission | EVL-01, Zeilenbutton (In Prüfung und Rückfrage; Text wie ORG-103d) |
| Z30.row.aria | {action}: {title} | {action}: {title} | EVL-01, Name des Zeilenbuttons für Screenreader (nicht sichtbar) |
| Z30.row.untitled | Ohne Titel | Untitled | EVL-01, Zeile ohne Titel |
| Z30.row.dateOpen | Termin noch offen | Date not set yet | EVL-01, Zeile ohne Datum (nicht im Frame) |
| Z30.row.datePostponed | Neuer Termin folgt | New date to follow | EVL-01a, Zeile ohne Datum (verschoben) |
| Z30.row.when | {weekday}, {date}, {time} | {weekday}, {date}, {time} | EVL-01a, Zeile: Datum und Beginn |
| Z30.row.whenNoTime | {weekday}, {date} | {weekday}, {date} | EVL-01d, Zeile: nur Datum |
| Z30.count.one | Zeige {to} von {total} Events. | Showing {to} of {total} events. | EVL-01a, Zeile unter der Liste (eine Seite) |
| Z30.count.many | Zeige {from}–{to} von {total} Events | Showing {from}–{to} of {total} events | EVL-01g, Zeile unter der Liste (mehrere Seiten) |
| Z30.pager.prev | Zurück | Back | EVL-01g, Pager |
| Z30.pager.next | Weiter | Next | EVL-01g, Pager |
| Z30.pager.page | Seite {page} von {pages} | Page {page} of {pages} | EVL-01g, Pager |
| Z30.pager.nav | Seiten der Eventliste | Event list pages | EVL-01g, Name der Seitenleiste für Screenreader (nicht sichtbar) |
| Z30.list.new | Neues Event anlegen | Create new event | EVL-01a, Button |
| Z30.empty.title | Du hast noch kein Event | You have no event yet | EVL-01b, Titel |
| Z30.empty.lead | Lege dein erstes Event an. Es bleibt privat, bis du es veröffentlichst. | Create your first event. It stays private until you publish it. | EVL-01b, Einleitung |
| Z30.empty.cta | Erstes Event anlegen | Create your first event | EVL-01b, Button |
| Z30.noMatch.title | Keine Events gefunden | No events found | EVL-01c, Titel |
| Z30.noMatch.query | Zu „{query}“ gibt es {scope} nichts. Prüfe die Schreibweise oder setze den Filter zurück. | There is nothing for “{query}” {scope}. Check the spelling or reset the filter. | EVL-01c, Einleitung mit Suchbegriff |
| Z30.noMatch.filter | Bei dieser Auswahl gibt es keine Events. Setze den Filter zurück. | There are no events for this selection. Reset the filter. | EVL-01c, Einleitung ohne Suchbegriff (nicht im Frame) |
| Z30.noMatch.scope.upcoming | bei den kommenden Events | among the upcoming events | EVL-01c, Bereich im Satz |
| Z30.noMatch.scope.all | bei deinen Events | among your events | EVL-01c, Bereich im Satz |
| Z30.noMatch.scope.drafts | bei den Entwürfen | among the drafts | EVL-01c, Bereich im Satz |
| Z30.noMatch.scope.past | bei den vergangenen Events | among the past events | EVL-01c, Bereich im Satz |
| Z30.noMatch.reset | Filter zurücksetzen | Reset filter | EVL-01c, Button |
| Z30.error.title | Das Laden hat nicht geklappt. | Loading didn’t work. | EVL-01e, Titel des Hinweises |
| Z30.error.line | Das liegt nicht an dir. Versuche es noch einmal. | That’s not on you. Try again. | EVL-01e, Zeile 2 |
| Z30.error.retry | Noch einmal laden | Load again | EVL-01e, Button |
| Z30.loading | Lädt … | Loading … | EVL-01f, Ladezustand |
| Z30.manage.eyebrow | Event verwalten | Manage event | EVM-01a bis f, Eyebrow |
| Z30.manage.public.title | Öffentlich | Public | EVM-01a, Karte |
| Z30.manage.public.view | Eventseite ansehen | View event page | EVM-01a, 01d, 01f, Button |
| Z30.manage.row.link | Link | Link | EVM-01a, Zeile |
| Z30.manage.row.price | Preis | Price | EVM-01a und 01c, Zeile |
| Z30.manage.row.access | Zugang | Access | EVM-01a, Zeile |
| Z30.manage.row.title | Titel | Title | EVM-01c, Zeile |
| Z30.manage.row.when | Termin | Date | EVM-01c, Zeile |
| Z30.manage.row.place | Ort | Place | EVM-01c, Zeile |
| Z30.manage.notSet | Noch keine Angabe | Not set yet | EVM-01c, Wert ohne Angabe (nie „0“ oder „Frei“) |
| Z30.manage.edit.title | Bearbeiten | Edit | EVM-01a, Karte |
| Z30.manage.edit.lead | Ändere Text, Ort oder Beginn. Du entscheidest, wann die Änderung öffentlich wird. | Change text, place or start. You decide when the change goes public. | EVM-01a, Karte |
| Z30.manage.reschedule.title | Verschieben | Reschedule | EVM-01a, Karte |
| Z30.manage.reschedule.lead | Der Termin ändert sich. Gäste sehen den neuen Stand. | The date changes. Guests see the new details. | EVM-01a, Karte |
| Z30.manage.cancel.title | Absagen | Cancel | EVM-01a, Karte |
| Z30.manage.cancel.lead | Gäste sehen, dass das Event ausfällt. | Guests see that the event is off. | EVM-01a, Karte |
| Z30.manage.copyLink | Link kopieren | Copy link | EVM-01a, Button; nach dem Kopieren „Link kopiert.“ aus Z22.share.copied |
| Z30.manage.changes.notice.title | Gäste sehen noch den bisherigen Stand. | Guests still see the current version. | EVM-01b, Hinweis (Info), Zeile 1 |
| Z30.manage.changes.notice.line | Deine Änderungen sind nur für dich sichtbar. | Your changes are visible only to you. | EVM-01b, Hinweis (Info), Zeile 2 |
| Z30.manage.changes.pill | Änderungen noch nicht veröffentlicht | Changes not published yet | EVM-01b, Pille |
| Z30.manage.changes.title | Deine Änderungen | Your changes | EVM-01b, Karte |
| Z30.manage.changes.review | Änderungen prüfen und veröffentlichen | Review and publish changes | EVM-01b, Hauptbutton |
| Z30.change.field.title | Titel | Title | EVM-01b, Zeile |
| Z30.change.field.description | Beschreibung | Description | EVM-01b, Zeile |
| Z30.change.field.format | Format | Format | EVM-01b, Zeile (nicht im Frame) |
| Z30.change.field.start | Beginn | Start | EVM-01b, Zeile |
| Z30.change.field.end | Ende | End | EVM-01b, Zeile (nicht im Frame) |
| Z30.change.field.place | Ort | Place | EVM-01b, Zeile |
| Z30.change.field.address | Adresse | Address | EVM-01b, Zeile |
| Z30.change.field.price | Preis | Price | EVM-01b, Zeile (nicht im Frame) |
| Z30.change.field.access | Zugang | Access | EVM-01b, Zeile (nicht im Frame) |
| Z30.change.field.atmosphere | Atmosphäre | Atmosphere | EVM-01b, Zeile (nicht im Frame) |
| Z30.change.field.image | Eventbild | Event image | EVM-01b, Zeile (EVB-03b) |
| Z30.change.field.modules | Mehr zum Abend | More about the evening | EVM-01b, Zeile (nicht im Frame) |
| Z30.change.values | Bisher {before} · Neu {after} | Before {before} · Now {after} | EVM-01b, Zeile mit Werten |
| Z30.change.changed | Geändert | Changed | EVM-01b, Zeile ohne Werte |
| Z30.change.added | Neu | New | EVM-01b, Zeile für Neues |
| Z30.change.removed | Entfernt | Removed | EVM-01b, Zeile für Entferntes |
| Z30.change.nothing | Nichts angegeben | Nothing entered | EVM-01b, leere Seite eines Vergleichs |
| Z30.change.time | {time} Uhr | {time} | EVM-01b, Uhrzeit im Vergleich |
| Z30.change.dateTime | {date}, {time} Uhr | {date}, {time} | EVM-01b, Datum und Uhrzeit im Vergleich |
| Z30.manage.private.pill | Privater Entwurf | Private draft | EVM-01c, Pille |
| Z30.manage.private.missing.one | Zum Veröffentlichen fehlt noch eine Angabe. | One detail is still missing before you can publish. | EVM-01c, Hinweis, Zeile 1 (eine Lücke) |
| Z30.manage.private.missing.many | Zum Veröffentlichen fehlen noch Angaben. | Some details are still missing before you can publish. | EVM-01c, Hinweis, Zeile 1 (mehrere Lücken) |
| Z30.manage.private.ready | Dieses Event ist noch privat. | This event is still private. | EVM-01c, Hinweis, Zeile 1 (keine Lücke; nicht im Frame) |
| Z30.manage.private.line | Nur du siehst dieses Event. Gäste sehen es erst, wenn du es veröffentlichst. | Only you can see this event. Guests see it only when you publish it. | EVM-01c, Hinweis, Zeile 2 |
| Z30.manage.private.card | Stand | Current state | EVM-01c, Karte |
| Z30.manage.private.continue | Weiter bearbeiten | Keep editing | EVM-01c, Hauptbutton |
| Z30.manage.private.discard | Entwurf verwerfen | Discard draft | EVM-01c, Button |
| Z30.manage.cancelled.title | Dieses Event ist als abgesagt veröffentlicht. | This event is published as cancelled. | EVM-01d, Hinweis, Zeile 1 |
| Z30.manage.cancelled.line | Gäste sehen die Absage auf der Eventseite. | Guests see the cancellation on the event page. | EVM-01d, Hinweis, Zeile 2 |
| Z30.manage.cancelled.newDate | Neuen Termin setzen | Set a new date | EVM-01d, Hauptbutton |
| Z30.manage.postponed.newDate | Ersatztermin eintragen | Add replacement date | Verwaltung bei „Neuer Termin folgt“ (kein Figma-Frame), Hauptbutton |
| Z30.manage.past.line | Vergangene Events bleiben als Archiv auf deiner Seite. | Past events stay in the archive on your page. | EVM-01f, Hinweis |
| Z30.discard.eyebrow | Event bearbeiten | Edit event | EVB-07a und b, Eyebrow |
| Z30.discard.title | Entwurf verwerfen? | Discard the draft? | EVB-07a, Titel |
| Z30.discard.lead | {title} wurde nie veröffentlicht. Der Entwurf wird gelöscht. | {title} was never published. The draft will be deleted. | EVB-07a, Einleitung |
| Z30.discard.leadUntitled | Dieses Event wurde nie veröffentlicht. Der Entwurf wird gelöscht. | This event was never published. The draft will be deleted. | EVB-07a, Einleitung ohne Titel (nicht im Frame) |
| Z30.discard.notice.title | Das lässt sich nicht rückgängig machen. | This can’t be undone. | EVB-07a, Hinweis (Warnung), Zeile 1 |
| Z30.discard.notice.line | Hochgeladene Bilder des Entwurfs werden mit gelöscht. | Images uploaded for the draft are deleted too. | EVB-07a, Hinweis (Warnung), Zeile 2 |
| Z30.discard.yes | Entwurf verwerfen | Discard draft | EVB-07a, Button |
| Z30.discard.pending | Verwirft … | Discarding … | EVB-07a, Button während des Sendens |
| Z30.discard.no | Abbrechen | Cancel | EVB-07a, Button |
| Z30.discard.fail | Das Verwerfen hat nicht geklappt. Versuche es noch einmal. | Discarding didn’t work. Try again. | EVB-07a, Fehler (nicht im Frame) |
| Z30.discarded.title | Entwurf verworfen | Draft discarded | EVB-07b, Titel |
| Z30.discarded.lead | {title} ist gelöscht. | {title} is deleted. | EVB-07b, Einleitung |
| Z30.discarded.leadUntitled | Der Entwurf ist gelöscht. | The draft is deleted. | EVB-07b, Einleitung ohne Titel (nicht im Frame) |
| Z30.discarded.notice.title | Der Entwurf ist verworfen. | The draft is discarded. | EVB-07b, Hinweis (Erfolg), Zeile 1 |
| Z30.discarded.notice.line | Dein Profil und deine anderen Events sind unverändert. | Your profile and your other events are unchanged. | EVB-07b, Hinweis (Erfolg), Zeile 2 |
| Z30.discarded.toList | Zur Eventliste | Back to the event list | EVB-07b, Button |

### Live-Event bearbeiten (Z31, Welle 1 Flow 2 B, Slice 12, Stand 24.11.2026)
Deutsch aus den Figma-Frames EVB-01a bis EVB-06b (Section „Flow 2 B“); Englisch ist Vorschlag (Review offen). Ohne die Sätze zu Followern (Beschluss Founder 23.11.2026: EVB-03a entfällt, EVB-03b und EVB-05 ohne Follower-Zeile). Die Zeilen der Änderungskarte („Bisher … · Neu …“) kommen aus Z30.change.*; die Haken-Sätze aus Z27.confirm.*; Hinweis „Dein Entwurf hat sich geändert“ aus Z29.changes.stale.*; Fehlertexte für Datum und Uhrzeit aus Z24.time.*. „Nicht im Frame“ heißt: Text für einen Zustand, den Figma nicht zeichnet; er folgt der Form der gezeichneten Texte und ist Vorschlag.

| ID | Deutsch | Englisch | Quelle |
|---|---|---|---|
| Z31.edit.eyebrow | Event bearbeiten | Edit event | EVB-01 bis 06, Eyebrow |
| Z31.edit.notice.title | Änderungen bleiben privat, bis du sie veröffentlichst. | Changes stay private until you publish them. | EVB-01a, Hinweis, Zeile 1 |
| Z31.edit.notice.line | Gäste sehen bis dahin den bisherigen Stand. | Guests see the current version until then. | EVB-01a, Hinweis, Zeile 2 |
| Z31.edit.title.label | Titel | Title | EVB-01a, Feldname |
| Z31.edit.title.placeholder | Titel des Events | Event title | EVB-01b, Platzhalter |
| Z31.edit.title.missing | Gib dem Event einen Titel. | Give the event a title. | EVB-01b, Fehler am Feld |
| Z31.edit.description.label | Beschreibung | Description | EVB-01a, Feldname |
| Z31.edit.description.missing | Beschreibe das Event kurz. | Describe the event briefly. | EVB-01, Fehler am Feld (nicht im Frame) |
| Z31.edit.date.label | Datum | Date | EVB-01a, Feldname |
| Z31.edit.start.label | Beginn | Start | EVB-01a, Feldname der Uhrzeit |
| Z31.edit.place.label | Ort | Place | EVB-01a, Feldname |
| Z31.edit.place.placeholder | Name des Ortes | Name of the place | EVB-01, Platzhalter (nicht im Frame) |
| Z31.edit.address.label | Adresse | Address | EVB-01a, Feldname |
| Z31.edit.address.placeholder | Straße Nr., PLZ Ort | Street no., postal code city | EVB-01, Platzhalter (nicht im Frame) |
| Z31.edit.address.missing | Gib die Adresse an. | Enter the address. | EVB-01, Fehler am Feld (nicht im Frame) |
| Z31.edit.address.invalid | Schreibe die Adresse so: Straße Nr., PLZ Ort. Zum Beispiel Kanalstraße 12, 10999 Berlin. | Write the address like this: street no., postal code city. For example Kanalstraße 12, 10999 Berlin. | EVB-01, Fehler am Feld (nicht im Frame, Beschluss Founder 24.11.2026) |
| Z31.edit.err.title.one | Bitte prüfe eine Angabe. | Please check one entry. | EVB-01b, Hinweis, Zeile 1 |
| Z31.edit.err.title.many | Bitte prüfe {count} Angaben. | Please check {count} entries. | EVB-01b, Hinweis, Zeile 1 bei mehreren Fehlern (nicht im Frame) |
| Z31.edit.err.missing.title | Der Titel fehlt noch. | The title is still missing. | EVB-01b, Hinweis, Zeile 2 |
| Z31.edit.err.missing.description | Die Beschreibung fehlt noch. | The description is still missing. | EVB-01b, Zeile 2 für diese Angabe (nicht im Frame) |
| Z31.edit.err.missing.startDate | Das Datum fehlt noch. | The date is still missing. | EVB-01b, Zeile 2 für diese Angabe (nicht im Frame) |
| Z31.edit.err.missing.startTime | Der Beginn fehlt noch. | The start is still missing. | EVB-01b, Zeile 2 für diese Angabe (nicht im Frame) |
| Z31.edit.err.missing.placeName | Der Ort fehlt noch. | The place is still missing. | EVB-01b, Zeile 2 für diese Angabe (nicht im Frame) |
| Z31.edit.err.missing.address | Die Adresse fehlt noch. | The address is still missing. | EVB-01b, Zeile 2 für diese Angabe (nicht im Frame) |
| Z31.edit.err.line.many | Die markierten Felder brauchen eine Korrektur. | The marked fields need a correction. | EVB-01b, Zeile 2 bei mehreren Fehlern oder einer Angabe, die nicht passt (nicht im Frame) |
| Z31.edit.fail.title | Das Speichern hat nicht geklappt. | Saving didn’t work. | EVB-01c, Hinweis, Zeile 1 |
| Z31.edit.fail.line | Deine Eingaben sind noch da. Versuche es noch einmal. | Your entries are still here. Try again. | EVB-01c, Hinweis, Zeile 2 |
| Z31.edit.save | Änderungen speichern | Save changes | EVB-01a bis c, Button |
| Z31.edit.saving | Speichert … | Saving … | EVB-01, Button während des Sendens (nicht im Frame) |
| Z31.edit.cancel | Abbrechen | Cancel | EVB-01a bis c, Button |
| Z31.saved.title | Änderungen gespeichert | Changes saved | EVB-02, Titel |
| Z31.saved.lead | Die Änderungen sind noch nicht öffentlich. | The changes aren’t public yet. | EVB-02, Einleitung |
| Z31.saved.notice.title | Gespeichert. | Saved. | EVB-02, Hinweis (Erfolg), Zeile 1 |
| Z31.saved.notice.line | Gäste sehen noch den bisherigen Stand. | Guests still see the current version. | EVB-02, Hinweis (Erfolg), Zeile 2 |
| Z31.saved.review | Änderungen prüfen | Review changes | EVB-02, Button |
| Z31.keepEditing | Weiter bearbeiten | Keep editing | EVB-02, 03b, 03c, Button |
| Z31.changes.title | Das ändert sich | What changes | EVB-03b, Titel |
| Z31.changes.lead | Prüfe die Änderungen, bevor sie öffentlich werden. | Check the changes before they go public. | EVB-03b, Einleitung |
| Z31.changes.card | Änderungen | Changes | EVB-03b, Karte |
| Z31.changes.next | Weiter zur Bestätigung | Continue to confirmation | EVB-03b, Button |
| Z31.changes.discard | Änderungen verwerfen | Discard changes | EVB-03b, Button (nicht im Frame; Weg zu EVB-06a) |
| Z31.none.title | Keine Änderungen | No changes | EVB-03c, Titel |
| Z31.none.lead | Dein Entwurf entspricht dem öffentlichen Stand. | Your draft matches what is public. | EVB-03c, Einleitung |
| Z31.none.notice.title | Es gibt nichts zu veröffentlichen. | There is nothing to publish. | EVB-03c, Hinweis, Zeile 1 |
| Z31.none.notice.line | Ändere etwas, dann kannst du es hier prüfen. | Change something, then you can review it here. | EVB-03c, Hinweis, Zeile 2 |
| Z31.toManage | Zur Eventverwaltung | Back to event management | EVB-03c, 05, 06b, Button |
| Z31.publish.title | Änderungen veröffentlichen | Publish changes | EVB-04a bis c, Titel |
| Z31.publish.lead | Gäste sehen den neuen Stand sofort. | Guests see the new version right away. | EVB-04a bis c, Einleitung |
| Z31.publish.card | Das wird öffentlich | This goes public | EVB-04a bis c, Karte |
| Z31.publish.back | Zurück zur Prüfung | Back to review | EVB-04a bis c, Button |
| Z31.publish.fail.line | Öffentlich ist weiter der bisherige Stand. Deine Änderungen sind gespeichert. Versuche es noch einmal. | The public version is still the current one. Your changes are saved. Try again. | EVB-04c, Hinweis, Zeile 2 (Abweichung vom Frame: dort steht „Deine Bestätigung ist gespeichert“, das stimmt nicht; gespeichert sind die Änderungen) |
| Z31.done.title | Änderungen sind veröffentlicht | Changes are published | EVB-05, Titel |
| Z31.done.notice.title | Gäste sehen jetzt den neuen Stand. | Guests now see the new version. | EVB-05, Hinweis (Erfolg), Zeile 1 (Zeile 2 mit Follower-Hinweis entfällt, Beschluss Founder 23.11.2026) |
| Z31.discard.title | Änderungen verwerfen? | Discard changes? | EVB-06a, Titel |
| Z31.discard.lead | Deine privaten Änderungen gehen verloren. Öffentlich bleibt der bisherige Stand. | Your private changes will be lost. The public version stays as it is. | EVB-06a, Einleitung |
| Z31.discard.notice.title | Das lässt sich nicht rückgängig machen. | This can’t be undone. | EVB-06a, Hinweis (Warnung), Zeile 1 |
| Z31.discard.notice.line | Das Event selbst bleibt live. | The event itself stays live. | EVB-06a, Hinweis (Warnung), Zeile 2 |
| Z31.discard.yes | Änderungen verwerfen | Discard changes | EVB-06a, Button |
| Z31.discard.pending | Verwirft … | Discarding … | EVB-06a, Button während des Sendens (nicht im Frame) |
| Z31.discard.no | Abbrechen | Cancel | EVB-06a, Button |
| Z31.discard.fail | Das Verwerfen hat nicht geklappt. Versuche es noch einmal. | Discarding didn’t work. Try again. | EVB-06a, Fehler (nicht im Frame) |
| Z31.discarded.title | Änderungen verworfen | Changes discarded | EVB-06b, Titel |
| Z31.discarded.notice.title | Die Änderungen sind verworfen. | The changes are discarded. | EVB-06b, Hinweis (Erfolg), Zeile 1 |
| Z31.discarded.notice.line | Öffentlich ist weiter der bisherige Stand. | The public version is still the current one. | EVB-06b, Hinweis (Erfolg), Zeile 2 |

## Mails MAIL-01 bis MAIL-14 (Deutsch und Englisch, Vorschlag 11.11.2026)
**Status:** Der deutsche Wortlaut ist aus den Figma-Frames übernommen (Stand 11.11.2026, Seiten 20, 30, 50). Die englische Fassung ist ein **Vorschlag von Claude** und braucht die Durchsicht des Founders. Gleiche IDs in beiden Sprachen; die Mail kommt in der gespeicherten Sprache des Empfängers, ohne Wert in Englisch (siehe „Sprachen“). Platzhalter in `{…}`. **Vorschautext:** in Figma nicht gezeichnet; Vorschlag: die erste Textzeile nach der Anrede, höchstens 90 Zeichen. **Datums- und Zeitformat** folgt der Mailsprache (DE „Sa, 14.11.2026 · 20:00 Uhr“, EN „Sat, 14 Nov 2026 · 8:00 PM“); die Zeitzone ist die des Events (`Europe/Berlin`). Nach dem Kopf folgt in Organizer-Mails „Hallo,“ / „Hello,“, in Mails an Gäste nur dort, wo der Frame es zeigt.

**Fußzeilen (gelten für die Mails der Spalte)**
| ID | Deutsch | English |
|---|---|---|
| MF-ORG (MAIL-01 bis 07, 09 bis 11) | DISKOE · Impressum · Datenschutz. Das ist eine Systemmail zu deinem Konto, keine Werbung. | DISKOE · Imprint · Privacy policy. This is a system email about your account, not advertising. |
| MF-GUEST (MAIL-12, 13, 13b) | DISKOE · Impressum · Datenschutz. Das ist eine Systemmail, keine Werbung. | DISKOE · Imprint · Privacy policy. This is a system email, not advertising. |
| MF-FOLLOW (MAIL-08a bis d, 14) | Du bekommst diese Systemmail, weil du {Profil} folgst. Nicht mehr folgen. DISKOE · Impressum · Datenschutz. | You're getting this system email because you follow {profile}. Unfollow. DISKOE · Imprint · Privacy policy. |

**Mails an Organizer** (Absender „DISKOE“, Empfänger: Organizer-Adresse, bei MAIL-07 die alte Login-Adresse)
| ID | Betreff DE / EN | Text DE / EN | Button DE / EN | Hinweis darunter DE / EN |
|---|---|---|---|---|
| MAIL-01 Anmeldecode | Dein Anmeldecode für DISKOE / Your DISKOE sign-in code | hier ist dein Code zum Anmelden: `{Code}` / here is your code to sign in: `{code}` | Direkt anmelden / Sign in directly | Der Code gilt 10 Minuten und nur einmal. Du hast ihn nicht angefordert? Dann kannst du diese Mail ignorieren. Es passiert nichts. / The code works once and for 10 minutes. Didn't request it? You can ignore this email. Nothing happens. |
| MAIL-02a Live, Profil und Event | Dein Profil und dein Event sind live / Your profile and your event are live | wir haben „{Profil}“ und dein Event „{Event}“ freigegeben. Beides ist jetzt öffentlich. Teile die Links, damit dich Leute finden. / we've approved “{profile}” and your event “{event}”. Both are public now. Share the links so people can find you. | Zu deinem Profil / Go to your profile | Nach dem Anmelden findest du beide Links auf deiner Startseite. / After you sign in, you'll find both links on your home page. |
| MAIL-02b Live, nur Profil | Dein Profil ist live / Your profile is live | wir haben „{Profil}“ freigegeben. Dein Profil ist jetzt öffentlich. Bis du ein Event anlegst, steht dort „Neue Termine folgen.“ / we've approved “{profile}”. Your profile is public now. Until you add an event, it says “New dates to follow.” | Zu deinem Profil / Go to your profile | Nach dem Anmelden findest du den Link auf deiner Startseite. / After you sign in, you'll find the link on your home page. |
| MAIL-03 Rückfrage | Rückfrage zu deinem Stand bei DISKOE / A question about your submission to DISKOE | wir haben eine Rückfrage zu deinem Event, Bereich „{Bereich}“. Bis du geantwortet hast, bleibt alles privat. Die Frage selbst siehst du nach dem Anmelden in der App. / we have a question about your event, section “{section}”. Everything stays private until you've replied. You'll see the question itself in the app after you sign in. | Rückfrage ansehen / View question | Aus Datenschutzgründen steht die Frage nicht in der Mail. / For privacy reasons, the question isn't in this email. |
| MAIL-04 Profil gesperrt | Dein Profil ist vorübergehend nicht öffentlich / Your profile is temporarily not public | wir haben dein Profil „{Profil}“ vorübergehend gesperrt. Gäste sehen es gerade nicht. Den Grund und die Möglichkeit zu antworten findest du nach dem Anmelden. / we've temporarily suspended your profile “{profile}”. Guests can't see it right now. After you sign in, you'll find the reason and a way to reply. | Zur Nachricht / View message | Aus Datenschutzgründen steht der Grund nicht in der Mail. / For privacy reasons, the reason isn't in this email. |
| MAIL-05 Event ausgeblendet | Dein Event ist nicht öffentlich / Your event is not public | wir haben dein Event „{Event}“ ausgeblendet. Dein Profil bleibt öffentlich. Den Grund und die Möglichkeit zu antworten findest du nach dem Anmelden. / we've hidden your event “{event}”. Your profile stays public. After you sign in, you'll find the reason and a way to reply. | Zur Nachricht / View message | Aus Datenschutzgründen steht der Grund nicht in der Mail. / For privacy reasons, the reason isn't in this email. |
| MAIL-06 Profil wieder öffentlich | Dein Profil ist wieder öffentlich / Your profile is public again | wir haben die Sperre von „{Profil}“ aufgehoben. Profil und Events sind wieder öffentlich. / we've lifted the suspension of “{profile}”. Profile and events are public again. | Zu deinem Profil / Go to your profile | Du musst nichts weiter tun. / You don't need to do anything else. |
| MAIL-07 Login geändert (nur an die alte Adresse) | Dein Login bei DISKOE wurde geändert / Your DISKOE login was changed | wir haben die Login-Adresse für „{Profil}“ geändert. Ab jetzt meldet man sich mit einer anderen Adresse an. Mit dieser Adresse geht das nicht mehr. Hast du das nicht erwartet? Dann melde dich bitte bei uns. / we've changed the login address for “{profile}”. From now on, people sign in with a different address. This address no longer works for that. Didn't expect this? Then please get in touch. | Uns schreiben / Write to us | Das ist eine Sicherheitsmail. Es steht keine neue Adresse darin. / This is a security email. It doesn't contain the new address. |
| MAIL-09 Konto gesperrt | Dein Konto ist vorübergehend gesperrt / Your account is temporarily suspended | wir haben dein Konto vorübergehend gesperrt. Gäste sehen deine Profile und Events gerade nicht. Den Grund und die Möglichkeit zu antworten findest du nach dem Anmelden. / we've temporarily suspended your account. Guests can't see your profiles and events right now. After you sign in, you'll find the reason and a way to reply. | Zur Nachricht / View message | Aus Datenschutzgründen steht der Grund nicht in der Mail. / For privacy reasons, the reason isn't in this email. |
| MAIL-10 Konto wieder freigeschaltet | Dein Konto ist wieder freigeschaltet / Your account is active again | wir haben die Sperre deines Kontos aufgehoben. Deine Profile und Events sind wieder öffentlich. / we've lifted the suspension of your account. Your profiles and events are public again. | Zur Startseite / Go to your home page | Du musst nichts weiter tun. / You don't need to do anything else. |
| MAIL-11 Event wieder öffentlich | Dein Event ist wieder öffentlich / Your event is public again | wir haben „{Event}“ wieder öffentlich gemacht. Das Event ist mit dem Stand von vor dem Ausblenden wieder erreichbar. / we've made “{event}” public again. The event is reachable again as it was before it was hidden. | Zum Event / View event | Du musst nichts weiter tun. / You don't need to do anything else. |

**Mails an Gäste: Anmeldung und Bestätigung** (Empfänger: Adresse des Gastes)
| ID | Betreff DE / EN | Text DE / EN | Button DE / EN | Hinweis darunter DE / EN |
|---|---|---|---|---|
| MAIL-12 Login-Code | Dein Code für DISKOE / Your code for DISKOE | hier ist dein Code, um deine Merkliste und deine E-Mail-Abos zu verwalten: `{Code}` / here is your code to manage your saved list and your email subscriptions: `{code}` | Direkt öffnen / Open directly | Der Code gilt nur für kurze Zeit und nur einmal. Du hast ihn nicht angefordert? Dann kannst du diese Mail ignorieren. Es passiert nichts. / The code works once and only for a short time. Didn't request it? You can ignore this email. Nothing happens. |
| MAIL-13 Folgen bestätigen | Bestätige, dass du {Profil} folgen willst / Confirm that you want to follow {profile} | du hast darum gebeten, {Profil} zu folgen. Bestätige das mit einem Klick. Danach schreiben wir dir, wenn {Profil} neue Events ankündigt oder sich Termin, Ort oder Absage eines Events ändern. Du kannst das Abo jederzeit beenden. In jeder Mail steht ein Link dafür. / you asked to follow {profile}. Confirm with one click. After that, we'll write to you when {profile} announces new events or when the date, place or cancellation of an event changes. You can end the subscription at any time. Every email has a link for it. | Folgen bestätigen / Confirm follow | Du hast das nicht angefragt? Dann ignoriere diese Mail. Ohne Bestätigung passiert nichts. / Didn't request this? Then ignore this email. Nothing happens without confirmation. |
| MAIL-13b Event-Abo bestätigen | Bestätige Änderungen zu {Event} / Confirm updates about {event} | du möchtest Änderungen zu {Event} erhalten. Bestätige das mit einem Klick. Danach schreiben wir dir, wenn sich Termin oder Ort ändern oder das Event abgesagt wird. Du kannst das Abo jederzeit beenden. In jeder Mail steht ein Link dafür. / you'd like to get updates about {event}. Confirm with one click. After that, we'll write to you if the date or place changes or the event is cancelled. You can end the subscription at any time. Every email has a link for it. | Abo bestätigen / Confirm subscription | Du hast das nicht angefragt? Dann ignoriere diese Mail. Ohne Bestätigung passiert nichts. / Didn't request this? Then ignore this email. Nothing happens without confirmation. |

**Mails an Follower** (Empfänger: Adresse des Gastes mit bestätigtem Abo; Fußzeile MF-FOLLOW; vor dem Versand Abo, Eventstand und bisherigen Versand prüfen)
| ID | Betreff DE / EN | Überschrift und Inhalt DE / EN | Button DE / EN | Hinweis darunter DE / EN |
|---|---|---|---|---|
| MAIL-08a Termin verschoben | Neuer Termin: {Event} / New date: {event} | Termin verschoben / Date changed · {Event} · von {Profil} / by {profile} · Bisher / Before: {Datum, Uhrzeit} · Neu / New: {Datum, Uhrzeit} | Zum Event / View event | Der Eventlink ist gleich geblieben. / The event link hasn't changed. |
| MAIL-08b Beginn und Ort geändert | Änderung bei „{Event}“ / A change to “{event}” | Änderung / Change · {Event} · von {Profil} / by {profile} · Beginn / Start: Bisher / Before, Neu / New · Ort / Place: Bisher / Before, Neu / New | Zum Event / View event | Alle Angaben findest du auf der Eventseite. / You'll find all details on the event page. |
| MAIL-08c Absage | Abgesagt: {Event} / Cancelled: {event} | Abgesagt / Cancelled · {Event} · von {Profil} / by {profile} · Der Termin war / The date was: {Datum, Uhrzeit, Ort} · Fragen zu Tickets und Erstattungen beantwortet der Veranstalter. Erstattungen laufen nicht über DISKOE. / The organizer answers questions about tickets and refunds. Refunds don't go through DISKOE. | Zur Eventseite / View event page | Sobald es einen neuen Termin gibt, bekommst du wieder einen Hinweis. / As soon as there's a new date, you'll get another notice. |
| MAIL-08d Neuer Termin folgt | Termin offen: {Event} / Date open: {event} | Neuer Termin folgt / New date to follow · {Event} · von {Profil} / by {profile} · Bisher / Before: {Datum, Uhrzeit} · Neu / New: Noch offen / Still open | Zur Eventseite / View event page | Sobald es einen neuen Termin gibt, bekommst du wieder einen Hinweis. / As soon as there's a new date, you'll get another notice. |
| MAIL-14 Neue Events gebündelt | Neue Events von {Profil} / New events from {profile} | Neue Events / New events · {Profil} hat {n} neue Events (1: „hat 1 neues Event“ / „has 1 new event“) / {profile} has {n} new events · je Event eine Zeile: {Datum} · {Uhrzeit} · {Event} | Zu den Events / View events | Wir bündeln neue Events in einer Mail. / We bundle new events in one email. |

**Offen:** Durchsicht der englischen Fassung durch den Founder (Begriffe „suspended“ für „gesperrt“, „hidden“ für „ausgeblendet“, „place“ für „Ort“, „Follower“ in der Fußzeile). Die Betreffzeilen sind in den Frames nicht überall gleich lang geprüft (E-Mail-Programme kürzen ab etwa 60 Zeichen). `MAIL-01` bis `03` werden zuerst gebaut (Welle 1).
