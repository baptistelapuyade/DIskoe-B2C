# 07 — Start-Prompts

## Schritt 0 — erledigt
Lokales Repo und Remote sind verbunden (Merge b434376, 23.10.2026). Dieses Paket wird per Pull Request aufgenommen, siehe Prompt im Chat.

## Schritt 1 — Erster Auftrag (Claude Code oder Codex), Planungsphase
```
Lies AGENTS.md und docs/startpaket/README.md bis 07. Lies dann die Datenverträge unter docs/ (siehe README, Abschnitt „Wo die Verträge liegen“) und das Delta v0.5 in docs/startpaket/06.
Aufgabe: Erstelle einen Umsetzungsplan für den Durchstich aus docs/startpaket/02-durchstich.md. Schreibe noch keinen Code.
Liefere: (1) Verzeichnisstruktur, (2) Datenmodell für Profil, Event, Medien und Zugang als SQL-Entwurf mit RLS-Regeln, (3) Seiten/Routen, (4) Teststrategie mit den Prüffällen, die der Durchstich abdeckt, (5) Liste offener Fragen und TODO(spec).
Prüfe vorhandene Dateien im Repo, bevor du etwas annimmst. Erfinde keine Anforderungen. Nenne Widersprüche zwischen den Dokumenten.
```

## Schritt 2 — Gerüst
```
Setze nach meiner Freigabe des Plans das Projektgerüst auf: Next.js (App Router, TypeScript, feste Version), Tailwind mit den Tokens aus 04-design-tokens.md, shadcn/ui-Basis, Supabase-Client, ESLint, Vitest, Playwright, GitHub-Actions-CI, .env.example. Ein Branch, ein PR. Keine Fachlogik.
```

## Schritt 3 — Durchstich in Scheiben (je ein Branch und PR)
1. Datenbank-Migration und RLS für Profil/Event/Medien, mit Tests für Entwurf-vs-öffentlich.
2. Login per E-Mail-Code und Organizer-Zuordnung.
3. Profil anlegen und veröffentlichen.
4. Event anlegen mit Pflichtlückenprüfung (Antwortzustände, Zeit, Geld).
5. Veröffentlichen und Absagen mit Vorschau.
6. Öffentliche Event- und Profilseiten, JSON-LD, Sitemap, Meta.
7. Playwright-Flows der Abnahme aus 02-durchstich.md.

## Standardsatz für jede Aufgabe
```
Halte dich an AGENTS.md. Nenne vor dem Coding die betroffenen Vertragsabschnitte und Prüffälle. Ändere keine Dokumente unter docs/ außer docs/startpaket/ nach Absprache. Beende mit: geänderte Dateien, ausgeführte Prüfungen (mit Ergebnis), offene Punkte.
```

## Mit zwei Agenten parallel
Claude und Codex arbeiten nie am selben Branch. Aufgaben vorher über Dateien/Module trennen, Merge-Reihenfolge festlegen, PRs vom Founder prüfen lassen.
