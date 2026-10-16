# DISKOE B2C V1 — Produktbeschlüsse Q29–Q36 und S3 (Lesefassung, Stand 2026-10-15)

**Herkunft:** Notion-Seite „Beschlüsse Q29–Q36 & S3 — 15.10.2026 / Claude-Übergabe" (`3fab1cce8b738184ae44d857ecb9b999`), am 2026-10-15 über die Notion-Verbindung direkt gelesen (Seitenstand 2026-10-15 10:41 UTC). Ebenfalls gelesen: die Scope-Seite `3fab1cce8b73812aa1b4e69387f145df` und die S3-Seite `3f9b1cce8b73818e8fb2cc20b325009d`. **Später ebenfalls gelesen (Nachtrag):** Build-Seite, Datenvertrag v0.2/v0.3 und Claude-Übergabe (13:34–13:37 UTC). Der Outcome Brief wurde im Nachtrag nicht erneut gelesen. Es gibt keinen Auto-Sync; diese Datei ist eine manuell erstellte Lesefassung, Notion bleibt für Produktentscheidungen führend.

**Fortschreibung:** Präzisiert und teils ersetzt durch das [Produktdelta v0.4 (16.10.2026)](PRODUCT_DECISIONS_DELTA_V04_2026-10-16.md); die Punkte Q33 (Eventalarm), Q36 (Premium/Plus-Umfang) und das Nachtrags-Versand-Detail bleiben hier unverändert erhalten.

**Einordnung:** Dies sind Produktentscheidungen, **keine Entwicklungsfreigabe**. Designs (D1–D10), technische Spezifikation, Implementierung und reale Validierung stehen aus. Frühere Vorschläge in `SCOPE_EXTENSION_B2C_2026-10-15.md` und `DATA_CONTRACT_B2C_V1_ADDENDUM_2026-10-15.md` bleiben als Historie erhalten; wo sie hier widersprochen werden, gilt dieses Dokument.

**Kennzeichnung:** **[Beschlossen]** = Produktregel. **[Design offen]** = Produktregel steht, Gestaltung/Texte fehlen. **[Technisch offen]** = Werte, Mechanik, Anbieter, Schema nicht festgelegt. **[Schätzung]** = ungeprüft.

## Q29 — Profilmodule und Grenzen [Beschlossen]

- Immer oben: Identität (Projektname, kurze Vorstellung). Bildminimum siehe Q35.
- Direkt darunter: kommende eigene Events, automatisch aus veröffentlichten Events; nächster Termin hervorgehoben. Ohne Termine sinnvoller Leerzustand mit Abo-Möglichkeit.
- Fünf optionale Module: Musik; Bilder/Flyer; Über uns/Manifest; Von uns empfohlen; vergangene Events. Aktivieren/Deaktivieren und Umsortieren untereinander; je Modul nur eine Instanz; keine frei gebauten Spalten, keine zusätzlichen Text-/Galerieblöcke.
- Musik: ein Slot (Anbieter siehe Q31). Galerie: bis zu sechs manuell sortierbare Bilder. Manifest: ein längerer Text mit einfacher Formatierung.
- Empfehlungen: insgesamt bis zu drei Events/Organizerprofile, keine Mindestmenge (siehe Q34).
- Archiv: zunächst sechs vergangene eigene Events, weitere aufklappbar.
- Links/Kontakt: optionaler Bereich am Ende, bis zu fünf offizielle Links und optional öffentliche Kontaktadresse; für das Profilminimum mindestens ein Link oder Kontakt.
- Leere optionale Module werden öffentlich ausgeblendet. Follow ist feste Aktion am Profilkopf, ggf. erneut nach kommenden Events, kein einzurichtendes Modul.

## Q30 — Gestaltung [Rahmen beschlossen; konkrete Designs offen]

