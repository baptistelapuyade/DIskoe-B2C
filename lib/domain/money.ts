// Money is a whole number of cents plus a currency code. Never a float.

export const DEFAULT_CURRENCY = "EUR";

// TODO(spec): upper limit is a proposal. 999999 EUR in cents fits a Postgres
// integer.
const MAX_WHOLE_UNITS = 999_999;

export type ParsedPrice =
  | { ok: true; amountMinor: number }
  | { ok: false; message: string };

// Accepts "12", "12,5", "12,50", "12.50", "12 €", "€ 12,50". Thousands
// separators are not accepted, so that "1.234" is never read as 1,234 EUR.
// The amount is computed from the digits, not with floating point.
export function parsePriceInput(raw: unknown): ParsedPrice {
  const text = typeof raw === "string" ? raw.trim() : "";
  const cleaned = text
    .replace(/€|eur\b/gi, "")
    .replace(/\s+/g, "")
    .trim();

  const match = /^(\d{1,6})(?:[.,](\d{1,2}))?$/.exec(cleaned);

  if (!match) {
    return {
      ok: false,
      message: "Bitte gib den Preis als Betrag ein, zum Beispiel 12,50.",
    };
  }

  const whole = Number.parseInt(match[1], 10);
  const fraction = Number.parseInt((match[2] ?? "").padEnd(2, "0") || "0", 10);

  if (whole > MAX_WHOLE_UNITS) {
    return { ok: false, message: "Der Preis ist zu hoch." };
  }

  const amountMinor = whole * 100 + fraction;

  if (amountMinor <= 0) {
    return {
      ok: false,
      message:
        "Ein Festpreis muss größer als 0 sein. Für einen freien Eintritt wähle „Frei“.",
    };
  }

  return { ok: true, amountMinor };
}

const SYMBOL: Record<string, string> = { EUR: "€" };

export function formatMoney(
  amountMinor: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw new RangeError("amountMinor must be a non-negative integer");
  }

  const whole = Math.floor(amountMinor / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const fraction = (amountMinor % 100).toString().padStart(2, "0");

  return `${whole},${fraction} ${SYMBOL[currency] ?? currency}`;
}

export type PriceView =
  | { state: "provided"; model: "free" }
  | { state: "provided"; model: "fixed"; amountMinor: number; currency?: string }
  | { state: "unknown" }
  | { state: "unanswered" | "not_applicable" | "skipped" };

// The text shown to a person. "Frei" appears only for a provided free price.
// Every other state shows a neutral text or nothing, never "Frei" and never 0.
export function priceLabel(price: PriceView): string | null {
  if (price.state === "provided") {
    return price.model === "free"
      ? "Frei"
      : formatMoney(price.amountMinor, price.currency);
  }

  if (price.state === "unknown") {
    return "Preis noch offen";
  }

  return null;
}

// The amount as it is typed into a form field: "12,50", without symbol.
export function formatAmountInput(amountMinor: number): string {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw new RangeError("amountMinor must be a non-negative integer");
  }

  return `${Math.floor(amountMinor / 100)},${(amountMinor % 100)
    .toString()
    .padStart(2, "0")}`;
}
