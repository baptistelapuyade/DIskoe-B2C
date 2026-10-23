# 05 — Module und Gestaltung

## Profil: Struktur (Q29, Delta v0.4 §17)
Fest oben: Identität (Name, Kurzvorstellung, Kopf je Profiltyp), danach kommende Events (automatisch aus veröffentlichten Events, nächster Termin hervorgehoben, Leerzustand „Neue Termine folgen“ plus Folgen-Aktion). Fest unten: Links/Kontakt (bis 5 offizielle Links plus optionaler öffentlicher Kontakt).
Dazwischen fünf optionale Module, jeweils nur einmal, an/aus und umsortierbar:
`music` (ein Slot SoundCloud oder Spotify), `gallery` (max. 6 Bilder, Beschriftung optional), `manifest` (ein Text, einfache Formatierung), `recommendations` (max. 3 fremde veröffentlichte DISKOE-Ziele, Kommentar Pflicht, max. 140 Zeichen), `archive` (vergangene eigene Events, zuerst 6, weitere im Modul).
Leere optionale Module werden öffentlich ausgeblendet. Follow ist feste Aktion im Kopf, kein Modul.

## Speicherform (Vorschlag)
Module als geordnete Liste, damit spätere Module und Konfigurationen keine Schemaänderung brauchen:
```ts
type ProfileModule =
  | { type: 'music'; enabled: boolean; config: { provider: 'soundcloud' | 'spotify'; itemUrl: string; heading?: string; comment?: string } }
  | { type: 'gallery'; enabled: boolean; config: { items: { mediaUseId: string; caption?: string }[] } } // max 6
  | { type: 'manifest'; enabled: boolean; config: { body: string } }
  | { type: 'recommendations'; enabled: boolean; config: { items: { targetType: 'event' | 'organizer'; targetId: string; comment: string }[] } } // max 3, comment <= 140
  | { type: 'archive'; enabled: boolean; config: Record<string, never> };
// profile.modules: ProfileModule[]  (Reihenfolge = Anzeigereihenfolge; je type höchstens ein Eintrag)
```
Validierung serverseitig: je Typ höchstens eine Instanz, Limits, nur veröffentlichte Ziele, keine eigenen Inhalte bei Empfehlungen.

## Gestaltung (v0.5 §4.2)
Gespeichert werden Einzelwerte, Vorlagen sind nur Startwerte:
```ts
type Theme = {
  preset: 'poster' | 'editorial' | 'mixtape';
  background: string;   // hex
  text: string;         // hex, Kontrast >= 4.5 zum Hintergrund
  accent: string;       // hex, Kontrast >= 3 zum Hintergrund
  radius: 'sharp' | 'soft' | 'round';       // eckig / leicht / rund
  fontPair: 'pair1' | 'pair2' | 'pair3' | 'pair4' | 'pair5' | 'pair6'; // 6 kuratierte Paare, Namen offen
  modules: 'flat' | 'framed';               // flach / gerahmt
  spacing: 'compact' | 'airy';              // kompakt / luftig
};
```
- Abgeleitet (nicht speichern): Text gedämpft, Linie, Fläche, Schrift auf Akzent.
- Nicht gestaltbar: Profiltyp-Kennzeichen, Modulreihenfolge-Struktur oben/unten, Headerform je Typ, Systemelemente.
- Änderungen als Entwurf, öffentlich erst mit „Veröffentlichen“. Free.
- Künstlerseiten nutzen in der Alpha das Standardthema.

## Eventgestaltung (v0.5 §4.3)
```ts
type EventThemeMode = 'like_profile' | 'custom';  // Standard: like_profile
// event.theme nur bei 'custom': { background, text, accent, radius, fontPair }
```
- `like_profile`: zeigt immer das **aktuell veröffentlichte** Profildesign (live, auch für vergangene Events). Nichts wird kopiert.
- Wechsel auf `custom` kopiert die Profilwerte einmalig als Startwerte. Zurücksetzen verwirft die eigene Gestaltung.
- Veröffentlichen-Dialog im Profil nennt die Zahl betroffener Events (`like_profile`).
- Duplizieren übernimmt Modus und Theme. Event-Artwork ist unabhängig.
- Event-Editor: Hintergrund, Schriftfarbe, Akzent, Ecken, Schriftpaar. Keine Module, keine Abstände; die Informationshierarchie der Eventseite bleibt fest.
- Sichtbarer, nicht einklappbarer Hinweis im Editor: „Diese Seite nutzt das Design eures Profils“ mit Button „Design für dieses Event ändern“.

## Profiltypen (v0.5 §4.1)
`profile_kind`: `veranstalter` oder `venue`, gewählt beim Anlegen, Wechsel nur über den Founder. Artist ist eine **Person** (kein Organizer-Profil). Kopf: Venue Cover mit Name und Ortszeile; Veranstalter zentriertes quadratisches Profilbild; Artist rundes Bild links (Alpha: Monogramm). Wer Reihe und Ort betreibt, legt zwei Profile an.

## Ausbau nach der Alpha (Modularität bewusst vorbereiten)
Neue Modultypen = neuer Eintrag im `type`-Union plus Renderer plus Editor-Panel (grob 8–16 h je Modul, ungemessen). Mehrere Instanzen, freie Blöcke oder Event-Module sind deutlich teurer (40–80 h+, ungemessen) und nicht beschlossen. Kein freier Canvas, kein beliebiges HTML/CSS.
