# DISKOE B2C V1 — Produktdelta v0.4 (Lesefassung, Stand 2026-10-16)

**Herkunft:** Notion-Seite „B2C-Datenvertrag — Delta v0.4: Plus Alpha, Besucher, Kommunikation & Feedback" (`3fbb1cce8b7381febf80e46a435c7667`, Seitenstand 2026-10-16 11:42 UTC), vollständig über die Notion-Verbindung gelesen einschließlich Abschnitt 14 (Abschließende Produktbeschlüsse) und Abschnitt 15 (Ergänzte Abnahmefälle). Die Notion-Seite meldet `verification: unverified`; diese Datei ist eine manuell erstellte Lesefassung ohne Auto-Sync. Notion bleibt für Produktentscheidungen führend.

**Einordnung:** Produktbeschlüsse, **keine Entwicklungsfreigabe**. Keine Designs, keine technische Typisierung, keine Umsetzung, keine ausgeführten Tests. Abschnitt 15 sind schriftliche Spezifikationsfälle.

**Verhältnis zu den anderen Dokumenten:**
- Q29–Q36/S3 ([Lesefassung 15.10.](PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md)) und Datenvertrag v0.3 ([Entwurf](DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md)) bleiben vollständig erhalten. Dieses Delta **präzisiert oder ersetzt** nur die unten in Abschnitt 3 genannten Punkte.
- Alt-Spezifikationen (Scope-Vorschlag, Addendum A1, Datenvertrag v0.1) bleiben Historie und sind nicht maßgeblich.

**Kennzeichnung:** **[Beschlossen]** = Produktregel. **[Vorschlag]** = Ableitung im Repo, noch nicht von Notion bestätigt. **[Design offen]** / **[Technisch offen]** / **[Offen]** = siehe Text.

---

## 1. Paket und achtwöchiger Testzugang (S10) [Beschlossen]

- Paket gehört zum Organizerprojekt; Besucherfunktionen sind nicht paketabhängig.
- Gebuchtes Paket, zeitlich begrenzte Testfreigabe, **effektiver Funktionszugang** und Buchungs-/Zahlungsstatus sind getrennte Zustände. Ein kostenloser Test ist kein zahlendes Abo.
- **Plus Alpha** ist der erste Paid-Test; **Pro** bleibt Roadmap. Preise: 19 EUR/Monat (Plus) und 39 EUR/Monat (Pro) sind **Hypothesen**; keine validierte Zahlungsbereitschaft. Brutto/Netto und Angebotsbedingungen sind offen; 19 EUR gilt nach Abschnitt 14.7 als zu testender sichtbarer Endpreis.
- Der Founder startet den Test ausdrücklich, sobald der zugesagte Umfang nutzbar ist. Acht Wochen je Projekt, möglichst zwei echte Durchläufe; Verlängerung manuell und nachvollziehbar.
- Zugesagten Testumfang gemeinsam aktivieren; keine laufenden Einzelfristen pro Funktion.
- Im Organizerbereich stehen Testumfang, Enddatum und vorgesehener anschließender Preis. Sieben Tage vor Ende und am Enddatum wird informiert.
- Ohne aktive Buchung nach Testende: Free, **keine automatische Zahlung**. Manuelle Anfrage bzw. Rechnung genügt. Kündigung stoppt die Verlängerung; der Zugang endet erst mit dem vereinbarten bezahlten bzw. Testzeitraum. Mahn- und Zahlungsausfallregeln leiten sich daraus **nicht** automatisch ab.
- Konkrete KI-/Versandkontingente sind [Offen]; nichts unbegrenzt versprechen.

## 2. Alpha-Matrix Free / Plus Alpha [Beschlossen]

| Bereich | Free | Plus Alpha |
|---|---|---|
| Profil/Events | Drei Basisrichtungen, eigene Basisfarben, modulare Basis, manuell erstellen/duplizieren | Eigene gespeicherte Eventvorlagen; zusätzliche Premiumdesigns **nicht** als Alpha-Pflichtumfang |
| KI | Material/Text/Flyer zu editierbarem Entwurf, Pflichtlücken/Zusatzfragen, manueller Fallback | Aktive Textoptimierung und wiederholte Varianten; keine still entfernte Free-Erfassung |
| Auffindbarkeit | Indexierbare Seiten, bestätigte strukturierte Daten, Grundmetadaten | Zusätzliche sprachliche Optimierung/Vorschläge; keine Sichtbarkeitsgarantie |
| Sharing | Öffentliche Links, Linkvorschau, Kopieren/normales Teilen inkl. WhatsApp; eigenen Flyer nutzen | Vorbereitete Nachrichtentexte/Varianten und QR-Download im Kommunikationspaket; automatische Bildgenerierung **nicht** zugesagt |
| Kommunikation | Automatische neue Organizer-Eventhinweise, wichtige Änderungen/Absagen | Eigene eventbezogene Nachrichten an separat berechtigte Empfänger |
| Besucher | Privates Merken, Kalenderexport, Organizerabo und Eventänderungsabo | Besucherbasis nicht vom Organizerpaket abhängig |
| Feedback | Keine neue Befragung; bestehende Ergebnisse nach Downgrade lesbar/exportierbar | Eine kurze Befragung je Event mit optional einer Zusatzfrage |
| Analytics | Aufrufe, Ticketlink-Klicks, bestätigte Follower | Zeitlicher Verlauf/Quellen, markierte Links, eigene Nachrichten, Feedback |
| Verwaltung | Ein Verwaltungszugang | Ein Verwaltungszugang; Team/Mehrtermin/Automationsfolgen später Pro |

