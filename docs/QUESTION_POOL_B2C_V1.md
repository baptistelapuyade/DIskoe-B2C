# DISKOE B2C V1 — formatabhängiger Fragenpool S3

**Stand:** 2026-10-14
**Status:** Arbeitsgrundlage für S3. Q08–Q11, Publikationsminimum und Formatpflichten sind bestätigt. Neue Detailauswahlen, Antwortoptionen und Auswahlheuristiken sind **Vorschläge zur gemeinsamen Prüfung**. Kein UI, Datenmodell oder KI-System ist implementiert.

## 1. Zweck und verbindliche Auswahlregeln

Der Pool übersetzt den B2C-Datenvertrag in Rückfragen für einzelne datierte Berliner Präsenzveranstaltungen an einem Ort. Er ist ein Auswahlvorrat, kein Pflichtfragebogen.

1. Material sowie bestätigte Organizer-, Orts- und Reihendaten zuerst ausschöpfen.
2. Offene Publikationspflichten und kritische Widersprüche zuerst fragen. Überspringen löst keinen Pflichtfehler.
3. Danach zunächst ungefähr fünf tatsächlich relevante Ergänzungen wählen; bei Bedarf mehr, ohne starre Obergrenze oder erzwungene Quote.
4. Kosten und handlungsrelevante Zugangs-/Zeitlücken gehen vor Vibe und zusätzlichen Medien. Bekannte wesentliche Einschränkungen dürfen nicht verborgen werden.
5. Vorhandene, bestätigte oder im selben Vorgang ausdrücklich unbekannte beziehungsweise nicht zutreffende Angaben nicht wiederholt fragen. Bei neuem Event oder wesentlicher Änderung darf die Gültigkeit gezielt erneut bestätigt werden.
6. „Unbekannt“ ist eine bestätigte derzeitige Wissenslücke und wird, soweit zulässig, transparent. „Nicht zutreffend“ heißt, dass die Frage sachlich nicht passt. „Überspringen“ lässt sie unbearbeitet und bei optionalen Fragen später ergänzbar.
7. Widersprüche mit den konkurrierenden Angaben und ihrer Herkunft zeigen; nichts vorauswählen.

**Vorschlag:** Bei gleich wichtigen Zusatzfragen zuerst Angaben wählen, die eine konkrete Besucherentscheidung verändern (hingehen, Zeitpunkt, Zugang, Budget, Aufenthaltsart), danach Programmverständnis und belegte Atmosphäre, zuletzt Medien. Im Alpha-Pilot anhand von Antworten, Überspringen, Korrekturen und Abbrüchen prüfen.

Jede Beratung erklärt Besucher- und Matchingnutzen konkret. Mehr bestätigter Kontext kann spätere DISKOE-Zuordnung und maschinelles Verständnis unterstützen, garantiert aber keine Google-/KI-Platzierung oder Reichweite.

## 2. Gemeinsamer Basispool

### B01 — Titel

- **Information/Feld:** öffentlicher Eventtitel; Eventidentität/Titel.
- **Wann:** fehlt oder widerspricht sich; erledigt durch einen bestätigten eindeutigen Titel.
- **Priorität:** Publikationspflicht.
- **Frage/Nutzen/Antwort:** „Wie soll der Event öffentlich heißen?“ Ein eindeutiger Titel verhindert Verwechslungen. Kurzer Freitext; bei Widerspruch erkannte Varianten oder „anderer Titel“.
- **Zustände:** unbekannt/nicht zutreffend unzulässig; Überspringen blockiert Publikation.
- **Ebene:** Event.

### B02 — Format

- **Information/Feld:** Hauptformat; Eventidentität/Format.
- **Wann:** fehlt oder ist mehrdeutig; erledigt durch bestätigtes Format.
- **Priorität:** Publikationspflicht.
- **Frage/Nutzen/Antwort:** „Welches Format beschreibt den Abend am besten?“ Steuert verständliche Darstellung, passende Folgefragen und spätere Filter. Live-/DJ-Abend; Offspace-/Vernissage-Abend; Filmabend; Mischform/anderes mit Beschreibung.
- **Zustände:** unbekannt/nicht zutreffend unzulässig; Überspringen blockiert.
- **Ebene:** Event; Reihe darf Vorschlag liefern.

