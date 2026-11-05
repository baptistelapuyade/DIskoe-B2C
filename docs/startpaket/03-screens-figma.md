# 03 — Screen-Index (Figma)

Datei: `4wtHBUljZkvFetSA9ZujjY`. Link-Muster: `https://www.figma.com/design/4wtHBUljZkvFetSA9ZujjY?node-id=<ID mit - statt :>`. Beispiel: `2643:9417` → `node-id=2643-9417`.
Hinweis: Figma ist visuelle Referenz. Fachregeln stehen in den Verträgen. Alles hier sind statische Entwürfe, keine Funktionsnachweise.

## Arbeiten mit Figma (seit 04.11.2026)
- **Ein Frame zeigt einen Screen in einem Zustand und einem Viewport.** Keine Screens in Sammelrahmen. Notizen und Review-Hinweise stehen als Text links in der Section, nie im Screen-Frame.
- **Eine Section ist ein Bereich oder Flow.** Jede Zeile ist ein Screen: links der Normalzustand, rechts die weiteren Zustände, Mobil am Zeilenende. Öffentliche Seiten: Mobil als eigene Zeile direkt unter Desktop.
- **Viewports:** Organizer-Desktop 1128 px (das ist das Desktop-Fenster, Founder 04.11.2026), öffentliche Seiten 1440 px, Mobil 390 px.
- **Frame-Namen:** `BEREICH-Nummer[Zustand] · Screen — Zustand · Viewport (alter Code)`, z. B. `PUB-01b · Eventseite — Abgesagt · Desktop`, `ORG-19 · Eventeditor — privater Entwurf · Desktop (T19 / 01)`. Bereiche: `ORG` (bis zur Prüfung), `NACH` (nach der Veröffentlichung), `PUB` (öffentlich), `INT` (intern), `D11`–`D21` (Netzwerk-Bausteine, z. B. `D11.2 · Ort suchen · Desktop`).
- **Section-Namen:** `STATUS · [nicht im Durchstich ·] Kürzel Titel`. Status: `GELTEND`, `ENTWURF`, `ÜBERHOLT` (anzugleichen oder zu klären), `REGELN` (Prüfmaterial, kein Screen), `ARCHIV`. „nicht im Durchstich“ beschreibt den heutigen Bauumfang; was in die Alpha kommt, entscheidet der Founder.
- **Bau-Signal im Dev Mode:** „Ready for dev“ = darf gebaut werden, „Completed“ = gebaut (PR-Nummer als Anmerkung). Frames ohne Status werden nicht gebaut.
- **Ablauf beim Bauen:** Founder und Claude gehen Flow für Flow und Screen für Screen durch. Der Founder passt den Screen in Figma an, wo nötig, und setzt „Ready for dev“. Claude liest genau diesen Frame (Code-Auszug und Screenshot), legt vor dem Bauen eine Abweichungsliste vor (Figma sagt A, Daten/Regeln im Repo sagen B, Vorschlag C) und baut erst nach Okay. Wo Figma schweigt, wird nichts erfunden. Fertig ist ein Screen erst nach einem Vergleich des gerenderten Bildes mit dem Figma-Screenshot; im PR steht eine Tabelle „Figma gegen Umsetzung“.

## Seiten der Datei (Struktur seit 04.11.2026)
Die Legende auf Seite 00 enthält dieselben Regeln. Vor der Neuordnung wurde eine Version im Figma-Versionsverlauf gesichert („Vor Neuordnung 04.11.“). Alle Screen-Frames haben ihre Knoten-ID behalten; nur Sammelrahmen und Zwischenüberschriften wurden entfernt.