**Ausdrückliche Änderungen gegenüber früher:** Vorbereiteter Nachrichtentext und QR-Download waren früher Free und sind nun Plus. Automatische neue Eventhinweise und Korrekturen bleiben Free. Eigene zusätzliche Nachrichten sind separat. Ein generiertes Bildformat ist aus dem Plus-Alpha-Paket entfernt; es kann optional manuell auf echte Nutzung geprüft werden, ohne Kosten- oder Buildzusage. Kein automatischer WhatsApp-Versand. Keine Teamrechte oder Pro-Umsetzung durch die Paketmatrix.

## 3. Downgrade und Premiumgestaltung [Beschlossen]

- Öffentliche Profile, Events und optimierte Texte bleiben bestehen und sind Free bearbeitbar. Normales Eventduplizieren bleibt Free und kann vorhandene gute Texte übernehmen.
- Eigene Vorlagen bleiben gespeichert und einsehbar; Anwenden und Neuanlegen nur Plus.
- Fertige Kommunikationspakete (Texte, QR, freigegebener Flyer) bleiben zugänglich und herunterladbar. Neue Generierung oder Aktualisierung nur Plus; veraltete Fassungen werden markiert.
- Eigene Nachrichtenentwürfe bleiben erhalten; Bearbeitung und Versand sind gesperrt. Noch nicht an den Anbieter übergebene Sendungen werden gestoppt. Automatische Free-Updates laufen weiter.
- Vorhandene Plus-Auswertungen für den bisherigen Zeitraum bleiben innerhalb der geltenden Aufbewahrung lesbar; neue detaillierte Plus-Auswertungen pausieren. Free-Grundzählungen laufen weiter.
- Gestartete Befragungen laufen bis zum zuvor festgelegten Ende; keine Verlängerung und keine neue Befragung ohne Plus. Ergebnisse bleiben lesbar und exportierbar.
- Bei erneutem Plus keine automatische Veröffentlichung, Nachsendung oder Wiederöffnung. Vorlagen und Entwürfe sind nutzbar; der Premiumstil wird bewusst reaktiviert.
- Exklusive Designoptionen brauchen aktiven Zugang. Öffentlich wird nach Ende auf einen gültigen Free-Ersatz zurückgestellt; gespeicherte Plus-Einstellungen werden nicht gelöscht. Die Auswahl kennzeichnet die Ablaufwirkung von Anfang an; Ersatz vor Ablauf vorschauen und ändern lassen.
- Ersatz ist standardmäßig die letzte gültige Free-Gestaltung. Fehlt diese, ist ein gültiger Free-Default explizit vorzusehen (konkrete Auswahl im Design [Design offen]).
- Premium-Eventgestaltung ist vom Profil getrennt und hat einen eigenen Free-Ersatz je Event. Inhalte, Bilder und Module werden nicht als Downgrade-Strafe gelöscht. Premiumdesigns gelten nicht als neuer verpflichtender Alpha-Umfang.

## 4. Besuchsidentität, private Merkungen und Kalender (S11) [Beschlossen]

- Merken auf der Eventseite; wiederholter Klick erzeugt keine Dublette.
- Ohne Anmeldung wird auf diesem Gerät gespeichert, mit Hinweis auf die Gerätebindung. Kein serverweiter Personenbezug aus einer unbestätigten E-Mail.
- Optionaler E-Mail-Code für geräteübergreifenden Zugang; die lokale Auswahl wird nach Bestätigung übernommen. Die genaue Zusammenführung bestehender Merkungen wird im technischen Entwurf dedupliziert [Technisch offen].
- Kein Organizerprofil nötig; Besucherzugang verleiht keine Organizerrechte. Dieselbe E-Mail ist nicht automatisch Berechtigung für beliebige Organizerprojekte.
- Eine private Merkliste; keine benannten Sammlungen, kein öffentliches Teilen der gesamten Auswahl in der Alpha. Einzelne Eventlinks sind teilbar.
- Merkverbindung: Eigentümer, Event-ID, Zeitpunkt. Keine Marketingeinwilligung, kein Besuchsnachweis, keine öffentliche Zusage. Organizer erhalten keine Merker-Personenliste.
- Jederzeit entfernbar. Vergangene oder abgesagte Inhalte werden klar markiert; zurückgenommene ohne öffentliche Details.
- Einzelnes Event als Kalenderdatei exportieren. Änderungen aktualisieren eine bereits heruntergeladene Datei nicht automatisch.
- Auth-Token, Kontakte, Besucherkonto und Abos werden technisch kompatibel verknüpft, aber Zwecke und Rechte bleiben getrennt. Lebenszyklus lokaler Speicherung und Accountlöschung ist [Offen].

