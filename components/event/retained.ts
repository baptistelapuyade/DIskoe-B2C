// What an organizer typed in the current step is kept in this browser when a
// save failed and the page is left (Figma EVT-09c, decision 10.11., UX-12): until
// the step is saved or the organizer signs out. Nothing leaves the browser,
// and it is not kept for anyone else: the key carries the profile and event,
// not the person.

const PREFIX = "diskoe:event-step:";

export type Retained = Record<string, string | boolean | string[]>;

function key(scope: string): string {
  return `${PREFIX}${scope}`;
}

// Storage can be blocked or full (private mode): every access is guarded.
export function saveRetained(scope: string, values: Retained): void {
  try {
    window.localStorage.setItem(key(scope), JSON.stringify(values));
  } catch {
    // Nothing to do: the values stay in the form while it is open.
  }
}

export function loadRetained(scope: string): Retained | null {
  try {
    const raw = window.localStorage.getItem(key(scope));
    const parsed: unknown = raw ? JSON.parse(raw) : null;

    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Retained)
      : null;
  } catch {
    return null;
  }
}

export function clearRetained(scope: string): void {
  try {
    window.localStorage.removeItem(key(scope));
  } catch {
    // See above.
  }
}

export function clearAllRetained(): void {
  try {
    for (const name of Object.keys(window.localStorage)) {
      if (name.startsWith(PREFIX)) {
        window.localStorage.removeItem(name);
      }
    }
  } catch {
    // See above.
  }
}