| Seite | Inhalt |
|---|---|
| 00 Start hier | Legende: Seiten, Aufbau, Namen, Status, Bau-Signal |
| 10 Design-System — DISKOE-Komponenten | Eigene Komponenten in Bereichen DS-A bis DS-H (siehe „Seite 10 — Komponenten“), u. a. `DISKOE / Action Bar` (2876:1802) |
| 11 Design-System — UI-Kit (Basis) | shadcn-Kit mit funktionalen Bausteinen (Akkordeon, Input File, Select, Tabs, Dialog, Tooltip, Table, Pagination, Breadcrumb, Sheet, Command …); zweite Komponentenquelle neben Seite 10, unverändert |
| 20 Organizer — Ablauf bis zur Prüfung | Zeile 1 Durchstich: ORG-A bis ORG-D. Zeile 2 nicht im Durchstich: ORG-E, D21, D11, D12, D15, D20, D16–D18 |
| 30 Organizer — nach der Veröffentlichung | NACH-A bis NACH-C; darunter der Slice-5-Review-Stand (ÜBERHOLT) |
| 40 Öffentliche Seiten | Zeile 1 Eventseite, Zeile 2 Profile |
| 50 Intern (Founder) | INT-A Founder-Prüfung, INT-B Ortsbindung (nicht im Durchstich) |
| 60 Besucher-Prototyp | Klickprototyp (Desktop 1440×900, Mobile 390×844); nicht umsortiert, sonst brechen die Verknüpfungen |
| 80 Geparkt — Discovery (spätere Phase) | Bausteine für die Discovery nach der Alpha, nicht löschen; unverändert |
| 90 Archiv | ersetzte Stände mit Datum und Grund im Namen; neu: alter Dateiaufbau vom 22.10. |

### Seite 10 und 11 — Komponenten (seit 05.11.2026)
**Zwei Quellen, feste Reihenfolge beim Bauen:**
1. Seite 10 „DISKOE-Komponenten“: eigene Bausteine des Produkts. Zuerst hier suchen.
2. Seite 11 „UI-Kit (Basis)“: shadcn-Kit für funktionale Bausteine ohne DISKOE-Version (z. B. Akkordeon, Input File, Select, Tabs, Dialog, Tooltip, Table). Von dort darf Claude Komponenten nehmen.
3. Hat keine der beiden Seiten den Baustein, fragt Claude nach, statt ihn zu erfinden.

Farben, Schrift und Abstände gelten nach den DISKOE-Tokens (`04-design-tokens.md`), auch bei Bausteinen aus dem Kit. Weicht ein Kit-Baustein davon ab, steht das in der Abweichungsliste vor dem Bauen. Wird ein Kit-Baustein im Produkt benutzt, kann der Founder entscheiden, ihn als `DISKOE / …` auf Seite 10 nachzubauen. Seite 11 bleibt unverändert (Kit-Struktur), trägt aber oben links eine Hinweiskarte „DISKOE: So nutzen wir dieses Kit“ (2952:34393).

**Seite 10 ist nach Bereichen geordnet:** Komponenten-Sets liegen nebeneinander und brechen in Zeilen um, Bereiche liegen in einem Raster. In Sets mit Viewport-Eigenschaft steht Mobil rechts neben Desktop, jede Zeile ist ein Zustand. Neue Komponenten kommen in den passenden Bereich, nicht lose auf die Seite. Auf der Seite liegt links oben die Legende „DS · Legende“ (2952:1846). Alle Komponenten-IDs sind unverändert, Instanzen auf anderen Seiten bleiben verbunden.