## 5. Abos, Präferenzen und Eventänderungsabo (S9) [Beschlossen; Designs und Zustellung offen]

- Alpha: Organizerabo nach den bisherigen Free-Regeln und neues einzelnes **Eventänderungsabo**. Reihenabo ist ein späteres Produktziel ohne Alpha-Oberfläche; das Modell bleibt erweiterbar, aber es wird keine vollständige Reihenabofunktion vorbereitet.
- Organizeranmeldung hat zwei getrennte Zwecke: neue Events und wichtige Änderungen sowie zusätzliche Eventnachrichten. Zusätzliche Nachrichten sind freiwillig, nicht vorausgewählt und getrennt verwaltbar und abmeldbar.
- Bestehendes Eventabo oder Projektabo wird nicht still für neue Zwecke verwendet. Weitere Newsletter und allgemeine Werbung brauchen eine separate Anmeldung.
- Aktion auf der Eventseite: „Über Änderungen informieren“, mit bestätigter E-Mail. Nur Termin, Beginn, Ort, Verschiebung und Absage; keine Erinnerung, kein Feedback und keine Organizerwerbung aus dem Eventabo.
- Das Eventabo ist eine ausdrückliche neue berechtigte Empfängergruppe: Man kann nach der ursprünglichen Organizerankündigung beitreten und künftig Änderungen dieses Events erhalten. *Präzisierung zu Q33:* Ein Beitritt ist eine bewusste Handlung und kein automatischer Eventalarm.
- Gleiche Aktualisierung an dieselbe bestätigte Adresse über Organizer- und Eventabo nur einmal. Getrennte Abos und Zwecke werden nicht durch Deduplizierung gelöscht oder verschmolzen.
- Merken ist unabhängig; es erfolgt keine automatische Anmeldung.
- Ende des Events beendet die regulären Eventupdates. Die genaue Behandlung von Archivcutoff, verschobenem Termin, Nachweisen und Löschung ist in der Lebenszyklusmatrix zu prüfen [Offen]. Kein pauschaler Anspruch auf fortlaufende E-Mails nach abgeschlossenem Event.
- Abmeldung je Ziel und Zweck sowie Beendigung aller Abos. Bestehende Sicherheit, Bestätigung und Prüfung vor Versand sowie die Abmeldewirkung bleiben erhalten.

## 6. Eigene Nachrichten, Empfänger und Limits (S12) [Beschlossen; Kontingente technisch offen]

- Zulässig sind Einladung, Erinnerung oder Programminformation zu einem eigenen veröffentlichten Event. Keine allgemeinen Newsletter oder Fremdangebotswerbung im Alpha-Nachrichteneditor.
- Inhalt: Betreff, Text, Eventkarte/Link, optional bereits freigegebenes Eventbild. Kein Mailbuilder.
- Empfänger: alle für zusätzliche Eventnachrichten berechtigten Projektabonnenten **oder** die entsprechenden früheren Empfänger eines gewählten Events. Die Empfängerberechtigung wird aktuell geprüft.
- Keine Auswahl aus Seitenbesuchen, Merkungen oder vermuteten Interessen. Keine fremden Kontaktlisten; Empfänger sehen keine anderen Adressen.
- Vorschau mit Empfängerzahl und bewusste Sendebestätigung. Nur „Jetzt senden“; keine zukünftige Terminplanung eigener Nachrichten in der Alpha. Ein technischer Wartezustand ist kein frei planbarer Kampagnenversand.
- Limits: **max. eine eigene Nachricht je Projekt und 24 Stunden; max. zwei je Event.** Zwecke und Empfängergruppen teilen dieses Kontingent; keine Umgehung durch Wechsel. Technische und wirtschaftliche Kontingente sind zusätzlich [Offen].
- Automatische neue Eventhinweise sowie wichtige Änderungen oder Absagen zählen nicht als eigene Nachricht. Eigene Textgenerierung sendet nichts.
- Für abgesagte, zurückgenommene oder vergangene Events werden normale Einladungen und Erinnerungen gesperrt. Ausnahme: Feedbackanfrage (Abschnitt 7).
- Kein Plus nach Testende: eigene Sendungen stoppen; Free-Systemupdates laufen weiter.
- Eingang 1: Nachricht erstellen → Event und Zweck wählen (Einladung, Erinnerung, Programminformation, Feedbackanfrage).
- Eingang 2: Event verwalten → Absage, Verschiebung, Datum oder Ort bestätigen → Systemupdate. Kein frei wählbarer Typ „Systemupdate“ im eigenen Editor.
- Absage zeigt Folgen und optional einen kurzen Grund; sie wirkt nach Bestätigung sofort, ohne andere private Änderungen zu veröffentlichen. Keine Pluskontingente.
- Weicht Datum oder Ort im Nachrichteneditor ab, wird zur Eventdatenänderung geführt; öffentliche Seite und Update bleiben konsistent. Wie semantische Konflikte technisch erkannt werden, ist nicht garantiert [Technisch offen].