### B03 — Kurzbeschreibung

- **Information/Feld:** verständliche freigegebene Beschreibung; Eventidentität/Beschreibung.
- **Wann:** Material erklärt Inhalt/Form nicht; erledigt durch bestätigten verständlichen Text.
- **Priorität:** Publikationspflicht.
- **Frage/Nutzen/Antwort:** „Wie würdet ihr den Abend in zwei bis vier Sätzen beschreiben?“ Hilft Besuchern bei der Grundentscheidung und der thematischen Zuordnung. Freitext oder editierbarer, klar markierter KI-Vorschlag.
- **Zustände:** unbekannt/nicht zutreffend unzulässig; Überspringen blockiert.
- **Ebene:** Event; Reihentext nur Vorschlag.

### B04 — Datum und Beginn

- **Information/Feld:** Datum, Beginn, Zeitzone; Zeit/Beginn.
- **Wann:** fehlt, unvollständig oder widersprüchlich; erledigt durch bestätigten Zeitpunkt in Europe/Berlin.
- **Priorität:** Publikationspflicht.
- **Frage/Nutzen/Antwort:** „An welchem Datum beginnt der Event, und um wie viel Uhr?“ Grundlage für Planung und zeitliche Zuordnung. Datum-/Zeitauswahl; bei Widerspruch Varianten oder eigener Wert.
- **Zustände:** unbekannt/nicht zutreffend unzulässig; Überspringen blockiert.
- **Ebene:** Event.

### B05 — Ort und Adresse

- **Information/Feld:** Ort und eindeutige Adresse; Ort/Name/Adresse.
- **Wann:** fehlt, uneindeutig oder widersprüchlich; erledigt durch bestätigten normalen V1-Ort. Geheime/TBA-Orte sind kein beschlossener Normalfall.
- **Priorität:** Publikationspflicht.
- **Frage/Nutzen/Antwort:** „Wo findet der Event statt? Bitte bestätigt Ort und vollständige Adresse.“ Verlässliche Anreise und räumliche Zuordnung. Stammdatensatz/erkannte Variante wählen oder eingeben.
- **Zustände:** unbekannt/nicht zutreffend unzulässig; Überspringen blockiert.
- **Ebene:** Ort, für das Event bestätigt.

### B06 — Kosten

- **Information/Feld:** Kostenmodell, Betrag/Spanne/Währung/Hinweis; Kosten.
- **Wann:** keine explizite Angabe oder Widerspruch; erledigt auch durch bestätigtes „noch nicht bekannt“.
- **Priorität:** Publikationspflicht.
- **Frage/Nutzen/Antwort:** „Was kostet der Eintritt?“ Ermöglicht Budgetentscheidung; nur bestätigte Preise dürfen Budgetpassung begründen. Kostenlos; fester Preis; ab; Spanne; Spende/freie Preiswahl; noch nicht bekannt; jeweils optionaler Hinweis.
- **Zustände:** „noch nicht bekannt“ zulässig und sichtbar; nicht zutreffend unzulässig; Überspringen blockiert. Fehlend ist nie automatisch kostenlos.
- **Ebene:** Event; Reihenwert nur Vorschlag.

### B07 — Zugangsweg

- **Information/Feld:** ohne Anmeldung, Abendkasse oder Anmeldung/Ticket; Zugang.
- **Wann:** fehlt oder widerspricht sich; bei erforderlichem Onlinezugang erst mit funktionierendem bestätigtem Link erledigt.
- **Priorität:** Publikationspflicht.
- **Frage/Nutzen/Antwort:** „Wie kommen Besucher hinein?“ Verhindert falschen Ticketweg und unterstützt Zugangsfilter. Ohne Anmeldung; Abendkasse; Online-Ticket/-Anmeldung + URL; mehrere Wege + Details.
- **Zustände:** unbekannt/nicht zutreffend unzulässig; Überspringen blockiert.
- **Ebene:** Event.

### B08 — Ende oder Besuchsfenster

