# 09 — UX-Framework und Styleguide

**Status:** Entwurf, Stand 05.11.2026 (zweite Fassung). Der Founder hat am 05.11. die Punkte Anrede (Du), Gendern (Doppelpunkt), WCAG 2.2 AA, Mobil zuerst mit 44-px-Tippzielen, CI-Prüfung und Styleguide-Vorschlag bestätigt und Produktprinzipien ergänzt. Das Dokument gilt als Ganzes, sobald der Founder es freigibt (PR-Merge). Abschnitte ohne Quelle sind als **Vorschlag** gekennzeichnet; offene Entscheidungen stehen in §8.

## 1. Zweck und Geltung
Das Framework macht Screen-Reviews wiederholbar. Statt jeden Screen neu zu beurteilen, prüfen wir ihn gegen dieselben Regeln, und was wir beim Review lernen, wird eine Regel (§7.6).

- **Es gilt für:** neue und geänderte Screens, jeden Zustand und Viewport, Systemmails, Fehler- und Leertexte, Figma-Frames vor „Ready for dev“.
- **Rangfolge bei Widerspruch:** Datenverträge und Fachregeln (siehe `README.md`, Quellenrangfolge) vor diesem Dokument; dieses Dokument vor einzelnen Figma-Entscheidungen. Verstößt ein Figma-Frame gegen eine Regel hier, steht das in der Abweichungsliste (§7.3) und der Founder entscheidet. Ausnahmen werden im Screen dokumentiert, nicht still gemacht.
- **Werte, Farben, Komponenten** stehen nicht hier, sondern in `04-design-tokens.md` und auf den Figma-Seiten 10 und 11 (`03-screens-figma.md`). Hier stehen die Regeln, nach denen sie eingesetzt werden.
- **Kennzeichnung:** **Regel** = gilt, Quelle genannt. **Vorschlag** = Claude schlägt vor, Founder bestätigt. **Offen** = Entscheidung fehlt (§8).

## 2. Produktprinzipien
Grundlage sind die sechs Prinzipien des Founders vom 05.11.2026, ergänzt um Prinzipien aus der Netzwerkstrategie v0.2 (Notion, §11), dem Outcome Brief und `AGENTS.md`. Sie entscheiden, wenn zwei Regeln kollidieren, und sind in der Checkliste (§6, Bereich G) abgefragt.

| ID | Prinzip | Was es für Screens heißt | Prüffrage |
|---|---|---|---|
| PP-01 | **Single-Player zuerst.** Am Anfang bringen die meisten Funktionen auch allein genug Wert. Das Netzwerk ist Bonus, nie Voraussetzung. | Kein Screen verlangt eine zweite Person, ein Publikum oder ein Netzwerk, um nützlich zu sein. Verknüpfungen sind optional und haben einen Weg ohne Gegenüber (z. B. Ort als Text). | Hilft der Screen einer einzelnen Person, die sonst niemanden bei DISKOE kennt? |
| PP-02 | **Wenig Arbeit, viel Ergebnis.** Flyer rein, Seite raus. | Wir fragen nur, was fehlt, und nie etwas doppelt. Vorbelegen statt Abtippen. | Was könnte das System ausfüllen oder weglassen? |
| PP-03 | **Verlinkung zeigen, Nutzen nennen.** Wo sich etwas verknüpfen lässt (Venue, Line-up, Co-Hosts, Empfehlungen, Follower), sieht man die Möglichkeit klar, und ein Satz sagt, was man davon hat. | Verknüpfungen sind sichtbare Aktionen, keine versteckten Optionen. Neben jeder steht der Nutzen („Dein Programm erscheint auch bei der Venue“). | Sieht man, was sich verknüpfen lässt, und steht dort, was es bringt? |
| PP-04 | **Teilen und Verlinken, wo es Sinn ergibt.** Das ist unser Netzwerkeffekt. | Jeder Abschluss hat einen Teilen-Moment; jede öffentliche Seite hat einen Weg nach außen (teilen) und einen Weg hinein (folgen, verknüpfen). | Gibt es an dieser Stelle einen Weg zu teilen oder zu verlinken? Wenn nein, warum nicht? |
| PP-05 | **Teilen so einfach wie möglich.** | Ein Tipp statt mehrerer Schritte; Systemdialog mobil, Link kopieren am Desktop; kein Konto für die Empfangenden; Linkvorschau (Titel, Bild) ist fertig. | Kommt man in höchstens zwei Schritten vom Screen zum geteilten Link? |
| PP-06 | **Viralität mitdenken.** Wir haben kein großes Marketingbudget. | Jede Funktion fragt: Wer sieht das Ergebnis außerhalb von DISKOE, und was bringt diese Person zu uns? Verbreitung ist Nebenprodukt des Eigennutzes. | Gibt es einen Hebel, über den das Ergebnis Neue erreicht, ohne dass wir etwas senden? |
| PP-07 | **Vertrauen vor Reichweite.** Grenze für PP-03 bis PP-06. | Viralität nur mit Einwilligung: keine Dark Patterns, kein Versand an Dritte ohne Auslöser der Person (Einladungen sind Links, die die Reihe selbst teilt; DISKOE speichert keine Empfängeradressen). | Würde sich die betroffene Person fair behandelt fühlen? |
| PP-08 | **Bestätigte Fakten, nichts still öffentlich.** | Entwürfe sind privat; KI-Vorschläge sind Vorschläge; nichts wird erfunden oder als sicher gezeigt, was es nicht ist. | Ist erkennbar, was bestätigt, vorgeschlagen und unbekannt ist? |
| PP-09 | **Fairness bei Dritten.** | Seiten über Personen sind minimal, nennen die Quelle und sind sofort entfernbar. | Kann die betroffene Person es sehen und mit einem Klick beenden? |
| PP-10 | **Kultureller Bezug ist nicht optional.** Kommunikation, Gestaltung, Ton und Begriffe gehören in die Szene. | Kein Corporate-Eventtool: Sprache der Szene, Typografie und Bilder mit Haltung, die Organizer-Inhalte stehen im Vordergrund. | Würde die Szene das so sagen und so aussehen lassen? |
| PP-11 | **Frei ist, was verbreitet.** Bezahlt wird Häufigkeit, Kontrolle und Geldfluss. | Teilen, Folgen, Merken, Verknüpfen und die Basis der Erfassung stehen nie hinter einer Bezahlschranke. Hinweise auf Plus blockieren nie den Kernablauf. | Steht etwas Verbreitendes hinter einer Bezahlung oder einem Upsell-Hindernis? |