## 7. Feedback und Feedbackanfrage (S13) [Beschlossen]

- Eine Befragung je eigenem Event, Plus erforderlich.
- Standard: Gesamtbewertung 1–5 (Pflicht). Frage „Was sollten die Veranstalter beibehalten oder verbessern?“ mit optionalem Freitext.
- Optional eine eigene Zusatzfrage: Freitext oder Einfachauswahl mit höchstens fünf Optionen; freiwillige Antwort.
- Nicht gelistete Umfrage ohne Login, Namens- oder E-Mail-Abfrage. Keine garantierte vollständige Anonymität ohne Umsetzungskonzept; Hinweis, keine personenbezogenen Angaben im Freitext einzutragen.
- Kein verifizierter Besuchsnachweis. Weiterleitung ist möglich; die technische Mehrfachbegrenzung garantiert keine eindeutige Person. Schutzdaten und Aufbewahrung sind [Offen].
- Antworten erst nach bekanntem Ende. Bei unbekanntem Ende öffnet der Organizer manuell. Interner Archivcutoff startet keine Befragung.
- Standard: sieben Tage offen, maximal 30 Tage. Start, Ende und Grenze sind in der UI transparent. Das Enddatum ist während Plus innerhalb des Maximums anpassbar; keine Verlängerung nach Downgrade.
- Fragen und Antwortoptionen sind bis zur ersten Antwort editierbar, danach fest. Laufzeitänderungen sind davon getrennt.
- Manuelles Schließen ist möglich; danach keine Antworten mehr. Absage schließt, Rücknahme oder Profilpause pausiert. Reaktivierung nach Pause wird nicht automatisch versprochen [Design offen].
- Der Organizer teilt den Link oder sendet eine eigene Plus-Feedbackanfrage an die aktuell berechtigten Empfänger.
- Die Feedbackanfrage ist eine ausdrückliche Ausnahme nach Eventende, wenn die Befragung offen ist. Sie zählt zu den zwei eigenen Nachrichten je Event und zur 24-Stunden-Grenze; kein zusätzliches Freikontingent.
- Ohne Plus keine neue Feedbackmail; ein bereits erstellter offener Befragungslink kann selbst geteilt werden.
- Ergebnisse sind privat: Anzahl, Bewertungsverteilung, Freitexte und CSV-Export. Laufende oder bisherige Ergebnisse bleiben nach Downgrade lesbar und exportierbar.
- Ergebniszugriff ist nicht gleich Marketingkontakt oder persönliche Teilnehmerliste.

## 8. Assistent und Kommunikationspakete (S12) [Beschlossen; Kontingent-Werte Abschnitt 9]

- Ablauf: Inhalt wählen → Zweck wählen → Vorschlag bearbeiten → verwenden.
- Eventtext kürzen, verständlich umformulieren oder Alternative erzeugen; Kommunikation (Einladung, Erinnerung, Programminfo, Feedback) aus bestätigten Daten.
- Zwei Textvarianten: kurz für Messenger, ausführlich für E-Mail oder Partner. Deutsch oder Englisch; Namen und Fakten bleiben erhalten.
- Paket aus ausgewählten Texten, aktuellem Eventlink, QR-Download und vorhandenem freigegebenem Flyer. Keine zugesagte Bildgenerierung.
- Kopieren, Einzeldateien herunterladen oder im Nachrichteneditor weiterbearbeiten. Kein selbstständiger Versand an Gäste oder Partner; kein Kontaktimport.
- Generierung erzeugt einen Entwurf, aber keine automatische Eventänderung, Veröffentlichung oder Sendung. Veröffentlichung und Versand sind gesondert freizugeben.
- Ausgabe und bestätigte Datenversion werden einander zugeordnet. Bei relevanter Änderung wird die Ausgabe möglicherweise als veraltet markiert; keine unveränderte Aktualität behaupten. Das QR-Ziel (Event-URL) kann aktuell sein, während der danebenstehende Text veraltet ist.
- Neue Fakten werden erst nach Bestätigung der Eventdaten übernommen. Keine erfundenen Claims wie „fast ausverkauft“. Ausgabe ist editierbar; Konflikte werden angezeigt.
- Fehlschlag ist kein erfolgreiches Ergebnis für die Nutzungszählung; Eingabe und letzte brauchbare Fassung bleiben erhalten.
- Nutzungslimits und Kosten nach Anbieterprüfung, nicht unbegrenzt. Die UI zeigt Restnutzung, laufend, Fehler, Wiederholen und gesperrt; konkrete Zahlen sind [Offen].