- **Information/Feld:** Ende, Besuchsfenster, letzter Einlass; Zeit.
- **Wann:** beeinflusst Ankunft/Aufenthalt; bei flexiblem Offspace-Besuch besonders relevant. Erledigt durch bestätigte Angabe oder zulässiges ausdrücklich unbekanntes Ende.
- **Priorität:** wichtige Ergänzung; bei flexiblem Offspace-Besuch Formatpflicht.
- **Frage/Nutzen/Antwort:** „Bis wann läuft der Abend beziehungsweise bis wann kann man sinnvoll vorbeikommen?“ Hilft Ankunft und Rückweg, verbessert zeitliche Passung. Endzeit; offenes Ende; Ende unbekannt; letzter Einlass.
- **Zustände:** unbekannt zulässig, ohne erfundene Endzeit; nicht zutreffend nur bei eindeutigem festen Programm; Überspringen optional außer bei flexiblem Besuch.
- **Ebene:** Event.

### B09 — Eingang/Anreise

- **Information/Feld:** Eingang, Hinterhof, Etage, Klingel, besondere Anreise; Ort/Eingang.
- **Wann:** Zugang nicht selbsterklärend oder Material deutet Besonderheit an; bestätigte Ortsangabe kann genügen, wenn sie für das Event gilt.
- **Priorität:** wichtige Ergänzung; bekannte wesentliche Hürde publikationsrelevant.
- **Frage/Nutzen/Antwort:** „Gibt es etwas, das Besucher beim Finden des Eingangs oder bei der Anreise wissen sollten?“ Reduziert Suchstress. Kein Hinweis; Hinterhof; Etage/Klingel; Freitext.
- **Zustände:** unbekannt/überspringen zulässig, sofern keine bekannte Hürde verborgen wird; nicht zutreffend bei Standardzugang.
- **Ebene:** Ort; Abweichung am Event.

### B10 — räumliche Zugänglichkeit

- **Information/Feld:** bekannte Zugänglichkeit/Barrieren; Ort/Kontext.
- **Wann:** noch nicht bestätigt oder besondere Räume genutzt werden; Ortsangabe nicht blind übertragen.
- **Priorität:** wichtige Ergänzung; bekannte wesentliche Einschränkung sichtbar machen.
- **Frage/Nutzen/Antwort:** „Was ist zur räumlichen Zugänglichkeit bekannt?“ Unterstützt Besuchsentscheidung und spätere Zugänglichkeitsfilter. Stufenlos; Stufen/nicht stufenlos; teilweise + Details; noch nicht geklärt.
- **Zustände:** unbekannt zulässig; nicht zutreffend nicht sinnvoll; Überspringen zulässig, bekannte Barrieren nicht.
- **Ebene:** Ort mit Eventbestätigung.

### B11 — Indoor/Outdoor

- **Information/Feld:** räumlicher Modus/Wetterabhängigkeit; Kontext.
- **Wann:** unklar oder für Kleidung/Verlegung relevant; erledigt durch bestätigte Angabe.
- **Priorität:** wichtige Ergänzung.
- **Frage/Nutzen/Antwort:** „Findet der Event drinnen, draußen oder gemischt statt?“ Hilft Kleidung und Anreise, verbessert Kontextpassung. Indoor; outdoor; gemischt; wetterabhängig + Details.
- **Zustände:** unbekannt/überspringen zulässig; nicht zutreffend nicht sinnvoll.
- **Ebene:** Event; Ort als Vorschlag.

### B12 — Teilnahme-/Altersbedingungen

- **Information/Feld:** Altersgrenze, Mitgliedschaft, Ausweis, Einlassbedingung; Zugang/Einschränkungen.
- **Wann:** Material deutet Bedingung an oder sie kann wesentlich sein; keine Regel erfinden.
- **Priorität:** Publikationspflicht, wenn bekannt und wesentlich; sonst wichtige Ergänzung.
- **Frage/Nutzen/Antwort:** „Gibt es eine Altersgrenze oder andere Bedingungen für den Einlass?“ Vermeidet unnötige Anreise und verbessert Zielgruppenpassung. Keine bekannten Bedingungen; ab 18; anderes Alter; Ausweis/Mitgliedschaft/Anmeldung; Freitext.
- **Zustände:** unbekannt/überspringen nur ohne bekannte Bedingung; nicht zutreffend entspricht „keine Bedingungen“.
- **Ebene:** Event; Ortsregel erneut prüfen.

## 3. Live-/DJ-Abend