| Bereich (Section) | Knoten | Inhalt |
|---|---|---|
| DS-0 Stilübersicht (Frame, Referenz) | 2454:392 | Farben, Typografie, Beispiele (vorher „DISKOE / Review“) |
| GELTEND · DS-A Aktionen und Formular | 2952:1841 | Button, Icon Button, Checkbox, Switch, Tabs, Input, Textarea, Select, File Input, Form Field, Image Upload |
| GELTEND · DS-B Rückmeldung und Kleinteile | 2952:1842 | Badge, Alert, Dialog, Avatar, Atmosphere Chip, Media, Empty State |
| GELTEND · DS-C Seitenstruktur und Navigation | 2952:1843 | Section Heading, Color Block, Page Header (+ Desktop), Navigation Item, Workspace Switcher, Action Bar, **Footer** (`2978:1861`, Viewport Desktop/Mobil, Divider Aus/An; Impressum und Datenschutz, 44 px Tippfläche, seit 05.11.2026), **App Header** (`2980:8182`, Viewport Desktop/Mobil; Wortmarke links, Aktion rechts, Standard „Abmelden“), **Progress / Fortschrittsleiste** (`2984:8323`, Viewport Desktop mit Beschriftungen / Mobil „Schritt n von 5“, Step 1–5, erreicht Iris), **Weg Panel** (`2985:8287`, Viewport Desktop-Panel / Mobil-Band, Step 1–3 mit Akzent Iris/Blau/Pink, Eigenschaft „Show wordmark“), **Navigation Row** (`2985:8294`, Viewport Desktop/Mobil, „Zurück“ links) |
| GELTEND · DS-D Event- und Profilkarten | 2952:1844 | Event Card, Event Row, Profile Banner, Profile Header / Cover, Spotify Placeholder, **Profile Card / Profilkarte** (`2985:8579`, Viewport Desktop/Mobil × Tone Neutral/Success/Warning; nutzt Avatar, Badge, Progress, Button; Texteigenschaften Name, Nachricht, Hinweistext; Schalter Zweit-/Drittaktion) |
| ENTWURF · nicht in der Alpha · DS-H Event-Follow | 2952:1845 | Event Follow / Organizer Card, Change Card (Mails an Besucher sind außerhalb der Mail-Freigabe) |
| GELTEND · DS-G Event-Infokarten | 2786:40643 | Info-Balken, Gut zu wissen v3 (Desktop/Mobile), Event-Tag, Tag-Farben |
| GELTEND · DS-E Profilmodule | 2577:5297 | Profile Module (Identity, Event Item, Upcoming Events, Manifest, Music, Gallery, Recommendations, Archive, Links and Contact), Venue Section |
| ENTWURF · nicht im Durchstich · DS-F Artist-Profil und Listen | 2731:50998 | Artist Section (Hero, Kommende Events, Bio, Links, Gespielt bei, Archiv, Über diese Seite), Profile Event Row, Link Card, Archive Poster, Type Label, Tag, Show More |

### Seite 20 — Organizer bis zur Prüfung
| Section | Knoten | Zeilen |
|---|---|---|
| GELTEND · ORG-A Zugang und Profil anlegen | 2943:5576 | Teststart, E-Mail (`ORG-01`), Code (`02`), Profiltyp (`52`), Profileditor (`03`, `04`, Mobil `88`), Profilbild (`05`, `51`, `49`, `93`), Cover/Venue-Pfad (`50`, `06`, nicht im Durchstich), Vorschau (`09`), Bestätigen (`10`–`13`), in Prüfung (`14`, `41`) |
| GELTEND · ORG-B Event erfassen und bearbeiten | 2943:5589 | Eventstart (`15`, `16`, Mobil `89`, `90`), Erfassung (`17`, `18`), Entwurf fortsetzen (`84`, `40`, `45`), Eventeditor (`19`, `39`, `30`, `31`, `43`, `44`, `94`, Mobil `53`), Programm und Besuch (`ORG-91`), Preis und Zugang (`ORG-92a`–`l`: fixed, free, from, range, donation, minimum_donation, unknown, registration, soldout, fees_known, fees_unknown, urlerror), Atmosphäre (`20`, `21`, Mobil `54`, `55`) |
| GELTEND · ORG-C Zusatzfragen (Ergänzungen) | 2943:5599 | Start (`22`, Mobil `85`), Club (`23`–`27`, Mobil `86`), Zugänglichkeit (`28`), Vernissage (`75`–`78`), Film (`79`–`83`), Abschluss (`29`, `46`–`48`, Mobil `87`) |
| GELTEND · ORG-D Vorschau, Bestätigung und Erstprüfung | 2943:5608 | Vorschau (`33`, `32`, Mobil `56`), Bestätigung (`34`–`37`), eingereicht (`38`, `42`) |
| ENTWURF · nicht im Durchstich · ORG-E Profilgestaltung und Module | 2943:5614 | Gestaltung (`07`, `65`, `66`), Module (`08`, `62`), Modulinhalte (`57`–`61`, `64`), Profilvorschau (`63`), Galerie (`67`–`70`), Empfehlungen (`71`–`74`) |
| ENTWURF · nicht im Durchstich · D21, D21 c/d, D11, D12, D15, D20, D16–D18 | 2777:44971, 2779:45721, 2715:43598, 2719:43976, 2720:44069, 2760:44388, 2721:44178 | Netzwerk-Bausteine, Gestaltung, Plus/Pro. D21-Frames sind 1440 breit (übrige Organizer-Screens 1128) |

