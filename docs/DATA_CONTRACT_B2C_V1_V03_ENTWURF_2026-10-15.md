# DISKOE B2C V1 — Datenvertrag v0.3 (Entwurf, Lesefassung)

**Stand:** 2026-10-15
**Status:** Fachlicher Entwurf zur Gesamtdurchsicht. Produktregeln sind beschlossen (jeweils mit Herkunft gekennzeichnet). Feldnamen, Enum-Vollständigkeit, Längen-/Dateigrenzen, Typisierung und Gesamtabnahme sind **Vorschlag** und **nicht abgenommen**.
**Keine Umsetzung:** kein Schema, keine Datenbanktabellen, keine Migration, kein Code, keine ausgeführten Tests, keine Entwicklungsfreigabe.

**Herkunft:** Notion „B2C-Datenvertrag v0.3 — Felddefinitionen & Prüfmatrix / Entwurf" (`3fab1cce8b73810799acd5a04ee72327`, Seitenstand 2026-10-15 13:34 UTC). Vorstufe „B2C-Datenvertrag v0.2" (`3fab1cce8b7381efbf71ce1bf718d89d`, Stand 2026-10-15 13:37 UTC), Beschlussseite (`3fab1cce8b738184ae44d857ecb9b999`) und Claude-Übergabe (`3fab1cce8b7381bc8f9bd5915138d91b`) wurden am 2026-10-15 über die Notion-Verbindung direkt gelesen.

**Verhältnis zu anderen Verträgen:**
- [`DATA_CONTRACT_B2C_V1.md`](DATA_CONTRACT_B2C_V1.md) (v0.1) und die [Ergänzung A1](DATA_CONTRACT_B2C_V1_ADDENDUM_2026-10-15.md) bleiben unverändert als Historie erhalten.
- v0.2 war fachlicher Zwischenstand und ist in diesem Dokument aufgegangen. Es gibt damit **eine** aktive Lesefassung für Felder ab v0.3, keine zwei konkurrierenden technischen Schemata.
- Ein vollständiger Zeilenvergleich mit v0.1 ist in diesem Abgleich **nicht** erfolgt. Überholte v0.1-Regeln (z. B. frühere Publikations-Gates oder Optionalität von Profilbildern) gelten nur, soweit v0.3 oder die Beschlussdatei sie ersetzt. Dieser Vergleich bleibt offen.

**Kennzeichnung:** **[Beschlossen]** = Produktregel. **[Vorschlag]** = technische Verpackung oder Normalisierung, noch nicht abgenommen. **[Offen]** = nicht entschieden.

## 0. Beschlossene Kernregeln (Kurzfassung)

- Entwürfe sind privat. Öffentlich wird nur ein vollständiger, bestätigter Stand mit Pflichtangaben (Titel, Beginn, Ort, Format, Atmosphäre, Kosten, Zugang, Bestätigung).
- KI liefert Vorschläge. Keine KI-Vorauswahl gilt als Bestätigung.
- Unbekannt ist eine bewusste Antwort, kein leerer Wert. Fehlend ist nie automatisch kostenlos, barrierefrei oder passend.
- Atmosphäre ist seit dem Abgleich **Publikationspflicht** (siehe Abschnitt 7).
- Versand: regulär 10:00 Europe/Berlin, höchstens eine reguläre Ankündigung je Organizer in 24 Stunden; Kurzfrist-Ausnahme mit festem 15-Minuten-Fenster.
- Discovery braucht ein freigegebenes Eventbild. Reine Eventpublikation bleibt ohne Bild möglich.
- Profil: Bildpflicht für die Veröffentlichung (Cover oder Anzeigebild), keine Muster, unabhängige Eventgestaltung.
- Discovery-Webapp ist eine spätere, separate Entwicklungsphase; der Katalog wird im Organizerprodukt vorbereitet.

## 1. Typkonventionen [Vorschlag]

- **ID:** stabile, undurchsichtige Identität; kein ID-Format und kein Datenbanksystem festgelegt.
- **Text:** Unicode; nach Entfernen reiner Leerzeichen nicht leer, sofern Pflicht. Lange Texte ohne ausführbares HTML; Richtext-Struktur für das Manifest separat.
- **URL:** gültige öffentliche Webadresse; für aktive Links vorzugsweise HTTPS. Anbieter-/Embedquellen auf einer Allowlist. URL-Gültigkeit ist nicht geprüfte Erreichbarkeit oder Ticketverfügbarkeit.
- **Instant:** eindeutiger Zeitpunkt mit Offset/UTC, zusätzlich benannte IANA-Zeitzone für die Ortszeit. Eingabe und Anzeige lokal; keine feste UTC-Stunde als Ersatz für Europe/Berlin.
- **Money:** nichtnegative ganze Zahl in kleinsten Währungseinheiten plus Währungscode (EUR-Cent als Vorschlag). Keine binären Gleitkommabeträge.
- **Enum:** genau ein erlaubter Wert. **Liste:** geordnete Sammlung. **Set:** eindeutige Werte ohne Duplikate. **Ref:** stabile Referenz statt Inhaltskopie.
- Exakte Längen- und Dateigrößenlimits sind vor Implementierung zu prüfen. Keine willkürlichen Produktlimits als beschlossen ausgeben; bereits beschlossene Mengenlimits gelten (z. B. Galerie bis sechs, Empfehlungen bis drei).
- Pflicht bezieht sich auf die Veröffentlichung. Unvollständige private Entwürfe bleiben speicherbar; die Verantwortlichenzuordnung bleibt trotzdem systemseitig nötig.
- In den Tabellen bedeutet **A(T)** eine Antwort vom Typ T mit den Antwortzuständen aus Abschnitt 2. Ein fehlender Wert wird nicht über leeren Text, 0 oder `false` ausgedrückt.

## 2. Antwort und Herkunft [Beschlossen; technische Verpackung Vorschlag]

| Feldvorschlag | Typ / Werte | Regel |
|---|---|---|
| `answer.state` | provided / unknown / not_applicable / skipped / unanswered | Fünf Zustände; je Feld nur eine erlaubte Teilmenge. |
| `answer.value` | T; nur bei `provided` | Bei `provided` typgültiger Wert nötig; bei anderen Zuständen kein inhaltlicher Ersatzwert. |
| `evidence_refs` | Liste von Herkunftsreferenzen | Quelle bzw. Eingabebezug, nicht öffentliches Rohmaterial. Keine dauerhafte Rohkopie allein aus Herkunftsbedarf ableiten. |
| `processing_kind` | direct / extracted / interpreted | Verarbeitung von Quelle und Bestätigung trennen; KI-Vorschlag ist nicht automatisch bestätigt. |
| `confirmation_ref` | Referenz auf bestätigte Inhaltsversion | Bestätigung eines vorhandenen Wertes ist getrennt davon. Sammelbestätigung möglich. |
| `confirmed_by` / `confirmed_at` / `revision_id` | ID / Instant / ID | Akteur, Zeitpunkt und Version nachvollziehbar. Rein technische Verarbeitung erneuert die Bestätigung nicht. |