### L01 — musikalischer Inhalt

- **Information/Feld:** Künstler oder Musik-/Live-/DJ-Konzept; Formatinhalt.
- **Wann:** aus Titel/Beschreibung nicht verständlich; bestätigtes Konzept genügt, vollständiges Line-up nicht.
- **Priorität:** Publikationspflicht.
- **Frage/Nutzen/Antwort:** „Welche Acts oder welches Musik-/Live-/DJ-Konzept prägen den Abend?“ Ermöglicht musikalische Entscheidung und Zuordnung. Acts/Line-up; Stil-/Konzepttext; „Line-up unvollständig“ plus Konzept.
- **Zustände:** unbekannte Acts zulässig, wenn Konzept verständlich; nicht zutreffend unzulässig; Überspringen blockiert sonst.
- **Ebene:** Event; Reihe als Vorschlag.

### L02 — Darbietungsform

- **Information/Feld:** Live, DJ oder gemischt; Formatinhalt/Programmform.
- **Wann:** noch nicht klar; erledigt durch bestätigte Beschreibung/Line-up.
- **Priorität:** wichtige Ergänzung.
- **Frage/Nutzen/Antwort:** „Wie wird die Musik präsentiert?“ Klärt Erlebnisform ohne Ableitung aus Genre. Live-Acts; DJ-Sets; beides; anderes.
- **Zustände:** unbekannt/überspringen zulässig; nicht zutreffend bei anderem klar beschriebenem Musikformat.
- **Ebene:** Event/Reihe mit Eventprüfung.

### L03 — Aufenthaltsart

- **Information/Feld:** Konzert, Tanzfläche, gemeinsamer Start, lockerer Aufenthalt; Kontext/Ablauf.
- **Wann:** nicht aus bestätigten Angaben erkennbar.
- **Priorität:** wichtige Ergänzung.
- **Frage/Nutzen/Antwort:** „Wie erlebt man den Abend vor Ort?“ Nimmt Erstbesucherunsicherheit und verbessert Situationspassung. Sitzendes/stehendes Konzert; Tanzfläche; gemeinsamer Start; flexibles Kommen; Mehrfachauswahl/Freitext.
- **Zustände:** unbekannt/nicht zutreffend/überspringen zulässig; nichts aus Artwork erfinden.
- **Ebene:** Event; Reihe als Vorschlag.

### L04 — späterer Einstieg

- **Information/Feld:** späterer Einstieg/letzter Einlass; Zeit/Zugang.
- **Wann:** lange Laufzeit, Nachtformat oder Türschluss möglich; nicht aus Ende ableiten. B08 kann erledigen.
- **Priorität:** wichtige Ergänzung; bekannte Grenze publikationsrelevant.
- **Frage/Nutzen/Antwort:** „Kann man später dazukommen, und gibt es einen letzten Einlass?“ Unterstützt spontane/späte Planung. Jederzeit bis; nur bis; kein späterer Einlass; unbekannt.
- **Zustände:** unbekannt/überspringen zulässig, bekannte Grenze nicht; nicht zutreffend bei einmaligem Beginn.
- **Ebene:** Event.

### L05 — Ablauf/Setfolge

- **Information/Feld:** grobe Programmpunkte/Setfolge; Formatinhalt/Ablauf.
- **Wann:** mehrere Acts/Teile und Zeiten verändern Besuchsentscheidung; kein kompletter Timetable nötig.
- **Priorität:** zusätzliche Vertiefung.
- **Frage/Nutzen/Antwort:** „Gibt es einen groben Ablauf oder wichtige Startzeiten einzelner Teile?“ Hilft den passenden Teil zu erreichen. Liste/Uhrzeiten; Reihenfolge ohne Zeiten; noch nicht angekündigt.
- **Zustände:** unbekannt/nicht zutreffend/überspringen zulässig.
- **Ebene:** Event.

### L06 — offizielle Hör-/Programmreferenz

- **Information/Feld:** externer offizieller Audio-/Video-/Artist-Link; Medien/Belege.
- **Wann:** freigegebener Link belegt den Charakter; vorhandenen Link nicht erneut fragen.
- **Priorität:** zusätzliche Vertiefung.
- **Frage/Nutzen/Antwort:** „Gibt es einen offiziellen Link, über den Besucher vorab einen Eindruck bekommen können?“ Beleg statt Vermutung; kein eigenes Hosting. URL + Bezeichnung; nein; später.
- **Zustände:** alle zulässig; kein automatisches Abrufen/Uploadversprechen.
- **Ebene:** Künstler/Reihe/Event, für Event bestätigt.

