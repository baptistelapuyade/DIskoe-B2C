import { describe, expect, it } from "vitest";

import { DATENSCHUTZ, IMPRESSUM, legalRobots } from "../../lib/legal/texts";

describe("legal pages", () => {
  it("stay out of search engines while they are placeholders", () => {
    for (const doc of [IMPRESSUM, DATENSCHUTZ]) {
      expect(doc.placeholder).toBe(true);
      expect(legalRobots(doc)).toEqual({ index: false, follow: false });
    }
  });

  it("can be indexed once the founder has filled them", () => {
    expect(legalRobots({ ...IMPRESSUM, placeholder: false })).toEqual({
      index: true,
      follow: true,
    });
  });
});