- Drei Richtungen auf gemeinsamer Modulbasis: **Poster** (große Typografie, starke Farbflächen, klare Kanten, Flyer prominent), **Editorial** (Freiraum, ruhige Bilder, markante Überschriften, Textgewicht), **Mixtape** (kompakte gerahmte Module, persönliche Kommentare, Musik/Bilder, Inspiration früher persönlicher Kulturwebseiten).
- Alle Module in allen Richtungen; keine zielgruppenabhängige Funktionsbeschränkung; Reihenfolgegrenzen aus Q29.
- Sechs kuratierte Farbpaletten je Richtung plus eigene Hintergrund-, Text- und Akzentfarbe; Lesbarkeitsprobleme anzeigen und vor Veröffentlichung korrigieren.
- Drei vorgegebene Schriftkombinationen je Richtung; keine Schriftuploads, keine beliebigen Schriftgrößen.
- Nur einfarbige Hintergründe in der Alpha; keine fertigen Muster, kein ganzseitiges eigenes Hintergrundbild. Muster höchstens spätere, unbeschlossene Premiumoption.
- Cover/Anzeigebild mit mobiler Zuschnittvorschau. Keine separaten Farben/Schriften/Rahmen pro Modul.
- Stilwechsel als privater Entwurf mit mobiler Vorschau und expliziter Veröffentlichung; Inhalte und Modulreihenfolge bleiben erhalten.
- Kein Autoplay, keine blinkenden Effekte, keine frei einstellbaren Animationen.
- **Ersetzt:** frühere automatische Vererbung des Profilstils auf Eventseiten (siehe Q35) und die frühere Aussage „begrenzte Hintergrundoptionen" (nun nur einfarbig).

## Q31 — Musik [Beschlossen; Funktion in der Alpha zu prüfen]

- Ein optionaler Musikslot je Profil, wahlweise SoundCloud oder Spotify; öffentlicher Link genügt, keine Kontoverknüpfung. SoundCloud: Track/Mix/Playlist; Spotify: Track/Album/Playlist. Andere Anbieter nur als normale offizielle Profil-Links.
- Optionale Überschrift und persönlicher Kommentar; Vorschau vor Veröffentlichung.
- Offizieller Anbieterplayer, kein Autoplay. Zunächst DISKOE-Platzhalter; externe Inhalte erst nach bewusster Aktivierung mit Hinweis auf die Anbieter-Verbindung.
- Externer Öffnen-Link als Fallback; nicht einbettbare/entfernte Inhalte blockieren die Profilveröffentlichung nicht.
- Nur öffentliche, zur Einbettung freigegebene Inhalte; Künstler/Quelle erkennbar. Keine Audio-Uploads/-Kopien, keine beliebigen fremden Embed-Codes. Keine vollständige Spotify-Wiedergabe versprechen.
- Keine Musikfunktion für einzelne Eventseiten durch Q31 beschlossen.
- **[Technisch offen]:** konkrete Medien-/Datenschutzhinweise, Anbieterbedingungen, Verhalten in echten Browser-/Geräteumgebungen.
- **[Schätzung]** Spotify-Zusatzaufwand grob 4–8 Stunden gegenüber vorhandenem gemeinsamen SoundCloud-Slot; ungeprüft, kein Codeaudit, kein Terminversprechen.

## Q32 — Follow-Zweck und Einstieg [Beschlossen]

- Zweck: neue veröffentlichte eigene Events eines Organizerprojekts per E-Mail erhalten. Sichtbare Aktion: „Neue Events per E-Mail erhalten".
- Nur E-Mail-Adresse, kein Consumerkonto/Passwort; Abos verleihen keine Organizerrechte.
- Aktives Abo erst nach Bestätigungslink. Verwaltung der eigenen Projektabos und Abmeldung aus jeder Update-Mail; Verwaltung über zeitlich begrenzten E-Mail-Link.
- Organizer sehen zunächst die bestätigte Aboanzahl, keine Adressliste, keinen Export.
- Anmelde-/Bestätigungsversuche werden begrenzt; keine mehrfach aktiven Abos derselben Adresse zum selben Projekt.
- DISKOE-Newsletter und Werbung sind separate Anmeldungen, nicht Teil des Projektabos.