## 4. Offspace-/Vernissage-Abend

### O01 — Thema/Programmkonzept

- **Information/Feld:** Ausstellungs-/Programmthema; Formatinhalt.
- **Wann:** Titel/Beschreibung erklärt Thema nicht; erledigt durch verständliche Bestätigung.
- **Priorität:** Publikationspflicht.
- **Frage/Nutzen/Antwort:** „Worum geht es in der Ausstellung oder im Programm des Abends?“ Unterstützt Inhaltsentscheidung und Interessenpassung. Zwei bis vier Sätze oder editierbarer Vorschlag.
- **Zustände:** unbekannt/nicht zutreffend unzulässig; Überspringen blockiert.
- **Ebene:** Event; Ausstellung/Reihe als Quelle.

### O02 — Besuchsmodus

- **Information/Feld:** fester Beginn oder flexibles Vorbeikommen; Formatinhalt/Besuchsmodus.
- **Wann:** nicht eindeutig bestätigt.
- **Priorität:** Publikationspflicht.
- **Frage/Nutzen/Antwort:** „Ist der Abend für flexibles Vorbeikommen gedacht oder gibt es einen gemeinsamen Programmbeginn?“ Klärt Pünktlichkeit und Zeitpassung. Flexibel; gemeinsamer Beginn; beides mit festen Programmpunkten.
- **Zustände:** unbekannt/nicht zutreffend unzulässig; Überspringen blockiert.
- **Ebene:** Event.

### O03 — Besuchsfenster

- **Information/Feld:** Zeitraum für flexiblen Besuch; Zeit.
- **Wann:** bei flexiblem Besuch; erledigt durch bestätigtes Fenster oder ausdrücklich unbekanntes/offenes Ende.
- **Priorität:** Publikationspflicht bei flexiblem Besuch.
- **Frage/Nutzen/Antwort:** „In welchem Zeitraum kann man flexibel vorbeikommen?“ Ermöglicht spontane Planung. Von/bis; ab mit offenem Ende; Ende unbekannt.
- **Zustände:** unbekannt/offen zulässig und sichtbar; nicht zutreffend bei rein gemeinsamem Beginn; Überspringen blockiert bei flexiblem Modus.
- **Ebene:** Event.

### O04 — Programmpunkte

- **Information/Feld:** Anschauen, Talk, Performance, Musik, Austausch, Anleitung; Ablauf.
- **Wann:** zusätzliche Punkte verändern Erwartung/Ankunft; erledigt durch bestätigten Ablauf.
- **Priorität:** wichtige Ergänzung.
- **Frage/Nutzen/Antwort:** „Was passiert konkret vor Ort?“ Zeigt, ob freies Schauen oder feste Teile warten. Mehrfachauswahl + Zeiten/Freitext.
- **Zustände:** alle zulässig; bekannte feste Punkte sichtbar machen.
- **Ebene:** Event.

### O05 — sinnvoller Zeitbedarf

- **Information/Feld:** grober Besuchszeitbedarf; Kontext/Dauer.
- **Wann:** flexibler Besuch und kurze/lange Teilnahmeentscheidung relevant; keine Garantie formulieren.
- **Priorität:** wichtige Ergänzung.
- **Frage/Nutzen/Antwort:** „Kann man kurz vorbeischauen, oder sollte man mehr Zeit einplanen?“ Unterstützt spontane versus längere Besuchssituationen. Kurzbesuch möglich; etwa Minuten; ganzes Programm; individuell.
- **Zustände:** alle zulässig.
- **Ebene:** Event.

### O06 — Beteiligte

- **Information/Feld:** Künstler/Kollektive/Positionen; Formatinhalt.
- **Wann:** bekannt und erklärend; Vollständigkeit nicht nötig.
- **Priorität:** zusätzliche Vertiefung.
- **Frage/Nutzen/Antwort:** „Welche Künstler, Kollektive oder Positionen sind beteiligt?“ Unterstützt Entdeckung und Programmzuordnung. Liste; unvollständig; keine Einzelankündigung.
- **Zustände:** alle zulässig.
- **Ebene:** Event/Ausstellung/Reihe mit Bestätigung.