Neu vergeben: `ORG-91` (Programm und Besuch, 2688:9788), `ORG-92a`–`l` (Preis und Zugang, z. B. fixed 2688:10292, unknown 2688:12129), `ORG-93` (Profilbild mit Bildbeschreibung, 2857:39275, vorher S5-B1), `ORG-94` (Eventbild mit Bildbeschreibung, 2857:39307, vorher S5-B2). Prototyp-Startpunkte (14) sind erhalten.

### Seite 30 — nach der Veröffentlichung
| Section | Knoten | Zeilen |
|---|---|---|
| GELTEND · NACH-A Freigabe und Rückfrage | 2945:642 | Testanleitung, Freigabe (`NACH-01`), Rückfrage (`02`–`04`), Systemmails (`NACH-19`, 2894:1178, vorher S5-E, Textentwurf) |
| GELTEND · NACH-B Eventverwaltung und Änderungen | 2945:649 | Eventverwaltung (`05`), weiteres Event (`NACH-17` 2855:38933, `NACH-18` 2896:735, vorher S5-C/S5-F), Text ändern (`06`–`08`), Ort ändern (`09`, `10`) |
| GELTEND · NACH-C Verschieben und Absage | 2945:656 | Verschieben (`11`–`14`), Absage (`15`, `16`) |
| ÜBERHOLT · Slice 5 Review-Flow (29.10.2026) | 2859:40104 | Review-Labels und „Kopien“. Sechs von neun Kopien weichen in Text oder Höhe vom Original ab; beim Screen-Review klären, welche Fassung gilt, danach archivieren |

### Seite 40 — öffentliche Seiten
| Section | Knoten | Frames |
|---|---|---|
| GELTEND · PUB-01 Eventseite | 2936:11700 | Desktop/Mobil: a Normal (2643:9417 / 2652:7621), b Abgesagt (2676:9868 / 2676:10041), c Verschoben, Termin folgt (2676:10193 / 2676:10312), d Verschoben, neuer Termin (2676:10434 / 2676:10554), e Vorbei (2676:10677 / 2676:10826), f Vernissage (2792:48358), g Film (2792:48780). Nach einer Änderung: h–l (2702:11091, 11240, 11389, 11543, 11692). Teilen: m–o (2661:8159, 8560, 8789) |
| REGELN · PUB-16 Gut zu wissen — Farbtest und Randfall | 2936:11706 | vier Paletten, Randfall 6 Balken Desktop/Mobil |
| ENTWURF · nicht im Durchstich · PUB-07 Eventseite mit Ortsstatus, Co-Hosts, Line-up (D13) | 2716:41215 | 07a–c Desktop, 07a Mobil |
| ENTWURF · nicht im Durchstich · PUB-18 Besucheraktionen | 2939:11702 | Merken, E-Mail-Abos, Kalender: `PUB-18.01a` … `PUB-18.10d` |
| GELTEND · PUB-06 Veranstalterprofil | 2940:11700 | a Normal (2632:7096 / 2632:7267), b ohne kommende Termine (2580:6685 / 2602:15795, noch alter Stil), c Liste eingeklappt (2732:51616 / 2732:51892), d Liste ausgeklappt (2732:51754) |
| ENTWURF · nicht im Durchstich · PUB-03 Profilmodule und Kombinationen | 2577:5862 | 03a–g Desktop (inkl. frühere PUB-04-Regeln), 03a, h–j Mobil (frühere PUB-05) |
| ENTWURF · nicht im Durchstich · PUB-11, PUB-08, PUB-09 | 2747:43479, 2730:56314, 2758:43625 | Venue-Profil, Künstler:innen-Seite, Künstler-Zustände |
| REGELN · PUB-12 Profiltypen | 2753:52940 | Vergleich Kopf, Kennzeichen, Karten |
| ENTWURF · nicht im Durchstich · PUB-13 Profilgestaltung | 2769:44367 | Richtungen und Paletten |
| GELTEND · nicht im Durchstich · PUB-17 Follow-Platzierung | 2839:47447 | Entscheidung 26.10.2026, 17a–e |

Aufgelöst am 04.11.2026: `PUB-01`- und `PUB-19`-Sammelrahmen (Zustände jetzt `PUB-01b`–`e`), `PUB-20`–`24` (jetzt `PUB-01h`–`l`), `PUB-14`/`15` (jetzt `PUB-01f`/`g`), `PUB-04`/`05` (jetzt in `PUB-03`), `PUB-10` (jetzt `PUB-06c`/`d`), `PUB-16`-Rahmen, `PUB-18`-Rahmen. Offen: `PUB-01h`–`l` überschneiden sich mit `b`–`d`; beim Screen-Review klären, welche Fassung gilt.

