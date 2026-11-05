# Screen-Review ORG-A — Zugang und Profil anlegen

Stand: 2026-11-05. Welle 1, erster Screen-Block. Grundlage: `docs/startpaket/09-ux-framework.md` (Checkliste §6), Figma-Section `GELTEND · ORG-A` (Knoten 2943:5576, Seite 20).

## Was geprüft wurde, und was nicht
- **Geprüft (Figma gelesen):** ORG-02 (Code), ORG-03 (Profileditor), ORG-10 (Profil bestätigen) vollständig mit Text und Aufbau; ORG-01, ORG-04, ORG-05, ORG-09, ORG-11 bis 14, ORG-41, ORG-49 bis 52, ORG-88 und ORG-93 nur nach Struktur und abgeschnittenen Texten.
- **Geprüft (Code gelesen, nicht ausgeführt):** `app/(auth)/login/*`, `components/profile/forms.tsx`, `components/profile/status.tsx`, `app/(organizer)/organizer/profiles/[profileId]/edit|preview/page.tsx`, `components/ui/field.tsx`, `components/ui/button.tsx`.
- **Nicht geprüft:** gerendertes Bild gegen Figma (Preview wurde für ORG-A noch nicht aufgerufen), Dev-Mode-Status „Ready for dev“ (aus den vorhandenen Werkzeugen nicht lesbar), Mobil-Darstellung, Tastaturbedienung, Kontrastwerte. Diese Zeilen der Checkliste bleiben offen.