- Bewusst bestätigtes Unbekannt ist `state = unknown` mit Bestätigung. „Kein WC" ist `state = provided` mit negativem Sachwert. „Nicht zutreffend" ist nur feldabhängig erlaubt.
- Bearbeitung nach Bestätigung erfordert die Bestätigung der neuen betroffenen Inhaltsversion.
- Öffentliche Provenienzanzeige kompakt. Interne Rohdaten, Notizen und Tokens sind niemals öffentlich.
- Keine numerischen KI-Confidence-Scores als Wahrheitssignal.

## 3. Organizer, Reihe, Version und Gestaltung [Beschlossen; Details Vorschlag]

| Feldvorschlag | Typ / Werte | Regel |
|---|---|---|
| `organizer.id` / `owner_id` | ID / private verantwortliche ID | Ein verantwortlicher Organizerzugang je Profil; keine Teamrechte in V1. |
| `organizer.name` / `introduction` / `slug` | Text / Text / URL-Segment | Für Profilpublikation erforderlich. Stabile Profil-URL nach Erstpublikation nur mit Founder-Unterstützung ändern. |
| `organizer.official_links` | Liste aus Bezeichnung und URL, max. 5 | Mindestens ein offizieller Link oder `public_contact`. Keine privaten Kontodaten übernehmen. |
| `organizer.public_contact` | optionale öffentliche Kontaktangabe | Kontaktkanäle abschließend typisieren; E-Mail zunächst als Kandidat. Nie automatisch aus der privaten Login-Adresse veröffentlichen. |
| `organizer.profile_image` / `cover_image` | optionale MediaUse-Referenzen | Mindestens eines der beiden für die Profilpublikation (Q35). Letztes öffentliches Bild nur durch Ersatz entfernen. |
| `series.id` / `name` / `concept` | optionale ID / Text / Text | Reihe als Vorlagenquelle; kein automatischer Terminplaner und keine zugesagten eigenen Reihenseiten. |
| `draft_revision` / `published_revision` | optionale Refs auf getrennte Inhaltsstände | Bearbeitung darf den öffentlichen Stand nicht ändern. |
| `publication_state` | private / public / withdrawn | Getrennt von Eventstatus, Bestätigung, Sperre und Archivierung. |
| `first_review_state` | pending / approved / clarification_needed | Organizer-Erstprüfung; nicht jede Eventänderung erneut intern prüfen. |
| `restriction` | separater interner Sperr-/Interventionsstand | Kein durch Publikation umgehbarer Zustand. Rechte, Gründe und Matrix offen. |
| `design.direction` | poster / editorial / mixtape | Gültiger Default bzw. gewählte Richtung für die öffentliche Fassung. |
| `design.palette` / `custom_colors` | Palettenkennung oder Hintergrund-/Text-/Akzentfarbe | Sechs kuratierte Paletten je Richtung plus eigene Farben; Lesbarkeitsprüfung erforderlich. Konkrete Werte offen. |
| `design.font_pair` / `version` | freigegebene Kennung / Designversion | Keine freien Schriftuploads oder Größen, keine Muster. Updatepolitik offen. |
| `modules.enabled` / `middle_order` | Set von Modulkennungen / geordnete IDs | Identität oben, kommende Events danach, Links/Kontakt unten. Musik, Galerie, Manifest, Empfehlungen und Archiv dazwischen sortierbar, je einmal. |
| `gallery.items` | Liste MediaUse, max. 6 | Manuell sortierbar, optionale Bildunterschrift. Deaktiviert bedeutet nicht Inhalte löschen. |
| `manifest` | optionaler Text mit einfacher Formatierung | Keine beliebigen HTML- oder CSS-Inhalte. |
| `music.provider` / `item_url` / `heading` / `comment` | `soundcloud` oder `spotify` / URL / optionale Texte | Ein Slot. SoundCloud: Track, Mix, Playlist; Spotify: Track, Album, Playlist. Kein Autoplay; Aktivierung vor Anbieterrequest; Linkfallback. |
| `event.design` | unabhängiger Gestaltungsstand | Optional Profilgestaltung als Starthilfe kopieren. Spätere Profiländerungen ändern das Event nicht. Kein Moduleditor. |

- Profil ohne Events ist erlaubt. Leerzustand „Neue Termine folgen" plus Abo-Möglichkeit.
- Stilwechsel erhält Inhalte und gültige Optionen; mobile Vorschau und Bestätigung. Nicht übertragbare Optionen als erkennbare Defaults vorschlagen. Private Änderungen bleiben privat.

## 4. Eventidentität, Zeit und Besuch [Beschlossen; Feldnamen Vorschlag]

| Feldvorschlag | Typ / Werte | Regel |
|---|---|---|
| `event.id` / `organizer_id` / `series_id` | ID / Ref / optionale Ref | Identität und öffentliche URL bleiben bei Korrektur und Verschiebung erhalten. Duplikat bekommt eine neue ID und ist privater Entwurf. |
| `event.title` / `description` | A(Text) | `provided` und bestätigt Pflicht; kein bloß generischer, unverständlicher Inhalt. |
| `event.primary_format` | A(Format) | Ein Hauptformat; Normalisierung siehe Abschnitt 7. Nicht alle Altformate universell freigeben. |
| `event.additional_formats` | A(Set von Formaten) | Optionale Ergänzungen; keine Duplikate des Hauptformats. |
| `event.status` | scheduled / rescheduled / postponed_undated / cancelled | Geplant / verschoben mit Termin / verschoben ohne Termin / abgesagt. Endgültige Löschung separat. |
| `event.start_at` / `timezone` | A(Instant) / IANA-Zeitzone | Bestätigter Beginn Pflicht. Bei `postponed_undated` den alten Termin nicht als aktuell verwenden. Ersatztermin bei `rescheduled` Pflicht. |
| `event.end` | at / open_ended / unknown | `at` braucht einen Instant nach dem Beginn. Offenes und unbekanntes Ende unterscheiden. Unbearbeitete Optionalangabe nicht still als bewusste Antwort führen. |
| `event.visit_mode` | A(fixed_start / flexible / combined) | Für Vernissagen Pflichtantwort; bei anderen Formaten gezielt erfragen. Listening-Session: Pflicht (Abschnitt 16). |
| `event.doors_at` | A(Instant) | Optional; nicht automatisch der Eventbeginn. |
| `event.last_entry` | A(at mit Instant oder no_fixed_cutoff) | Optional. `unknown` über den Antwortzustand. Keine letzte Einlasszeit erfinden. |
| `event.visit_window` | A(from Instant, until at / open_ended / unknown) | Bei `flexible` oder `combined` erforderlich; ein zusammenhängendes Fenster. Bekannte Zeiten gegen Eventzeit und Einlass prüfen. |
| `event.schedule_note` | A(Text) | Optionaler Ablaufhinweis; kein Sessionplaner. |
| `archive_at` / `temporal_phase` | abgeleiteter Instant / Zeitphase | Bekanntes Ende, sonst Folgetag 12:00 Ortszeit. Interner Cutoff ist keine Dauer und kein tatsächliches Ende. |

