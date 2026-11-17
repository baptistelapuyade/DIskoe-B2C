// German texts. The IDs are the catalog IDs of docs/startpaket/12-zustandstexte.md;
// messages.en.ts carries the same IDs (a unit test enforces it). Placeholders
// are written {name}.
export const de = {
  "Z20.weg.title": "Dein Weg",
  "Z20.weg.step1": "Anmelden",
  "Z20.weg.step2": "Profil und erstes Event anlegen",
  "Z20.weg.step3": "Einreichen und freigeben lassen",
  "Z20.weg.mobile": "Schritt {n} von 3 · {name}",
  "Z20.progress.mobile": "Schritt {n} von {total} · {name}",
  "Z20.lang.label": "Sprache",
  "Z20.nav.signOut": "Abmelden",
  "Z20.nav.review": "Prüfung",
  "Z20.legal.nav": "Rechtliches",
  "Z20.legal.imprint": "Impressum",
  "Z20.legal.privacy": "Datenschutz",
  "Z20.back": "Zurück",
} as const;

export type MessageId = keyof typeof de;
