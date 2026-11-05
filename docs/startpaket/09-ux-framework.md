# 09 — UX-Framework und Styleguide

**Status:** Entwurf vom 05.11.2026 zur Abstimmung mit dem Founder. Mit der Bestätigung gilt dieses Dokument für jeden Screen, jeden Zustand, jede Mail und jeden Fehlertext. Bis dahin sind Abschnitte, die nicht aus einer Quelle stammen, als **Vorschlag** gekennzeichnet; offene Entscheidungen stehen in §8.

## 1. Zweck und Geltung
Das Framework macht Screen-Reviews wiederholbar. Statt jeden Screen neu zu beurteilen, prüfen wir ihn gegen dieselben Regeln, und was wir beim Review lernen, wird eine Regel (§7.6).

- **Es gilt für:** neue und geänderte Screens, jeden Zustand und Viewport, Systemmails, Fehler- und Leertexte, Figma-Frames vor „Ready for dev“.
- **Rangfolge bei Widerspruch:** Datenverträge und Fachregeln (siehe `README.md`, Quellenrangfolge) vor diesem Dokument; dieses Dokument vor einzelnen Figma-Entscheidungen. Verstößt ein Figma-Frame gegen eine Regel hier, steht das in der Abweichungsliste (§7.3) und der Founder entscheidet. Ausnahmen werden im Screen dokumentiert, nicht still gemacht.
- **Werte, Farben, Komponenten** stehen nicht hier, sondern in `04-design-tokens.md` und auf den Figma-Seiten 10 und 11 (`03-screens-figma.md`). Hier stehen die Regeln, nach denen sie eingesetzt werden.
- **Kennzeichnung:** **Regel** = gilt, Quelle genannt. **Vorschlag** = Claude schlägt vor, Founder bestätigt. **Offen** = Entscheidung fehlt (§8).

## 2. Leitprinzipien DISKOE
Aus der Netzwerkstrategie v0.2 (Notion, §11), dem Outcome Brief und `AGENTS.md`. Sie entscheiden, wenn zwei Regeln kollidieren.

1. **Flyer rein, Seite raus.** Jeder Ablauf spart dem Organizer Arbeit. Wir fragen nur nach dem, was fehlt, und nehmen nie etwas zweimal auf.
2. **Standalone und Eigennutz zuerst.** Jeder Screen nützt dem Handelnden sofort, auch ohne Netzwerk.
3. **Bestätigte Fakten vor selbstsicheren Texten.** Nichts wird erfunden, geraten oder als sicher dargestellt, was es nicht ist.
4. **Nichts wird still öffentlich.** Entwürfe sind privat; öffentlich wird nur, was der Mensch ausdrücklich bestätigt hat.
5. **Vertrauen vor Reichweite.** Das gilt besonders bei Seiten über Dritte und bei Mails an Besucher.
6. **Kulturelle Passung.** Gestaltung und Ton gehören in die Szene. Kein Corporate-Eventtool, keine Marketing-Floskeln.

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
- Tippziele mindestens 44 × 44 px (WCAG 2.2 AA verlangt 24 × 24 px, wir halten 44 aus Komfort); Abstand zwischen Zielen.
- Eingabetext mindestens 16 px, damit iOS nicht zoomt. Kein Hover-only: alles Wichtige ist ohne Hover erreichbar.
- Wichtige Aktionen in Daumenreichweite (unten), keine Pflicht-Mehrfinger-Gesten.
- Öffentliche Seiten werden **mobil zuerst** geprüft (Vorschlag: Zugriff kommt überwiegend über geteilte Links aus Stories und Chats).

### 3.5 Barrierefreiheit (Orientierung WCAG 2.2, Stufe AA)
Ob eine Rechtspflicht besteht (Barrierefreiheitsstärkungsgesetz) ist **nicht geprüft**; wir arbeiten trotzdem nach AA, weil die Szene Zugänglichkeit als Thema ernst nimmt und `Zugänglichkeit` selbst ein Datenfeld am Event ist.
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
- **UX-10 Nur fragen, was fehlt.** Die Erfassung füllt vor, fragt gezielt nach und fragt nichts doppelt (Prinzip 1, WCAG 3.3.7).
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
- **UX-22 Die Szene darf man sehen.** Typografisch und im Bild eigensinnig statt Standard-SaaS; Fotos und Flyer der Organizer sind die Hauptdarsteller, die Oberfläche tritt zurück. *(Prinzip 6; Vorschlag zur Ausgestaltung im Review)*