## Q33 — Versand, Änderungen und Absagen [Beschlossen; Versandwerte durch Nachtrag 2026-10-15 beschlossen]

- Neue veröffentlichte Events bis zum nächsten täglichen Versand sammeln; höchstens eine reguläre Ankündigung je Organizer innerhalb von 24 Stunden; mehrere Events gemeinsam.
- Tippfehler, Beschreibung, Flyerwechsel: keine weitere Mail.
- Änderung von Datum, Beginn oder Ort bei bereits angekündigtem Event: gesondertes Update an damalige Empfänger, sofern beim Versand noch aktiv abonniert; kurz bündeln, um Korrekturserien zu vermeiden.
- Absage nach expliziter Bestätigung zeitnah an dieselbe berechtigte Empfängergruppe; Eventseite mit deutlichem Absagehinweis bleibt erreichbar.
- Entfernung ist nicht automatisch Absage: Grund klären, bei bereits angekündigtem Event auf erforderliches Änderungs-/Absageupdate hinweisen.
- Vor Veröffentlichung Versandfolge anzeigen; bei wichtigen Änderungen Hinweis auf Benachrichtigung bisheriger Empfänger.
- Ein Event je Abo nur einmal als neu ankündigen; Speichern oder Zurückziehen/Wiederveröffentlichen setzt das nicht zurück. Vor erstem Versand zurückgezogene/abgesagte Events werden nicht neu angekündigt.
- Neues Abo: Bestätigung und Link auf kommende Events, keine nachträgliche Reihe alter Ankündigungen. Empfehlungen anderer Inhalte lösen keine Update-Mail aus.
- Kein vollständiger Eventalarm: spätere Abonnenten und reine Seitenbesucher erhalten Korrekturen zu zuvor versandten Events nicht automatisch. Mehrere Projektabos können mehrere Mails ergeben; projektübergreifender Digest später prüfen.
- Reguläre 24-Stunden-Grenze und gesonderte wichtige Updates unterscheiden.
- **[Technisch offen]:** Versandzeit, Zeitzone, Bündelungsfenster, kurzfristige Events nahe Veranstaltungsbeginn, Zustände, Sperren, Zustellversuche, Deduplizierung. Keine Werte erfinden.

## Q34 — Empfehlungen und persönliche Einladungen [Beschlossen]

- Bis zu insgesamt drei veröffentlichte DISKOE-Events oder Organizerprofile, manuell sortierbar; persönlicher kurzer Kommentar je Empfehlung erforderlich; Urheber erkennbar; keine gegenseitige Empfehlung suggerieren.
- Empfehlender Organizer bestätigt die Veröffentlichung; empfohlene öffentliche Ziele brauchen keine zusätzliche Freigabe. Eigene Inhalte sind im Empfehlungsmodul nicht auswählbar.
- Vergangene Events nach Ende, abgesagte und entfernte Ziele öffentlich ausblenden; im Editor Hinweis/Status, Ersatz manuell wählen, keine automatische Ersatzempfehlung.
- Fehlt ein Ziel auf DISKOE: externen Link und optional Projektnamen privat vormerken; persönlichen Einladungslink und editierbaren Erklärungstext erzeugen. Der Organizer versendet selbst über Teilen/Kopieren. Kein DISKOE-E-Mail-Versand an fremde Organizer in der Alpha, kein Kontaktimport.
- Einladung erklärt Empfehlungsanlass und eigenen Produktnutzen; kein öffentliches Fremdprofil/Fremdevent aus externem Link.
- Nach Registrierung und Veröffentlichung wird die Verknüpfung vorgeschlagen und vom empfehlenden Organizer bestätigt; bis dahin privat.
- Keine automatischen Erinnerungen an Eingeladene, keine Einladungsbelohnungen.
- Einladung → Registrierung → Veröffentlichung getrennt messen; kein nachgewiesener viraler Effekt.
- **[Design/Datenvertrag offen]:** Zuordnungsmechanik und Einladungszustände.