- Zeitumstellung: mehrdeutige oder nicht existierende Ortszeit vor Freigabe klären.
- Laufender Besuch setzt bestätigte Besuchbarkeit voraus. Unbekanntes Ende und Archivcutoff genügen nicht.
- Sonderfall späterer Beginn am Folgetag mit internem Cutoff ausdrücklich prüfen. Keinen Cutoff als echten Endwert speichern.

## 5. Kosten und Zugangswege [Beschlossen; Feldnamen Vorschlag]

| Feldvorschlag | Typ / Werte | Regel |
|---|---|---|
| `pricing.model` | free / fixed / from / range / donation; unknown als Antwortzustand | Kostenantwort für die Publikation nötig; bestätigt unbekannt ist zulässig. |
| `pricing.amount` / `min` / `max` / `currency` | Money-Felder | `fixed` braucht Betrag; `from` ein Minimum; `range` Min und Max mit min ≤ max. Währung Pflicht; EUR als Default. |
| `pricing.note` | optionaler Text | Optionen, Ermäßigungen, Zugangsbezug verständlich. Kein vollständiger Ticketkatalog. |
| `pricing.donation_minimum` | optionale Money-Angabe | Verpflichtende Mindestzahlung von der freiwilligen Spende unterscheiden; bei Budgetauswertung entsprechend. |
| `pricing.mandatory_fees` | included / extra_known / unresolved, plus Betrag wo bekannt | Keinen Gesamtpreis aus unklarer Gebührenlage garantieren. |
| `access.routes` | nichtleere Liste von Zugangsoptionen | Ohne Voranmeldung, Abendkasse, Online-Ticket und Online-Anmeldung sind kombinierbar. Name, Preis- und Verfügbarkeitsbezug je Option. |
| `access.route.kind` / `url` | walk_in / door / online_ticket / online_registration; optionale URL | Erforderlicher Onlinezugang braucht einen bestätigten gültigen Link. Notwendigkeit und Empfehlung je Anmeldung noch modellieren. |
| `access.route.availability` | A(available / sold_out / waitlist) plus `as_of` | Unbekannt getrennt führen. Organizerangabe mit Zeitpunkt; kein Livebestand. |
| `access.age_rule` | A(no_restriction / minimum_age / special_rule) | `minimum_age` braucht eine Ganzzahl; `special_rule` verständlichen Text. Nicht aus Ort oder Genre ableiten. |
| `access.conditions` | optionale bestätigte Hinweise | Bekannte wesentliche Teilnahmebedingungen öffentlich. Nicht in optionalen privaten Feldern verlieren. |

- Harte Budgetbedingung nur aus einer bestätigten relevanten Preisoption inklusive notwendiger Gebühren. Ab-Preis ohne zugängliche passende Option reicht nicht.
- „Vorverkauf ausverkauft" lässt bestätigte andere Zugangswege bestehen. Ein funktionierender Ticketlink ist kein Verfügbarkeitsnachweis.
- Rechts- und Betreiberregeln nicht aus unserer Dateneingabe ableiten.

## 6. Ort und räumliche Zugänglichkeit [Beschlossen; Feldnamen Vorschlag]

| Feldvorschlag | Typ / Werte | Regel |
|---|---|---|
| `place.id` / `name` / `address` | Ref / Text / strukturierte Adresse | Bestätigter eindeutiger Hauptort mit Straße, Hausnummer, PLZ, Stadt, Land. Kein regulärer Fall für geheime oder TBA-Orte. |
| `event.place_use` | Ortssnapshot/Version mit `area` und `entry_note` | Genutzten Bereich konkretisieren, wenn für das Auffinden nötig. Kein globales stilles Überschreiben anderer bestätigter Events. |
| `geo.latitude` / `longitude` | Zahlen in [-90, 90] / [-180, 180] | Automatisch aus der bestätigten Adresse. Keine manuelle Koordinatenpflicht. Pin optional verschiebbar. |
| `geo.source` / `status` / `address_revision` | Herkunft / Prüfzustand / Referenz | Vorschlag: Status pending, matched, ambiguous, failed. Genauigkeitskriterium und Anbieter offen. |
| `geo.district` / `neighborhood` | optionale verlässlich zugeordnete Referenzen | Alte Bezirksliste mischt Lagebegriffe; vor neuen Filtern normalisieren. Keine unbestätigte Bezirksauswahl erfinden. |
| `setting` | A(indoor / outdoor / mixed) | Eventbezogen; unknown zulässig. |
| `accessibility.step_free` | A(step_free / steps_only / partial) | Optional; unknown getrennt; `partial` braucht Bereichserklärung. |
| `accessibility.area_note` | A(Text) | Bei `partial` nötig; passend zum tatsächlich genutzten Bereich. |
| `accessibility.wheelchair_wc` | A(Boolean) | `false` heißt bestätigt nicht vorhanden. Keine pauschale Barrierefreiheitszusage. |
| `accessibility.support_note` / `contact` | optionale bestätigte Angaben | Aufzug, Rampe, Hilfe, Einschränkungen und Rückfragekontakt. Ortsvorlage für das Event bestätigen. |

- Kartenfehler blockiert den Distanzfilter, nicht automatisch die Publikation. Gebäude-Pin ist nicht der Eingang.
- Mehrere Räume an derselben Adresse im Hinweis, kein Mehrortevent.
- Genauigkeitsbestätigung darf nicht bloß bedeuten, dass ein Geocoder irgendeinen Treffer geliefert hat.

## 7. Programm, Taxonomie und Atmosphäre [Beschlossen; IDs Vorschlag]

