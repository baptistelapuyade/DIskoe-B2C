// Money is a whole number of cents plus a currency code. Never a float.

import { t, type Lang } from "../i18n";

export const DEFAULT_CURRENCY = "EUR";

// TODO(spec): upper limit is a proposal. 999999 EUR in cents fits a Postgres
// integer.
const MAX_WHOLE_UNITS = 999_999;

export type ParsedPrice =
  { ok: true; amountMinor: number } | { ok: false; message: string };

export type AmountCode = "missing" | "format" | "tooHigh" | "zero";

export type ParsedAmount =
  { ok: true; amountMinor: number } | { ok: false; code: AmountCode };

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

// "12,50" in German, "12.50" in English; thousands grouped with "." and ",".
function groupedNumber(lang: Lang, amountMinor: number): string {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw new RangeError("amountMinor must be a non-negative integer");
  }

  const de = lang === "de";
  const whole = Math.floor(amountMinor / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, de ? "." : ",");
  const fraction = (amountMinor % 100).toString().padStart(2, "0");

  return `${whole}${de ? "," : "."}${fraction}`;
}

// "12,50 €" in German, "€12.50" in English.
export function formatMoney(
  lang: Lang,
  amountMinor: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  const number = groupedNumber(lang, amountMinor);
  const symbol = SYMBOL[currency] ?? currency;

  return lang === "de" ? `${number} ${symbol}` : `${symbol}${number}`;
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
// Wording: catalog Z27.price.*, in the language of the reader.
export function priceLabel(lang: Lang, price: PriceView): string | null {
  if (price.state === "provided") {
    const money = (amountMinor: number) =>
      formatMoney(
        lang,
        amountMinor,
        "currency" in price ? price.currency : undefined,
      );

    switch (price.model) {
      case "free":
        return t(lang, "Z27.price.free");
      case "donation":
        return t(lang, "Z27.price.donation");
      case "min_donation":
        return t(lang, "Z27.price.minDonation", {
          amount: money(price.amountMinor),
        });
      case "from_price":
        return withFees(
          lang,
          t(lang, "Z27.price.from", { amount: money(price.amountMinor) }),
          price.fees,
        );
      case "range": {
        // The symbol stands once: "10,00–20,00 €", "€10.00–20.00".
        const low = groupedNumber(lang, price.amountMinor);
        const high = groupedNumber(lang, price.maxAmountMinor);
        const symbol =
          SYMBOL[price.currency ?? DEFAULT_CURRENCY] ?? price.currency;

        return withFees(
          lang,
          lang === "de"
            ? `${low}–${high} ${symbol}`
            : `${symbol}${low}–${high}`,
          price.fees,
        );
      }
      default:
        return withFees(lang, money(price.amountMinor), price.fees);
    }
  }

  if (price.state === "unknown") {
    return t(lang, "Z27.price.unknown");
  }

  return null;
}

function withFees(
  lang: Lang,
  text: string,
  fees: PriceFees | null | undefined,
): string {
  return fees === "included"
    ? t(lang, "Z27.price.fees", { price: text })
    : text;
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