**Reihenfolge bei Konflikt:** Vertrauen und Wahrheit (PP-07 bis PP-09) vor Verbreitung (PP-03 bis PP-06) vor Bequemlichkeit (PP-02). PP-01 und PP-10 gelten immer.

*Herkunft der sechs Founder-Prinzipien:* Verlinkung zeigen → PP-03, Teilen und Verlinken → PP-04, Viralität → PP-06, Teilen einfach → PP-05, Single-Player → PP-01, Kultureller Bezug → PP-10. Neu ergänzt von Claude (Vorschlag, noch zu bestätigen): PP-02, PP-07, PP-08, PP-09, PP-11.

## 3. Allgemeine UX-Regeln (Kanon)
Anerkannte Regeln, jeweils mit der Bedeutung für DISKOE. Wer sie nicht erfüllt, nennt den Grund in der Abweichungsliste.

### 3.1 Nielsens zehn Heuristiken
| # | Regel | Bei DISKOE |
|---|---|---|
| 1 | Sichtbarkeit des Systemzustands | Jeder Screen zeigt, ob etwas Entwurf, in Prüfung, live oder geändert-aber-nicht-veröffentlicht ist. Laufende Vorgänge (Upload, KI-Erfassung, Senden) sind sichtbar und nicht doppelt auslösbar. |
| 2 | Sprache der Nutzer | Begriffe der Szene (Listening-Session, Offspace, Line-up), keine Systembegriffe („Entität“, „Payload“, „Revision“). |
| 3 | Nutzerkontrolle und Freiheit | Abbrechen, Zurück und Rückgängig wo möglich; Entwürfe gehen nie verloren. Veröffentlichen ist nur nach Bestätigung möglich und wirkt erst dann. |
| 4 | Konsistenz und Standards | Gleiche Dinge heißen und sehen überall gleich aus. Bausteine kommen aus Figma-Seite 10, dann 11. Plattformstandards (Links unterstrichen oder erkennbar, Formularelemente) werden nicht neu erfunden. |
| 5 | Fehlervermeidung | Eingabetypen, Auswahl statt Freitext, Lückenprüfung vor dem Absenden, Bestätigung bei Folgen für Dritte (Absage, Entfernen). Nur Farben mit ausreichendem Kontrast werden angeboten. |
| 6 | Wiedererkennen statt Erinnern | Optionen sichtbar statt Befehle merken; die KI-Extraktion steht neben dem Original-Flyer; Vorschau zeigt, was die Besucher sehen. |
| 7 | Flexibilität und Effizienz | Duplizieren eines Events statt neu anlegen; Tastaturbedienung; sinnvolle Vorbelegung (nicht Raten). |
| 8 | Ästhetisches und minimalistisches Design | Pro Screen ein Ziel und eine Hauptaktion. Alles andere ist sekundär oder eingeklappt. |
| 9 | Fehler erkennen, diagnostizieren, beheben | Klartext, was passiert ist und was jetzt zu tun ist; Sprung zum betroffenen Feld; keine Codes ohne Erklärung. |
| 10 | Hilfe und Dokumentation | Hilfe dort, wo die Frage entsteht (Hinweis am Feld), nicht in einem separaten Handbuch. |

### 3.2 Gesetze und Muster
- **Hicks Gesetz:** Weniger Optionen je Schritt beschleunigen die Entscheidung. Rückfragen der KI kommen thematisch gebündelt und nicht als lange Liste (Vorschlag: höchstens ein Thema je Schritt).
- **Fitts’ Gesetz:** Wichtige Aktionen sind groß und gut erreichbar, vor allem mobil. Destruktive Aktionen liegen nicht neben der Hauptaktion.
- **Millers Gesetz und Chunking:** Lange Formulare werden in sinnvolle Gruppen gegliedert (wie ORG-B/C), nicht in einer Wand.
- **Jakobs Gesetz:** Nutzer erwarten, dass Dinge funktionieren wie auf anderen Seiten (Login, Teilen, Kalender).
- **Progressive Offenlegung:** Zusatzfragen (Club, Vernissage, Film) erscheinen nur, wenn das Format sie braucht (ORG-C).
- **Zeigarnik und Fortschritt:** Mehrstufige Abläufe zeigen, wo man steht und was noch fehlt. Unfertiges bleibt als Entwurf erhalten.
- **Peak-End:** Der Abschluss eines Ablaufs (Veröffentlicht, Eingereicht) ist ein bewusst gestalteter Moment mit nächstem Schritt (Teilen, nächstes Event), kein Leerlauf.
- **Postels Gesetz:** Eingaben tolerant annehmen (Leerzeichen, Groß/Klein, verschiedene Datums- und Preisschreibweisen), Ausgaben streng und einheitlich formatieren.

### 3.3 Formulare
Quellen: Baymard Institute, GOV.UK Design System, NN/g.
- Eine Spalte, Label immer sichtbar über dem Feld (kein Platzhalter als Label). Pflicht und optional eindeutig; optionale Felder werden markiert, nicht Pflichtfelder mit Stern allein.
- Validierung nach dem Verlassen des Felds, nicht bei jedem Tastendruck; Fehler am Feld plus eine Zusammenfassung oben bei Absendeversuch. Eingaben bleiben nach einem Fehler erhalten.
- Richtige Eingabetypen und `autocomplete`; Auswahllisten nur bei bekannten Optionen; lange Listen mit Suche.
- Hilfetext vor dem Fehler (Format, Beispiel), nicht erst danach.
- Automatisches Speichern von Entwürfen oder klare Anzeige „Gespeichert / Nicht gespeichert“.