## 9. Assistentenkontingent [Beschlossen]

- **50 erfolgreiche Läufe je Organizerprojekt und 30 Tage**, gemeinsam über alle Events. Nicht 50 je Event. Ein früher Vorschlag von 35 ist ausdrücklich verworfen.
- Ein bewusst gestarteter Optimierungs- oder Variantenauftrag zählt als ein Lauf; kurze und lange Variante aus einem Auftrag zusammen zählen als ein Lauf. Eine neue Generierung zählt als neuer Lauf und wird vorher angezeigt.
- Fehlgeschlagene Aufträge ohne nutzbares Ergebnis zählen nicht. Manuelles Bearbeiten, Kopieren, Download und QR-Erstellung verbrauchen kein Kontingent. Free-Extraktion und notwendige Rückfragen sind getrennt und verbrauchen kein Plus-Kontingent.
- Zeitraum ab Plus-Testfreischaltung, bei aktivem Zugang nach 30 Tagen erneuert. Testverlängerung setzt keinen Zähler zurück. Restverbrauch und Erneuerungsdatum werden angezeigt.
- Ein erreichtes Limit pausiert die Plusgenerierung; Inhalte, Free-Funktionen und manuelle Funktionen bleiben erhalten; keine automatischen Zusatzkosten.
- Gleichzeitigkeit und Missbrauchsschutz werden separat festgelegt. Wirtschaftlichkeit vor Verkauf prüfen. Upgrade oder Buchung nach dem Test wird nicht still als Bonusreset gewertet; die genaue Periodenführung ist technisch zu normalisieren [Technisch offen].

## 10. Feedbacklaufzeit, Ergebnisse und Lebenszyklus (S13, Abschnitt 14.4) [Beschlossen]

- Sieben Tage ab tatsächlicher erster Öffnung. Bei bekanntem bestätigtem Ende automatisch nur, wenn der Organizer dies vorher aktiviert hat; bei unbekanntem Ende manuell.
- Spätestens 30 Tage nach erster Öffnung schließen; eine Pause verschiebt diese Grenze nicht. Bei Plus ist das Enddatum im erlaubten Rahmen editierbar; nach Downgrade keine Verlängerung.
- Fragen und Antwortoptionen sind nach der ersten Antwort fest; die Laufzeit ist separat änderbar.
- Pro Browser eine Antwort, plus Schutzlimits. Keine Eindeutigkeitsgarantie je Person. Wiederholungs- und Schutzdatenfrist sind technisch zu prüfen [Technisch offen].
- Bei kleinen Mengen werden Antwortanzahl und Verteilung ab dem Anfang gezeigt, klar als kleine Stichprobe gekennzeichnet; keine unbegründeten Trend- oder Vergleichsbehauptungen. Freitexte bleiben privat, da sie Rückschlüsse erlauben können.
- Antworten und daraus berechnete Ergebnisse werden **zwölf Monate nach Schließung** gelöscht. CSV-Export vorher möglich; frühere Löschung über den Support. Produktfrist, keine gesetzliche Vorgabe. Technische Schutzdaten sind kürzer und zweckgebunden separat zu regeln.
- Profilpause oder Eventrücknahme pausiert die Befragung; der Link wird neutral. Rückkehr öffnet nicht automatisch wieder; aktives Plus und noch nicht erreichtes Enddatum sind nötig.
- Pause über das Enddatum hinaus → geschlossen. Downgrade während einer Pause bleibt Pause; Wiederaufnahme erfordert Plus. Bereits durchgehend offene Befragungen laufen nach Downgrade bis zum Enddatum weiter.
- Absage schließt; Rücknahme der Absage öffnet nicht automatisch. Manuelles Schließen ist in der Alpha endgültig (mit Bestätigungshinweis); für eine vorübergehende Unterbrechung dient die Pause.
- Endgültige Eventlöschung deaktiviert den Befragungslink. Antwort- und Nachweislöschung richtet sich nach einem noch zu prüfenden Löschkonzept; es gibt keine Pflicht, alles trotz früherer Löschung zwölf Monate zu halten.

## 11. Merkungen, Kontolöschung und Eventabo-Lebenszyklus (Abschnitt 14.5) [Beschlossen]

