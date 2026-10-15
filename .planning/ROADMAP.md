# Roadmap: DISKOE B2C V1

## Overview

Diese bewusst grobe Roadmap bringt DISKOE B2C V1 ausschließlich bis zu einer belastbaren, freigabefähigen Arbeitsgrundlage: zuerst werden der formatabhängige Fragenpool und die verbleibenden Produktdetails abgeschlossen, danach die zusammenhängenden mobilen und öffentlichen Nutzerflüsse gestaltet und schließlich Architekturentscheidungen sowie vertikale Lieferpakete vorbereitet. Sie autorisiert weder Anwendungscode noch Abhängigkeiten, Datenbankarbeiten, Migrationen, Deployment, Live-API-/LLM-Verarbeitung oder kostenpflichtige Dienste. Jede spätere Implementierung bleibt bis zu einer ausdrücklichen, in `docs/STATUS.md` dokumentierten Freigabe ausstehend.

## Phases

- [ ] **Phase 1: Produktvertrag und Fragenpool** - Formatabhängige Fragen, Pflichtregeln, Texte und verbleibende Produktdetails werden entscheidungsreif festgelegt.
- [ ] **Phase 2: Zusammenhängendes Experience Design** - Publishing-Flow, Organizerprofil, Eventseite und Sharing werden als prüfbarer Mobile-first-Gesamtfluss gestaltet.
- [ ] **Phase 3: Architektur und Lieferplanung** - Sicherheits-, Daten-, Betriebs- und Auslieferungsentscheidungen werden als ADRs und vertikale Liefergrenzen vorbereitet.

## Phase Details

### Phase 1: Produktvertrag und Fragenpool
**Goal**: Organizer und Redaktion verfügen über einen vollständigen, abgestimmten Produktvertrag für Erfassung, Prüfung, Bestätigung, Lebenszyklus, Kuration und Erfolgsmessung der drei V1-Formate.
**Depends on**: Nothing (first phase)
**Requirements**: OFFER-01, OFFER-02, PUBLISH-01, PUBLISH-02, PUBLISH-03, PUBLISH-04, PUBLISH-05, PUBLISH-06, CURATE-01, FOLLOW-01, OPS-02
**Success Criteria** (what must be TRUE):
  1. Ein Organizer kann für Live/DJ, Offspace/Vernissage und Filmabend erkennen, welche Fragen wann gestellt werden, warum sie nützlich sind und ob eine Antwort erforderlich, optional, unbekannt oder nicht zutreffend ist.
  2. Ein Organizer kann anhand der freigegebenen Regeln einen privaten Entwurf manuell oder aus Text beziehungsweise bis zu drei Flyerbildern vervollständigen, KI-Ableitungen korrigieren und kritische Lücken oder Widersprüche vor der Bestätigung erkennen.
  3. Ein Organizer kann klar unterscheiden, was Speichern, Vorschau, Bestätigung, erste Freigabe, Veröffentlichung, Änderung, Verschiebung, Absage, Entfernung, Archivierung und Duplizieren bewirken.
  4. Ein Organizer versteht Angebot, Alpha-Grenzen und den konkret zu bestätigenden Daten-/Medienumfang für Seiten, Sharing und spätere Discovery; offene Rechts- oder Produkttexte sind sichtbar als offen markiert.
  5. Redaktion und Produktverantwortung können Kuration und Messgrößen einschließlich ihrer Aussagegrenzen anhand eindeutiger Regeln beurteilen.
  6. Die offenen Entscheidungen Q29–Q36 und die Follow-Spec S9 sind gemeinsam entschieden oder ausdrücklich als offen geführt; Vorschläge gelten nicht als freigegeben.
**Plans**: TBD — Produktplanung erst interaktiv nach Review; keine Implementierung
**UI hint**: yes