### 3.4 Mobil und Touch
Quellen: Apple Human Interface Guidelines, Material Design, WCAG 2.2.
- Tippziele mindestens 44 × 44 px (**bestätigt 05.11.**; WCAG 2.2 AA verlangt 24 × 24 px); Abstand zwischen Zielen. **Entschieden (Founder, 05.11., 16:25): 44 px auf allen Viewports, auch auf Desktop.** In Figma gilt dafür die Button-Variante `Size = Large` (44 px). **Bekannte Abweichung:** Die gebauten Komponenten `Button` und `Feld` sind 36 px hoch (`min-h-9` im Code, nicht gegen Figma geprüft) und werden beim Bau von Welle 1 auf 44 px gebracht. Die Eingabefeld-Komponente (Figma 36 px) ist noch zu prüfen.
- Eingabetext mindestens 16 px, damit iOS nicht zoomt. Kein Hover-only: alles Wichtige ist ohne Hover erreichbar.
- Wichtige Aktionen in Daumenreichweite (unten), keine Pflicht-Mehrfinger-Gesten.
- Öffentliche Seiten werden **mobil zuerst** geprüft (**bestätigt 05.11.**; Zugriff kommt überwiegend über geteilte Links aus Stories und Chats).

### 3.5 Barrierefreiheit (Orientierung WCAG 2.2, Stufe AA)
**Ziel bestätigt (05.11.).** Ob eine Rechtspflicht besteht (Barrierefreiheitsstärkungsgesetz), ist **nicht geprüft**; wir arbeiten trotzdem nach AA, weil die Szene Zugänglichkeit als Thema ernst nimmt und `Zugänglichkeit` selbst ein Datenfeld am Event ist.
- Kontrast: Text ≥ 4,5 : 1, großer Text und Akzentflächen ≥ 3 : 1 (`04-design-tokens.md`, Backend prüft beim Speichern).
- Information nie nur über Farbe (Status immer auch mit Text oder Symbol: Abgesagt, Verschoben, Vorbei, Fehler).
- Sichtbarer Fokus, vollständige Tastaturbedienung, sinnvolle Reihenfolge, Labels für alle Felder, Überschriftenhierarchie, `lang="de"`.
- Bilder: Bildbeschreibung ist freiwillig, wird aber angeboten und erklärt (Beschluss Slice 5).
- **Ziehen nicht erforderlich (2.5.7):** Umsortieren (Module, Line-up) braucht eine Alternative zu Drag and Drop, z. B. Nach oben/Nach unten.
- **Barrierefreie Anmeldung (3.3.8):** Der E-Mail-Code lässt Einfügen und `autocomplete="one-time-code"` zu; kein Abtippen von Zeichenrätseln.
- **Keine doppelte Eingabe (3.3.7):** Was im selben Ablauf schon erfasst wurde, wird nicht erneut verlangt.
- Bewegung dezent, `prefers-reduced-motion` respektieren. Bei Dark Mode (nur Plattform-Theme) Kontraste getrennt prüfen.

### 3.6 Rückmeldung, Zustände, Leistung
- Jeder Screen hat die Zustände **leer, befüllt, Entwurf, Fehler, laufender Vorgang und gesperrt**, soweit sie vorkommen (Anforderung aus dem Build-Dokument). Jeder Zustand ist ein eigener Figma-Frame (`03-screens-figma.md`).
- Rückmeldung innerhalb von etwa 100 ms (z. B. Button reagiert); ab etwa 1 s ein Ladezustand (Skeleton oder Fortschritt), ab etwa 10 s Fortschritt mit Abbruchmöglichkeit (KI-Erfassung).
- Optimistische Anzeige nur bei Aktionen, die sich sauber zurücknehmen lassen. Veröffentlichen, Absagen und Senden sind nie optimistisch.
- Leerzustände erklären, was hier entsteht, und bieten den nächsten Schritt an. Fehlerzustände nennen Ursache und Ausweg.

### 3.7 Einwilligung, Datenschutz, faire Gestaltung
- Keine vorangekreuzten Einwilligungen; eine Einwilligung je Zweck; Widerruf so leicht wie Erteilen (Abmeldelink in jeder Mail).
- Keine Dark Patterns: kein Confirmshaming („Nein, ich will keine Events“), keine künstliche Dringlichkeit, keine versteckten Abwahlen.
- Nur technisch notwendige Speicherung ohne Banner; Messung ohne Fremd-Tracker (`01-architektur.md`). Kommt etwas Einwilligungspflichtiges hinzu, wird zuerst entschieden, dann gebaut.
- Destruktive und folgenreiche Aktionen nennen die Folge in der Bestätigung („Das Event wird als abgesagt angezeigt“) und haben nicht denselben Rang wie die Hauptaktion.

## 4. DISKOE-Regeln
Verbindlich, weil aus Verträgen und Beschlüssen abgeleitet. Die Kennung (UX-nn) wird in Abweichungslisten und PRs zitiert.