## 5. Text und Ton
Vorschlag, bis der Founder bestätigt (§8).
- **Anrede:** Offen, ob „du“ (einzeln) oder „ihr“ (Kollektive). Heute: Founder-Seite in Du-Form, Figma 01 „Eure Seiten sind veröffentlicht“.
- **Stil:** kurz, aktiv, konkret. Ein Gedanke pro Satz. Keine Ausrufezeichen-Euphorie, keine Marketing-Superlative, kein „leider“, kein Behördendeutsch.
- **Buttons:** Verb plus Objekt („Event veröffentlichen“, „Absage bestätigen“), nie „OK“ oder „Weiter“, wenn etwas passiert.
- **Fehler:** 1. was ist passiert, 2. was kann ich tun. Keine Schuldzuweisung („Du hast …“), keine technischen Codes.
- **Leere Zustände:** was hier entsteht, plus nächster Schritt.
- **Begriffe:** Format-Namen und Atmosphäre-Begriffe wie in `04-design-tokens.md` und Figma. Ein Ding heißt überall gleich (nicht Event/Veranstaltung/Termin gemischt).
- **Gendern:** Offen (Notion nutzt „Künstler:innen“).
- **Zahlen und Zeit:** deutsches Format, 24-Stunden-Uhr, „Uhr“ nach der Zeit, Datum mit Wochentag in Listen.
- **Mails:** Betreff nennt den Zweck; erster Satz sagt, was der Empfänger tun soll; Absender und Grund des Empfangs stehen drin.

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
- [ ] C1 Alle Texte folgen §5 (Ton, Buttons, Fehler, Begriffe).
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

## 7. Verankerung im Prozess
Das Framework wirkt nur, wenn es nicht vom guten Willen abhängt. Deshalb:

1. **`AGENTS.md`:** Regel „UX-Framework“: Vor jeder UI-Aufgabe wird dieses Dokument gelesen; kein Screen wird ohne ausgefüllte Checkliste (§6) vorgelegt oder gemergt.
2. **Abweichungsliste vor dem Bauen** bekommt eine Spalte: Figma | Vertrag | **UX-Framework** | Vorschlag. Verstöße zitieren die Kennung (z. B. „verstößt gegen UX-01“).
3. **Pull-Request-Vorlage** (`.github/pull_request_template.md`): Abschnitte „Figma gegen Umsetzung“ und „UX-Check“ (Checkliste ausgefüllt, Abweichungen begründet) sind Pflicht für jeden PR, der `app/` oder `components/` ändert.
4. **Screen-Review mit dem Founder** beginnt mit der Checkliste für den jeweiligen Screen. Ergebnis wird je Screen festgehalten (Ja/Nein/Begründung), bevor „Ready for dev“ gesetzt wird.
5. **Figma:** Die Legende auf Seite 00 verweist auf dieses Dokument; neue Komponenten und Frames werden gegen §6 geprüft.
6. **Lernschleife:** Jeder Fund aus einem Review oder Test (z. B. die Editor-UX-Punkte aus dem Abnahme-Durchlauf) wird, wenn er allgemein ist, zur Regel (neue UX-Nummer) und nicht nur am Screen behoben. Änderungen am Framework laufen per PR mit Founder-Okay und Datum.
7. **Startprompts** (`07-start-prompt.md`) und `README.md` nennen das Dokument; `docs/STATUS.md` hält den Stand.
8. **Vorschlag, noch nicht gebaut:** Eine CI-Prüfung, die PRs mit Änderungen in `app/` oder `components/` ablehnt, wenn der Abschnitt „UX-Check“ im PR-Text fehlt. Braucht Zustimmung (§8).

## 8. Offene Entscheidungen (Founder)
1. **Anrede:** „du“ (einzelne Person) oder „ihr“ (Kollektive)? Einheitlich im ganzen Produkt oder je Zielgruppe?
2. **Gendern:** Doppelpunkt („Künstler:innen“) wie in Notion oder neutrale Formulierungen?
3. **Zugänglichkeitsziel:** WCAG 2.2 AA als Ziel bestätigen. Ob das Barrierefreiheitsstärkungsgesetz greift, wäre vor dem Alpha-Start zu prüfen.
4. **Mobil zuerst für öffentliche Seiten** und Tippziel 44 px bestätigen.
5. **CI-Prüfung für den UX-Check** (§7.8) bauen: ja oder nein.
6. **Lücken im Styleguide:** Abstandsraster, Eckenradius je Stufe und Icon-Satz sind noch nicht festgelegt (`TODO(spec)` in `04-design-tokens.md`). Soll Claude aus den vorhandenen Figma-Frames einen Vorschlag ableiten?
7. **Editor-UX-Punkte 1–8 aus dem Test:** bitte noch einmal nennen oder ablegen; sie werden hier als Regeln eingearbeitet.
8. **Text- und Link-Import:** Rein als UX-Frage: Beim Flyer-Start bleiben Text einfügen und Link einfügen als sichtbare Alternative im Eventstart, auch wenn sie später gebaut werden?

## 9. Quellen
- Nielsen Norman Group: 10 Usability Heuristics; Formularrichtlinien.
- W3C: Web Content Accessibility Guidelines (WCAG) 2.2, insbesondere 2.5.7, 2.5.8, 3.3.7, 3.3.8.
- Yablonski: Laws of UX (Hick, Fitts, Miller, Jakob, Zeigarnik, Peak-End, Postel).
- Apple Human Interface Guidelines; Google Material Design (Tippziele, Touch).
- Baymard Institute; GOV.UK Design System (Formulare, Fehlermeldungen).
- DISKOE intern: `AGENTS.md`, `04-design-tokens.md`, `03-screens-figma.md`, `06-delta-v0.5-lesefassung.md`, `08-alpha-matrix.md`, Notion „Organizer Network Strategy v0.2“ und „Alpha-Featurematrix v0.1“.
- Nicht geprüft: aktuelle Wortlaute der externen Quellen. Die Regeln sind aus dem Fachwissen zusammengefasst, nicht aus den Seiten übernommen.