### Seite 50 — intern
| Section | Knoten | Frames |
|---|---|---|
| GELTEND · INT-A Founder-Prüfung | 2945:6270 | `INT-01` Prüfungen offen (2764:44858, vorher D8/I01), `INT-03` Profil und erstes Event prüfen (2855:38880, vorher S5-A), `INT-04` Rückfrage eingeben (2894:1019, vorher S5-D) |
| ENTWURF · nicht im Durchstich · INT-B Ortsbindung | 2945:6276 | `INT-02` Ortsbindung ablehnen (2764:45285, vorher D8/I02) |

## Verlauf
Die Abschnitte ab hier sind Stand ihres Datums und nennen teils alte Nummern oder aufgelöste Rahmen (z. B. `PUB-19`–`24`, `PUB-04`/`05`, `PUB-10`, Kernflow 2533:3521). Die Zuordnung zur neuen Struktur steht oben.

### Umzüge am 30.10.2026
| Vorher | Jetzt |
|---|---|
| Flow 01 Wireframes (2496:2924) | Archiv; Mobil M01–M03 jetzt `ORG-53` bis `ORG-56` im Kernflow |
| Flow 00 Organizer-Einstieg (2514:1943) | Archiv; 00.7 und M00.1–M00.3 jetzt `ORG-84`, `ORG-88` bis `ORG-90`; 00.4c (manuelles Formular) durch Eventeditor `ORG-19` ersetzt |
| Flow 01 Adaptive Ergänzungen (2504:1579) | Archiv; Vernissage/Film `ORG-75` bis `ORG-83`, Mobil `ORG-85` bis `ORG-87` |
| Zusammenhängender Profileditor (2519:5757) | Archiv; Modulinhalte und Varianten `ORG-57` bis `ORG-74` |
| Eventsonderzustände, Öffentliches Ergebnis, Besucheraktionen (Zustände) | Seite 40, `PUB-18` bis `PUB-24` |
| D8 (2764:44857) | Seite 50 |
| Poll-, Plan-, District-, Merken- und Kategorien-Bausteine aus dem Kit (17 Elemente) | Seite 80 Geparkt, für die Discovery |
| Zustände 01–16 | `NACH-01` bis `NACH-16`, Aktionen in `DISKOE / Action Bar` |
| 17 handgebaute „Gut zu wissen / zwei Spalten“ (D13, Eventsonderzustände, Ergebnis) | durch Komponente „Gut zu wissen v3“ ersetzt; Altbestand im Archivrahmen auf Seite 90 |

Geltende Eventseite: „Öffentliche Eventseite — Contententwurf / Review - NEW“ (`PUB-01`). D13, Eventsonderzustände und Öffentliches Ergebnis sind noch an sie anzugleichen.

## Komponenten (DISKOE — Komponenten)
Button 2453:242 (Varianten Primary/Outline/Ghost, Size Regular/Large), Alert 2453:739, Dialog 2453:755, Form Field 2454:356, Image Upload 2454:391, Atmosphere Chip 2454:235, Event Card 2487:42626, Event Row 2479:801, Profile Banner 2479:706, Profile Header Cover 2624:6973, Empty State 2479:802, Spotify Placeholder 2561:5143. Abschnitte: Profilmodule 2577:5297, Artist-Profil und Listen 2731:50998, Event-Infokarten 2786:40643 (enthält **Info-Balken**, **Event-Tag**, **Tag-Farben**, **Gut zu wissen v3**).

## Bauhinweise aus den Reviews
- Buttons: bestehende Varianten wählen, Größe nicht strecken, keine Schatten auf Outline-Buttons, Kontur innen 1 px (Delta v0.4 §17.6).
- Mobile Event-Aktionen: Haupt-CTA volle Breite, Merken/Teilen gleich breit darunter.
- „Mehr anzeigen“ bei mehr als 3 Einträgen (Events, Galerie, Archiv): größer, Akzentfarbe, 72 px Abstand zur Liste.
- Eventseite: Faktenblock direkt nach dem Titel, Datum/Beginn und Venue hervorgehoben (Delta v0.4 §17.5).
- Archivliste: keine eigene Archivseite, „Weitere vergangene Events anzeigen“ im Modul.