| Feldvorschlag | Typ / Werte | Regel |
|---|---|---|
| `program.participants` | A(Liste aus `name`, `role?`, `official_url?`) | Vollständiges Line-up optional; keine Künstlerkonten nötig. |
| `program.concept` | A(Text) | Verständliches musikalisches Konzept bzw. Ausstellungs- oder Screeningkonzept je Format. Darf aus einer bestätigten Beschreibung erfüllt sein; keine doppelte Pflichttexteingabe. |
| `program.languages` | A(Set von Sprachcodes oder `no_language_content`) | Film: Pflichtantwort, unknown zulässig. Keine aus Wissen geratene Fassung. |
| `program.subtitles` | A(none / present / partial / not_applicable) | `present` braucht Sprachen, `partial` eine Erläuterung. Unbekannt als Antwortzustand. |
| `program.participation` / `reference_links` | A(Set von Beteiligungsformen) / Liste aus Bezeichnung, URL, Bezug | Konkrete Merkmale; Hör- und Programmbelege optional. Auswahlwerte jenseits der Beispiele noch ausarbeiten. |
| `atmosphere.tags` | A(Set aus max. 3: cozy, intimate, relaxed, lively, casual, experimental, underground, alternative, community_driven, immersive) | Siehe Atmosphärenpflicht unten. Kein automatisches KI-Ankreuzen. |
| `atmosphere.description` | A(Text) | Alternative oder Ergänzung zur Tagwahl. Bestätigte passende Beschreibungsteile wiederverwenden; kein zweiter identischer Text nötig. |
| `atmosphere.evidence` | optionale belegende Aussage oder Referenz | Erläuterung anbieten; keine zusätzliche Belegpflicht beschlossen. Interpretationen erkennbar machen. |
| `energy_level` | A(low / medium / high) | Optional; unknown zulässig. Energie ist nicht Lautstärke; Organizer-Einschätzung. |
| `social_interaction` | A(low / medium / high) | Optional; beschreibt Interaktionsangebot bzw. -prägung, nicht Publikumsdichte; keine Kontaktpflicht ableiten. |
| `music.broad_styles` | A(Set von höchstens 3 breiten Richtungen) | Optional, wenn das musikalische Konzept bereits verständlich ist. |
| `music.focus_text` | A(Text) | Originale präzise Genre- oder Konzeptbezeichnung erhalten; keine automatische Erweiterung allgemeiner Enums. |

**Atmosphärenpflicht [Beschlossen, neu seit dem Abgleich]:** Für die Eventpublikation ist **mindestens ein** bestätigter Atmosphärenbegriff (höchstens drei) **oder** eine eigene kurze bestätigte Beschreibung erforderlich. Energie und soziale Interaktion bleiben optional. Mood als Besucherintention ist keine zusätzliche Organizer-Tagpflicht.

**Atmosphärenbegriffe [Beschlossen]:** Gemütlich; Intim/persönlich; Entspannt; Lebhaft; Ungezwungen; Experimentell; Underground/DIY; Alternativ/unabhängig; Community-geprägt; Immersiv. Kurzdefinitionen gemäß Chatvorschlag; Überschneidungen in der Alpha prüfen.

**Energie [Vorschlag]:** low = ruhig, langsam, konzentriert; medium = belebt, mäßig aktivierend; high = intensiv, stark aktivierend.
**Interaktion [Vorschlag]:** low = eigenständiger Besuch ohne vorgesehenen Austausch; medium = Austausch möglich, kein wesentlicher Programmteil; high = Austausch oder gemeinsame Beteiligung prägt das Programm.

**Musikrichtungen [Beschlossen]:** Elektronisch; Hip-Hop/Rap; Jazz; Soul/Funk/R&B; Rock/Punk; Pop; Klassik/Neue Musik; Folk/akustisch; experimentelle Musik/Klangkunst. Technische IDs als Namenszuordnung später eindeutig festlegen. Kein umfassender Genrebaum. Freitextpräzisierung bleibt erhalten; eindeutige Synonyme dürfen vereinheitlicht werden.

**Hauptformate [Beschlossen, vorläufig für die Alpha]:**

| Produktformat | Normalisierung [Vorschlag] |
|---|---|
| Konzert / Live-Musik | concert |
| DJ-Set | dj_set |
| Party / Clubabend (auch tagsüber oder draußen) | club_night |
| Listening-Session | listening_session |
| Vernissage / Ausstellungseröffnung | opening |
| Datierter Ausstellungsabend / Offspace-Programm | exhibition |
| Filmabend / Screening | screening |

- Ergänzende Programmteile getrennt führen: Live-Musik, DJ-Set, Screening, Talk/Gespräch, Lesung, Performance. Ihre IDs exakt abgleichen; sie implizieren keine neuen eigenständigen Hauptformate.
- Ein unpassendes Format wird als Entwurf zur Klärung geführt, nicht als universelles „Sonstiges" publiziert.
- Kein Dauerausstellungsplan.
- Outdoor, Preis und Einlass werden aus Fakten abgeleitet, nicht als getrennt gepflegter Vibe-Tag. DISKOE-Fit und Discovery-Value sind keine neue Publikationspflicht.

## 8. Medien und verwendungsbezogene Freigabe [Beschlossen; Rechtstexte offen]

| Feldvorschlag | Typ / Werte | Regel |
|---|---|---|
| `media.id` / `uploader` / `original_ref` | ID / private ID / private Dateireferenz | Upload ist keine Veröffentlichung. Erfassungsdateien und öffentliche Nutzung trennen. |
| `media.source` / `credit` | Herkunft / optionale Quellen- oder Urheberangabe | Bestätigter Nutzungsumfang separat. Keine erfundenen Rechte. |
| `media_use.asset_id` / `role` | Ref / profile_image, cover_image, gallery, event_image | Verwendung explizit wählen. Bis zu sechs Galeriebilder, ein Event-Hauptbild. |
| `media_use.crop` / `alt_text` / `caption` | Ausschnitt/Fokus / Text / optionaler Text | Original erhalten, Vorschau je Verwendung. Keine unbelegten KI-Bildbeschreibungen. |
| `media_use.confirmation` | versionierter Freigabebezug | Öffentliche Seite, Sharing und spätere Discovery gemäß freigegebenem Umfang. Keine automatische Partner- oder API-Freigabe. |

- **Eventbild für Discovery** ist ein freigegebenes Bild; für die reine Eventpublikation bleibt es optional. Ein Profilbild wird nicht still als Eventbild verwendet. Kein ungefragter Profilbildersatz, keine erfundenen Fotos.
- Letztes Profilbild nicht ersatzlos entfernen. Entfernte Galeriezuordnung löscht keine anderweitig genutzte Datei.
- Finale rechtliche Freigabetexte und technische Dateilimits sind offen.

## 9. Empfehlungen und Einladungen [Beschlossen; Zuordnung Details offen]

