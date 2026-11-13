import type { MessageId } from "./messages.de";

// English texts (proposal until the founder has reviewed the wording, see
// docs/startpaket/12-zustandstexte.md). Same IDs as the German file.
export const en: Record<MessageId, string> = {
  "Z20.weg.title": "Your path",
  "Z20.weg.step1": "Sign in",
  "Z20.weg.step2": "Create your profile and first event",
  "Z20.weg.step3": "Submit and get approved",
  "Z20.weg.mobile": "Step {n} of 3 · {name}",
  "Z20.progress.mobile": "Step {n} of {total} · {name}",
  "Z20.lang.label": "Language",
  "Z20.nav.signOut": "Sign out",
  "Z20.nav.review": "Review",
  "Z20.legal.nav": "Legal",
  "Z20.legal.imprint": "Imprint",
  "Z20.legal.privacy": "Privacy policy",
  "Z20.back": "Back",
  "Z21.email.eyebrow": "Sign in",
  "Z21.email.title": "Your cultural presence starts here",
  "Z21.email.lead":
    "Sign in with a code by email. After that you create your profile or take over the profile DISKOE has prepared for you. You don't need a password.",
  "Z21.email.label": "Email address",
  "Z21.email.placeholder": "name@collective.example",
  "Z21.email.hint": "We'll send the code to this address.",
  "Z21.email.send": "Send code",
  "Z21.email.retry": "Try again",
  "Z21.email.sending": "Sending code …",
  "Z21.email.invalid": "That isn't a complete email address. Check it.",
  "Z21.send.failed.title": "Sending didn't work.",
  "Z21.send.failed.line": "Your address is still entered. Try again.",
  "Z21.code.eyebrow": "Enter code",
  "Z21.code.title": "Check your inbox",
  "Z21.code.lead":
    "We've sent a code to {email}. Enter it here. It can take a moment to arrive. It works for 10 minutes and only once. Check your spam folder too.",
  "Z21.code.label": "Code from the email",
  "Z21.code.placeholder": "6-digit code",
  "Z21.code.submit": "Sign in",
  "Z21.code.resend": "Send a new code",
  "Z21.code.otherEmail": "Use a different email address",
  "Z21.code.wrong":
    "The code is wrong or has expired. Check the number or request a new code.",
  "Z21.code.locked.title": "Too many wrong codes.",
  "Z21.code.locked.line": "Please wait ten minutes or request a new code.",
  "Z21.resent.pill": "New code sent",
  "Z21.resent.lead":
    "We've sent a new code to {email}. The previous code is no longer valid.",
  "Z21.resent.hint": "You can request another code in one minute.",
  "Z21.link.eyebrow": "Link expired",
  "Z21.link.title": "This link is no longer valid",
  "Z21.link.lead":
    "The link in your email has expired or was already used. Request a new code and you can continue.",
};
