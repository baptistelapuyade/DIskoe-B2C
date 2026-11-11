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
| MAIL-01 Anmeldecode | Dein Anmeldecode für DISKOE / Your DISKOE sign-in code | hier ist dein Code zum Anmelden: `{Code}` / here is your code to sign in: `{code}` | Direkt anmelden / Sign in directly | Der Code gilt nur für kurze Zeit und nur einmal. Du hast ihn nicht angefordert? Dann kannst du diese Mail ignorieren. Es passiert nichts. / The code works once and only for a short time. Didn't request it? You can ignore this email. Nothing happens. |
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
