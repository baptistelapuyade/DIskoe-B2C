# 03 — Screen-Index (Figma)

Datei: `4wtHBUljZkvFetSA9ZujjY`. Link-Muster: `https://www.figma.com/design/4wtHBUljZkvFetSA9ZujjY?node-id=<ID mit - statt :>`. Beispiel: `2643:9414` → `node-id=2643-9414`.
Hinweis: Figma ist visuelle Referenz. Fachregeln stehen in den Verträgen. Alles hier sind statische Entwürfe, keine Funktionsnachweise.

## Seiten der Datei (Struktur seit 30.10.2026)
Status im Namen jeder Section: GELTEND, ENTWURF oder ARCHIV. Screens tragen eine durchgehende Nummer (`ORG-nn`, `NACH-nn`, `PUB-nn`), der alte Code steht in Klammern dahinter. Knoten-IDs sind beim Umsortieren gleich geblieben.

| Seite | Inhalt |
|---|---|
| 00 Start hier | Legende, Status-Regeln, Nummernschema |
| 10 Design-System — DISKOE-Komponenten | Eigene Komponenten, u. a. `DISKOE / Action Bar` (2876:1802) |
| 11 Design-System — UI-Kit (Basis) | shadcn-basiertes Fundament; nur Icons, Select, Tabs, Internal Components und Button werden außerhalb des Kits benutzt |
| 20 Organizer — Ablauf bis zur Prüfung | Master: Kernflow v1 (2533:3521, `ORG-01` bis `ORG-90`), dazu D11, D12, D15–D18, D20, D21, Preis und Zugang, Eventeditor-Review |
| 30 Organizer — nach der Veröffentlichung | `NACH-00` Übersicht, `NACH-01` bis `NACH-16` Freigabe, Rückfrage, Eventverwaltung, Ändern, Verschieben, Absage; Section „ENTWURF · Slice 5“ (2859:40104) |
| 40 Öffentliche Seiten | `PUB-01` bis `PUB-24`; geltende Eventseite ist `PUB-01` (2643:9414) |
| 50 Intern (Founder) | D8 Interne Prüfseite (2764:44857) |
| 60 Besucher-Prototyp | Klickprototyp (Desktop 1440×900, Mobile 390×844) |
| 80 Geparkt — Discovery (spätere Phase) | Bausteine für die Discovery nach der Alpha (Poll, Plan, District, Merken, Kategorien, Account row, Event-detailpage u. a.), nicht löschen |
| 90 Archiv | ersetzte Stände mit Datum und Grund im Namen |

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

## Öffentliche Seiten
| Screen | Knoten | Vertrag |
|---|---|---|
| Eventseite, Contententwurf (Desktop 2643:9417, Mobile 2652:7621) | 2643:9414 | R07, v0.5 §6.7 Gut zu wissen, §6.8 Tag-Farben |
| Format-Beispiele Vernissage / Film | 2792:48358 / 2792:48780 | v0.3 §7, Formatvarianten der Balken |
| Randfall 6 Balken, Farbtest | 2797:58145 und Frames „Randfall · 6 Balken“ | v0.5 §6.7 |
| Eventseite mit Ortsstatus, Co-Hosts, Line-up-Links (D13) | 2716:41215 | v0.5 §2–§3 |
| Veranstalter-Profile Desktop/Mobile | 2632:7093 | Q29, v0.5 §4.1 |
| Profilmodule und Kombinationen | 2577:5862, 2591:39999 (Desktop-Regeln), 2602:13733 (Mobile) | Delta v0.4 §17 |
| Regel: Listen mit mehr als drei Einträgen | 2732:51615 | „Mehr anzeigen“ ab 4 Events |
| Venue-Profil mit Programm (D19) | 2747:43479 | v0.5 §4, §3 |
| Profiltypen-Vergleich | 2753:52940 | v0.5 §4.1 |
| Künstler:innen-Seite (D14 v3 + Zustände) | 2730:56314, 2758:43625 | v0.5 §6 |
| Profilgestaltung: Richtungen, Paletten | 2769:44367 | v0.5 §4.2 |
| Follow-Platzierung (GELTEND seit 02.11.2026), Animation, Palettenprüfung, Merken-Dialog | 2839:47447 | Q32, S9, D10 |