### 4.1 Daten, Zustände und Wahrheit
- **UX-01 Unbekannt ist nie leer, 0 oder „Frei“.** Die fünf Antwortzustände `provided / unknown / not_applicable / skipped / unanswered` sind im UI unterscheidbar. Beispiele: „Preis noch offen“ (nie „Frei“), „Noch keine Angaben“ bei Zugänglichkeit (fehlende Angaben heißen nie „nicht zugänglich“). *(AGENTS.md, Delta v0.5 §9)*
- **UX-02 Der Status ist immer sichtbar.** Jedes Profil und jedes Event zeigt Entwurf privat, In Prüfung, Live oder Änderungen nicht veröffentlicht; Events zusätzlich Abgesagt, Verschoben, Vorbei. Speichern ist nicht Veröffentlichen. *(PUBLISH-04, Datenvertrag)*
- **UX-03 Veröffentlichen ist ein bewusster Moment.** Vorschau davor, ausdrückliche Bestätigung, Beschriftung nennt die Wirkung („Veröffentlichen“, nicht „Weiter“ oder „Speichern“). Nach dem Veröffentlichen steht der nächste Schritt (Teilen, nächstes Event). *(PUBLISH-04)*
- **UX-04 KI-Vorschläge sind Vorschläge.** Aus dem Flyer ausgefüllte Felder sind als Vorschlag erkennbar, jederzeit änderbar, der Original-Flyer ist daneben sichtbar, Unsicherheit und Widersprüche sind markiert, nichts wird erfunden. Pflichtfelder braucht eine Bestätigung des Menschen. Fällt die KI aus, geht die Arbeit manuell ohne Datenverlust weiter. *(PUBLISH-02/03, AGENTS.md)*
- **UX-05 Lücken sind konkret.** Nie „Unvollständig“, sondern „Eventbild fehlt“ mit Sprung zum Feld. „Pflicht zur Veröffentlichung“ und „freiwillig“ sind getrennt. Auch die Reihenfolge folgt dem Weg des Organizers, nicht der Datenbank. *(Slice 4)*
- **UX-06 Zeit in Ortszeit.** Anzeige in `Europe/Berlin`, mit Wochentag; ein Ende nach Mitternacht ist eindeutig lesbar (Folgetag); kein erfundenes Ende. Verschoben zeigt alten und neuen Termin oder „Neuer Termin folgt“. *(AGENTS.md, P11)*
- **UX-07 Geld ist eindeutig.** Betrag mit Währung und Komma-Format („12,00 €“); Spende, „ab“, „von bis“ und „Preis noch offen“ sind eigene Zustände mit festen Formulierungen aus Figma `ORG-92`. *(AGENTS.md)*
- **UX-08 Statuswechsel sind laut.** Abgesagt, Verschoben und Vorbei stehen im Kopf der Seite, nicht nur in der Farbe; bei Absage und Vorbei verschwindet der Ticketlink. Die bestätigten Statustexte (03.11.) sind verbindlich. *(Slice 6)*

### 4.2 Organizer-Abläufe
- **UX-09 Ein Ziel, eine Hauptaktion.** Pro Screen genau ein primärer Button. Ablauf, Fortschritt und „Wo bin ich?“ sind sichtbar.
- **UX-10 Nur fragen, was fehlt.** Die Erfassung füllt vor, fragt gezielt nach und fragt nichts doppelt (PP-02, WCAG 3.3.7).
- **UX-11 Folgen vorher nennen.** Absagen, Verschieben, Ort ändern, Entfernen: die Bestätigung nennt, was Besucher sehen und, sobald es Follow gibt, wer informiert wird. Keine Sätze über Abos, wo es keine Abos gibt. *(Slice 5)*
- **UX-12 Nichts geht still verloren.** Entwürfe bleiben bei Abbruch, Fehler und Sitzungsende erhalten; Änderungen an Live-Seiten bleiben privat, bis der Organizer sie bestätigt. *(Variante B, Slice 5)*
- **UX-13 Kein Zwang zur Gestaltung.** Standard-Theme sieht gut aus; Anpassung ist optional. Der Editor bietet nur Kombinationen mit ausreichendem Kontrast und meldet „n ausgeblendet“. *(04-design-tokens.md)*
- **UX-14 Der Founder-Bereich folgt denselben Regeln.** Auch interne Screens (Prüfung, Rückfrage) sind für Menschen gebaut, nicht für Entwickler. *(INT-A)*

### 4.3 Öffentliche Seiten und Besucher
- **UX-15 Kerninfo ohne Login und ohne Scrollen.** Was, Wann, Wo, Preis, Zugang stehen im ersten Bildschirm, mobil wie Desktop. Lesen verlangt nie eine Anmeldung. Entwürfe sind per Zugriffsschutz nicht erreichbar. *(PUBLIC-02, AGENTS.md)*
- **UX-16 Eine klare Besucheraktion.** Ticket/Anmeldung ist die Hauptaktion; Teilen, Merken, Kalender, Folgen sind sekundär und gleich gewichtet. Nicht freigeschaltete Funktionen erscheinen nicht als deaktivierte Attrappe, außer als bewusst beschlossener Platzhalter. *(Slice 6)*
- **UX-17 Mails an Besucher sind fair und eindeutig.** Double-Opt-in, ein Satz zum Zweck vor der Eingabe, Abmeldelink in jeder Mail, Versand gebündelt um 10:00 Uhr. Die Oberfläche sagt „Wir haben dir einen Link geschickt“, nie „zugestellt“. *(Q32/Q33, AGENTS.md)*
- **UX-18 Seiten über Dritte sind minimal und entfernbar.** Artist-Seiten zeigen nur Name, Rolle, Termine, nennen die Quelle und haben einen gut sichtbaren „Das bin ich · Seite entfernen“. *(Delta v0.5 §6, Strategie v0.2)*
- **UX-19 Der Weg von außen wird mitgedacht.** Linkvorschau (Titel, Bild), geteilte Links und Teilen-Dialog gehören zum Screen, nicht nur die Seite selbst. *(SHARE-01)*

### 4.4 Gestaltung und Marke
- **UX-20 Tokens und Komponenten zuerst.** Farben, Schrift, Abstände nur über Tokens; Komponenten zuerst von Figma-Seite 10, dann 11, sonst nachfragen. Tag-Farben (Format, Atmosphäre, Profiltyp) sind fest. *(AGENTS.md, 04-design-tokens.md)*
- **UX-21 Profilgestaltung bricht die Plattform nicht.** Organizer gestalten Profil und Event; Fehlerzustände, Pflichthinweise und Rechtliches bleiben im Plattformstil lesbar.
- **UX-22 Die Szene darf man sehen.** Typografisch und im Bild eigensinnig statt Standard-SaaS; Fotos und Flyer der Organizer sind die Hauptdarsteller, die Oberfläche tritt zurück. *(PP-10; Vorschlag zur Ausgestaltung im Review)*