## Abweichungsliste (Figma ↔ gebaut ↔ Framework)
| Nr. | Befund | Kennung | Vorschlag | Entscheidung Founder |
|---|---|---|---|---|
| 1 | **Anrede:** Alle ORG-A-Frames sprechen „ihr/euch/eure“ („Schaut in euer Postfach“, „Eure Profilseite“). Das Framework (bestätigt) und der Code sagen „du“. | C1, §5.1 | Code bleibt bei „du“. Figma-Texte werden auf „du“ umgestellt (Frames ORG-01 bis ORG-14, 41, 49 bis 52, 88, 93). | offen |
| 2 | **Überschriften:** Figma ORG-01/02: „Euer Kulturauftritt beginnt hier“, „Schaut in euer Postfach“. Code: „Anmelden“, „Wir senden dir einen Code per E-Mail. Ein Passwort brauchst du nicht.“ Der Code ist neutraler, Figma näher an der Szene. | G5, PP-10 | Entscheiden, ob die Szenesprache aus Figma (in Du-Form) übernommen wird. | offen |
| 3 | **Komponenten:** Login (`login-form.tsx`) und Profilformulare (`forms.tsx`) bauen Eingaben und Buttons mit eigenen Klassen statt `components/ui` (Button, Field). Folge: Radius `rounded-md` statt 8 px, Eingabetext 16 px statt 14 px, Rahmenfarbe `border-border` statt `border-border-strong`, eigene Höhen. Fehlerfarbe uneinheitlich (`text-destructive` in `forms.tsx`, `text-error` sonst). | UX-20, F1 | Auf `Field` und `buttonClass` umstellen, eine Fehlerfarbe. | offen |
| 4 | **Fokus:** Buttons und Eingaben in `forms.tsx` haben keinen eigenen Fokusring (Login hat ihn). | D2, §3.5 | Fokusring wie in `components/ui/button.tsx`, später nach Figma (3 px Iris, §5.2). | offen |
| 5 | **Zwei Hauptaktionen auf einer Seite:** Die Editorseite zeigt „Speichern“ (Angaben) und „Bild hochladen“ (Bild) als gleichrangige Primärbuttons. Figma führt Schritt für Schritt (Angaben → „Bilder wählen“). | UX-09, A1 | Ein Weg mit Reiter oder Schritt; je Schritt eine Hauptaktion. Figma-Reiter: Angaben, Bilder, Gestaltung, Module, Vorschau (Gestaltung und Module nicht im Durchstich, in Figma ausgegraut). | offen |
| 6 | **Navigation:** Figma hat „Zurück“ oben links auf jedem Screen und Reiterleiste. Code: Rücklink „← Deine Profile“ nur als kleiner Textlink, Reiter „Bearbeiten / Vorschau“. Der Login hat keinen Zurück-Weg. | A2, D3 | Ein Muster für Zurück und Fortschritt festlegen; Tippziel nach Entscheidung 36/44 px (Framework §8, offen Nr. 3). | offen |
| 7 | **Code-Eingabe:** Figma ORG-02 zeigt „Code erneut anfordern“ und „Andere E-Mail verwenden“ und nennt die Mail-Adresse. Code zeigt Hinweis und Feld, aber weder erneutes Anfordern noch Rückweg zur E-Mail-Eingabe. Der Figma-Satz „konkrete Zeiten folgen in der Zugangsspezifikation“ ist ein Platzhalter, kein Endtext. | A2, B1, C1 | Beide Aktionen ergänzen, Frist und Begrenzung festlegen (Zustand „zu oft angefordert“ fehlt in Figma). | offen |
| 8 | **Fehlende Frames:** Für ORG-01 und ORG-02 gibt es keine Mobil-Frames und keine Fehlerzustände (falsche Adresse, falscher oder abgelaufener Code, laufender Vorgang). Im Code existieren Fehlertexte. In ORG-A gibt es nur einen Mobil-Frame (ORG-88). | B1, B2, D4 | Frames ergänzen (je Zustand und Viewport), bevor gebaut wird. | offen |
| 9 | **Profiladresse:** Figma ORG-03 zeigt ein Eingabefeld „Profiladresse“ („Eindeutigen Namen für eure Profil-URL wählen“). Code: Adresse wird von DISKOE festgelegt und ist nicht änderbar. | UX-12, A3 | Entscheiden: Founder legt fest (Code) oder Organizer wählt (Figma). Bei Wahl durch Organizer: Verfügbarkeitsprüfung und Folgen einer Änderung nennen. | offen |
| 10 | **Link und Kontakt:** Figma: ein Feld „Offizieller Link oder öffentlicher Kontakt“ mit Hinweis „Eure private Login-E-Mail wird nicht automatisch veröffentlicht.“ Code: zwei Felder („mindestens eines“), der Hinweis zur Login-Mail fehlt (nicht gefunden). | E1, E2, §3.7 | Hinweis übernehmen (schützt vor versehentlicher Veröffentlichung der Login-Adresse). Ein oder zwei Felder entscheiden. | offen |
| 11 | **Profiltyp-Auswahl (ORG-52)** und **Bildart wechseln** (Profilbild/Cover): in Figma vorhanden, im Durchstich nur Veranstalter und Profilbild. Der Code lässt beides aus, richtig für den Durchstich. In der Alpha (Wellen 2 bis 5) werden Venue und Artist ergänzt. | Scope | Kein Fehler; Frames sind „nicht im Durchstich“ markiert, Wellenzuordnung in `08-alpha-matrix.md`. | zur Kenntnis |
| 12 | **Zuschnittvorschau:** Figma zeigt „Desktop: breiter Profilkopf / Mobil: Ausschnitt prüfen“ vor dem Hochladen. Code zeigt keine Vorschau des Zuschnitts. | UX-12, §3.6 | Entscheiden, ob für die Alpha nötig. | offen |
| 13 | **Doppelte Rechteerklärung:** Beim Bild-Upload muss „Ich habe die Rechte an diesem Bild …“ angekreuzt werden, beim Einreichen noch einmal „Freigaben für Texte und das Bild“. | UX-10, §3.3.7 | Prüfen, ob eine der beiden entfallen kann oder die Doppelung rechtlich gewollt ist. | offen |
| 14 | **Einreichen (ORG-10):** Figma-Text nennt „späteren Discovery“ als Verwendung der öffentlichen Inhalte. Discovery ist nach V1 und nicht beschlossen. Der Code lässt das aus und fragt stattdessen „… damit einverstanden, dass mein Profil mit der Freigabe durch DISKOE öffentlich wird“ (Variante B). Figma-Button „Profil einreichen“, Code „Zur Prüfung einreichen“. Rechtswortlaut ist laut Code und Figma ein Entwurf. | PP-08, UX-03, E1 | Discovery-Satz nicht übernehmen; Beschriftung und Rechtstext mit dem Founder festlegen (Rechtstexte gehören zu Welle 0). | offen |
| 15 | **Wireframe-Beschriftungen in Figma:** Vor jeder Überschrift steht „DISKOE / Organizer-Einstieg“ bzw. „DISKOE / Profilseite · privater Entwurf“. Der Code zeigt auf dem Login nur „DISKOE“. Unklar, ob das Produkttext oder Wireframe-Beschriftung ist. | C1 | Klären. „Privater Entwurf“ als Statusanzeige wäre sinnvoll (UX-02), der Pfad „DISKOE / …“ nicht. | offen |
| 16 | **Status sichtbar:** Der Code zeigt den Profilstatus (Entwurf, In Prüfung, Live, Frage) in der Kopfzeile und erklärt Folgen („Änderungen bleiben privat …“). Passt zu UX-02. | UX-02 | keine Änderung | erfüllt |