### Phase 2: Zusammenhängendes Experience Design
**Goal**: Organizer und Besucher können den vollständigen V1-Ablauf in abgestimmten Mobile-first-Designs nachvollziehen und gegen alle relevanten Status-, Leer- und Fehlerzustände prüfen.
**Depends on**: Phase 1
**Requirements**: PUBLIC-01, PUBLIC-02, PROFILE-01, SHARE-01, SHARE-02
**Success Criteria** (what must be TRUE):
  1. Ein Organizer kann im Prototyp den Weg von Material oder manueller Eingabe über Rückfragen, Korrektur, Vorschau und Bestätigung bis zum Teilen ohne konzeptionelle Lücke durchlaufen.
  2. Ein Besucher kann auf responsiven Organizer- und Eventseiten bestätigte Entscheidungsinformationen, Herkunft/Aktualität sowie aktive, geänderte, abgesagte, entfernte, vergangene und leere Zustände eindeutig verstehen.
  3. Ein Organizer kann aus einem veröffentlichten Stand stabilen Link, Linkvorschau, editierbaren Nachrichtentext und QR-Code prüfen, ohne dass öffentliche Entwürfe oder abweichende Datenstände entstehen.
  4. Manuelle Story-Muster können mit realen freigegebenen Eventbeispielen getestet werden, ohne eine automatische Story-Generierung als beschlossen oder implementiert darzustellen.
  5. Profileditor (D9) mit mobiler Vorschau und Follow-Zustände (D10) sind als prüfbare Mobile-first-Designs in den begrenzten, entschiedenen Grenzen beschrieben; Eventseiten behalten eine stabile Informationshierarchie.
**Plans**: TBD — Designplanung erst interaktiv nach Review; keine Implementierung
**UI hint**: yes

### Phase 3: Architektur und Lieferplanung
**Goal**: Die freigegebenen Produkt- und Designverträge sind durch nachvollziehbare Architekturentscheidungen, Sicherheitsgrenzen und prüfbare vertikale Lieferpakete für eine spätere gesondert autorisierte Umsetzung vorbereitet.
**Depends on**: Phase 2
**Requirements**: ACCESS-01, ACCESS-02, ACCESS-03, PUBLIC-03, OPS-01
**Success Criteria** (what must be TRUE):
  1. Organizer-, Redaktions- und Besucherwege besitzen eine überprüfbare Rechte- und Sichtbarkeitsmatrix, in der fremde Inhalte und private Entwürfe unzugänglich bleiben und die erste Freigabe eindeutig geregelt ist.
  2. Ein freigegebener Organizer kann im Architekturvertrag nachvollziehen, wie eigene bestätigte Stände sicher veröffentlicht, aktualisiert, abgesagt oder zurückgenommen werden, ohne den bisherigen öffentlichen Stand still zu überschreiben.
  3. Öffentliche Seiten, Katalog, Sharing, stabile URLs sowie SEO-/strukturierte Daten beziehen sich nachweisbar auf denselben bestätigten sichtbaren Stand.
  4. Die Redaktion kann anhand definierter Zustände Datenlücken und Erstfreigaben bearbeiten sowie problematische Veröffentlichungen sperren oder zurücknehmen; Sicherheits-, Fehler- und Auditgrenzen sind beschrieben.
  5. ADRs und vertikale Lieferpakete benennen Entscheidungen, Abnahmesignale und offene Risiken, bleiben aber ausdrücklich Planung: Implementierung beginnt erst nach neuer Autorisierung.
**Plans**: TBD — Architekturplanung erst nach Abschluss der Produkt- und Designphasen; Umsetzung nicht autorisiert
**UI hint**: yes

## Coverage

| Requirement | Phase |
|-------------|-------|
| OFFER-01 | Phase 1 |
| OFFER-02 | Phase 1 |
| ACCESS-01 | Phase 3 |
| ACCESS-02 | Phase 3 |
| ACCESS-03 | Phase 3 |
| PUBLIC-01 | Phase 2 |
| PUBLIC-02 | Phase 2 |
| PUBLIC-03 | Phase 3 |
| PUBLISH-01 | Phase 1 |
| PUBLISH-02 | Phase 1 |
| PUBLISH-03 | Phase 1 |
| PUBLISH-04 | Phase 1 |
| PUBLISH-05 | Phase 1 |
| PUBLISH-06 | Phase 1 |
| SHARE-01 | Phase 2 |
| SHARE-02 | Phase 2 |
| CURATE-01 | Phase 1 |
| FOLLOW-01 | Phase 1 |
| PROFILE-01 | Phase 2 |
| OPS-01 | Phase 3 |
| OPS-02 | Phase 1 |

**Coverage:** 21/21 V1 requirements mapped exactly once. Implementation remains unauthorized and pending.

## Progress

**Execution Order:** Phase 1 → Phase 2 → Phase 3. No phase advances automatically; each transition requires review, and implementation requires separate authorization.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Produktvertrag und Fragenpool | 0/TBD | Not started | - |
| 2. Zusammenhängendes Experience Design | 0/TBD | Not started | - |
| 3. Architektur und Lieferplanung | 0/TBD | Not started | - |
