import { describe, expect, it } from "vitest";

import {
  applyLiveEdit,
  formatAddress,
  parseAddress,
  shiftedEnd,
  validateLiveEdit,
  type LiveEditBase,
  type LiveEditInput,
} from "@/lib/domain/event-live-edit";

const base: LiveEditBase = {
  title: "Sommerfest im Hof",
  description: "Ein Abend im Hof.",
  startDate: "2026-11-14",
  startTime: "20:00",
  endDate: "2026-11-14",
  endTime: "23:00",
  endUnknown: false,
  placeName: "Hof am Kanal",
  addressLine: "Kanalstraße 12",
  postalCode: "10999",
  city: "Berlin",
};

const input: LiveEditInput = {
  title: "Sommerfest im Hof",
  description: "Ein Abend im Hof.",
  startDate: "2026-11-14",
  startTime: "20:00",
  placeName: "Hof am Kanal",
  address: "Kanalstraße 12, 10999 Berlin",
};

describe("address", () => {
  it("formats street, postal code and city", () => {
    expect(formatAddress(base)).toBe("Kanalstraße 12, 10999 Berlin");
    expect(formatAddress({ ...base, postalCode: "" })).toBe(
      "Kanalstraße 12, Berlin",
    );
  });

  it("splits at the last comma", () => {
    expect(parseAddress("Kanalstraße 12, 10999 Berlin")).toEqual({
      ok: true,
      parts: {
        addressLine: "Kanalstraße 12",
        postalCode: "10999",
        city: "Berlin",
      },
    });
    expect(parseAddress("Hof 3, Hinterhaus, 10999 Berlin")).toEqual({
      ok: true,
      parts: {
        addressLine: "Hof 3, Hinterhaus",
        postalCode: "10999",
        city: "Berlin",
      },
    });
  });

  it("allows a missing postal code", () => {
    expect(parseAddress("Kanalstraße 12, Berlin")).toEqual({
      ok: true,
      parts: { addressLine: "Kanalstraße 12", postalCode: "", city: "Berlin" },
    });
  });

  it("refuses what has no street, no city, or digits in the city", () => {
    expect(parseAddress("Kanalstraße 12")).toEqual({ ok: false });
    expect(parseAddress("Kanalstraße 12,")).toEqual({ ok: false });
    expect(parseAddress(", 10999 Berlin")).toEqual({ ok: false });
    expect(parseAddress("Kanalstraße 12, 10999")).toEqual({ ok: false });
    expect(parseAddress("Kanalstraße 12, 123 Berlin")).toEqual({ ok: false });
  });
});

describe("shiftedEnd", () => {
  const before = base;

  it("keeps the duration when the start moves", () => {
    expect(
      shiftedEnd(before, { startDate: "2026-11-14", startTime: "21:00" }),
    ).toEqual({ endDate: "2026-11-15", endTime: "00:00" });
    expect(
      shiftedEnd(before, { startDate: "2026-11-21", startTime: "20:00" }),
    ).toEqual({ endDate: "2026-11-21", endTime: "23:00" });
  });

  it("keeps the end when nothing moved, or when it is not set or unknown", () => {
    const same = { startDate: "2026-11-14", startTime: "20:00" };

    expect(shiftedEnd(before, same)).toEqual({
      endDate: "2026-11-14",
      endTime: "23:00",
    });
    expect(
      shiftedEnd(
        { ...before, endDate: "", endTime: "" },
        {
          startDate: "2026-11-15",
          startTime: "20:00",
        },
      ),
    ).toEqual({ endDate: "", endTime: "" });
    expect(
      shiftedEnd(
        { ...before, endUnknown: true, endDate: "", endTime: "" },
        {
          startDate: "2026-11-15",
          startTime: "20:00",
        },
      ),
    ).toEqual({ endDate: "", endTime: "" });
  });

  it("follows the clock change instead of adding wall-clock time", () => {
    // 22:00 to 01:00 on the night of 24.10. is three hours (CEST). Moving the
    // start to 00:30 on the 25th, the clocks go back at 03:00 CEST: three real
    // hours later it is 02:30 CET.
    const night = {
      startDate: "2026-10-24",
      startTime: "22:00",
      endDate: "2026-10-25",
      endTime: "01:00",
      endUnknown: false,
    };

    expect(
      shiftedEnd(night, { startDate: "2026-10-25", startTime: "00:30" }),
    ).toEqual({ endDate: "2026-10-25", endTime: "02:30" });
  });
});

describe("validateLiveEdit", () => {
  it("accepts the stored event as it is", () => {
    expect(validateLiveEdit(input)).toEqual({});
  });

  it("names every required detail that is empty", () => {
    expect(
      validateLiveEdit({
        title: " ",
        description: "",
        startDate: "",
        startTime: "",
        placeName: "",
        address: "",
      }),
    ).toEqual({
      title: "titleMissing",
      description: "descriptionMissing",
      startDate: "dateMissing",
      startTime: "timeMissing",
      placeName: "placeNameMissing",
      address: "addressMissing",
    });
  });

  it("names a date or time that cannot be read", () => {
    expect(
      validateLiveEdit({ ...input, startDate: "morgen", startTime: "25:61" }),
    ).toEqual({ startDate: "dateInvalid", startTime: "timeInvalid" });
    expect(
      validateLiveEdit({
        ...input,
        startDate: "2026-03-29",
        startTime: "02:30",
      }),
    ).toEqual({
      startTime: "timeNonexistent",
    });
  });

  it("names too long texts and an address that does not fit the pattern", () => {
    expect(validateLiveEdit({ ...input, title: "x".repeat(121) })).toEqual({
      title: "titleTooLong",
    });
    expect(validateLiveEdit({ ...input, address: "Kanalstraße 12" })).toEqual({
      address: "addressInvalid",
    });
    expect(
      validateLiveEdit({ ...input, address: `${"x".repeat(201)}, Berlin` }),
    ).toEqual({ address: "addressTooLong" });
  });
});

describe("applyLiveEdit", () => {
  it("returns the stored values with the address split and the end moved", () => {
    const result = applyLiveEdit(base, {
      ...input,
      startTime: "21:00",
      address: "Brunnenstraße 5, 10115 Berlin",
    });

    expect(result).toEqual({
      ok: true,
      values: {
        ...base,
        startTime: "21:00",
        endDate: "2026-11-15",
        endTime: "00:00",
        addressLine: "Brunnenstraße 5",
        postalCode: "10115",
        city: "Berlin",
      },
    });
  });

  it("keeps stored address parts that the split would not recognise", () => {
    const odd = { ...base, postalCode: "SW1A 1AA", city: "London" };
    const result = applyLiveEdit(odd, {
      ...input,
      address: formatAddress(odd),
    });

    expect(result).toMatchObject({
      ok: true,
      values: { postalCode: "SW1A 1AA", city: "London" },
    });
  });

  it("returns the errors and changes nothing when a detail is missing", () => {
    expect(applyLiveEdit(base, { ...input, title: "" })).toEqual({
      ok: false,
      errors: { title: "titleMissing" },
    });
  });
});