## Checkliste §6 für ORG-A (Stand Review)
| Punkt | Ergebnis | Begründung |
|---|---|---|
| A1 Hauptaktion | Nein | Editor: zwei gleichrangige Primärbuttons (Nr. 5) |
| A2 Weg und nächster Schritt | Nein | Zurück und Code-Wiederholung fehlen (Nr. 6, 7) |
| A3 Nichts doppelt verlangt | Offen | Rechteerklärung zweimal (Nr. 13), Profiladresse (Nr. 9) |
| A4 Folgen für Dritte | n. a. | Profil-Erstellung betrifft keine Dritten |
| B1 Zustände geklärt | Nein | Fehler- und Wartezustände des Logins fehlen in Figma (Nr. 8) |
| B2 Frame je Zustand und Viewport | Nein | Mobil fehlt für ORG-01 bis 14 (außer 88) |
| B3 Unbekannt/übersprungen unterscheidbar | n. a. | keine A(T)-Felder in ORG-A |
| B4 Status sichtbar | Ja | Nr. 16 |
| B5 Eingaben gehen nicht verloren | Offen | im Browser nicht geprüft |
| C1 Texte nach §5.1 | Nein | Anrede in Figma (Nr. 1), Platzhaltertexte (Nr. 7, 15) |
| C2 Konkrete Lücken | Ja | `GapList` auf Editor und Vorschau (Code gelesen) |
| C3 KI | n. a. | |
| C4 Zeit und Geld | n. a. | |
| D1 Kontraste | Offen | nicht gemessen |
| D2 Tastatur und Fokus | Nein | Fokusring fehlt in `forms.tsx` (Nr. 4); Rest offen |
| D3 Tippziele 44 px | Nein | Buttons 40 px, Felder 36 px, Textlinks klein (Nr. 6) |
| D4 Mobil und Desktop | Offen | Mobil nicht geprüft |
| E1 Einwilligung, Zweck | Offen | Rechtswortlaut Entwurf (Nr. 14); Hinweis zur Login-Mail fehlt (Nr. 10) |
| E2 Keine PII in URLs/Logs | Offen | im Login-Pfad nicht geprüft (`next`-Parameter, Code-Mail-Link) |
| E3 Entwürfe nicht öffentlich | Offen | Zugriffsschutz laut Slice-Berichten, hier nicht neu geprüft |
| E4 Dritte | n. a. | |
| F1 Tokens und Komponenten | Nein | Nr. 3 |
| F2 Ready for dev, Bildvergleich | Offen | Status nicht lesbar, Bildvergleich steht aus |
| F3 Linkvorschau | n. a. | private Screens |
| F4 Maße nach §5.2 | Offen | Radius und Höhen weichen ab (Nr. 3) |
| G1 Single-Player-Nutzen | Ja | Profil nützt ohne Netzwerk |
| G2 Verknüpfung sichtbar | n. a. | |
| G3 Teilen-Moment | Offen | gehört in NACH-A (nach Freigabe), nicht in ORG-A; dort prüfen |
| G4 Verbreitungshebel | n. a. | |
| G5 Szene | Offen | Nr. 2 |
| G6 Nicht hinter Bezahlschranke | Ja | |

## Aus dem Review abgeleitete allgemeine Regeln (Vorschlag, noch nicht im Framework)
- **UX-23 (Vorschlag):** Ein Wegweiser je Organizer-Flow (Zurück, Fortschritt, nächster Schritt) in einem festen Muster; jeder Schritt hat genau eine Hauptaktion (Konkretisierung von UX-09 für mehrteilige Editoren).
- **UX-24 (Vorschlag):** Wiederholte Zustimmungen und Bestätigungen werden zusammengelegt, wenn der Zweck derselbe ist (Konkretisierung von UX-10).
- **UX-25 (Vorschlag):** Figma-Texte sind vor dem Bauen in Du-Form und mit §5.1 abgeglichen; Platzhaltertexte („folgen in der Spezifikation“) gelten nicht als Endtext.
