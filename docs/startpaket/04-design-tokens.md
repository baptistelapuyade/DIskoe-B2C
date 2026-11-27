# 04 — Design-Tokens und Kontrastregeln

Quelle: Figma-Variablen (Collections `DISKOE / Primitives`, `DISKOE / Theme`, `DISKOE / Profilpalette`). Schrift im Entwurf: Space Grotesk (Regular, Medium, Bold).

## Primitives
| Name | Hex | Name | Hex |
|---|---|---|---|
| paper | #fcfcfa | ink | #343432 |
| muted | #676762 | surface | #f1f1ed |
| border | #dfdfd9 | hover | #e8e8e2 |
| focus | #77689a | white | #ffffff |
| iris | #7455d8 | irisLight | #a795ee |
| pink | #f39cc3 | blue | #a9cce9 |
| peach | #ffb58e | yellow | #f5d95c |
| lavender | #c3a4cc | borderStrong | #8e8e87 |
| success | #2e7048 | successSoft | #e8f3ec |
| warning | #8a5a00 | warningSoft | #fbf1dc |
| error | #c8202a | errorSoft | #faeceb |
Statusflächen der öffentlichen Eventseite (Figma `accent/accent-purple`, `red/400`, Text `black`; 27.11.2026): statusMoved #d7b4ff (neuer Termin), statusStopped #f87171 (Termin folgt, abgesagt), statusInk #000000. Kontrast Schwarz auf beiden Flächen über 7 : 1.
Dark-Varianten (nur Plattform-Theme, nicht Profile): inkRaised #3e3e3b, inkHigh #4a4a47, inkDeep #1f1f1e, borderDark #5a5a55, mutedOnDark #b9b9b1, errorOnDark #f29a9e, successOnDark #8fd3a8, warningOnDark #f0c46a.

## Theme (Light/Dark, Plattform-UI)
background=white/ink, foreground=ink/paper, primary=ink/paper, primary-foreground=paper/ink, secondary=surface/inkHigh, muted=surface/inkRaised, muted-foreground=muted/mutedOnDark, accent=surface/inkRaised, destructive=error/errorOnDark, border=border/borderDark, input=white/inkRaised, ring=iris/irisLight, card=white/ink. Marken-Tokens: `brand/pink|iris|blue|yellow` mit passender Schriftfarbe (ink, bei iris white). Status: error/success/warning je mit `subtle`.

## Profilpalette (Rollen je Profil/Event-Gestaltung)
Rollen: Seite, Fläche, Kopf, Kopf Text, Text, Text gedämpft, Linie, Akzent, Akzent Text. Im Produkt werden die Rollen aus den gespeicherten Einzelwerten abgeleitet (v0.5 §4.2). Die neun Figma-Modi sind Beispiel-Startwerte der drei Vorlagen:

| Rolle | Poster Nacht | Poster Signal | Poster Ultramarin | Editorial Papier | Editorial Salbei | Editorial Tinte | Mixtape Kassette | Mixtape Neon | Mixtape Pastell |
|---|---|---|---|---|---|---|---|---|---|
| Seite | #ffffff | #fffdf5 | #ffffff | #fbf9f4 | #f6f8f4 | #ffffff | #f4efe6 | #111111 | #fff4f8 |
| Fläche | #f3f2ee | #fff0c2 | #e9eeff | #f2eee5 | #e7ede3 | #f1f1f3 | #ffffff | #1c1c1c | #ffffff |
| Kopf | #1b1a19 | #ff4f1f | #2633d9 | #fbf9f4 | #dde6d6 | #15171c | #f4efe6 | #111111 | #e6e0ff |
| Kopf Text | #faf9f7 | #1b1a19 | #ffffff | #1f1e1b | #1d2a1f | #f4f4f6 | #231f1a | #f2f2f2 | #2a2340 |
| Text | #2b2a29 | #1b1a19 | #14163a | #1f1e1b | #1d2a1f | #15171c | #231f1a | #f2f2f2 | #2a2340 |
| Text gedämpft | #6b6966 | #5e574c | #555a7a | #6e6a62 | #5c6a5e | #61646d | #6d655a | #a3a3a3 | #6e6688 |
| Linie | #e2e0db | #e8dfc4 | #d5dbf5 | #e3ded3 | #d3ddcc | #e1e2e6 | #231f1a | #d4ff3a | #2a2340 |
| Akzent | #7455d8 | #1b1a19 | #ff7ab8 | #9c3d25 | #2f5d3a | #c8a24a | #e2462f | #d4ff3a | #6b4eff |
| Akzent Text | #ffffff | #ffffff | #14163a | #ffffff | #ffffff | #15171c | #ffffff | #111111 | #ffffff |

