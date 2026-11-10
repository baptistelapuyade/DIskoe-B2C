# 12 — Zustandstexte (Katalog, Stand 10.11.2026)

**Status:** Wortlaut und fünf Grundentscheidungen vom Founder freigegeben am 10.11.2026, 11:34 (Standard „Das {Aktion} hat nicht geklappt.“; „Gäste“ statt „Besucher“; Fehlgeschlagen = Fehler, Mail nicht übergeben = Warnung; „verworfen“; Mail-Zusatz immer). Button-Beschriftungen und Mails folgen. Einzige Quelle für Hinweisboxen und Zustandstexte in Profil-, Event- und Founder-Flows. Gilt zusammen mit `09-ux-framework.md` §5.1 (du, Doppelpunkt, kurz, aktiv, Fehler: erst was passiert ist, dann was du tun kannst) und den Mustern in `11-muster-und-zustaende.md`.

## Regeln
1. **Zustandstexte kommen aus diesem Katalog.** Frames tragen die Text-ID im Ebenennamen (z. B. `Z03`). Änderungen zuerst hier, dann in den Frames und im Code (gemeinsames Textverzeichnis mit denselben IDs).
2. **Platzhalter** stehen in `{…}`. Ein Schritt braucht einen eigenen Eintrag nur, wenn der Katalog ihn nicht abdeckt; dann mit Begründung.
3. **Art der Hinweisbox:** Fehler = die Aktion wurde nicht ausgeführt. Warnung = die Aktion ist gelaufen oder noch möglich, aber mit Einschränkung. Info = Erklärung. Erfolg = erledigt.
4. **Immer sagen, was nach einem Fehler gilt** (`{Stand danach}`): was bleibt, was ist öffentlich.
5. **Mails:** „an den Versanddienst übergeben“ steht nie ohne den Zusatz, dass das nicht „angekommen“ heißt (`AGENTS.md`).

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
