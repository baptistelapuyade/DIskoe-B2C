import { describe, expect, it } from "vitest";

import {
  formatMoney,
  parseAmount,
  parsePriceInput,
  priceLabel,
} from "../../lib/domain/money";

describe("parsePriceInput", () => {
  it("reads amounts as whole cents", () => {
    expect(parsePriceInput("12")).toEqual({ ok: true, amountMinor: 1200 });
    expect(parsePriceInput("12,5")).toEqual({ ok: true, amountMinor: 1250 });
    expect(parsePriceInput("12,50")).toEqual({ ok: true, amountMinor: 1250 });
    expect(parsePriceInput("12.50")).toEqual({ ok: true, amountMinor: 1250 });
    expect(parsePriceInput("€ 12,50")).toEqual({ ok: true, amountMinor: 1250 });
    expect(parsePriceInput("0,01")).toEqual({ ok: true, amountMinor: 1 });
  });

  it("does not suffer from float rounding", () => {
    expect(parsePriceInput("19,99")).toEqual({ ok: true, amountMinor: 1999 });
    expect(parsePriceInput("0,29")).toEqual({ ok: true, amountMinor: 29 });
    expect(parsePriceInput("1,15")).toEqual({ ok: true, amountMinor: 115 });
  });

  it("rejects zero, so a fixed price is never silently free", () => {
    const zero = parsePriceInput("0");

    expect(zero.ok).toBe(false);
    expect(parsePriceInput("0,00").ok).toBe(false);
  });

  it("rejects unclear, negative and too large input", () => {
    for (const bad of ["", "abc", "-5", "1.234", "1,234", "12,505", "1000000"]) {
      expect(parsePriceInput(bad).ok).toBe(false);
    }

    expect(parsePriceInput(undefined).ok).toBe(false);
  });
});

describe("formatMoney", () => {
  it("formats cents without floats", () => {
    expect(formatMoney(1250)).toBe("12,50 €");
    expect(formatMoney(5)).toBe("0,05 €");
    expect(formatMoney(123456)).toBe("1.234,56 €");
  });

  it("refuses non-integers and negative amounts", () => {
    expect(() => formatMoney(12.5)).toThrow();
    expect(() => formatMoney(-1)).toThrow();
  });
});

describe("priceLabel (P07)", () => {
  it("shows Frei only for a provided free price", () => {
    expect(priceLabel({ state: "provided", model: "free" })).toBe("Frei");
  });

  it("shows an unknown price as open, never as Frei or 0", () => {
    const label = priceLabel({ state: "unknown" });

    expect(label).toBe("Preis noch offen");
    expect(label).not.toMatch(/Frei|0/);
  });

  it("shows nothing for an unanswered price", () => {
    expect(priceLabel({ state: "unanswered" })).toBeNull();
    expect(priceLabel({ state: "skipped" })).toBeNull();
    expect(priceLabel({ state: "not_applicable" })).toBeNull();
  });

  it("shows a fixed price in euros", () => {
    expect(
      priceLabel({ state: "provided", model: "fixed", amountMinor: 1250 }),
    ).toBe("12,50 €");
  });
});

describe("parseAmount", () => {
  it("returns a code, not a German sentence", () => {
    expect(parseAmount("12,50")).toEqual({ ok: true, amountMinor: 1250 });
    expect(parseAmount("")).toEqual({ ok: false, code: "missing" });
    expect(parseAmount(undefined)).toEqual({ ok: false, code: "missing" });
    expect(parseAmount("zwölf")).toEqual({ ok: false, code: "format" });
    expect(parseAmount("0,00")).toEqual({ ok: false, code: "zero" });
    // Seven digits are not an amount a door price can be.
    expect(parseAmount("1000000")).toEqual({ ok: false, code: "format" });
  });
});

describe("priceLabel of the price forms (EVT-04)", () => {
  it("shows a donation, a minimum donation, a from price and a range", () => {
    expect(priceLabel({ state: "provided", model: "donation" })).toBe(
      "Eintritt gegen Spende",
    );
    expect(
      priceLabel({ state: "provided", model: "min_donation", amountMinor: 500 }),
    ).toBe("Eintritt gegen Spende, ab 5,00 €");
    expect(
      priceLabel({ state: "provided", model: "from_price", amountMinor: 1000 }),
    ).toBe("ab 10,00 €");
    expect(
      priceLabel({
        state: "provided",
        model: "range",
        amountMinor: 800,
        maxAmountMinor: 1500,
      }),
    ).toBe("8,00–15,00 €");
  });

  it("adds 'inkl. Gebühren' only when the fees are stated as included", () => {
    const fixed = { state: "provided", model: "fixed", amountMinor: 1200 } as const;

    expect(priceLabel({ ...fixed, fees: "included" })).toBe("12,00 € inkl. Gebühren");
    expect(priceLabel({ ...fixed, fees: "unknown" })).toBe("12,00 €");
    expect(priceLabel({ ...fixed, fees: null })).toBe("12,00 €");
  });
});