## Follow und Eventänderungen in den Hi-Fi-Screens (Stand 2026-11-02)
Entscheidungen vom 26.10.2026 (Q32, S9, D10): Follow ist eine feste Profilaktion, kein Modul und für Organizer nicht abschaltbar. Label „Neue Events per E-Mail erhalten“, E-Mail-Feld direkt in der Section, Anmeldung per Bestätigungslink. Der Entwurf `PUB-17` (2839:47447) ist die Referenz und trägt jetzt den Status GELTEND; Animation und Zustände stehen nur dort. Die Screens unten sind danach angeglichen. `PUB-02` (alte Review-Fassung ohne Komponenten) liegt auf Seite 90 Archiv; `PUB-04` (Desktop-Regeln, Modulanzahl) hat keinen Profilkopf und blieb unverändert.

### Komponenten und ihre Nutzung
| Baustein | Wo | Nutzung |
|---|---|---|
| `DISKOE / Profile Module / Identity` (Set 2597:8374, Viewport Desktop/Mobile) | Veranstalter-Kopf in `PUB-03`, `05`, `06`, `12`, `13` | Hero-Aktionen: Follow primär mit Mikrotext, „Programm ansehen“ sekundär, „Profil teilen“ in der Kopfzeile. Der Name im Mikrotext ist fest („Nebenraum“) und wird im Screen nicht überschrieben. |
| `DISKOE / Profile Header / Cover` (Venue, Desktop 2624:6923, Mobile 2624:6948) | `PUB-11`, `12` | Gleiche Aktionsreihenfolge; „Profil teilen“ mit dunklem Hintergrund (50 %), weil es auf dem Foto liegt. |
| `DISKOE / Artist Section / Hero`, nur Mode „Selbst gepflegt“ (Desktop 2733:41747, Mobile 2733:41775) | `PUB-08` (Variante B), `12` | Follow primär. Mode „Alpha, angelegt vom Organizer“ hat bewusst keine Follow-Aktion. |
| Follow-Section „Nichts verpassen“ (noch **keine** Komponente; Vorlagen 2908:12139 Desktop, 2908:12202 Mobile) | vor „Links und Kontakt“ in `PUB-03`, `05`, `06`, `08` (B), `11`, `13` | Immer nach allen Modulen. Farben nur über Profilpalette-Rollen (Kopf, Kopf Text, Akzent, Akzent Text, Seite, Linie, Text gedämpft), damit alle neun Paletten 4,5 : 1 erreichen. Bei Venue und Artist ist der Name im Text per Hand ersetzt. Offen: als Komponente mit Textfeld für den Namen bauen. |
| `DISKOE / Event Follow / Organizer Card` (Set 2915:12020, Viewport Desktop/Mobile, Textfelder „Headline“ und „Text“) | Block „Veranstaltet von“ auf allen Eventseiten (`PUB-01`, `07`, `14`, `15`, `19`–`24`) | Anmeldung für alle künftigen Events des Veranstalters. In die Textfelder den Veranstalternamen einsetzen (Muster: „Neue Events von {Name} direkt ins Postfach.“). |
| `DISKOE / Event Follow / Change Card` (Set 2915:12059, Eigenschaften Viewport und Status) | dritte Spalte im Band „Beschreibung, Atmosphäre und Updates“ | Anmeldung nur für Änderungen an diesem einen Event. Status je Eventzustand wählen (siehe unten). |

### Change Card: Status je Eventzustand
| Eventzustand | Status | Inhalt |
|---|---|---|
| normal, geändert, Termin neu bestätigt (`PUB-01`, `07`, `14`, `15`, `20`–`22`, `rescheduled`) | Aktiv | E-Mail-Feld, Button „Bei Änderungen benachrichtigen“ |
| verschoben, neuer Termin folgt (`postponed_undated`, `PUB-23`) | Neuer Termin folgt | E-Mail-Feld, Button „Über neuen Termin informieren“ |
| abgesagt (`cancelled`, `PUB-24`) | Abgesagt | graue Fläche, nur Text, keine Anmeldung |
| vorbei (`past`) | Vorbei | graue Fläche, Text und Link „Neue Events erhalten ↓“ zur Veranstalter-Karte |