## Organizer-Flows
| Screen | Knoten | Vertrag |
|---|---|---|
| Organizer-Einstieg (Flow 00, archiviert; jetzt `ORG-01` bis `ORG-18` im Kernflow) | 2514:1943 | S4, R03 |
| Zusammenhängender Profileditor (archiviert; Master im Kernflow) | 2519:5757 | Q29–Q35 |
| Flow 01 Erfassung und adaptive Ergänzungen (archiviert; Master im Kernflow) | 2496:2924, 2504:1579 | S3, R05 |
| Master-Flow Kernflow v1 (GELTEND, `ORG-01` bis `ORG-90`) | 2533:3521 | Kernflow |
| Eventeditor: Programm, Besuch, Preis, Zugang | 2686:10021 | v0.3 §4–§5 |
| D11 Ort, Line-up, Mitveranstalter wählen | 2715:43598 | v0.5 §2 |
| D12 Venue einladen und bestätigen | 2719:43976 | v0.5 §3, §5 |
| D15 Briefing-Link | 2720:44069 | v0.5 §7 |
| D16–D18 Plus/Pro reservieren | 2721:44178 | Featurematrix |
| D20 Venue-Einstieg, Profilwechsel | 2760:44388 | v0.5 §4 |
| D8 Interne Prüfseite (nur Founder) | 2764:44857 | v0.5 §4 |
| D21 Gestaltung: Vorlage und Anpassen (Profil) | 2777:44971 | v0.5 §4.2 |
| D21 c/d Eventgestaltung: übernimmt Profil | 2779:45721 | v0.5 §4.3 |

## Zustände und Besucher
| Screen | Knoten |
|---|---|
| Freigabe, Rückfrage, Eventänderungen (16 Zustände) | 2699:10718 |
| Eventsonderzustände Desktop und Mobile | 2675:9863 |
| Besucheraktionen: Merken, E-Mail-Abos | 2653:7643 |
| Besucher-Klickprototyp mit Overlays | 2663:8327 |

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
- Am 02.11.2026 wurden beim Einsetzen acht Status-Spalten (`PUB-19` abgesagt, verschoben ohne Termin, vorbei; `PUB-23`, `PUB-24`) mit der aktiven Karte überschrieben. Der ursprüngliche Inhalt ist nicht wiederherstellbar (keine gespeicherte Version nach dem 30.10.). Die Spalten tragen jetzt die Status-Varianten, deren Texte neu entworfen und vom Founder noch nicht inhaltlich bestätigt sind.
- Der Merken-Dialog verweist noch auf die alte Änderungs-Anmeldung. Er sollte nur „Merken“ und die Veranstalter-Anmeldung anbieten.
- Der Besucher-Prototyp (Seite 60) trägt noch die alte Spalte „Wenn sich etwas ändert“ und den alten Veranstalter-Block.
- Die Profile ohne Termine („Keine kommenden Events · Neue Termine folgen“ in `PUB-03`, `05`) sind im alten Stil.
- Vor der Umsetzung im Code fehlen Texte für die Bestätigungs-E-Mails dieser beiden Anmeldungen und die Entscheidung, ob die Änderungs-Anmeldung in der Alpha enthalten ist (öffentliche Eventseiten gehören zu Slice 6).

## Slice 5 gebaut (Stand 2026-10-30)
Section „ENTWURF · Slice 5“ (2859:40104): S5-A Founder-Prüfung (2855:38880), S5-D Rückfrage mit betroffener Stelle (2894:1019) und S5-E Mailentwürfe (2894:1178) sind in PR D gebaut, die Organizer-Seiten (Bestätigung, in Prüfung, Selbstveröffentlichung, Eventverwaltung) in PR C. Kein Screenshot-Vergleich mit Figma erfolgt; Abweichungen in `.planning/phases/04-durchstich/SLICE-5-SUMMARY.md`. Der Rest (PR F/G, 2026-11-02): `NACH-11`, `NACH-12`, `NACH-15` und der Zustand `NACH-16` sind gebaut, ohne Freitext „Grund/Hinweis“ und ohne Abo-Sätze. Nicht gebaut: `NACH-09`, `NACH-10`, `NACH-13`, `NACH-14` (veröffentlichte Zustände sind die Verwaltungsseite).

## Slice 6 gebaut (PR I, 2026-11-02)
`PUB-01` (Eventseite) ist als `/e/[slug]` gebaut, auch die Statusvarianten für verschoben, verschoben ohne Termin und abgesagt. Weggelassen sind Follow, Merken, Kalender, Änderungs-Karte (Alpha-Ausschluss) sowie Programm, Einlass, Alter, Vor Ort und Zugänglichkeit (keine Daten in der Alpha). Texte der Statusvarianten sind Vorschläge. Einzelheiten: `.planning/phases/04-durchstich/SLICE-6-SUMMARY.md`.