- Nach dem Event unter „Vergangen“ behalten, bis der Besucher sie entfernt. Absagehinweis ohne aktive Ticketaktion; Rücknahme neutral ohne Details oder Bilder.
- Verschiebung mit gleicher Event-ID: Merkung und Abo bleiben, keine neue Anmeldung.
- Eventabo endet regulär bei bestätigtem Ende, ohne bekannte Endzeit zum internen Archivzeitpunkt. Der Cutoff ist keine tatsächliche Endzeit.
- Absage oder Verschiebung ohne Ersatztermin: Statusupdate an berechtigte Eventabonnenten. Bei offenem Ersatztermin bleibt das Abo für die spätere Terminbestätigung erhalten. Diese Ausnahme zur regulären Beendigung ist ausdrücklich zu berücksichtigen.
- Merkung entfernen beendet kein separat gewähltes Abo; Hinweis und Abmeldelink.
- Besucherzugang löschen: gespeicherte Merkungen werden entfernt, zugehörige Abos beendet; die Folgen werden vorher gezeigt. Notwendige Nachweise gemäß gesonderter Aufbewahrung.
- Organizerberechtigter Zugang: Eine Besucheraktion löscht das Projekt nicht still; vollständige Kontolöschung über den Support.
- Lokale Merkliste ist löschbar; ohne bestätigten Login keine automatische Synchronisation.

## 12. Messung, Distribution und Downgrade (S-Analytics, Abschnitt 14.6) [Beschlossen]

- **Free:** Gesamtaufrufe von Profil und Event, Ticketlink-Klicks je Event, aktueller bestätigter Projektabostand.
- **Plus:** täglicher Verlauf, erkennbare Quellen, neue Abos und Abmeldungen über die Zeit; Quellenlinks für Kanäle und Partner. Eigene Nachrichten: vom Anbieter angenommene Sendungen, bekannte Fehler, Linkklicks. Kein Öffnungstracking.
- **Plus:** erste Filter nach Zeitraum, Event und Quelllink. Keine Pro-Vergleiche mehrerer Events oder Reihen.
- Öffentliche Anzeige zählt Seitenaufrufe; Reload darf erneut zählen. Keine Unique-Personen behaupten; keine vermeintlich eindeutigen Besucher aus Aufrufen, keine persönlichen Klick- oder Merklisten.
- Vorschau und angemeldete verantwortliche Organizerbesuche werden ausgeschlossen. Anonyme Eigenbesuche sind nicht sicher erkennbar.
- Ticket- oder Anmeldelink: bewusster externer Klick; Mehrfachklick ist keine mehrfache Person und kein Kauf.
- Follower sind aktive bestätigte Organizerabos. Ein zusätzlicher Zweck ist kein zweiter Follower; Eventabos werden getrennt gezählt.
- Markierter Quelllink, sonst erkennbare Herkunft, sonst Direkt/unbekannt. Erkennbare Bots und Linkvorschauen werden möglichst herausgefiltert, ohne Perfektionsgarantie.
- Tagesgrenze Europe/Berlin; Zeitraum und Aktualität sind sichtbar. Eine Messlücke wird nicht als Null dargestellt.
- Nach Downgrade nur Free-Grundzählung; markierte Links funktionieren weiter; neue detaillierte Quellen und Verläufe pausieren. Keine nachträgliche Rekonstruktion der Free-Zeit bei erneuter Buchung.
- Historische Plus-Werte bleiben im geltenden Rahmen lesbar. Wirklich anonyme Aggregate dürfen länger bestehen; Anonymität und Frist werden gesondert geprüft. Kein pauschaler unbegrenzter Zugriff auf personenbezogene Rohdaten.
- Kein E-Mail-Öffnungstracking. Anbieterannahme ist nicht Zustellung.
- Ticketklick ≠ Kauf; Merken ≠ Teilnahme; Feedback ≠ verifizierter Besuch. Erzeugt, kopiert, heruntergeladen, geteilt und geklickt werden getrennt gemessen. Ein Sharingnachweis wird nicht vorgetäuscht.
- Alte 90-Tage-Regel für individuelle Ereignisse wird nicht still verlängert. Downgrade erhält die Quellen- und Linkfunktion. Die genaue Granularität legt das Messschema fest [Technisch offen].

## 13. Konsolidierte Entscheidungen Gemeinsamer Zugang, Vorlagen, Löschung, Preis (Abschnitte 14.1–14.3, 14.7) [Beschlossen]

