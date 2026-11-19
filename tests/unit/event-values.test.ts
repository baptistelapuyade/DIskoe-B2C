import { describe, expect, it } from "vitest";

import { eventGapCodes, parseEventInput } from "../../lib/domain/event-publication";
import {
  rowToFormValues,
  rowToValues,
  valuesToRow,
  type EventRevisionRow,
} from "../../lib/event/values";

const base: EventRevisionRow = {
  id: "00000000-0000-4000-8000-000000000001",
  title_state: "unanswered",
  title: null,
  description_state: "unanswered",
  description: null,
  format_state: "unanswered",
  primary_format: null,
  start_state: "unanswered",
  start_at: null,
  end_state: "unanswered",
  end_at: null,
  place_state: "unanswered",
  place_name: null,
  address_line: null,
  postal_code: null,
  city: null,
  price_state: "unanswered",
  price_model: null,
  price_amount_minor: null,
  price_max_amount_minor: null,
  price_fee_model: null,
  currency: "EUR",
  access_state: "unanswered",
  access_routes: [],
  atmosphere_state: "unanswered",
  atmosphere_tags: [],
  atmosphere_description: null,
  modules: null,
  event_image_use_id: null,
  confirmed_at: null,
};

function parsed(input: Parameters<typeof parseEventInput>[0]) {
  const result = parseEventInput(input);

  if (!result.ok) {
    throw new Error(JSON.stringify(result.errors));
  }

  return result.value;
}

describe("valuesToRow", () => {
  it("writes an empty draft with every state unanswered and no values", () => {
    const row = valuesToRow(parsed({}));

    expect(row.title_state).toBe("unanswered");
    expect(row.title).toBeNull();
    expect(row.price_state).toBe("unanswered");
    expect(row.price_model).toBeNull();
    expect(row.price_amount_minor).toBeNull();
    expect(row.access_routes).toEqual([]);
    expect(row.atmosphere_tags).toEqual([]);
  });

  it("P07: an unknown price is stored as unknown, never as free or 0", () => {
    const row = valuesToRow(parsed({ priceModel: "unknown" }));

    expect(row.price_state).toBe("unknown");
    expect(row.price_model).toBe("unknown");
    expect(row.price_amount_minor).toBeNull();
  });

  it("stores a fixed price in cents and a free price without amount", () => {
    expect(
      valuesToRow(parsed({ priceModel: "fixed", priceAmount: "12,50" })),
    ).toMatchObject({
      price_state: "provided",
      price_model: "fixed",
      price_amount_minor: 1250,
    });
    expect(valuesToRow(parsed({ priceModel: "free" }))).toMatchObject({
      price_state: "provided",
      price_model: "free",
      price_amount_minor: null,
    });
  });

  it("keeps a deliberately unknown end as a state without a value", () => {
    const row = valuesToRow(parsed({ endUnknown: "on" }));

    expect(row.end_state).toBe("unknown");
    expect(row.end_at).toBeNull();
  });

  it("stores the place only as a whole", () => {
    expect(
      valuesToRow(
        parsed({ placeName: "Keller", addressLine: "Musterstraße 1", city: "Berlin" }),
      ),
    ).toMatchObject({
      place_state: "provided",
      place_name: "Keller",
      address_line: "Musterstraße 1",
      postal_code: null,
      city: "Berlin",
    });
    expect(valuesToRow(parsed({})).place_name).toBeNull();
  });

  it("stores online routes with their link", () => {
    const row = valuesToRow(
      parsed({
        accessKinds: ["door", "online_ticket"],
        onlineTicketUrl: "https://tickets.example.org/",
      }),
    );

    expect(row.access_state).toBe("provided");
    expect(row.access_routes).toEqual([
      { kind: "door" },
      { kind: "online_ticket", url: "https://tickets.example.org/" },
    ]);
  });
});

describe("rowToValues and rowToFormValues", () => {
  const input = {
    title: "Nacht der Klänge",
    description: "Live im Keller.",
    format: "concert",
    startDate: "2026-10-31",
    startTime: "23:00",
    endDate: "2026-11-01",
    endTime: "04:00",
    placeName: "Keller",
    addressLine: "Musterstraße 1",
    postalCode: "10115",
    city: "Berlin",
    priceModel: "fixed",
    priceAmount: "12,50",
    accessKinds: ["door", "online_registration"],
    onlineRegistrationUrl: "anmeldung.example.org",
    atmosphereTags: ["Gemütlich"],
    atmosphereDescription: "Leise.",
  };

  function savedRow(): EventRevisionRow {
    return { ...base, ...valuesToRow(parsed(input)) } as EventRevisionRow;
  }

  it("shows the saved draft in the form the way it was typed (Europe/Berlin)", () => {
    const form = rowToFormValues(savedRow());

    expect(form.title).toBe("Nacht der Klänge");
    expect(form.format).toBe("concert");
    expect(form.startDate).toBe("2026-10-31");
    expect(form.startTime).toBe("23:00");
    expect(form.endDate).toBe("2026-11-01");
    expect(form.endTime).toBe("04:00");
    expect(form.priceModel).toBe("fixed");
    expect(form.priceAmount).toBe("12,50");
    expect(form.accessKinds).toEqual(["door", "online_registration"]);
    expect(form.onlineRegistrationUrl).toBe("https://anmeldung.example.org/");
    expect(form.atmosphereTags).toEqual(["Gemütlich"]);
    expect(form.atmosphereDescription).toBe("Leise.");
  });

  it("shows an unknown price as its own choice and an unknown end as unchecked-state", () => {
    const form = rowToFormValues({
      ...base,
      price_state: "unknown",
      price_model: "unknown",
      end_state: "unknown",
    });

    expect(form.priceModel).toBe("unknown");
    expect(form.priceAmount).toBe("");
    expect(form.endUnknown).toBe(true);
  });

  it("calculates the same gaps from a saved row as from the input", () => {
    expect(eventGapCodes(rowToValues(savedRow()), true)).toEqual([]);
    expect(eventGapCodes(rowToValues(savedRow()), false)).toEqual([
      "event_image",
    ]);
    expect(eventGapCodes(rowToValues(base), false)).toHaveLength(9);
  });

  it("copes with a broken access_routes value", () => {
    const values = rowToValues({
      ...base,
      access_state: "provided",
      access_routes: [{ kind: "teleport" }, "x", null],
    });

    expect(values.access.state).toBe("unanswered");
  });
});

describe("saving one section keeps the others", () => {
  const saved: EventRevisionRow = {
    ...base,
    title_state: "provided",
    title: "Test Event",
    price_state: "provided",
    price_model: "fixed",
    price_amount_minor: 1200,
    access_state: "provided",
    access_routes: [{ kind: "door" }],
    event_image_use_id: "00000000-0000-4000-8000-0000000000aa",
  };

  it("writes price and access back unchanged after a form round trip", () => {
    // What a section save does: saved row to form values, overlay of the
    // section's own fields (here: title only), parse, write.
    const form = { ...rowToFormValues(saved), title: "Neuer Titel" };
    const row = valuesToRow(
      parsed({ ...form, endUnknown: form.endUnknown ? "on" : null }),
    );

    expect(row).toMatchObject({
      title: "Neuer Titel",
      price_state: "provided",
      price_model: "fixed",
      price_amount_minor: 1200,
      access_state: "provided",
      access_routes: [{ kind: "door" }],
    });
    // The image link is not part of a section save at all.
    expect(row).not.toHaveProperty("event_image_use_id");
  });
});