## Q35 — Profilminimum, Entwürfe, Eventgestaltung [Beschlossen]

- Öffentliches Minimum: Projektname, Kurzvorstellung, eindeutige Profil-URL, mindestens ein offizieller Link oder öffentliche Kontaktmöglichkeit und **ein eigenes Cover oder Anzeigebild**. Ein Bild genügt, beide möglich, kein separates Logo nötig. Ohne Bild privater Entwurf möglich, Veröffentlichung nicht; das letzte öffentliche Bild wird nur durch Ersatz entfernt. Designs müssen mit nur Cover und mit nur Anzeigebild funktionieren.
- **Ersetzt:** frühere vollständige Bildoptionalität für Profile („Logo/Cover optional"). Die Event-Artworkpflicht ist dadurch nicht pauschal geändert; Event-Artwork bleibt wie im bisherigen Eventminimum optional.
- Verifizierte E-Mail und erste interne Prüfung vor Erstpublikation bleiben. Profil ohne Event veröffentlichbar, mit „Neue Termine folgen" plus Abo statt leerem Block.
- Änderungen werden automatisch privat als Entwurf gespeichert; die öffentliche Fassung bleibt bis zur expliziten Veröffentlichung unverändert. Mobile Gesamtvorschau für Inhalt/Module/Gestaltung.
- Profil-URL nach Erstveröffentlichung in der Alpha nur mit Founder-Unterstützung änderbar; geteilte Links bleiben erhalten.
- Profil offline nehmen ist eine separate Aktion mit Auswirkungen auf Events/Abos; keine automatische Eventabsage; reguläre Eventmails pausieren; Umgang mit bestehenden Events wird ausdrücklich gewählt. **[Offen]:** genaue Optionen und Sonderfälle.
- Eventgestaltung wird unabhängig vom Profil gespeichert: eigener Flyer/Cover optional gemäß bisherigem Eventminimum, eigene Farbpalette, vorgegebene Schriftkombination, passende Voreinstellung. Feste Event-Informationshierarchie, kein Event-Moduleditor. „Profilgestaltung übernehmen" ist optionale Starthilfe, keine automatische Bindung.
- Profiländerungen verändern bestehende Eventseiten nicht. Duplizieren übernimmt die Eventgestaltung, danach editierbar. Der verantwortliche Organizer ist auf jeder Eventseite erkennbar und verlinkt.
- Zusätzliche Eventgestaltungsarbeit ist in der neuen Schätzung zu berücksichtigen.

## Q36 — Alpha, Messung, Grenzen [Beschlossen]

- Offene Registrierung ohne festes Testerlimit; 5–8 Organizer nur erste betreute Lerngruppe, kein Zugangslimit, keine maximale Stichprobe. Erstprüfung bleibt; persönliche Einrichtungshilfe nach Bedarf, keine unbegrenzte Einzelbetreuung; bei Engpass transparente Wartezeit, Registrierung/Entwürfe bleiben möglich.
- Beobachtungsfenster zunächst vier Wochen ab ersten öffentlichen Profilen, bei fehlenden Folgeterminen gezielt verlängern.
- Richtwerte sind Lernsignale, keine Beweise oder Go/No-go-Gates: mindestens vier Organizer veröffentlichen und teilen; mindestens drei nutzen das Profil über einen einmaligen Testpost hinaus als öffentlichen Auftritt; mindestens drei veröffentlichen ein zweites reales Event. Mindestens drei schaffen weitere Veröffentlichung ohne persönliche Hilfe.
- Wiederveröffentlichungsnenner: nur Organizer mit einem weiteren anstehenden Event. Founder-Aktionen/Testinhalte zählen nicht als selbstständige Nutzung. Onboarding, Erstprüfung und spätere Hilfe zeitlich getrennt erfassen.
- Follow: bestätigte externe Abos, Abmeldungen, Rückkehr über spätere Ankündigungen; keine feste Quote bei kleinen Zahlen; E-Mail-Öffnungen sind keine Erfolgsmetrik.
- Empfehlungen: Klicks, Einladungen, Registrierungen, Veröffentlichungen; ein eingeladener veröffentlichender Organizer ist positives Lernsignal, kein zwingendes Kriterium.
- Bei größerer Stichprobe zusätzlich Quoten mit Nennern. Tatsächliches Teilen, Klick/Download, Reichweite, Wiederkehr und Netzwerkeffekte unterscheiden; Ticketklicks sind keine Verkäufe. Organizer sehen nur aggregierte Zahlen, keine individuellen Besucheraktivitäten.
- Unbestätigte Anmeldungen werden nach sieben Tagen gelöscht; Abmeldung stoppt den Versand sofort. **[Offen]:** Aufbewahrung notwendiger Sperr-/Versandinformationen im Betriebskonzept vor Start.
- Aufwand erst nach restlichen Specs, Design-/Bestands-/Providerabgleich neu schätzen. Die alten 6–8 Wochen sind keine Zusage; die frühere Follow-Schätzung (24–40 h) setzte einfachere Versandregeln voraus und ist nicht unverändert belastbar.

**Abgrenzung zum früheren Stand:** Das frühere „Pilot: geschlossene/betreute Berlin-Alpha" ist durch „offene Registrierung ohne Testerlimit, betreute Erstlerngruppe" ersetzt.

## S3 — fünf Detailentscheidungen [Beschlossen]

1. **Mischform für Erfassung und Rückfragen:** zuerst editierbarer Evententwurf aus Text/Flyer; dann Pflichtlücken/Widersprüche gezielt einzeln klären; danach ungefähr fünf relevante Zusatzfragen, bei Bedarf mehr, ohne starre Quote. Einzelfragen mit Nutzenhinweis, einfache Auswahl/Mehrfachauswahl/Freitext. Überspringen, unbekannt, nicht zutreffend unterscheiden; keine vorausgewählten unbestätigten Fakten. Jederzeit vollständige Formularansicht, Eingaben bleiben, manueller Fallback, gemeinsame Abschlussvorschau mit markierten Pflichtlücken. Zusatzinformationen sind Kern des Katalogaufbaus; Freiwilligkeit ist eine zu validierende Hypothese. Je Frage Beantwortung/Überspringen/Korrekturen/Abbruch/Zeit messen; „Unbekannt" ist keine verwertbare Antwort. Discovery-Minimum bleibt offen.
2. **Erneute Nachfrage:** bewusst unbekannte Angaben im selben Vorgang nicht erneut fragen; später nur auf Nutzerwunsch, bei neuen widersprechenden Informationen oder beim nächsten Event bei eventspezifischen Antworten. Bestätigte dauerhafte Projekt-/Ortsangaben wiederverwenden und korrigierbar halten; keine stille Übernahme eventabhängiger Fakten.
3. **Räumliche Zugänglichkeit:** zuerst Zugang zum Veranstaltungsbereich (stufenlos / nur über Stufen / teilweise stufenlos / unbekannt), bei teilweise erreichbare/nicht erreichbare Bereiche erklären; passende Folgefragen: rollstuhlgerechtes WC (vorhanden/nicht vorhanden/unbekannt), optional Aufzug, Rampe, benötigte Hilfe, Rückfragekontakt. Ortsangaben für den konkret genutzten Bereich bei Folgeevents erneut bestätigen. Keine allgemeine Publikationspflicht, keine Gleichsetzung fehlender Daten mit unzugänglich, kein umfassendes Barrierefreiheitslabel. Öffentlich konkrete bestätigte Angaben, sonst „Keine bestätigten Angaben zur Zugänglichkeit", ggf. Kontakt. Sitzmöglichkeiten, Reizarmut, Sprachzugang getrennt.
4. **Mischformate:** ein Hauptformat plus mehrere optionale Ergänzungen, gezielte Zusatzfragen statt zweitem Fragebogen; Darstellung etwa „Vernissage mit anschließendem DJ-Set", Unterschiede bei Beginn/Zugang/Kosten sichtbar. Zusammengehöriger Besuch = ein Eintrag; unabhängig besuchbare/separat buchbare Angebote = eigene, verlinkte Einträge (Art der Verlinkung **offen**). Live/DJ, Offspace/Vernissage, Film und Kombinationen unterstützt, Film ohne festen Alphaanteil. Weitere Formate bei echtem Bedarf mit Daten-/Fragenprüfung; kein Universalformatumfang.
5. **Alpha-Auswertung des Fragenpools:** wöchentlich qualitativ prüfen, Änderungen versionieren; Missverständnisse → Formulierung/Optionen; häufiges Überspringen → Relevanz/Zeitpunkt/Aufwand; Antworten bereits im Material → Extraktion; nur für Teilgruppe relevant → selektiv; ohne Besucher-/Discovery-Nutzen → aus dem aktiven Pool nehmen und dokumentieren; unverzichtbare Besuchsinformation → Publikationspflicht ausdrücklich prüfen; Matchinginformation → Discovery-Eignung prüfen. Keine automatischen Prozentgrenzen, keine stillen neuen Pflichtfragen. Die 32 Fragen und vier fiktiven Fälle bleiben Grundlage und gelten nicht als real getestet.

## Nachtrag 2026-10-15 — Discovery-Grundlogik, Versand, Atmosphäre, Listening, Einladungen, Löschung, Fristen [Beschlossen]

**Quellen:** Notion-Seiten „Claude-Übergabe — Datenvertrag v0.3 & Abschlussbeschlüsse / 15.10.2026" (`3fab1cce8b7381bc8f9bd5915138d91b`), „B2C-Datenvertrag v0.3" (`3fab1cce8b73810799acd5a04ee72327`), „B2C-Datenvertrag v0.2" (`3fab1cce8b7381efbf71ce1bf718d89d`), „S3 — Formatabhängiger Fragenpool" (`3f9b1cce8b73818e8fb2cc20b325009d`), Beschlussseite (`3fab1cce8b738184ae44d857ecb9b999`), Build-Seite (`3f9b1cce8b73813285dcd1df4ab0cbd5`) und Scope-Seite (`3fab1cce8b73812aa1b4e69387f145df`), am 2026-10-15 direkt gelesen. Die Punkte unten präzisieren Q32–Q36 und S3; wo sie Q33 präzisieren, gilt dieser Nachtrag.

- **Versand (präzisiert Q33):** regulär täglich 10:00 Europe/Berlin, höchstens eine reguläre Ankündigung je Organizer in 24 Stunden. Kurzfristige Ausnahme: Die erste kurzfristige Publikation startet ein festes 15-Minuten-Fenster, das nicht verlängert wird; weitere kurzfristige Batches nach dem Versand sind zulässig. Tagesmail und kurzfristige Ankündigung nur ohne Verspätung zusammenführen.
- **Änderungen (präzisiert Q33):** Vor der Erstankündigung wird der aktuelle bestätigte Stand gesendet, keine Korrekturmail. Absage oder Rücknahme vor dem Erstversand entfernt das Event; eine leere Mail entfällt. Neuer Termin wird neu geplant; ohne Termin keine Erstankündigung. Wichtige Änderungen von Datum, Beginn oder Ort werden in einem festen 15-Minuten-Fenster gebündelt; zurückgenommene Änderungen werden nicht gemeldet; eine Absage ersetzt eine wartende Änderung. Übergabe an den Anbieter ist nicht Zustellung.
- **Profilpause (präzisiert Q35):** Bestehende Events bleiben bewusst öffentlich oder werden zurückgenommen. Neue reguläre Mails, Profilabos und Einladungen pausieren; wichtige Korrekturen an berechtigte frühere Empfänger bleiben möglich. Rückkehr ohne automatische Nachsendung. Offline-Absender bei verbleibender Eventseite: Name und neutraler Profillink, keine Neuanmeldung.
- **Follow (präzisiert Q32):** Private Kontakte, Abos und Versandnachweise getrennt führen. Zustellbarkeit ist nicht Einwilligung. Der aktive Zustand wird vor jedem Versuch geprüft. Einzel- und Alle-Abmeldung; alte Links reaktivieren nichts.
- **Discovery-Grundlogik (ergänzt Q33/Q35):** Grundvoraussetzungen sind ein öffentlicher, bestätigter, freigegebener Eventstand, der nicht gesperrt, entfernt, abgesagt oder archiviert ist, ein gültiger bestätigter Termin und Ort, verständlicher Titel, Beschreibung und Hauptformat, keine ungelösten kritischen Widersprüche und ein **freigegebenes Eventbild**. Die reine Eventpublikation bleibt ohne Bild möglich. Ein Platzhalter ist nicht beschlossen; ein Profilbild wird nicht still als Eventbild verwendet. Harte Suchbedingungen nur mit passenden bestätigten Angaben; weiche Passung nur belegt; kein Feldmengenbonus. Consumer-Webapp und Ranking sind eine spätere eigene Entwicklungsphase nach Organizerlaunch und Katalogaufbau und nicht Teil des Alpha-Aufwands. Startmaßstab ist die Suchabdeckung; Schwellen offen.
- **Atmosphäre (neue Publikationspflicht):** Mindestens ein bestätigter Begriff (höchstens drei) oder eine eigene kurze bestätigte Beschreibung. Energie und soziale Interaktion bleiben optional. Keine KI-Vorauswahl gilt als Bestätigung. Fragenpool um B13 ergänzt; der Pool umfasst jetzt 33 Fragen.
- **Listening-Session:** Musikalisches Konzept und Besuchsmodus sind Pflicht.
- **Hauptformate (vorläufig für die Alpha):** Konzert, DJ-Set, Party/Clubabend, Listening-Session, Vernissage, datierter Ausstellungsabend/Offspace, Filmabend. Ergänzende Programmteile bleiben getrennt. Ein unpassendes Format wird als Entwurf zur Klärung geführt, nicht als universelles „Sonstiges" publiziert.
- **Zeit, Ort und Kosten (Vertragsregeln; Details im Datenvertrag v0.3):** Offenes und unbekanntes Ende sind unterschiedlich; ein Besuchsfenster; Einlass separat; Europe/Berlin; ein interner Archivcutoff ist kein Eventende. Zugangswege sind kombinierbar. Koordinaten werden aus der Adresse ermittelt; bei ungenauer Zuordnung ist die Distanzsuche aus, die Seite wird aber nicht automatisch blockiert.
- **Einladungen (präzisiert Q34):** Link 30 Tage gültig; ein erneuerter Link deaktiviert den alten. Ein Zielprojekt je Einladung; bestehendes Profil nutzen. Der Link gibt keine Rechte und keine Publikation. Fehlzuordnung ist aufhebbar. Verworfene Einladungen sind sofort ungültig und werden nach 30 Tagen gelöscht; offene Vorgänge werden nach 90 Tagen zur Bereinigung angeboten, unabhängig vom Linkablauf.
- **Löschung (Founder-Support in der Alpha):** Endgültige Event- und Kontolöschung läuft über den Founder-Support. Öffentlich zurücknehmen ist nicht endgültig löschen. Gemeinsam genutzte Orte und Medien anderer Projekte bleiben erhalten. Bevorstehende angekündigte Events werden vorher geklärt.
- **Produktfristen:** Unbestätigtes Abo 7 Tage; Erfassungsrohmaterial 30 Tage nach Veröffentlichung (öffentliche Medien ausgenommen); private Evententwürfe 90 Tage Inaktivität, danach 30 Tage Frist nach Erinnerung (Vorlagen ausgenommen); verworfene Einladungen 30 Tage; Fehlerlogs 30 Tage; individuelle Analytics 90 Tage; Backupziel höchstens 30 Tage, Anbieterfähigkeit offen. Aktive Abos und gewünschte öffentliche Archive werden nicht wegen Inaktivität gelöscht. Details: [Datenvertrag v0.3, Abschnitt 13](DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md).
- **Startvoraussetzungen (nicht beschlossen, vor produktiver Verarbeitung klären):** Nachweis-, Sperr- und Versanddaten; nie publizierte oder verwaiste Uploads; alte Inhaltsversionen; Backup- und Löschfähigkeit des Anbieters; Einwilligungs- und Freigabetexte.

## Weiter offen (keine pauschale Spec-Abnahme)

- Discovery-Suchdetails (Suchabdeckung, Schwellen, Erklärungstexte) und Gesamtabnahme des typisierten Datenvertrags v0.3 (Entwurf: `DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md`). **Nächste fachliche Aufgabe.**
- Konkrete Medien-/Einwilligungs-/Freigabetexte, Aufbewahrung/Löschung.
- D1–D10 mobile Designs einschließlich Eventgestaltung, Follow und Einladungszustände.
- Einladungszuordnung-Details und Offline-/Entfernungszustände. Versandzeit, Zeitzone und Kurzfristfälle sind im Nachtrag beschlossen; die Zustellmechanik bleibt offen.
- Tatsächlicher lokaler Bestand, Architektur, Anbieter, Sicherheit, Betrieb, Messschema, Pilotorganisation, neuer Aufwand.
- Nicht freigegeben: App, DB, Migrationen, Abhängigkeiten, Deployment, Billing, Update-Mails.

## Abnahmekriterien (Vorschlagsstand bis zur Design-/Detailfreigabe)

Aus der Scope-Seite übernommen und an die Beschlüsse angepasst; sie sind keine nachgewiesenen Ergebnisse.

- Mit minimalen Inhalten (Name, Kurzvorstellung, ein Link/Kontakt, ein Bild) entsteht in jeder der drei Richtungen ein brauchbares mobiles Profil. Logo, Musik, Galerie, Manifest sind keine Publikationspflicht; ein fehlendes Bild blockiert die Profilveröffentlichung.
- Modulwechsel/Umsortierung verlieren keine Inhalte; private Änderungen bleiben privat; veröffentlichter Stand und Vorschau sind unterscheidbar.
- Eventgestaltung ist unabhängig; Profiländerungen verändern bestehende Eventseiten nicht. Datum, Ort, Kosten, Zugang und Ticket-/RSVP-Aktion bleiben in allen Designs auffindbar; Fakten/Publikationsregeln ändern sich nicht durch das Design.
- Nicht ladbarer/entfernter Musikinhalt blockiert weder Profil noch Event; Linkfallback; kein Autoplay; externe Inhalte erst nach Aktivierung.
- Empfehlungen zeigen Urheber und Kommentar, trennen eigene Angebote, verschwinden bei ungültigen Zielen; leere Sammlung erzeugt keinen erfundenen Inhalt; Einladungen bleiben privat bis bestätigte Verknüpfung.
- Nur bestätigte aktive Abos erhalten Updates; Bestätigen, Verwalten, Abmelden funktionieren; Wiederholung löst keine doppelte Ankündigung aus; Entwürfe, zurückgezogene und gesperrte Veröffentlichungen erzeugen keine Updates; kein Versand vor vollständiger Bestätigungs-/Abmeldestrecke.
- Messung trennt Profilverwendung, Gestaltungswiederverwendung, bestätigte Abos/Wiederkehr, Empfehlungswirkung und Betreuungsaufwand; Ticketklicks sind keine Verkäufe; Korrelationen sind kein Netzwerkeffekt-Nachweis.