- **UX-23 Die Seite hat eine lesbare Hierarchie.** Jeder Screen hat genau einen Blickfang (meist Titel oder Hauptaktion), danach klar abgestufte Ebenen: Titel, Abschnitt, Fließtext, Nebeninfo. Ablauf, Schrift, Text, Elemente und Farben folgen derselben Rangfolge. Prüfung: Augen zusammenkneifen (Squint-Test) und fünf Sekunden schauen: Was fällt zuerst auf, was als Nächstes, stimmt das mit dem Ziel des Screens überein? *(Founder, 05.11.)*
- **UX-24 Farbe lenkt die Aufmerksamkeit.** Plattformfarben (Iris, Pink, Blau, Pfirsich, Gelb, Lavendel, Status-Soft-Töne) werden gezielt eingesetzt, um Fokus, Fortschritt, Status und Erfolgsmomente zu setzen, nicht als Dekoration und nicht überall. Mindestens ein bewusster Farbakzent pro Screen, kein Screen ohne Farbe außer Formulare, in denen der Fokus beim Ausfüllen liegt. Farbe trägt nie allein die Bedeutung (§3.5), Kontrast nach `04-design-tokens.md`. Die festen Tag-Farben behalten ihre Bedeutung und werden nicht für andere Zwecke verwendet. *(Founder, 05.11.)*
- **UX-25 Fehlt eine Schrift als Token, wird sie vorgeschlagen.** Passt keiner der vorhandenen Textstile (§5.2) zur Aufgabe, wird kein Wert „frei“ gesetzt. Ablauf: Vorschlag mit Name, Größe, Zeilenhöhe, Gewicht, Einsatz und Begründung → Founder bestätigt → Textstil in Figma und Token in `app/globals.css` anlegen, in `04-design-tokens.md` dokumentieren → erst dann verwenden. *(Founder, 05.11.)*

## 5. Text, Ton und Maße

### 5.1 Text und Ton
- **Anrede: „du“** (bestätigt 05.11.), überall: Organizer-Bereich, öffentliche Seiten, Mails. Auch wenn ein Kollektiv gemeinsam handelt, spricht der Screen die Person am Bildschirm an. Figma-Texte mit „ihr/eure“ (z. B. „Eure Seiten sind veröffentlicht“, ORG-D/NACH-A) werden in der Abweichungsliste auf „du/deine“ angeglichen.
- **Gendern mit Doppelpunkt** (bestätigt 05.11.): „Künstler:innen“, „Veranstalter:innen“, „Besucher:innen“. Wo es einfach geht, neutral formulieren („Personen im Line-up“, „wer folgt“). „Organizer“ bleibt als Produktbegriff.
- **Stil:** kurz, aktiv, konkret. Ein Gedanke pro Satz. Keine Ausrufezeichen-Euphorie, keine Marketing-Superlative, kein „leider“, kein Behördendeutsch.
- **Buttons:** Verb plus Objekt („Event veröffentlichen“, „Absage bestätigen“), nie „OK“ oder „Weiter“, wenn etwas passiert.
- **Fehler:** 1. was ist passiert, 2. was kannst du tun. Keine Schuldzuweisung („Du hast …“), keine technischen Codes.
- **Leere Zustände:** was hier entsteht, plus nächster Schritt.
- **Begriffe:** Format-Namen und Atmosphäre-Begriffe wie in `04-design-tokens.md` und Figma. Ein Ding heißt überall gleich (nicht Event/Veranstaltung/Termin gemischt).
- **Zahlen und Zeit:** deutsches Format, 24-Stunden-Uhr, „Uhr“ nach der Zeit, Datum mit Wochentag in Listen.
- **Mails:** Betreff nennt den Zweck; erster Satz sagt, was du tun sollst; Absender und Grund des Empfangs stehen drin.
- **Nutzen nennen** (PP-03): Wo eine Verknüpfung, ein Teilen-Schritt oder eine Einwilligung gefragt wird, steht ein Satz zum Nutzen vor dem Button.

### 5.2 Maße und Raster
**Ist-Stand** aus den Figma-Variablen der Stilübersicht (DS-0 `2454:392`) und der Komponenten DS-A (`2952:1841`), gelesen am 05.11.2026, und aus `app/globals.css` sowie `components/ui/`. Kein Abgleich Pixel für Pixel.

| Bereich | Ist in Figma | Ist im Code |
|---|---|---|
| Abstände (Variablen) | 0, 4, 6, 8, 12, 16, 20, 24, 32 px | Tailwind-Standardskala (4 px Schritte), meist `gap-2/3/4`, `p-4/6` |
| Eckenradius | 4, 6, 8, 10, 12 px und Pille (9999) | Buttons und Felder `rounded-lg` (8 px), Chips `rounded-full` |
| Schatten | `xs`, `sm` | `shadow-xs` an Feldern |
| Fokus | Ring 3 px in Iris, außen (`ring`) | Outline 2 px Iris, Abstand 2 px |
| Typografie | Space Grotesk: Display XL 112/112, L 80/82, M 56/60, S 40/44; Heading L 32/38, M 24/30; Title S 16/24; Body Regular 16/24; Body Small und Label 14/20; Eyebrow 13/16 mit Sperrung; Caption 12/16. Zusätzlich Instrument Serif Italic (Accent L 96/100) | Space Grotesk selbst gehostet |
| Icons | Komponenten `Icon / …` nach Lucide-Namen (z. B. `badge-euro`, `circle-help`), 24 px Raster | Eigene SVG-Komponenten in `components/public/icons.tsx`, Strich 1,5 px rund, `currentColor` |
| Tippziele | Button `Size = Large` 44 px (entschieden 05.11.); Feld 36 px, noch zu prüfen | Button und Feld 36 px hoch (siehe §3.4) |