## Kontrastregeln (Frontend und Backend)
- WCAG-Kontrast nach Relativer Luminanz. Text auf Seite/Fläche ≥ **4,5 : 1**. Gedämpfter Text ≥ 4,5 : 1. Akzent gegen Hintergrund ≥ **3 : 1**. Schrift auf Akzent wird automatisch hell oder dunkel gewählt, ≥ 4,5 : 1.
- Reihenfolge im Editor: erst Hintergrund, dann Schriftfarbe. Angeboten werden nur Farben, die den Kontrast erfüllen (Rest ausgeblendet, „n ausgeblendet“). Ändert sich der Hintergrund und die Schriftfarbe wird unlesbar, wird die nächste lesbare gesetzt und ein Hinweis gezeigt.
- Das Backend prüft beim Speichern; ungültige Kombinationen werden nicht gespeichert.
- Abgeleitet, nicht gespeichert: Text gedämpft, Linie, Fläche aus Hintergrund und Text.

## Feste Farben (unabhängig von Profilgestaltung)
**Format-Tags (v0.5 §6.8):** Konzert/Live-Musik Pink, DJ-Set Iris, Party/Clubabend Gelb, Listening-Session Blau, Vernissage Lavendel, Ausstellungsabend/Offspace Grün, Filmabend/Screening Peach. Zusatzteile (Talk, Lesung, Performance) nutzen die Farbe des Hauptformats.
**Atmosphäre-Tags (nach Gruppe):** Ruhig (Gemütlich, Intim/persönlich, Entspannt) Blau; Gesellig (Ungezwungen, Community-geprägt) Peach; Lebhaft (Lebhaft, Immersiv) Gelb; Eigensinnig (Experimentell, Underground/DIY, Alternativ/unabhängig) Pink.
Textfarbe auf Tags: ink; auf Grün white. Mapping als Code-Konstante.
**Profiltyp-Kennzeichen (v0.5 §4.1):** Venue Blau mit Ortsmarker, Veranstalter Iris mit Kalender, Artist Pink mit Person.
**Info-Balken (Gut zu wissen, v0.5 §6.7):** Fläche folgt Profilrolle „Fläche“, Text „Text“, Detail „Text gedämpft“ (17 px Medium), Trennlinien 1 px in `foreground`. Pills farbig: Einlass Lavendel, Eintritt Gelb, Alter Pink, Vor Ort Blau. Zugänglichkeit: neutral, bestätigt grün-getönt, teilweise orange-getönt.
**Eventseite, Flächen (Figma `neutral/100`, `800`, `900`):** `#f5f3f0` Eventkopf, `#2b2a29` Beschreibung, `#181817` Veranstalter-Band. Als Tokens `--neutral-100/800/900` in `app/globals.css` (seit 2026-11-04). Das Atmosphäre-Band nutzt weiter das Token Lavendel; der Figma-Wert `#bf8bf3` ist dort kein Variablenwert.
**Eventstatus:** Abgesagt/Verschoben nutzen Status-Tokens (error/warning), siehe Figma „Eventstatus-Farben“.

## Typografie und Maße
Plattform: Space Grotesk. Eventtitel in Eventkarten Desktop 56, Mobile 32 (Eventseite: Maße aus Figma lesen). Eyebrow 13, Fließtext 16, Balken-Detail 17. Profilgestaltung: 6 kuratierte Schriftpaare, **noch nicht konkretisiert** (TODO(spec)). Radius: `eckig/leicht/rund`, Werte noch festzulegen (TODO(spec)).