### O07 — Werk-/Raumreferenz

- **Information/Feld:** freigegebenes Bild/offizieller Link; Medien/Belege.
- **Wann:** Bildkapazität vorhanden und Beleg klärt Erwartung; Artwork bleibt optional.
- **Priorität:** zusätzliche Vertiefung.
- **Frage/Nutzen/Antwort:** „Gibt es ein freigegebenes Bild oder einen offiziellen Link, der einen Eindruck von Arbeiten oder Raum gibt?“ Beleg statt Vermutung. Upload zuordnen; URL; nein; später.
- **Zustände:** alle zulässig; keine fremden Fotos, V1-Bildlimit beachten.
- **Ebene:** Ort/Ausstellung/Reihe/Event; Nutzung bestätigen.

## 5. Filmabend

### F01 — Film/Screening-Konzept

- **Information/Feld:** Film, mehrere Filme oder kuratiertes Konzept; Formatinhalt.
- **Wann:** aus Titel/Beschreibung nicht verständlich; mehrere Filme dürfen ein Programm sein.
- **Priorität:** Publikationspflicht.
- **Frage/Nutzen/Antwort:** „Welcher Film oder welches Screening-Konzept wird gezeigt?“ Klärt Programm und Film-/Interessenpassung. Titel optional mit Jahr/Regie; Kurzfilmprogramm; Langfilm; kuratierte Auswahl; Titel unbekannt plus bestätigtes Konzept.
- **Zustände:** unbekannter Titel zulässig, wenn Konzept verständlich; nicht zutreffend/Überspringen blockiert sonst.
- **Ebene:** Event; Reihe als Vorschlag.

### F02 — Sprache

- **Information/Feld:** gesprochene Sprache(n); Formatinhalt/Sprache.
- **Wann:** immer explizit prüfen, sofern nicht bestätigt; nie aus externem Filmwissen ergänzen.
- **Priorität:** Publikationspflicht mit zulässigem bestätigt unbekannt.
- **Frage/Nutzen/Antwort:** „In welcher Sprache ist der Film beziehungsweise das Programm?“ Klärt sprachliche Zugänglichkeit und Passung. Sprache(n); ohne Dialog; noch nicht bekannt.
- **Zustände:** unbekannt zulässig und sichtbar; „ohne Dialog“ statt nicht zutreffend; Überspringen blockiert.
- **Ebene:** Event/Programm.

### F03 — Untertitel

- **Information/Feld:** Untertitel und Sprache(n); Formatinhalt.
- **Wann:** immer explizit prüfen; nie aus externen Fassungsdaten ableiten.
- **Priorität:** Publikationspflicht mit zulässigem bestätigt unbekannt.
- **Frage/Nutzen/Antwort:** „Gibt es Untertitel, und wenn ja, in welcher Sprache?“ Unterstützt sprachliche Zugänglichkeit. Keine; Sprache(n); teilweise + Details; noch nicht bekannt.
- **Zustände:** unbekannt zulässig; nicht zutreffend bei Programm ohne Sprachinhalt; Überspringen blockiert.
- **Ebene:** Event/konkrete Fassung.

### F04 — Programmdauer

- **Information/Feld:** Gesamtdauer inklusive Pause/Gespräch; Zeit/Kontext.
- **Wann:** fehlt; nicht aus externen Filmdaten errechnen.
- **Priorität:** wichtige Ergänzung.
- **Frage/Nutzen/Antwort:** „Wie lange dauert der gesamte Abend ungefähr – inklusive Pause oder Gespräch?“ Hilft Heimweg und Anschlussplanung. Minuten/Stunden; Film plus offenes Gespräch; unbekannt.
- **Zustände:** alle zulässig; keine öffentliche Endzeit erfinden.
- **Ebene:** Event.

### F05 — Rahmenprogramm