| Feldvorschlag | Typ / Werte | Regel |
|---|---|---|
| `recommendation.author` / `target_type` / `target_id` | Organizerref / event oder organizer / ID | Veröffentlichtes fremdes DISKOE-Ziel; maximal drei gemeinsam. |
| `recommendation.comment` / `order` / `confirmation` | Text / Reihenfolge / Versionsref | Kommentar Pflicht und ausdrücklich bestätigt. Keine Gegenseitigkeit behaupten. |
| `external_marker.url` / `project_name` / `target_type` | URL / optionaler Text / event oder organizer | Privat. Kein öffentliches Fremdevent aus einem Link. |
| `invitation.id` / `inviter` / `marker_ref` | ID / Organizerref / Ref | Keine Empfängeradresse nötig; Sharing und Kopieren durch den Organizer. |
| `invitation.created_at` / `expires_at` / `revoked_at` | Instant / Instant / optionale Instant | Link 30 Tage gültig. Ein erneuerter Link deaktiviert den alten. Zeiteinheit (30 Tage oder Kalendertage) technisch klar definieren. |
| `invitation.token_ref` | private sichere Linkreferenz | Keine Rechte zum Bearbeiten oder Publizieren. Speicherung und Sicherheit später; keine Tokens in Analytics. |
| `invitation.assignment_state` | open / proposed / linked / discarded | Linkgültigkeit getrennt von der Vorgangszuordnung. |
| `invitation.target_organizer` / `proposed_target` | optionale Refs | Ein Zielprojekt je Einladung. Empfänger sieht und akzeptiert den Zusammenhang. Falsche Zuordnung ist ablehnbar. |
| `invitation.linked_by` / `linked_at` | Akteur / Instant | Der empfehlende Organizer bestätigt ein konkretes veröffentlichtes Ziel. Ein Eventziel ist nicht allein durch Profilregistrierung erfüllt. |

- Bestehender Organizer: Login und Projektzuordnung statt Neuregistrierung.
- Ein weitergeleiteter Link öffnet eine Erklärung, aber keine automatische öffentliche Empfehlung und keine Rechte. Nutzung von DISKOE bleibt möglich, auch wenn keine Empfehlung entsteht.
- Manueller Suchpfad ohne Link ist möglich.
- Widerruf: Link sofort deaktivieren; Vorgang 30 Tage später löschen; offene Vorgänge nach 90 Tagen zur Bereinigung anbieten.
- Kein Einladungsversand durch DISKOE. Kopieren ist nicht versendet.

## 10. Follow und Versand [Beschlossen; Versandwerte beschlossen, Zustellmechanik Vorschlag]

| Feldvorschlag | Typ / Werte | Regel |
|---|---|---|
| `contact.id` / `email` / `delivery_health` | ID / private E-Mail / technischer Zustand | Keine öffentliche Ausgabe. Organizer sehen nur die aggregierte Aboanzahl. Bounce ist kein Widerruf. |
| `subscription.project` / `contact` / `state` | Refs / unconfirmed, active, unsubscribed, blocked | Projektbezogen eindeutig ein aktives Abo. Keine Teamrechte. |
| `subscription.consent_version` / `requested_at` / `confirmed_at` / `ended_at` | Referenz / Instants | Zweck und Textfassung nachweisen. Keine ungefragte Newsletter-Mitnahme. |
| `subscription.confirmation` / `management_credentials` | private sichere Nachweise | Verwaltung zeitlich begrenzt. Gültigkeitsdauern und Einmalverwendung als Authdetail prüfen. |
| `delivery.recipient` / `project` / `items` | Kontaktref / Organizerref / Liste aus Event und Inhaltsversion | Tatsächlichen Versand zuordnen, nicht nur geplante Empfänger. |
| `delivery.reason` / `state` / `timestamps` | Ankündigung, wichtige Änderung, Absage / Versuchszustand und Zeitpunkte | Vorschlag: queued, submitted, failed, uncertain, suppressed. Anbieterannahme ist keine Leserzustellung. |
| `delivery.deduplication_identity` | stabile Anlass-/Empfänger-Zuordnung | Ein Event je Abo nur einmal neu. Relevante Korrekturversion getrennt. Kein ungeprüfter Retry. |
| `notification_plan` | abgeleiteter geplanter Zeitpunkt und Anlass | Regulär 10:00 Europe/Berlin; kurzfristig und Änderung über 15-Minuten-Fenster; Absage sofort versandbereit. Keine Zustellgarantie. |

- Vor jedem Versuch aktiven Empfänger-, Projekt- und Eventstand prüfen. Alte Bestätigungslinks reaktivieren keine beendeten oder gesperrten Abos.
- Einzelabo und alle Projektabos abmeldbar.
- Spätere Empfänger werden nicht automatisch in den historischen Korrekturverteiler aufgenommen.
- Regulär höchstens eine Ankündigung je Organizer in 24 Stunden; eine kurzfristige Ausnahme ist bestätigt, wenn der Beginn vor dem nächsten erlaubten Versand liegt. Nicht mehr vor Beginn sendbar → keine neue Ankündigung.
- Änderungen an Datum, Beginn oder Ort gehen an aktuell berechtigte frühere Empfänger. Kleine Korrekturen gehen ohne Mail. Wiederveröffentlichung ist keine neue Erstankündigung.
- Unmittelbar vor der Übergabe an den Anbieter Abo, aktuellen öffentlichen Inhalt und bisherige Sendung erneut prüfen. Nach der Übergabe keinen Rückruf garantieren.

**Versandregeln [Beschlossen]:**
- Regulär täglich 10:00 Europe/Berlin, höchstens eine reguläre Ankündigung je Organizer in 24 Stunden.
- Kurzfristiges Event: Die erste kurzfristige Publikation startet ein festes **15-Minuten-Fenster**. Weitere Publikationen darin werden gebündelt, das Fenster wird nicht verlängert. Nach dem Versand darf ein neues Fenster starten; weitere kurzfristige Batches sind zulässig.
- Tagesmail und kurzfristige Ankündigung werden nur zusammengeführt, wenn dadurch kein Event zu spät angekündigt wird. Keine doppelte Eventankündigung.
- Wichtige Änderungen von Datum, Beginn oder Ort werden über ein festes 15-Minuten-Fenster gebündelt und zeigen den letzten bestätigten Stand. Vollständig zurückgenommene Änderungen werden nicht gemeldet.
- Absage ersetzt eine wartende Änderung und ist sofort versandbereit. Bereits übergebene Versuche werden berücksichtigt.
- Änderung vor Erstversand: aktueller bestätigter Stand wird gesendet, keine separate Korrekturmail.
- Absage oder Rücknahme vor Erstversand: Event entfällt; eine leere Mail entfällt.
- Verschiebung während der Wartezeit: nach neuem bestätigtem Beginn neu planen. Ohne Ersatztermin keine neue Ankündigung.
- Event beginnt vor Ablauf des Fensters: keine verspätete Neuankündigung und keine zusätzliche Sofortausnahme.
- Status „übergeben" ist nicht „zugestellt".

## 11. Sichtbarkeit, Offline, Entfernung und Löschung [Beschlossen; Detailtexte offen]

