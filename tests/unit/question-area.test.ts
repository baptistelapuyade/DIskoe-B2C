import { describe, expect, it } from "vitest";

import { questionWithArea } from "../../lib/domain/question-area";

describe("questionWithArea", () => {
  it("keeps the message as written without an area", () => {
    expect(questionWithArea("", "Wie hoch ist der Eintritt?")).toEqual({
      ok: true,
      value: "Wie hoch ist der Eintritt?",
    });
  });

  it("puts the affected spot into the first line", () => {
    expect(questionWithArea("Ort", "Stimmt die Adresse?")).toEqual({
      ok: true,
      value: "Betroffen: Ort\nStimmt die Adresse?",
    });
  });

  it("rejects a message that is too long together with the area", () => {
    const result = questionWithArea("Ort", "x".repeat(495));

    expect(result.ok).toBe(false);
  });
});

import { correctionHref, splitQuestion } from "../../lib/domain/question-area";

describe("splitQuestion", () => {
  it("separates the affected spot from the question", () => {
    expect(splitQuestion("Betroffen: Ort\nWelche Straße?")).toEqual({
      area: "place",
      text: "Welche Straße?",
    });
  });

  it("keeps a message without a spot whole", () => {
    expect(splitQuestion("Wie hoch ist der Eintritt?")).toEqual({
      area: null,
      text: "Wie hoch ist der Eintritt?",
    });
  });

  it("keeps a message with an unknown spot whole", () => {
    const raw = "Betroffen: Wetter\nRegnet es?";

    expect(splitQuestion(raw)).toEqual({ area: null, text: raw });
  });
});

describe("correctionHref", () => {
  const base = "/organizer/profiles/p1";

  it("sends the place to its own screen", () => {
    expect(correctionHref("place", base, "e1")).toBe(`${base}/question/place`);
  });

  it("sends other event spots to the step of that spot", () => {
    expect(correctionHref("time", base, "e1")).toBe(
      "/organizer/events/e1/edit/time",
    );
    expect(correctionHref("price", base, "e1")).toBe(
      "/organizer/events/e1/edit/price",
    );
    expect(correctionHref("event", base, "e1")).toBe(
      "/organizer/events/e1/edit/basics",
    );
  });

  it("falls back to the profile without event or spot", () => {
    expect(correctionHref("place", base, null)).toBe(`${base}/edit`);
    expect(correctionHref(null, base, "e1")).toBe(`${base}/edit`);
    expect(correctionHref("profile", base, "e1")).toBe(`${base}/edit`);
  });
});