- **Information/Feld:** Einführung, Gespräch, Diskussion, Zusammensitzen; Ablauf.
- **Wann:** angedeutet oder unklar.
- **Priorität:** wichtige Ergänzung.
- **Frage/Nutzen/Antwort:** „Gehört zum Screening noch eine Einführung, ein Gespräch oder ein anderer gemeinsamer Teil?“ Zeigt, ob der Abend mehr als Vorführung umfasst. Mehrfachauswahl + Uhrzeit/optional; nein; offen.
- **Zustände:** alle zulässig; bekannte Punkte sichtbar machen.
- **Ebene:** Event/Reihe mit Eventprüfung.

### F06 — verspäteter Einlass

- **Information/Feld:** Einlass nach Beginn; Zugang/Zeit.
- **Wann:** gemeinsamer Screeningbeginn und Saalregel relevant; nicht aus Dauer ableiten.
- **Priorität:** wichtige Ergänzung; bekannte Einschränkung publikationsrelevant.
- **Frage/Nutzen/Antwort:** „Ist Einlass nach Beginn noch möglich?“ Verhindert vergebliche Anreise. Ja bis; nein; nur Pause; ungeklärt.
- **Zustände:** unbekannt/überspringen zulässig, bekannte Grenze nicht; nicht zutreffend bei offenem Rahmen ohne Beginn.
- **Ebene:** Event/Ort, konkret bestätigt.

### F07 — Fassung/Präsentationsform

- **Information/Feld:** analog/digital, Live-Musik, besondere Fassung; Formatinhalt.
- **Wann:** angekündigt oder wesentlich; keine technische Vollständigkeit verlangen.
- **Priorität:** zusätzliche Vertiefung.
- **Frage/Nutzen/Antwort:** „Gibt es etwas Besonderes an der gezeigten Fassung oder Präsentation?“ Erklärt den besonderen Charakter. Digital; analog; Live-Musik; besondere Fassung; nein/nicht relevant.
- **Zustände:** alle zulässig.
- **Ebene:** Event/konkrete Fassung.

## 6. Auswahlprüfung mit vier fiktiven Beispielen

Alle Namen, Orte, Termine, Preise, Links und Inhalte sind **frei erfunden**. Es sind Dokumentationsfälle, keine echten Events, Medien oder Nutzertests.

### A — vollständiger Flyer

**Material:** „Nachtlinien“, 6.11.2026, 23:00–04:00, Beispielraum A mit Adresse; 15 EUR Abendkasse; DJ-Sets von Aster und Karo; ab 18; späterer Einlass bis 02:00; indoor; Beschreibung und offizieller Artist-Link.

**Auswahl:** B01–B08, B11–B12 sowie L01–L04/L06 sind vorhanden. Keine Pflichtfrage. Nur B09 Eingang und B10 Zugänglichkeit anbieten. L05 bleibt im Editor, wird aber nicht zur Fünferquote erzeugt.

**Erwartung:** Angaben gesammelt in der Vorschau bestätigen, nicht einzeln wiederholen.

### B — knapper Flyer

**Material:** „Neue Perspektiven — Opening, 7.11., 18 Uhr, Beispielraum B“, sonst nur abstrakte Grafik.

**Auswahl:** B02 Format, B03/O01 Beschreibung/Thema, B05 Adresse, B06 Kosten, B07 Zugang, O02 Besuchsmodus; bei „flexibel“ anschließend O03 Besuchsfenster. Erst danach etwa fünf Ergänzungen, etwa O04, O05, B09, B10, B11.

**Erwartung:** Mehr als fünf Fragen sind richtig, weil Pflichtlücken zusätzlich bestehen. Bestätigt unbekannte Kosten beziehungsweise ein unbekanntes Besuchsende können zulässig sein; unbearbeitetes Überspringen erfüllt die Pflicht nicht.

### C — widersprüchliche Angaben

**Material:** Filmflyer „Stadtlichter, 12.11., 19:30, Eintritt frei“; Begleittext nennt 20:00 und „5 EUR Spende“. Sprache einmal Deutsch, einmal Englisch mit deutschen Untertiteln. Ort, Zugang und Konzept seien eindeutig.

**Auswahl:** B04 zeigt 19:30/20:00 samt Herkunft; B06 kostenlos/Spende; F02/F03 klären Sprache und Untertitel getrennt. Danach F04 Dauer, F05 Rahmen und F06 späterer Einlass, sofern offen.