- **Profilpause:** neutraler öffentlicher Hinweis „Derzeit nicht öffentlich". Private Inhalte und Einstellungen bleiben erhalten. Vor der Pause wird gewählt, ob bestehende Events öffentlich bleiben oder zurückgenommen werden. Keine automatische Absage.
- Pausiert sind neue reguläre Ankündigungen, neue Profilabos und Profileinladungen. Wichtige Änderungen und Absagen bereits angekündigter Events gehen weiterhin an berechtigte frühere Empfänger.
- Bestehende Abos bleiben gespeichert und abmeldbar; die Pause ist kein Widerruf.
- **Offline-Absender** bei einem öffentlich verbleibenden Event: Organizername und neutraler Profillink, keine Neuanmeldung, bestehende Aboverwaltung.
- **Rückkehr:** ausdrücklich bestätigen, aktuelle Inhalte prüfen. Kein erneuter Erstcheck bei unveränderter Zuordnung ohne Sperre. Keine automatische Nachsendung; noch nicht versendete künftige Events werden angezeigt und der Organizer wählt aus.
- Sperre ist separat und nicht durch Wiederveröffentlichung umgehbar.
- Privaten Entwurf entfernen ändert den öffentlichen Stand nicht. Gemeinsam genutzte Medien bleiben erhalten.
- Event zurücknehmen: öffentliche Details, Discovery und Empfehlungen entfallen; keine neue Ankündigung; intern zunächst erhalten. Zurücknehmen ist nicht Absage und nicht endgültige Löschung.
- **Endgültige Event- oder Kontolöschung** in der Alpha über Founder-Support: Identität und Folgen bestätigen, Projektinhalte zurücknehmen, Empfehlungen ausblenden, Einladungslinks deaktivieren, Projektabos beenden. Bevorstehende angekündigte Events vorher klären; Kontolöschung ist keine automatische Eventabsage.
- Gemeinsam genutzte Orts- und Mediendaten anderer Organizer nicht unbeabsichtigt löschen.
- Alte Login-, Bestätigungs- und Einladungslinks dürfen gelöschte Zugänge oder Abos nicht reaktivieren.
- Abmeldung stoppt den Projektversand sofort; andere Abos bleiben unverändert.
- „Öffentlich entfernt" ist nicht „überall endgültig gelöscht". Aufbewahrung und Löschung von Rohmaterial, Inhalten, Nachweisen und Backups vor dem Start festlegen.

## 12. Discovery-Eignung als abgeleitete Prüfung [Beschlossen, Grundlogik; Suchdetails offen]

- **Grundvoraussetzungen:** öffentlicher bestätigter freigegebener Eventstand; nicht gesperrt, entfernt, abgesagt oder archiviert; gültiger bestätigter Termin und Ort; verständlicher Titel, Beschreibung und Hauptformat; keine ungelösten kritischen Widersprüche; **freigegebenes Eventbild**.
- Kein dauerhaft manuelles Ready-Flag. Die Eignung wird aus dem aktuellen bestätigten Stand berechnet.
- **Harte Suchbedingungen** (z. B. Gesamtkosten, später Einlass, Sprache oder Untertitel, konkrete räumliche Zugänglichkeit, Outdoor, Distanz, Alter oder Zugang) nur mit konkret passenden bestätigten Angaben erfüllen. Unbekannt ist nicht erfüllt.
- **Weiche Wünsche:** bestätigte Angaben stärker berücksichtigen; belegbare Beschreibungen oder Programmbelege vorsichtig verwenden; reine unbestätigte KI-Vermutungen nicht als persönliches Match behaupten. Fehlende Angaben sind neutral, kein negatives Urteil und kein pauschaler Feldmengenbonus.
- **Erklärungen** nur mit belegbaren Gründen. Einordnung und Interpretation von Fakten unterscheiden. Suchbedingungen nicht still lockern; bei wenigen Treffern eine Lockerung ausdrücklich anbieten.
- **Aktualität:** keine willkürliche Bestätigungs-Verfallsfrist in der Alpha. Erinnerungsbedarf anhand realer veralteter Angaben prüfen.
- Laufenden Besuch nicht aus dem internen Archivcutoff oder bloßer Dauer ableiten.
- **Reihenfolge:** zuerst Organizerprodukt mit Profilen, Eventseiten, Erfassung, Publishing, Sharing, Follow und Empfehlungen; Katalog aufbauen und wiederholte Nutzung messen. Discovery-Webapp danach als eigene Entwicklungsphase.
- Katalogvorbereitung gehört zur Organizer-Alpha. Consumer-Suche, Filter, Ranking und Ergebnisoberfläche gehören **nicht** zum aktuellen Alpha-Umfang und nicht zu dessen Aufwandsschätzung.
- **Startmaßstab:** ausreichend aktuelle passende Angebote für typische Suchsituationen (Suchabdeckung), nicht bloß Gesamtzahl. Konkrete Schwellen **offen**.
- Mindestbild darf nicht durch einen unbestätigten Platzhalter als erfüllt gelten. Ein Platzhalter ist derzeit nicht beschlossen.
- Organizer-Einschätzung und DISKOE-Interpretation kennzeichnen.

## 13. Aufbewahrung — beschlossene Produktfristen [Beschlossen; Nachweis- und Backupfristen offen]

Diese Fristen sind Produktentscheidungen, keine gesetzlichen Pauschalfristen.

- Unbestätigte Projektabos: **7 Tage**. Andere aktive Abos derselben Adresse bleiben erhalten.
- Erfassungsrohmaterial (nur zur Erfassung verwendete Flyer und Texte): **30 Tage** nach erfolgreicher Veröffentlichung; ausgewählte öffentliche Bilder ausgenommen.
- Private Evententwürfe: nach **90 Tagen** ohne Bearbeitung erinnern; **30 Tage** später löschen. Profilgestaltung und wiederverwendbare Vorlagen ausgenommen. Wie erneute Bearbeitung die Frist zurücksetzt, ist in der Validierung zu konkretisieren.
- Verworfene Einladungen und externe Merker: **30 Tage**. Offene Vorgänge nach **90 Tagen** zur Bereinigung anbieten; keine automatische Löschung aktiver Einladungen.
- Technische Fehlerlogs: **30 Tage**, ohne vollständige Inhalte, E-Mail-Adressen oder geheime Links.
- Individuelle Analytics-Ereignisse: **90 Tage**, danach löschen oder tatsächlich anonym zusammenfassen.
- Öffentliche Profile und Eventarchive bleiben erhalten, solange sie als Auftritt oder Archiv gewünscht sind. Aktive Abos werden nicht allein wegen Inaktivität gelöscht.
- Endgültig gelöschte Inhalte werden aus aktiven Systemen ohne unnötige Verzögerung entfernt.
- **Backupziel:** spätestens 30 Tage; Anbieterfähigkeit noch zu prüfen. Nach einer Wiederherstellung werden Löschungen erneut angewendet. Kein Anbietermerkmal als garantiert behaupten.
- **Offen:** begründete Fristen für Einwilligungsnachweise nach Aboende, minimale Sperrinformationen, Versandnachweise, verwaiste oder nie veröffentlichte Uploads, alte Inhaltsversionen. Diese Fristen müssen vor produktiver Verarbeitung feststehen.

