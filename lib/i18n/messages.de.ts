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
  "Z21.email.eyebrow": "Anmelden",
  "Z21.email.title": "Dein Kulturauftritt beginnt hier",
  "Z21.email.lead":
    "Melde dich mit einem Code per E-Mail an. Danach legst du dein Profil an oder übernimmst das Profil, das DISKOE für dich vorbereitet hat. Ein Passwort brauchst du nicht.",
  "Z21.email.label": "E-Mail-Adresse",
  "Z21.email.placeholder": "name@kollektiv.example",
  "Z21.email.hint": "Wir schicken den Code an diese Adresse.",
  "Z21.email.send": "Code senden",
  "Z21.email.sending": "Code wird gesendet …",
  "Z21.email.invalid": "Das ist keine vollständige E-Mail-Adresse. Prüfe sie.",
  "Z21.send.failed.title": "Das Senden hat nicht geklappt.",
  "Z21.send.failed.line":
    "Deine Adresse ist noch eingetragen. Versuche es noch einmal.",
  "Z21.code.eyebrow": "Code eingeben",
  "Z21.code.title": "Schau in dein Postfach",
  "Z21.code.lead":
    "Wir haben dir einen Code an {email} geschickt. Gib ihn hier ein. Es kann einen Moment dauern, bis er ankommt. Er gilt 10 Minuten und nur einmal. Schau auch im Spam-Ordner nach.",
  "Z21.code.label": "Code aus der E-Mail",
  "Z21.code.placeholder": "6-stelliger Code",
  "Z21.code.submit": "Anmelden",
  "Z21.code.resend": "Neuen Code senden",
  "Z21.code.otherEmail": "Andere E-Mail-Adresse verwenden",
  "Z21.code.wrong":
    "Der Code stimmt nicht oder ist abgelaufen. Prüfe die Zahl oder fordere einen neuen Code an.",
  "Z21.code.locked.title": "Zu viele falsche Codes.",
  "Z21.code.locked.line":
    "Bitte warte zehn Minuten oder fordere einen neuen Code an.",
  "Z21.resent.pill": "Neuer Code gesendet",
  "Z21.resent.lead":
    "Wir haben dir einen neuen Code an {email} geschickt. Der vorherige Code gilt nicht mehr.",
  "Z21.resent.hint": "Einen weiteren Code kannst du in einer Minute anfordern.",
  "Z21.link.eyebrow": "Link abgelaufen",
  "Z21.link.title": "Dieser Link gilt nicht mehr",
  "Z21.link.lead":
    "Der Link in deiner E-Mail ist abgelaufen oder wurde schon benutzt. Fordere einen neuen Code an, dann kommst du weiter.",
} as const;

export type MessageId = keyof typeof de;