Regeln:
- Der Eventkopf zeigt unter „Zum Kalender hinzufügen“ den Link „Bei Änderungen benachrichtigt werden ↓“ nur bei den Status Aktiv und Neuer Termin folgt.
- Bei Abgesagt und Vorbei gibt es keine Anmeldung zu Eventänderungen. Ein deaktivierter Button wurde bewusst nicht gewählt, weil er Fragen aufwirft, statt etwas zu erklären.
- Die Veranstalter-Karte steht immer unten im Block „Veranstaltet von“, auch bei Abgesagt und Vorbei.

### Abweichungen und offene Punkte
- Am 02.11.2026 wurden beim Einsetzen acht Status-Spalten (`PUB-19` abgesagt, verschoben ohne Termin, vorbei; `PUB-23`, `PUB-24`) mit der aktiven Karte überschrieben. Der ursprüngliche Inhalt ist nicht wiederherstellbar (keine gespeicherte Version nach dem 30.10.). Die Spalten tragen jetzt die Status-Varianten, deren Texte neu entworfen wurden. Der Founder hat die Wortlaute am 03.11.2026 bestätigt: „Neuer Termin“ (Der Termin unten ist der neue Termin.), „Neuer Termin folgt“ (Ein neuer Termin steht noch nicht fest.), „Abgesagt“ (Dieses Event findet nicht statt.), „Vorbei“ (Dieses Event ist vorbei.). Die Figma-Spalten müssen noch mit diesen Texten gefüllt werden.
- Der Merken-Dialog verweist noch auf die alte Änderungs-Anmeldung. Er sollte nur „Merken“ und die Veranstalter-Anmeldung anbieten.
- Der Besucher-Prototyp (Seite 60) trägt noch die alte Spalte „Wenn sich etwas ändert“ und den alten Veranstalter-Block.
- Die Profile ohne Termine („Keine kommenden Events · Neue Termine folgen“ in `PUB-03`, `05`) sind im alten Stil.
- Vor der Umsetzung im Code fehlen Texte für die Bestätigungs-E-Mails dieser beiden Anmeldungen und die Entscheidung, ob die Änderungs-Anmeldung in der Alpha enthalten ist (öffentliche Eventseiten gehören zu Slice 6).

## Slice 5 gebaut (Stand 2026-10-30)
Section „ENTWURF · Slice 5“ (2859:40104): S5-A Founder-Prüfung (2855:38880), S5-D Rückfrage mit betroffener Stelle (2894:1019) und S5-E Mailentwürfe (2894:1178) sind in PR D gebaut, die Organizer-Seiten (Bestätigung, in Prüfung, Selbstveröffentlichung, Eventverwaltung) in PR C. Kein Screenshot-Vergleich mit Figma erfolgt; Abweichungen in `.planning/phases/04-durchstich/SLICE-5-SUMMARY.md`. Der Rest (PR F/G, 2026-11-02): `NACH-11`, `NACH-12`, `NACH-15` und der Zustand `NACH-16` sind gebaut, ohne Freitext „Grund/Hinweis“ und ohne Abo-Sätze. Nicht gebaut: `NACH-09`, `NACH-10`, `NACH-13`, `NACH-14` (veröffentlichte Zustände sind die Verwaltungsseite).

## Slice 6 gebaut (PR I, 2026-11-02)
`PUB-01` (Eventseite) ist als `/e/[slug]` gebaut, auch die Statusvarianten für verschoben, verschoben ohne Termin und abgesagt. Weggelassen sind Follow, Kalender, Änderungs-Karte (Alpha-Ausschluss); „Teilen“ ist gebaut, „Merken“ nur als deaktivierter Platzhalter (Stand 2026-11-04, Layout an PUB-01 angeglichen) sowie Programm, Einlass, Alter, Vor Ort und Zugänglichkeit (keine Daten in der Alpha). Texte der Statusvarianten sind Vorschläge. Einzelheiten: `.planning/phases/04-durchstich/SLICE-6-SUMMARY.md`.
PR J (2026-11-02): Veranstalter-Profilseite gebaut (Kopf, kommende Events mit „Mehr anzeigen“ ab dem vierten, Leerzustand „Neue Termine folgen.“, Links und Kontakt). Ohne Follow-Section, Module und Gestaltung.