## 14. Prüffälle P01–P42 [Spezifikationsfälle, keine ausgeführten Tests]

| ID | Fall | Erwartetes Ergebnis |
|---|---|---|
| P01 | Titel, Beginn oder Adresse fehlt | Entwurf speicherbar; normale Publikation blockiert; konkrete Lücke genannt. |
| P02 | Atmosphäre weder bestätigt ausgewählt noch beschrieben | Publikation blockiert; ein KI-Vorschlag allein genügt nicht. |
| P03 | Keine Tags, aber bestätigter eigener Atmosphärensatz | Atmosphärenpflicht erfüllt; keine erzwungene zusätzliche Auswahl. |
| P04 | Vier Atmosphärenbegriffe | Auf höchstens drei reduzieren lassen; Inhalte nicht still abschneiden. |
| P05 | Kein Eventbild, sonst vollständig | Eventseite mit typografischer Gestaltung möglich; keine Discovery. |
| P06 | Profil ohne Profil- oder Titelbild | Privater Entwurf ja; Profilpublikation nein. |
| P07 | Preis „unknown", bestätigt | Publikation mit Hinweis; keine harte Budgetpassung. |
| P08 | Erforderliche Onlineanmeldung ohne URL | Publikation blockiert. |
| P09 | Abendkasse plus ausverkaufter Vorverkauf | Zugangswege getrennt zeigen; nicht pauschal ausverkauft. |
| P10 | Ab-Preis 10 EUR, Gebühren unklar, Budget 12 EUR | Keine gesicherte Budgetpassung behaupten. |
| P11 | Fr 23:00 bis Sa 04:00 | Eindeutige Datums- und Zeitzonenanzeige; Ende nach Beginn. |
| P12 | Ende unbekannt | Keine erfundene Endzeit; interner Cutoff separat; laufenden Besuch nicht zusagen. |
| P13 | Nicht existierende oder mehrdeutige Ortszeit bei Zeitumstellung | Vor Veröffentlichung eindeutig klären. |
| P14 | Letzter Einlass nach bestätigtem Ende | Widerspruch klären; keine stille Änderung. |
| P15 | Adresse korrekt, Kartenpunkt falsch oder mehrdeutig | Publikation möglich; Distanzsuche bis zur Klärung aus. |
| P16 | Ortsvorlage wird geändert | Andere bestätigte Events unverändert; Übernahme anbieten. |
| P17 | Teilweise stufenlos ohne Bereichserklärung | Antwort unvollständig; Erläuterung einholen; keine pauschale Zugänglichkeit. |
| P18 | Film ohne bestätigte Sprach- oder Untertitelantwort | Pflichtlücke; „unknown" ist ausdrücklich zulässig. |
| P19 | KI leitet hohe Energie nur aus einer Clubadresse ab | Nicht ungeprüft übernehmen; keine Veranstaltungsfakten daraus. |
| P20 | Genre-Freitext „Dub Techno" | Original erhalten; breite Zuordnung nur ergänzend; kein neuer globaler Enumwert. |
| P21 | Flyer nur zur Extraktion hochgeladen | Nicht automatisch als öffentliches Eventbild verwenden. |
| P22 | Galeriebild auch in anderem Event verwendet | Galerieentfernung löscht die andere Nutzung nicht. |
| P23 | Neuer Flyer privat, dann Absage | Absage sofort auf dem bisher öffentlichen Stand; Flyer bleibt privat. |
| P24 | Profilstil gewechselt | Eventgestaltung bleibt unabhängig. |
| P25 | Unveröffentlichtes oder abgesagtes Empfehlungsziel | Keine aktive öffentliche Empfehlung; Hinweis im Editor. |
| P26 | Einladungslink abgelaufen oder widerrufen | Keine Zuordnung über den Link; Erklärung oder Neuanforderung ohne Rechtegewinn. |
| P27 | Registrierung über Link, Event fehlt | Profilzuordnung möglich; konkrete Eventempfehlung bleibt offen. |
| P28 | Bestandsorganizer öffnet Einladung | Login und Projektzuordnung statt neues Konto; Empfehlung erst nach Bestätigung. |
| P29 | Link an falsches Projekt weitergeleitet | Keine automatische Empfehlung; falschen Vorschlag ablehnen oder deaktivieren. |
| P30 | Abo während Versandwarteschlange abgemeldet | Vor dem Versuch prüfen und unterdrücken. |
| P31 | Alter Bestätigungslink nach Abmeldung geöffnet | Keine Reaktivierung; Neuanmeldung erneut bestätigen. |
| P32 | Unbestätigtes Abo 7 Tage alt, anderes Abo aktiv | Nur das unbestätigte Projektabo löschen; aktives erhalten. |
| P33 | Versandtimeout nach möglicher Anbieterannahme | Zustand „uncertain"; Anbieter prüfen; nicht blind erneut senden. |
| P34 | Event zurückgezogen und wieder veröffentlicht | Keine doppelte Neuankündigung. |
| P35 | Kurzfristig publiziert, Beginn in 2 Stunden | 15-Minuten-Bündelung; Versand vor Beginn; 24-Stunden-Ausnahme sichtbar. |
| P36 | Event beginnt vor Ablauf der 15 Minuten | Keine verspätete Neuankündigung; keine zusätzliche Sofortausnahme. |
| P37 | Profil offline, Event vorher angekündigt und abgesagt | Korrektur oder Absage an weiterhin berechtigte frühere Empfänger. |
| P38 | Profil wieder online mit mehreren unversandten Events | Organizer wählt aus und bestätigt; kein automatischer Nachversand. |
| P39 | Entwurf löschen neben öffentlicher Fassung | Öffentliche Fassung bleibt erhalten; keine Medien anderer Nutzung löschen. |
| P40 | Kontolöschung bei geteiltem Veranstaltungsort | Projektzugriff und Projektinhalte weg; Ort anderer Projekte bleibt. |
| P41 | Backup wiederherstellen | Seit dem Snapshot erfolgte Abmeldungen und Löschungen vor Wiederinbetriebnahme anwenden. |
| P42 | Rohflyer nach Frist gelöscht | Minimaler Herkunfts- und Bestätigungsnachweis bleibt nachvollziehbar; keine falsche Behauptung, dass die Rohdatei noch existiert. |

## 15. Offene Entscheidungen und Abnahmegrenze [Offen]