**Vorschlag (bestätigt am 05.11., dass Claude ihn ableiten soll; Werte noch zu bestätigen):**
- **Raster:** 4-px-Basis. Erlaubte Stufen für neue Komponenten: 4, 8, 12, 16, 24, 32, 48, 64. 6 und 20 bleiben als vorhandene Sonderfälle, werden aber nicht neu verwendet.
- **Radien:** vier Stufen: 4 (Tags, kleine Elemente), 8 (Buttons, Felder), 12 (Karten, Dialoge), Pille. 6 und 10 sind zu prüfen und möglichst auf 8 oder 12 zu vereinheitlichen. Die Profil-Einstellung `eckig/leicht/rund` bleibt `TODO(spec)` bis zum Review von ORG-E.
- **Fokus:** der Figma-Ring (3 px Iris) gilt; der Code zieht nach.
- **Icons:** Lucide-Stil bleibt Vorbild (24-px-Raster, Strich 1,5 px, rund, `currentColor`). Neue Icons kommen aus der Figma-Komponente `Icon / …`, nicht frei gezeichnet. Ein Icon trägt nie allein die Bedeutung (Text oder Beschriftung dabei).
- **Tippziele:** siehe §3.4.
- **Seitenränder und Spaltenbreiten:** je Screen aus Figma lesen (z. B. Eventkopf Desktop 64 px Innenabstand), nicht pauschal festlegen.

### 5.3 Hierarchie, Farbe und Schrift (Ausgestaltung zu UX-23 bis UX-25)
Konkretisiert die drei Founder-Regeln. Zahlen sind Startwerte und werden im Review geschärft.

- **Rangfolge:** Titel > Abschnittstitel > Text > Nebeninfo. Pro Screen ein Titel (H1). Gleiche Rolle = gleicher Textstil auf allen Screens. Größe, Gewicht und Farbe tragen zusammen die Rangfolge; ein Element, das „wichtig“ ist, ist nie nur größer, sondern auch klar abgesetzt.
- **Farbe als Rangfolge:** Hauptaktion in `primary` (Ink); Fortschritt, aktueller Schritt und Auswahl in Iris; Status in den Soft-Tönen mit Text und Icon; Erfolg und Abschluss (Peak-End) dürfen eine Pastellfläche (Pink, Gelb, Pfirsich, Blau, Lavendel) bekommen, Text darauf in Ink. Graue Fläche ist Hintergrund, kein Akzent.
- **Schrift:** Die vorhandenen Textstile (§5.2) reichen für Plattform-Screens. Ein Screen nutzt höchstens drei Größenstufen neben Eyebrow und Caption. Neue Stile nur über UX-25.

**Von Claude vorgeschlagen, vom Founder bestätigt (05.11., 15:22), gelten als Arbeitsregeln:**
- **V1 Lesebreite, zwei Breiten (Founder, 06.11.2026, 18:42; ersetzt die Regel „Formulare höchstens 560 px“ vom 05.11. und die Vollbreite vom 18:34):** Auf dem Desktop gibt es zwei Breiten. **Schmal, 560 px und mittig:** Formulare (auch Schrittfolgen mit Fortschrittsanzeige), Hinweis- und Ergebnis-Screens (Alert plus Aktionen). Einzeilige Felder stehen dort paarweise in zwei Spalten, wenn sie zusammengehören (Datum/Beginn, Straße/Hausnummer), sonst einzeln. **Voll, Containerbreite von der Kopfzeile bis „Abmelden“:** Listen mit Suche und Filter, Übersichten, Zusammenfassungen und Prüflisten, mehrere gleichwertige Karten nebeneinander. Zusammenfassungen zeigen in voller Breite die Beschriftung links (260 px) und den Wert rechts, in schmaler Spalte die Beschriftung über dem Wert. Ein Screen mit Formularfeldern ist immer schmal, auch wenn er eine Zusammenfassung enthält. Im Founder-Bereich haben Hinweise, Karten und Felder in Formularen dieselbe Breite (560 px). Fließtext höchstens 75 Zeichen breit. Mobil immer volle Breite.
- **V2 Rhythmus statt Einheitsabstand:** Zusammengehörendes näher (8–12 px), Abschnitte weiter (32–48 px), nicht überall 24 px. Gruppierung durch Nähe vor Linien und Kästen.
- **V3 Titelgröße je Viewport:** Mobil Titel kleiner als Desktop (z. B. 24 statt 32), Fließtext bleibt 16 px; die Hierarchie bleibt über die Größenunterschiede erhalten, nicht über absolute Werte.
- **V5 Schriftstufen auf Plattform-Seiten (Founder, 06.11.2026):** Seitentitel Desktop Display S (40 Bold), mobil Heading L (32 Bold); Kartentitel und Zwischenüberschriften Heading M (24 Medium); Beschriftungen in Zusammenfassungszeilen Title S (16 Medium); Seitenwechsel („Zurück“, „Seite 1 von n“, „Weiter“) und Zähler 16; Listentitel Title S. Statusanzeigen auf der Seitenfläche nutzen die Variante Outline statt Secondary (graue Fläche auf grauem Grund ist nicht lesbar).
- **V4 Bild vor Text:** Wo der Organizer ein Flyer- oder Profilbild hat, ist es der Blickfang des Screens (PP-10, UX-22), nicht ein Kasten mit Text.
- **V5 Persönliche Texte an Schlüsselmomenten:** Leerzustände, Erfolg und Fehler dürfen im Ton der Szene sprechen (§5.1), kurz, ohne Floskel.
- **V6 Container schneiden nichts ab:** Rahmen, Schatten und Fokusringe werden in Figma und Code nie von einem Container abgeschnitten (kein Zuschneiden an Karten, Zeilen, Feldern). Prüfung im Zoom (200 %). *(Anlass: Fund im Review vom 05.11., abgeschnittene Ränder an Buttons und Feldern.)*
- **V7 Fünf-Sekunden-Test mit Text:** Zu jedem Screen im Review ein Satz: „Wer hier ankommt, sieht zuerst …, danach …, und tut als Nächstes …“. Passt der Satz nicht zum Ziel, ist die Hierarchie falsch.
- **V8 Kontrast auf Farbflächen:** Text auf Akzent- und Pastellflächen mit Wert im Review nennen (≥ 4,5 : 1), Iris nur für Text, wenn der Wert erreicht ist, sonst nur für Flächen, Linien und Icons.

