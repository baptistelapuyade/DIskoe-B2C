# 03 — Screen-Index (Figma)

Datei: `4wtHBUljZkvFetSA9ZujjY`. Link-Muster: `https://www.figma.com/design/4wtHBUljZkvFetSA9ZujjY?node-id=<ID mit - statt :>`. Beispiel: `2643:9414` → `node-id=2643-9414`.
Hinweis: Figma ist visuelle Referenz. Fachregeln stehen in den Verträgen. Alles hier sind statische Entwürfe, keine Funktionsnachweise.

## Seiten der Datei
| Seite | Inhalt |
|---|---|
| ❖ Components | shadcn-basiertes Fundament (Button, Input, Dialog …) |
| DISKOE — Komponenten | Eigene Komponenten und Abschnitte |
| Wireframes — Organizer-Flows | Organizer-Einstieg, Editor, Eventeditor, D8, D11, D12, D15–D18, D20, D21 |
| High-Fi — Profile & Event | Öffentliche Profil- und Eventseiten, Module, Profiltypen |
| Zustände — Event & Freigabe | Sonderzustände, Freigabe, Rückfragen, Besucheraktionen |
| Prototyp — Besucher | Klickprototyp (Desktop 1440×900, Mobile 390×844) |
| Referenzen & Archiv | Archiv, Vergleiche (nicht aktiv) |

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

## Organizer-Flows
| Screen | Knoten | Vertrag |
|---|---|---|
| Organizer-Einstieg (Flow 00) | 2514:1943 | S4, R03 |
| Zusammenhängender Profileditor | 2519:5757 | Q29–Q35 |
| Flow 01 Erfassung und adaptive Ergänzungen | 2496:2924, 2504:1579 | S3, R05 |
| Testprototyp Kernflow v1 | 2533:3521 | Kernflow |
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
