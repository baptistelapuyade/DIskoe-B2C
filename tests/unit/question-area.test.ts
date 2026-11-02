import { describe, expect, it } from "vitest";

import { questionAreas, questionWithArea } from "../../lib/domain/question-area";

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

  it("offers event spots only with a first event and no cover", () => {
    expect(questionAreas(false)).toEqual(["Profilbild", "Profiltext"]);
    expect(questionAreas(true)).toContain("Eventbild");
    expect(questionAreas(true)).not.toContain("Cover");
  });
});