- **Gemeinsamer Login (14.1):** Ein E-Mail-Code-Login für Besucher und Organizer. Private Merkliste und Abos sind nutzbar; der Organizerbereich nur bei bestehender berechtigter Zuordnung. Besucherregistrierung erzeugt weder öffentliches Profil noch Organizerrechte. Organizer brauchen keinen zweiten Besucheraccount. Lokale Merkungen werden nach bestätigtem Login zur Übernahme angeboten; bestehende werden dedupliziert; keine stille Übernahme für Marketingzwecke. Ein Abo erzwingt keinen vollständigen Besucheraccount; Abmeldung und Verwaltung laufen über einen sicheren E-Mail-Link.
- **Vorlagen (14.2):** Plus, bis zu **fünf benannte Vorlagen je Projekt**, aus einem eigenen Event oder neuem Entwurf. Kein eigener Designer und keine automatische Serie. Wiederkehrende Formate, Beschreibung, Musikkonzept und Atmosphärenvorschläge, Ort, Zugang und Kosten als prüfbare Vorschläge, Gestaltung und wiederverwendbare Medien. Der Organizer legt fest, welche Angaben bei jeder Nutzung neu gefragt werden (z. B. Line-up, Preis, Raum). Datum und Beginn werden neu gesetzt; Titel und aktuelles Programm werden geprüft; eventbezogene Angaben und Medien werden bestätigt; ein neuer privater Entwurf entsteht und wird ausdrücklich veröffentlicht. Alte Absagen, Verfügbarkeit, Freigaben, Empfänger, Versand und Feedback werden nicht übernommen. Eine Vorlagenänderung ändert keine bestehenden Events. Free-Duplizieren bleibt voll nutzbar.
- **Preis (14.7):** Plus 19 EUR/Monat als zu testender sichtbarer Endpreis ohne spätere Überraschungsaufschläge. Steuer- und Rechnungsausgestaltung vor dem Verkauf prüfen. Acht Wochen kostenlos ohne Zahlungsdaten, ohne Autozahlung und ohne Autoumwandlung.
- **Anfrage:** Button „Plus anfragen“ → konkretes Angebot mit Umfang, Preis und Laufzeit → ausdrückliche Annahme. Eine Anfrage ist keine Buchung.
- **Rechnung:** monatlich manuell, keine jährliche Vorauszahlung im ersten Test. Der Founder bestätigt Zugang und Gültigkeit; Zahlungsstatus und Zeitraum sind getrennt. Kündigung zum Ende des laufenden Monatszeitraums mit klarem Kontaktweg. Verlängerung, Zahlung und Zugang werden ausdrücklich dokumentiert.
- **Fehlende Zahlung:** Hinweis bzw. manuelle Klärung; keine automatische Eventrücknahme. Wechsel zu Free nur nach nachvollziehbarer Zugangsentscheidung und den beschlossenen Folgen.
- **UI-Zustände:** Test aktiv bis, Free, Anfrage eingegangen, Plus aktiv bis, Plus endet am; offene Rechnung als zusätzlicher Hinweis.
- **Kontingente 50/30 Tage** und Kalendermonatsrechnung werden technisch getrennt angezeigt; keine gleiche Periodenlänge vortäuschen.
- **Pro:** nur geplanter Ausbau ohne Buchungsbutton; Preis weiterhin Hypothese.
- **Löschung (Founder-Support, Abschnitt 14.5 und Notion-Nachtrag):** Endgültige Event- und Kontolöschung läuft über den Founder-Support. Öffentlich zurücknehmen ist nicht endgültig löschen.

## 14. Startvoraussetzungen, Offen und Nicht-Freigaben [Offen]

- Discovery-Suchdetails (Suchabdeckung, Schwellen, Erklärungstexte) und Gesamtabnahme des Datenvertrags v0.3 bleiben offen. **Nächste fachliche Aufgabe.**
- Konkrete Medien-, Einwilligungs- und Freigabetexte; Aufbewahrung und Löschung ([Abschnitt 13 des v0.3-Entwurfs](DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md) bleibt gültig, ergänzt um die Fristen unten).
- D1–D10 mobile Designs einschließlich Eventgestaltung, Follow- und Einladungszuständen sowie Feedback-, Nachrichten- und Vorlagen-Oberflächen.
- Einladungszuordnung-Details; Offline- und Entfernungszustände. Versandzeit, Zeitzone und Kurzfristfälle sind beschlossen; die Zustellmechanik bleibt offen.
- Tatsächlicher lokaler Bestand, Architektur, Anbieter, Sicherheit, Betrieb, Messschema, Pilotorganisation, neuer Aufwand.
- **Nicht freigegeben:** App, DB, Migrationen, Abhängigkeiten, Deployment, Billing, Update-Mails.

## 15. Ergänzte Abnahmefälle (schriftliche Spezifikationsfälle, keine ausgeführten Tests)

