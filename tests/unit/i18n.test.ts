import { describe, expect, it } from "vitest";

import {
  DEFAULT_LANG,
  messageIds,
  parseLang,
  placeholders,
  t,
  textFor,
  type MessageId,
} from "../../lib/i18n";

describe("text catalog", () => {
  it("has the same IDs in German and English", () => {
    expect(messageIds("en").sort()).toEqual(messageIds("de").sort());
  });

  it("uses the same placeholders in both languages", () => {
    for (const id of messageIds("de") as MessageId[]) {
      expect(placeholders(textFor("en", id)), id).toEqual(
        placeholders(textFor("de", id)),
      );
    }
  });

  it("has no empty text", () => {
    for (const lang of ["de", "en"] as const) {
      for (const id of messageIds(lang) as MessageId[]) {
        expect(textFor(lang, id).trim(), `${lang} ${id}`).not.toBe("");
      }
    }
  });

  it("only carries catalog IDs of the form Z<number>.<path>", () => {
    for (const id of messageIds("de")) {
      expect(id).toMatch(/^Z\d+[a-z]?(\.[A-Za-z0-9]+)+$/);
    }
  });
});

describe("language resolution", () => {
  it("defaults to English", () => {
    expect(DEFAULT_LANG).toBe("en");
    expect(parseLang(undefined)).toBe("en");
    expect(parseLang("fr")).toBe("en");
    expect(parseLang("")).toBe("en");
  });

  it("accepts de and en", () => {
    expect(parseLang("de")).toBe("de");
    expect(parseLang("en")).toBe("en");
  });
});

describe("t()", () => {
  it("fills placeholders", () => {
    expect(t("de", "Z20.weg.mobile", { n: 1, name: "Anmelden" })).toBe(
      "Schritt 1 von 3 · Anmelden",
    );
    expect(t("en", "Z20.weg.mobile", { n: 2, name: "Sign in" })).toBe(
      "Step 2 of 3 · Sign in",
    );
  });

  it("keeps a placeholder visible when its value is missing", () => {
    expect(t("en", "Z20.weg.mobile", { n: 1 })).toBe("Step 1 of 3 · {name}");
  });

  it("returns plain texts unchanged", () => {
    expect(t("de", "Z20.nav.signOut")).toBe("Abmelden");
    expect(t("en", "Z20.nav.signOut")).toBe("Sign out");
  });
});
