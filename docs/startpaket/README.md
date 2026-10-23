# Startpaket DISKOE B2C — Hub

Stand: 23.10.2026. Dieses Paket übergibt Produktentscheidungen und Design an die Entwicklung. Es ersetzt keine Verträge, es ordnet sie.

## Status
- Repo: `baptistelapuyade/DIskoe-B2C`, frische Codebasis, Dokumentation und `.planning/` vorhanden, kein Anwendungscode.
- Specs und Designs sind laut Build-Doc nicht insgesamt abgenommen. **Entwicklungsfreigabe:** siehe `AGENTS.md` (Abschnitt „Aktuelle Autorisierung“).
- Architektur: `01-architektur.md`. Alle genannten Architekturpunkte wurden durch den Founder am 23.10.2026 bestätigt: Next.js + Supabase, Hosting Amplify (AWS-Guthaben 1 Jahr), E-Mail Amazon SES, KI Google-Modell (Google-Guthaben), externe Domain, Login per E-Mail-Code (Google optional, nicht Teil der Alpha) und Workflow mit einem Branch pro Aufgabe, kleinen Pull Requests und Founder-Review. Ausdrücklich offene Detailfragen bleiben offen.

## Inhalt
| Datei | Zweck |
|---|---|
| `01-architektur.md` | Stack-Entscheidungen (ADR), offene technische Fragen |
| `02-durchstich.md` | Kleinster durchgehender Ablauf als erster Bauabschnitt |
| `03-screens-figma.md` | Screen-Index mit Figma-Links und Vertragsbezug |
| `04-design-tokens.md` | Farben, Profilpaletten, Kontrastregeln, feste Tag-Farben |
| `05-module-und-gestaltung.md` | Profilmodule, Gestaltung, Datenform |
| `06-delta-v0.5-lesefassung.md` | Gültige Regeln aus Delta v0.5 (22./23.10.) in kurzer Form |
| `07-start-prompt.md` | Fertige Prompts für Claude Code / Codex |

## Quellenrangfolge bei Widerspruch (neu → alt)
1. Beschlüsse im Chat nach dem 23.10.2026 (Founder)
2. `06-delta-v0.5-lesefassung.md` (inkl. §4.2 Profilgestaltung, §4.3 Eventgestaltung, §6.7/§6.8)
3. Delta v0.4 (16.10., Pakete, Besucher, Nachrichten, Feedback, Preis)
4. Datenvertrag v0.3 (15.10.) und Beschlüsse Q29–Q36 / S3
5. Figma als visuelle Referenz, Verträge gewinnen bei Fachregeln
6. Build-Doc in Notion (Register, Historie)

## Bekannte Überholungen (nicht aus alten Texten bauen)
- Q30 „drei feste Richtungen“ → ersetzt durch Vorlage plus Anpassen (v0.5 §4.2).
- Q35 „Event bindet nicht an Profil“ → Events folgen live dem veröffentlichten Profildesign, außer eigene Gestaltung (v0.5 §4.3).
- Delta v0.4 §17.7 „Profilbild oder Cover“ → Profiltyp bestimmt den Kopf (v0.5 §4.1).
- Delta v0.4 Plus-Testzugang mit Checkout → Alpha nur Reservierungstest (Featurematrix, Beschluss 22.10.).
- Eventbild ist Pflicht zur Veröffentlichung (Delta v0.4 §16), nicht optional wie in v0.3 P05.
- Build-Doc Abschnitt 8 (Zeit) ist überholt; gültig ist die Aufwandsschätzung v2 (318–536 h gesamt).

## Wo die Verträge liegen (Stand Repo nach Push vom 23.10.2026, Commit b434376)
- Datenvertrag v0.3 (Entwurf): `docs/DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md`; älter: `docs/DATA_CONTRACT_B2C_V1.md` und Ergänzung `…_ADDENDUM_2026-10-15.md`
- Delta v0.4: `docs/PRODUCT_DECISIONS_DELTA_V04_2026-10-16.md`
- Q29–Q36 und S3: `docs/PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md`
- Fragenpool: `docs/QUESTION_POOL_B2C_V1.md`; Scope: `docs/SCOPE_EXTENSION_B2C_2026-10-15.md`
- **Nicht im Repo:** Delta v0.5 und Alpha-Featurematrix (22./23.10.). Die Lesefassung in `06-delta-v0.5-lesefassung.md` ersetzt sie vorläufig. Vollständiger Abgleich mit Notion steht aus (kein Auto-Sync).
- Planung: `.planning/` (grobe technische Sequenz), `docs/STATUS.md` (Übergabe), `docs/ARCHITECTURE.md` (bisher „Architektur offen“, ab jetzt ergänzt durch `01-architektur.md`).