| ID | Fall | Erwartung |
|---|---|---|
| D01 | Gleicher Login ohne Organizerzuordnung | Keine Organizerrechte; lokale Übernahme dedupliziert. |
| D02 | Kontingent 50 Läufe | Projektweit, nicht je Event. |
| D03 | Zwei Varianten aus einem Auftrag | Ein Lauf. |
| D04 | Fehlversuch oder QR-Erstellung | Kein Verbrauch. |
| D05 | Testverlängerung | Kein Bonusreset. |
| D06 | Feedback unter kleiner Stichprobe | Korrekt als kleine Stichprobe bezeichnet. |
| D07 | Erste Öffnung bestimmt Laufzeit | Pause verlängert nichts. |
| D08 | Manuelles Schließen | Endgültig. |
| D09 | Downgrade bei pausierter Befragung | Nicht öffnen. |
| D10 | Verschiebung ohne Termin | Abo bleibt für spätere Terminbestätigung erhalten, trotz regulärem Cutoff. |
| D11 | Merkung entfernen | Bleibt vom Abmelden getrennt. |
| D12 | Offene Rechnung | Ändert den Eventstatus nicht. |
| D13 | Anfrage | Keine Buchung. |
| D14 | Testende | Keine Zahlung. |
| D15 | Alte Plusdetails nach Downgrade | Lesbar; neue Detailmessung pausiert und wird nicht rückwirkend erfunden. |

Die Fälle sind Papierspezifikationen; sie sind **keine** Softwaretests.

---

## 16. Vertragsdeltas (logische Gruppen, Abschnitt 10 des Notion-Deltas) [Vorschlag]

Diese Gruppen sind **keine** freigegebenen SQL-Tabellen oder finalen Feldnamen. Bestehende v0.3-Objekte werden erweitert, nicht unnötig dupliziert.

- **ProjectEntitlement:** Projekt, gebuchtes Paket, Testfreigabe, Beginn und Ende, Freigabeakteur, Preis-/Angebotsversion, effektive Rechte, Buchungs- bzw. Zahlungsreferenz. Zahlung ist nicht automatisch gleich Zugang.
- **VisitorIdentity / SavedEvent:** bestätigter Besucherzugang gegenüber lokalem Gerätebesitz, Eventreferenz, Zeitpunkt; Privatheit und Deduplizierung.
- **SubscriptionPreference:** Kontakt, Zieltyp und -ID, Zweck, Kanal, Status, Text- und Bestätigungsfassung, Zeitpunkte. Zieltyp in der Alpha: Organizer oder Event; Reihe nur als spätere Erweiterung.
- **Message:** Projekt, Event, eigener Zweck gegenüber serverseitigem Anlass, Entwurf, Text-, Medien- und Eventversion, Empfängerselektion, Freigabe, Versuch, Kontingentnachweis. Kein Missbrauch des Typfelds durch den Editor.
- **Survey:** Projekt und Event, Frageversion und -typen, Status offen, pausiert oder geschlossen, Beginn und Ende, erste Antwort, Antworten, Ergebnisse und Export. Technische Schutzsignale bleiben privat.
- **AssistantJob / Kit:** bestätigte Eingabeversion, Zweck und Sprache, Jobstatus, editierbare Outputs, nutzungszählender Erfolg, Bezug zur Veraltung.
- **DistributionLink / Measurement:** Projekt-, Event-, Kit- oder Nachrichtenbezug, Quellenlabel, aggregierbare Ereignisse. Keine Absender- oder Personenidentität aus einem Linklabel ableiten.
- **PremiumDesignFallback:** unabhängiger Free-Ersatz und gespeicherte Plus-Konfiguration je Profil oder Event; effektive Darstellung nach Zugang.
- **Invitation** (bereits in v0.3, Abschnitt 9): Gültigkeit 30 Tage (erneuerter Link deaktiviert den alten); Widerruf und Löschfristen wie in Abschnitt 13.

## 17. Abgleich mit dem bisherigen Repo-Stand [Vorschlag]

| Bisher | Nach Delta v0.4 |
|---|---|
| Premium/Monetarisierung nach V1 ohne Tarife, Preise, Billing (PREMIUM-01, Out of Scope) | Plus Alpha als achtwöchiger manueller Testzugang ist V1-Produktentscheidung; Pro, Team, Automation und Billing-Umsetzung bleiben nach V1 bzw. nicht autorisiert. |
| Keine Premiumfunktion als V1-Scope | Free/Plus-Matrix beschlossen; Plus-Umfang ist definiert, aber nicht implementiert. |
| Q33: kein vollständiger Eventalarm, Eventabo nicht vorgesehen | Eventänderungsabo ist eine ausdrückliche neue Aktion und präzisiert Q33 (kein Alarm, kein Automatismus). |
| Keine Besucheridentität | E-Mail-Code-Login, private Merkliste, Kalenderexport (V1). |
| Keine eigenen Nachrichten | Eigene Nachrichten mit Limits 1/24 h je Projekt und 2 je Event (Plus). |
| Keine Befragung | Plus-Feedbackumfrage mit Laufzeit- und Löschregeln. |
| Keine Vorlagen oder Assistentenkontingente | Fünf Vorlagen (Plus); 50 Läufe je Projekt und 30 Tage (Plus). |

---
*Lesefassung erstellt 2026-10-16 aus dem Notion-Delta v0.4. Keine Umsetzung, keine Entwicklungsfreigabe, keine Gesamtabnahme des Datenvertrags.*