- **Technische Normalisierung:** Feldnamen abgleichen; vollständige Enums und Objektvarianten; Haupt- und Ergänzungsformat-IDs; Längen- und Dateigrenzen; Pflicht und Antwortzustände je Feld; Preise je Route; Token- und Berechtigungsdetails; genaue Rechte- und Freigabetexte.
- **Aufbewahrungsmatrix:** Nachweise (Einwilligung, Sperre, Versand) nach Aboende, ältere Inhaltsversionen, nie publizierte Rohuploads und Backups mit konkreten Fristen und Löschablauf.
- **Mehrdeutige Zeitangaben, Preise je Route, sichere Tokens, private und öffentliche Projektionen, Idempotenz** ausarbeiten.
- **Gesamtabnahme:** Prüffälle schriftlich gegen die vollständigen Felddefinitionen prüfen; offene Widersprüche vor der Umsetzung schließen. **Papierfälle sind keine Softwaretests.**
- Rechte- und Einwilligungstexte, Architektur und Betrieb sowie D1–D10 sind separate Aufgaben.
- Discovery-Suchabdeckung: konkrete Schwellen offen.
- Anbieter für Geocoding, E-Mail-Versand und Backups: nicht entschieden.

## 16. Abschlussbeschlüsse zu Sonderfällen [Beschlossen]

- **Feste Sammelfenster:** erste kurzfristige Publikation startet 15 Minuten; weitere darin bündeln, nicht fortlaufend verlängern. Die 24-Stunden-Ausnahme bleibt; die Häufigkeit wird beobachtet.
- **Kollision Tagesmail und kurzfristig:** zusammenführen, wenn dadurch kein kurzfristiges Event zu spät angekündigt wird; keine doppelte Eventankündigung.
- **Änderung vor Erstversand:** neuesten bestätigten öffentlichen Stand senden; keine separate Korrekturmail.
- **Absage oder Rücknahme vor Erstversand:** Event entfernen; leere Mail entfällt.
- **Verschiebung während der Wartezeit:** nach neuem bestätigtem Beginn neu planen; ohne Ersatztermin keine neue Ankündigung.
- **Wichtige Änderungen:** festes 15-Minuten-Fenster, letzter bestätigter Stand; vollständig zurückgenommene Änderungen nicht melden.
- **Absage vor wartender Änderungsmail:** Absage ersetzt die Änderung; bereits übergebene Versuche berücksichtigen.
- **Unmittelbar vor Anbieterübergabe:** Abo, öffentlicher aktueller Inhalt und bisherige Sendung erneut prüfen. Nach Übergabe keinen Rückruf garantieren; eine bestätigte wichtige Korrektur kann danach ein weiteres Update nötig machen. Status „geplant" oder „übergeben" ist nicht Zustellung.
- **Einladungszuordnung:** zugeordneten Link nicht für ein anderes Projekt erneut verwenden. Der einladende Organizer kann eine Fehlzuordnung aufheben und einen neuen Link erzeugen.
- **Bestandsprojekt:** vorhandenes Profil statt eines zweiten Profils verwenden; eine Einladung erzeugt keine Bearbeitungsrechte.
- **Offlineprofil bei öffentlichem Event:** Organizername sichtbar; Profillink als neutraler Offlinehinweis; keine neue Aboanmeldung; bestehende Abos verwaltbar.
- **Alpha-Hauptformate (vorläufig):** siehe Abschnitt 7.
- **Listening-Session:** musikalisches Konzept und Besuchsmodus sind Pflicht; gemeinsamer Beginn oder flexibles Kommen muss erkennbar sein.
- **Ergänzende Programmteile:** Live-Musik, DJ-Set, Screening, Talk/Gespräch, Lesung, Performance; passende Folgefragen. Nicht automatisch als eigenständige Hauptformate freigeben.
- **Unpassendes Format:** Entwurf und Klärung; kein universelles „Sonstiges" als Umgehung der Pflichtregeln.
- **Verbleibende Aufbewahrungsfragen:** Nachweis-, Sperr- und Versanddaten, nie publizierte oder verwaiste Rohuploads, alte Versionen und Backupfähigkeit als konkrete Startvoraussetzungen führen (siehe Abschnitt 17).

## 17. Ergänzende Prüffälle P43–P50 [Spezifikationsfälle, keine ausgeführten Tests]

| ID | Fall | Erwartung |
|---|---|---|
| P43 | Neue Events im laufenden kurzfristigen Sammelfenster | Bündeln; ursprünglichen Versandzeitpunkt nicht verschieben. |
| P44 | Kollision mit der regulären Tagesmail | Nur ohne Verspätung zusammenführen; Event nicht doppelt ankündigen. |
| P45 | Preis oder Ort vor Erstankündigung geändert | Aktuelle bestätigte Fassung versenden statt separater Korrektur. |
| P46 | Änderung zurückgenommen oder von Absage überholt | Gegen den zuvor angekündigten Stand prüfen; unnötige Änderung entfällt; Absage hat Vorrang. |
| P47 | Zugeordneter Link erneut von anderem Projekt geöffnet | Keine zweite Zuordnung und keine Rechte; einladender Organizer kann neu einladen. |
| P48 | Öffentliches Event bei pausiertem Profil | Absendername und neutraler Profillink; keine Neuanmeldung; bestehende Verwaltung möglich. |
| P49 | Listening-Session ohne Besuchsmodus | Pflichtfrage klären; musikalisches Konzept und Modus nötig. |
| P50 | Alleinstehender Workshop als anderes Hauptformat | Privater Entwurf oder Klärung; keine automatische Publikation durch „Sonstiges". |

## 18. Konsistenzbefund und Grenzen

- **Geprüft:** fachliche Regeln dieser Fassung gegen v0.2, die Q29–Q36/S3-Beschlüsse, die nachfolgenden Nutzerentscheidungen, den Fragenpool (B01–B13) und die S3-Seite.
- **Gefunden und korrigiert:** Formatnormalisierung war offen → sieben Hauptformate. Atmosphärenpflicht fehlte im bisherigen 32-Fragen-Pool → Frage B13. Ältere fiktive Auswahlfälle müssen die Atmosphärenpflicht zusätzlich prüfen. Rohmaterial wird nicht ohne Frist allein wegen Herkunft gespeichert; Nachweisbedarf bleibt minimal.
- **Ergebnis:** Produktentscheidungen sind als Reviewgrundlage konsistent zusammengeführt.
- **Nicht nachgewiesen:** vollständige technische Typisierung (Haupt- und Ergänzungsformat-IDs, optionale Antwortvarianten, Preisoptionen, konkrete Längen, Tokens). Keine Gesamtfreigabe, keine Entwicklungsfreigabe, keine ausgeführten Tests.
- **Taxonomie-Quellen:** Die Notion-Taxonomiequellen des v0.2-Zwischenstands (Mood-, Vibe-, Social-fit- und Genre-Seiten) wurden in diesem Abgleich nicht erneut gelesen. Alte Scraping-, QC- und Pflichtregeln gelten für B2C nicht automatisch.
- **Nächste Arbeitsphase:** Vertrag zur Gesamtdurchsicht normalisieren; verbleibende Betriebs- und Nachweisfragen schließen; mobile Designs und Restspecs ausarbeiten. Nicht mit Consumer-Webapp oder App- bzw. DB-Implementierung beginnen.