## 6. Screen-Checkliste (Prüfblatt)
Wird für jeden Screen ausgefüllt (Antwort **Ja**, **Nein** mit Begründung oder **n. a.** mit Begründung). Sie ist Teil der Abweichungsliste vor dem Bauen und des PR-Abschnitts „UX-Check“.

**A. Zweck und Ablauf**
- [ ] A1 Der Screen hat ein Ziel und genau eine Hauptaktion (UX-09).
- [ ] A2 Der Weg hierher und der nächste Schritt sind klar (Zurück, Abbrechen, Fortschritt; Peak-End).
- [ ] A3 Es wird nichts verlangt, was schon bekannt ist (UX-10).
- [ ] A4 Folgen für Dritte werden vor der Aktion genannt (UX-11).

**B. Zustände**
- [ ] B1 Leer, befüllt, Entwurf, Fehler, laufender Vorgang, gesperrt sind geklärt oder als n. a. begründet (§3.6).
- [ ] B2 Jeder Zustand hat einen Figma-Frame je Viewport.
- [ ] B3 Unbekannt, nicht zutreffend, übersprungen sind unterscheidbar und nie 0/leer/„Frei“ (UX-01).
- [ ] B4 Der Status (Entwurf/Prüfung/Live/Änderungen/Abgesagt …) ist sichtbar (UX-02, UX-08).
- [ ] B5 Entwürfe und Eingaben gehen bei Fehlern und Abbruch nicht verloren (UX-12).

**C. Inhalt und Text**
- [ ] C1 Alle Texte folgen §5.1 (Du-Form, Doppelpunkt, Ton, Buttons, Fehler, Begriffe).
- [ ] C2 Pflichtlücken sind konkret benannt, mit Sprung zum Feld (UX-05).
- [ ] C3 KI-Inhalte sind als Vorschlag markiert; Original sichtbar (UX-04).
- [ ] C4 Zeit und Geld folgen UX-06/07.

**D. Zugänglichkeit und Mobil**
- [ ] D1 Kontraste erfüllt, Information nicht nur über Farbe (§3.5).
- [ ] D2 Tastatur, Fokus, Labels, Überschriften; Alternative zu Drag and Drop.
- [ ] D3 Tippziele ≥ 44 px, Eingabetext ≥ 16 px, nichts hover-only.
- [ ] D4 Mobil (390 px) und Desktop geprüft; öffentliche Seiten mobil zuerst.

**E. Daten, Datenschutz, Recht**
- [ ] E1 Keine Einwilligung vorangekreuzt, Zweck genannt, Abmeldung möglich (§3.7, UX-17).
- [ ] E2 Keine personenbezogenen Daten, Tokens oder Adressen in URLs, Logs oder Analytics.
- [ ] E3 Entwürfe sind per Zugriffsschutz nicht öffentlich (UX-15).
- [ ] E4 Seiten über Dritte erfüllen UX-18.

**F. Gestaltung und Bau**
- [ ] F1 Nur Tokens, Komponenten von Seite 10/11 (UX-20), Abweichungen gelistet.
- [ ] F2 Figma-Frame hat „Ready for dev“; gerendertes Bild wurde mit dem Frame verglichen.
- [ ] F3 Linkvorschau und geteilter Link sind bedacht (UX-19).
- [ ] F4 Maße folgen §5.2 (Raster, Radien, Fokus, Icons); Abweichungen sind gelistet.

**G. Produktprinzipien (§2)**
- [ ] G1 Der Screen nützt auch einer einzelnen Person ohne Netzwerk (PP-01).
- [ ] G2 Mögliche Verknüpfungen sind sichtbar und der Nutzen ist in einem Satz genannt (PP-03).
- [ ] G3 Es gibt einen Teilen- oder Verlinken-Moment, in höchstens zwei Schritten und ohne Konto für die Empfangenden, oder die Auslassung ist begründet (PP-04, PP-05).
- [ ] G4 Ein Verbreitungshebel ist bedacht und kommt ohne Dark Pattern und ohne Versand an Dritte ohne Auslöser aus (PP-06, PP-07).
- [ ] G5 Sprache, Gestaltung und Bildwelt passen zur Szene (PP-10, §5.1).
- [ ] G6 Nichts Verbreitendes steht hinter einer Bezahlschranke (PP-11).

**H. Hierarchie, Farbe und Schrift (§5.3)**
- [ ] H1 Es gibt einen Blickfang; Squint-Test und Fünf-Sekunden-Satz passen zum Ziel (UX-23).
- [ ] H2 Rangfolge von Titel, Abschnitt, Text, Nebeninfo ist über Größe, Gewicht und Farbe erkennbar; gleiche Rolle = gleicher Textstil.
- [ ] H3 Farbe lenkt gezielt (Fokus, Fortschritt, Status, Erfolg); nicht grau in grau, nicht bunt ohne Grund (UX-24).
- [ ] H4 Alle Schriften sind Tokens; fehlt eine, liegt ein Vorschlag nach UX-25 vor.
- [ ] H5 Lesebreite und Abstandsrhythmus passen (V1, V2).
- [ ] H6 Rahmen, Schatten und Fokusringe sind im Zoom vollständig sichtbar (V6).

## 7. Verankerung im Prozess
Das Framework wirkt nur, wenn es nicht vom guten Willen abhängt. Deshalb:

1. **`AGENTS.md`:** Regel „UX-Framework“: Vor jeder UI-Aufgabe wird dieses Dokument gelesen; kein Screen wird ohne ausgefüllte Checkliste (§6) vorgelegt oder gemergt.
2. **Abweichungsliste vor dem Bauen** bekommt eine Spalte: Figma | Vertrag | **UX-Framework** | Vorschlag. Verstöße zitieren die Kennung (z. B. „verstößt gegen UX-01“).
3. **Pull-Request-Vorlage** (`.github/pull_request_template.md`): Abschnitte „Figma gegen Umsetzung“ und „UX-Check“ (Checkliste ausgefüllt, Abweichungen begründet) sind Pflicht für jeden PR, der `app/` oder `components/` ändert.
4. **Screen-Review mit dem Founder** beginnt mit der Checkliste für den jeweiligen Screen. Ergebnis wird je Screen festgehalten (Ja/Nein/Begründung), bevor „Ready for dev“ gesetzt wird.
5. **Figma:** Die Legende auf Seite 00 verweist auf dieses Dokument; neue Komponenten und Frames werden gegen §6 geprüft.
6. **Lernschleife:** Jeder Fund aus einem Review oder Test (z. B. die Editor-UX-Punkte aus dem Abnahme-Durchlauf) wird, wenn er allgemein ist, zur Regel (neue UX-Nummer) und nicht nur am Screen behoben. Änderungen am Framework laufen per PR mit Founder-Okay und Datum.
7. **Startprompts** (`07-start-prompt.md`) und `README.md` nennen das Dokument; `docs/STATUS.md` hält den Stand.
8. **CI-Prüfung (bestätigt 05.11., gebaut):** Der Workflow `.github/workflows/ux-check.yml` (Skript `scripts/check-ux-section.sh`) lässt einen PR scheitern, der `app/` oder `components/` ändert, aber die Abschnitte „Figma gegen Umsetzung“ und „UX-Check“ nicht enthält oder deren Platzhalter („ja / nein“) nicht ausgefüllt hat. Die Prüfung ist nur ein Mindeststandard und ersetzt nicht das Review. Damit sie PRs blockiert, muss der Founder sie in GitHub unter Branch-Schutz für `main` als erforderlichen Status eintragen.
9. **Ablauf je Flow (Founder, 05.11.2026, 14:55):** Wir arbeiten Flow für Flow. (1) Inventar: welche Screens und Zustände gibt es in Figma (Desktop und Mobil) und im Code, welche fehlen (`docs/reviews/FLOW-n-inventar.md`). (2) Fehlende Screens werden in Figma erstellt, nach diesem Framework. (3) Erst wenn alle Screens eines Flows da sind, geht der Founder sie gemeinsam mit Claude Screen für Screen durch (Checkliste §6, Protokoll je Screen in `docs/reviews/`). (4) Danach wird gebaut oder angepasst. Ein Screen wird nicht einzeln durchgereicht, solange der Flow Lücken hat.

## 8. Entscheidungen und offene Punkte
**Entschieden am 05.11.2026 (Founder):**
1. Anrede: du.
2. Gendern mit Doppelpunkt.
3. WCAG 2.2 AA als Ziel.
4. Öffentliche Seiten mobil zuerst; Tippziel 44 px.
5. CI-Prüfung für den UX-Check: ja (gebaut, §7.8).
6. Claude leitet Abstandsraster, Radien und Icons aus Figma ab: ja (§5.2, Vorschlag am 05.11. bestätigt).
7. Im Eventstart bleibt neben dem Flyer sichtbar, dass Text und Link später folgen: ja.
8. Produktprinzipien PP-01 bis PP-11 (§2) übernommen wie formuliert, einschließlich der von Claude ergänzten PP-02, PP-07, PP-08, PP-09, PP-11 (Founder, 05.11., 14:46).
9. Alle weiteren Vorschläge aus dem Entwurf (Maße §5.2, Reihenfolge bei Konflikten §2) zugestimmt (Founder, 05.11., 14:46).
10. V1 bis V8 (§5.3) bestätigt (Founder, 05.11., 15:22).
11. UX-23 (Hierarchie), UX-24 (Farbe lenkt Aufmerksamkeit) und UX-25 (fehlende Schrift als Token vorschlagen) in das Framework aufnehmen (Founder, 05.11., 15:16). Ausgestaltung in §5.3, Checkliste H.

**Offen:**
1. ~~Editor-UX-Punkte 1–8~~ **Erledigt durch Verfahren (Founder, 05.11., 14:50):** Die Liste aus dem Test vom 04.11. ist nicht mehr auffindbar. Der Eventeditor (ORG-B) wird in Welle 1 Screen für Screen mit diesem Framework durchgearbeitet; Funde werden dabei sofort in Repo-Doku festgehalten (je Screen ein Review-Protokoll in `docs/reviews/`) und, wenn sie allgemein sind, als neue UX-Regel aufgenommen.
2. **Maße (§5.2):** Radien 6 und 10 prüfen; Profil-Radius `eckig/leicht/rund` im Review von ORG-E festlegen.
3. ~~Tippziele~~ **Entschieden (Founder, 05.11., 16:25):** Buttons 44 px auf allen Viewports. Offen bleibt das Eingabefeld (36 px in Figma und Code): ebenfalls 44 px?
4. **Barrierefreiheitsstärkungsgesetz:** Prüfung, ob es gilt, vor dem Alpha-Start.
5. **Branch-Schutz:** Die CI-Prüfung (§7.8) in GitHub als erforderlichen Status für `main` eintragen (Founder).

## 9. Quellen
- Nielsen Norman Group: 10 Usability Heuristics; Formularrichtlinien.
- W3C: Web Content Accessibility Guidelines (WCAG) 2.2, insbesondere 2.5.7, 2.5.8, 3.3.7, 3.3.8.
- Yablonski: Laws of UX (Hick, Fitts, Miller, Jakob, Zeigarnik, Peak-End, Postel).
- Apple Human Interface Guidelines; Google Material Design (Tippziele, Touch).
- Baymard Institute; GOV.UK Design System (Formulare, Fehlermeldungen).
- DISKOE intern: Produktprinzipien des Founders (05.11.2026), `AGENTS.md`, `04-design-tokens.md`, `03-screens-figma.md`, `06-delta-v0.5-lesefassung.md`, `08-alpha-matrix.md`, Notion „Organizer Network Strategy v0.2“ und „Alpha-Featurematrix v0.1“.
- Nicht geprüft: aktuelle Wortlaute der externen Quellen. Die Regeln sind aus dem Fachwissen zusammengefasst, nicht aus den Seiten übernommen.
