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
| Z03 | Aktion fehlgeschlagen | Fehler | Das {Aktion} hat nicht geklappt. | {Stand danach} Versuche es noch einmal. | Aktion (Speichern, Senden, Hochladen, Laden, Veröffentlichen, Absagen, Verschieben, Eintragen, Austreten, Sperren, Entsperren, Einreichen, Zurückziehen) |
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

## Englische Fassung (Vorschlag 10.11.2026, Claude; Founder prüft)
Gleiche IDs, gleiche Regeln (Ton: du → „you“, kurz, aktiv; Fehler: erst was passiert ist, dann was du tun kannst). Die Gerundien in `{Action}` entsprechen den deutschen Aktionen.

| ID | Line 1 | Line 2 | Placeholders |
|---|---|---|---|
| Z01 | Please check {one entry / two entries / n entries}. | One field: `{reason}` („The title is missing.“). Several missing: „The marked fields are still missing.“ Several invalid: „The marked fields aren't right yet.“ | count, reason |
| Z02 | {Object} is being {saved / uploaded / sent} … | This takes a moment. Stay on this page for a bit. | object, verb |
| Z03 | {Action} didn't work. | {State afterwards} Try again. | Action (Saving, Sending, Uploading, Loading, Publishing, Cancelling, Rescheduling, Signing up, Leaving, Suspending, Unsuspending, Submitting, Withdrawing) |
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
| merken, „Gemerkt (n)“ | save, „Saved (n)“ | **Offen:** „Save“ kollidiert mit „Speichern“ in Formularen („Save changes“). Vorschlag: „Save event“ / „Saved“ für die Merkliste, „Save changes“ für Formulare; Founder entscheidet. |
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

## Nicht erfasst
Button-Beschriftungen, Mails (`MAIL-01` bis `13`), Leere Zustände und Dialogtexte ohne Hinweisbox. Sie folgen nach der Freigabe dieses Katalogs.
