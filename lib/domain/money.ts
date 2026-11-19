// Money is a whole number of cents plus a currency code. Never a float.

export const DEFAULT_CURRENCY = "EUR";

// TODO(spec): upper limit is a proposal. 999999 EUR in cents fits a Postgres
// integer.
const MAX_WHOLE_UNITS = 999_999;

export type ParsedPrice =
  | { ok: true; amountMinor: number }
  | { ok: false; message: string };

export type AmountCode = "missing" | "format" | "tooHigh" | "zero";

export type ParsedAmount =
  | { ok: true; amountMinor: number }
  | { ok: false; code: AmountCode };

// Accepts "12", "12,5", "12,50", "12.50", "12 €", "€ 12,50". Thousands
// separators are not accepted, so that "1.234" is never read as 1,234 EUR.
// The amount is computed from the digits, not with floating point. The
// event steps use the code and look the text up in the catalog (Z25) in the
// language of the person.
export function parseAmount(raw: unknown): ParsedAmount {
  const text = typeof raw === "string" ? raw.trim() : "";

  if (text === "") {
    return { ok: false, code: "missing" };
  }

  const cleaned = text
    .replace(/€|eur\b/gi, "")
    .replace(/\s+/g, "")
    .trim();

  const match = /^(\d{1,6})(?:[.,](\d{1,2}))?$/.exec(cleaned);

  if (!match) {
    return { ok: false, code: "format" };
  }

  const whole = Number.parseInt(match[1], 10);
  const fraction = Number.parseInt((match[2] ?? "").padEnd(2, "0") || "0", 10);

  if (whole > MAX_WHOLE_UNITS) {
    return { ok: false, code: "tooHigh" };
  }

  const amountMinor = whole * 100 + fraction;

  if (amountMinor <= 0) {
    return { ok: false, code: "zero" };
  }

  return { ok: true, amountMinor };
}

const AMOUNT_MESSAGE: Record<AmountCode, string> = {
  missing: "Bitte gib den Preis als Betrag ein, zum Beispiel 12,50.",
  format: "Bitte gib den Preis als Betrag ein, zum Beispiel 12,50.",
  tooHigh: "Der Preis ist zu hoch.",
  zero: "Ein Festpreis muss größer als 0 sein. Für einen freien Eintritt wähle „Frei“.",
};

export function parsePriceInput(raw: unknown): ParsedPrice {
  const parsed = parseAmount(raw);

  return parsed.ok
    ? parsed
    : { ok: false, message: AMOUNT_MESSAGE[parsed.code] };
}

const SYMBOL: Record<string, string> = { EUR: "€" };

function groupedNumber(amountMinor: number): string {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw new RangeError("amountMinor must be a non-negative integer");
  }

  const whole = Math.floor(amountMinor / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const fraction = (amountMinor % 100).toString().padStart(2, "0");

  return `${whole},${fraction}`;
}

export function formatMoney(
  amountMinor: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  return `${groupedNumber(amountMinor)} ${SYMBOL[currency] ?? currency}`;
}

// The answer to "Pflichtgebühren" (Figma EVT-04l, 04m). "Included" is shown as
// "inkl. Gebühren"; "unknown" is shown as nothing, and it is never read as
// "no fees". Not answered is the same as unknown on the page.
export type PriceFees = "included" | "unknown";

type Money = { amountMinor: number; currency?: string };

export type PriceView =
  | { state: "provided"; model: "free" }
  | { state: "provided"; model: "donation" }
  | ({
      state: "provided";
      model: "fixed" | "from_price" | "min_donation";
      fees?: PriceFees | null;
    } & Money)
  | ({
      state: "provided";
      model: "range";
      maxAmountMinor: number;
      fees?: PriceFees | null;
    } & Money)
  | { state: "unknown" }
  | { state: "unanswered" | "not_applicable" | "skipped" };

// The text shown to a person. "Frei" appears only for a provided free price.
// Every other state shows a neutral text or nothing, never "Frei" and never 0.
export function priceLabel(price: PriceView): string | null {
  if (price.state === "provided") {
    switch (price.model) {
      case "free":
        return "Frei";
      case "donation":
        return "Eintritt gegen Spende";
      case "min_donation":
        return `Eintritt gegen Spende, ab ${formatMoney(price.amountMinor, price.currency)}`;
      case "from_price":
        return withFees(
          `ab ${formatMoney(price.amountMinor, price.currency)}`,
          price.fees,
        );
      case "range":
        return withFees(
          `${groupedNumber(price.amountMinor)}–${formatMoney(price.maxAmountMinor, price.currency)}`,
          price.fees,
        );
      default:
        return withFees(
          formatMoney(price.amountMinor, price.currency),
          price.fees,
        );
    }
  }

  if (price.state === "unknown") {
    return "Preis noch offen";
  }

  return null;
}

function withFees(text: string, fees: PriceFees | null | undefined): string {
  return fees === "included" ? `${text} inkl. Gebühren` : text;
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
