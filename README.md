# DISKOE B2C V1

Arbeitsgrundlage für DISKOE B2C V1. Das technische Projektgerüst ist vorhanden; Fachfunktionen, Datenbanktabellen, Migrationen und Deployments sind noch nicht umgesetzt.

## Einstieg

1. [`AGENTS.md`](AGENTS.md) lesen.
2. [`docs/PROJECT.md`](docs/PROJECT.md) und [`docs/STATUS.md`](docs/STATUS.md) lesen.
3. Für Daten- oder Architekturarbeit [`docs/DATA_CONTRACT_B2C_V1.md`](docs/DATA_CONTRACT_B2C_V1.md), die [Ergänzung A1](docs/DATA_CONTRACT_B2C_V1_ADDENDUM_2026-10-15.md) und [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) hinzunehmen. Die aktuelle Feld-Lesefassung ist der [Datenvertrag v0.3 (Entwurf)](docs/DATA_CONTRACT_B2C_V1_V03_ENTWURF_2026-10-15.md).
   Für Profil/Follow (2026-10-15) die beschlossenen [`docs/PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md`](docs/PRODUCT_DECISIONS_Q29_Q36_S3_2026-10-15.md) lesen; die frühere Vorschlagsfassung liegt in [`docs/SCOPE_EXTENSION_B2C_2026-10-15.md`](docs/SCOPE_EXTENSION_B2C_2026-10-15.md).
4. Aktuellen Git-Status und die jeweils relevante Notion-/Figma-Spec prüfen.

## Maßgebliche Quellen

- [Outcome Brief](https://app.notion.com/p/3f9b1cce8b738139af3aca7cea84bcad)
- [Build, Specs & LLM-Übergabe](https://app.notion.com/p/3f9b1cce8b73813285dcd1df4ab0cbd5)
- [B2C-Strategie](https://app.notion.com/p/3f9b1cce8b7381828767d03d0b310ca7)
- [Figma Event Service UX/UI](https://www.figma.com/design/88JCSs3P0tMB3FsQnwBbrG/Event-Service-UX-UI?node-id=7-13)
- [DMO-Referenzrepo](https://github.com/baptistelapuyade/DISKOE-DMO)
- [B2C-Bestandsprüfung im Draft-PR](https://github.com/baptistelapuyade/DISKOE-DMO/pull/1)

Notion hält Produktentscheidungen und offene Specs. Dieses Repository hält technische Verträge, Architekturentscheidungen, Arbeitsregeln und später Implementierungsbelege. Ein automatischer Sync ist nicht eingerichtet.

## Lokal starten

Voraussetzung ist [Node.js](https://nodejs.org/) `24.22.1` (LTS; Node 20 ist seit 30.04.2026 End-of-Life). Wer `nvm` installiert hat, kann die im Projekt festgelegte Version mit `nvm use` auswählen.

1. Repository herunterladen beziehungsweise klonen und den Projektordner im Terminal öffnen.
2. `npm install` ausführen. Das installiert ausschließlich die in `package-lock.json` festgeschriebenen Pakete.
3. `.env.example` als `.env.local` kopieren. Für die Startseite sind noch keine echten Zugangsdaten nötig; Platzhalter dürfen nicht durch echte Schlüssel im Git-Repository ersetzt werden.
4. `npm run dev` ausführen.
5. Im Browser `http://localhost:3000` öffnen.

Den lokalen Server beendet man im Terminal mit `Ctrl+C`. Die wichtigsten Prüfungen sind `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` und `npm run build`.

## Status

Produktentscheidungen S1–S6 sind weit fortgeschritten, aber nicht alle Texte, Detailregeln und Designs sind abgenommen. S7/S8 bleiben offen. Seit 2026-10-15 umfasst die Richtung begrenzte modulare Profile und einen frühen E-Mail-Follow-Test; Q29–Q36 und die fünf S3-Detailentscheidungen sind als Produktentscheidungen beschlossen (gegen Notion-Seiten desselben Tages abgeglichen, kein Auto-Sync). Der typisierte B2C-Datenvertrag liegt als Entwurf v0.3 vor (nicht abgenommen); Gesamtdurchsicht und Discovery-Suchdetails sind die nächsten fachlichen Aufgaben. Das Projektgerüst ist implementiert, aber noch keine Fachfunktion.