**Erwartung:** Nichts still auswählen. Organizer bestätigt eine Variante oder eigenen Wert; erst gelöste Pflichtwidersprüche erlauben Publikation.

### D — KI-Ausfall mit manuellem Fallback

**Material:** Drei Bilder für „Randlicht Kurzfilmabend“ wurden hochgeladen; Verarbeitung bricht ab. Titel und Ort sind gespeichert, keine Extraktion bestätigt.

**Ablauf:** Uploads/Eingaben bleiben. Im selben Entwurf B02–B07 und F01–F03 manuell ergänzen; danach nur offene Fragen wie F04–F06. Vorschau, Pflichtprüfung und Bestätigung bleiben gleich.

**Erwartung:** kein erneuter Uploadzwang, kein automatisches Publishing, kein stilles Überschreiben manueller Eingaben durch verspätete KI. Retry-, Timeout- und Speicherregeln bleiben S7.

## 7. Beratungs-Copy

- **Kosten:** „Hilft Besuchern bei der Budgetentscheidung. Nur ein bestätigter Preis kann später für Budgetfilter genutzt werden.“
- **Besuchsfenster/späterer Einstieg:** „Zeigt, ob spontanes oder späteres Kommen sinnvoll ist, und verbessert die zeitliche Passung.“
- **Ablauf/Besuchsmodus:** „Nimmt Erstbesuchern Unsicherheit und macht klar, ob Pünktlichkeit, Sitzen, Tanzen oder flexibles Vorbeischauen erwartet wird.“
- **Sprache/Untertitel/Zugänglichkeit:** „Hilft Besuchern vorab zu beurteilen, ob der Abend für sie zugänglich ist.“
- **Programm-/Vibe-Beleg:** „Ein bestätigter Programmpunkt oder offizieller Link vermittelt den Charakter verlässlicher als eine Vermutung.“

Zulässige Gesamtformulierung: „Mehr bestätigter Kontext kann DISKOE später helfen, den Event passenden Suchsituationen zuzuordnen. Klare öffentliche Angaben können außerdem das maschinelle Verständnis unterstützen. Eine bestimmte Platzierung oder zusätzliche Reichweite ist damit nicht garantiert.“

## 8. Noch offene Entscheidungen

1. **UI-Form:** Karten, Abschnittsliste oder Mischform; Darstellung von Herkunft und konkurrierenden Werten.
2. **Nachpflege:** wann ausdrücklich unbekannte Angaben später erneut angeboten werden dürfen, ohne Frage-Loop.
3. **Zugänglichkeitstiefe:** welche standardisierten Teilangaben neben stufenlos/teilweise/nicht stufenlos im Pilot verständlich und verantwortbar sind.
4. **Mischformate:** Hauptformat plus Ergänzung oder eigene kombinierte Pflichtregeln.
5. **Alpha-Auswertung:** Kriterien zum Entfernen, Umformulieren oder Hochstufen von Zusatzfragen; zunächst Antworten, Überspringen, Korrekturen, Abbrüche und gewonnene bestätigte Daten je Format messen.

## 8a. Ergänzung 2026-10-15: Abgrenzung zu Profil und Follow

Nutzerübergabe aus dem Developer-Chat vom 15.10.2026; kein direkter Notion-Abgleich. Die 32 Eventfragen B01–B12, L01–L06, O01–O07, F01–F07, die vier fiktiven Auswahlfälle und die fünf offenen Entscheidungen oben bleiben unverändert. Profilgestaltung und Follow erzeugen **keinen zusätzlichen Pflichtfragebogen beim Eventpublizieren**; Profil-/Follow-Entscheidungen Q29–Q36 stehen in `docs/SCOPE_EXTENSION_B2C_2026-10-15.md`, Abschnitt 9. Q29 (Module und kleinstes Profilangebot) ist als Nächstes zu entscheiden.

## 9. Verifikationsstand

Inhaltlich gegen `docs/DATA_CONTRACT_B2C_V1.md` und den aktuellen Notion-Build-Stand mit Q08–Q11 geprüft; vier synthetische Auswahlpfade dokumentiert. Nicht geprüft sind echte Organizer-Materialien, Nutzerverständnis, UI, KI-Ausgabe, Softwarelaufzeit, Speicherung oder Veröffentlichung.
