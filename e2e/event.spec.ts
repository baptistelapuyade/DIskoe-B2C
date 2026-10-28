import { expect, test, type Page } from "@playwright/test";

import { clearMailbox, waitForCode } from "./support/inbucket";
import { makeFounder, provisionAs, sql, userIdByEmail } from "./support/seed";

// Needs the local Supabase stack (see the e2e-auth CI job). Covers the private
// event draft (Slice 4): saving an incomplete draft, concrete gaps, price
// unknown, DST, atmosphere limit, online access link, event image. Publishing
// is Slice 5.

const BASE_URL = "http://127.0.0.1:3000";
// The CI serves the app with `next dev`, which compiles routes on first use.
const SLOW = { timeout: 20_000 };

const run = `e${Date.now().toString(36)}`;
const emails = {
  founder: `ev-founder-${run}@example.test`,
  ownerA: `ev-owner-a-${run}@example.test`,
  ownerB: `ev-owner-b-${run}@example.test`,
};
const TITLE = "Nacht der Klänge";

// A valid 1x1 PNG.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function signInWithCode(page: Page, email: string) {
  await clearMailbox(email);
  await page.goto("/login");
  await page.getByLabel("E-Mail-Adresse").fill(email);
  await page.getByRole("button", { name: "Code senden" }).click();

  const code = await waitForCode(email);
  await page.getByLabel("Code", { exact: true }).fill(code);
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await page.waitForURL("**/organizer");
}

const gapList = (page: Page) =>
  page.getByRole("note").filter({ hasText: "Das fehlt noch" });

async function save(page: Page) {
  await page.getByRole("button", { name: "Speichern", exact: true }).click();
}

test("the event draft: incomplete saves, concrete gaps, price, time, access, image", async ({
  browser,
}) => {
  test.setTimeout(300_000);

  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();

  // Accounts and profiles: provisioned the way the founder does it.
  await signInWithCode(page, emails.ownerA);
  await page.getByRole("button", { name: "Abmelden" }).click();
  await page.waitForURL("**/login", SLOW);
  const otherContext = await browser.newContext({ baseURL: BASE_URL });
  const otherPage = await otherContext.newPage();
  await signInWithCode(otherPage, emails.ownerB);
  await signInWithCode(page, emails.founder);
  const founderId = userIdByEmail(emails.founder);
  makeFounder(founderId);
  provisionAs(founderId, userIdByEmail(emails.ownerA), `ev-a-${run}`, "Alpha");
  provisionAs(founderId, userIdByEmail(emails.ownerB), `ev-b-${run}`, "Beta");
  await page.getByRole("button", { name: "Abmelden" }).click();
  await page.waitForURL("**/login", SLOW);
  await signInWithCode(page, emails.ownerA);

  // 1. Create the draft with a title only.
  await expect(page.getByText("Du hast noch kein Event angelegt.")).toBeVisible(
    SLOW,
  );
  await page.getByRole("link", { name: "Event anlegen" }).click();
  await page.getByLabel("Titel des Events").fill(TITLE);
  await page.getByRole("button", { name: "Entwurf anlegen" }).click();
  await page.waitForURL("**/organizer/events/*/edit", SLOW);
  const eventId = page.url().split("/events/")[1].split("/")[0];
  await expect(
    page.getByRole("heading", { name: "Event bearbeiten" }),
  ).toBeVisible(SLOW);

  const field = (column: string) =>
    sql(
      `select ${column} from public.event_revisions r join public.events e on e.draft_revision_id = r.id where e.id = '${eventId}'`,
    );

  // 2. P01/P05: an incomplete draft exists; every gap is named, the image too.
  const gaps = gapList(page);
  await expect(gaps).toContainText("Die Beschreibung fehlt.");
  await expect(gaps).toContainText("Datum und Uhrzeit des Beginns fehlen.");
  await expect(gaps).toContainText("Der Ort mit Adresse fehlt.");
  await expect(gaps).toContainText("Ein bestätigtes Eventbild fehlt.");
  await expect(gaps).not.toContainText("Der Titel fehlt.");
  expect(field("title_state")).toBe("provided");
  expect(field("price_state")).toBe("unanswered");

  // 3. Format, description and a night event (P11): stored as UTC instants.
  await page.getByLabel("Format", { exact: true }).selectOption("concert");
  await page.getByLabel("Beschreibung", { exact: true }).fill("Live im Keller.");
  await page.getByLabel("Beginn – Datum").fill("2026-10-31");
  await page.getByLabel("Beginn – Uhrzeit").fill("23:00");
  await page.getByLabel("Ende – Datum").fill("2026-11-01");
  await page.getByLabel("Ende – Uhrzeit").fill("04:00");
  await save(page);
  await expect(gaps).not.toContainText("Datum und Uhrzeit des Beginns fehlen.", SLOW);
  await expect(gaps).not.toContainText("Die Beschreibung fehlt.");
  expect(field(`to_char(start_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI')`)).toBe(
    "2026-10-31T22:00",
  );
  expect(field(`to_char(end_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI')`)).toBe(
    "2026-11-01T03:00",
  );
  await page.reload();
  await expect(page.getByLabel("Beginn – Uhrzeit")).toHaveValue("23:00", SLOW);
  await expect(page.getByLabel("Ende – Datum")).toHaveValue("2026-11-01");

  // 4. P13: a time the clock change skips is refused and the input stays.
  await page.getByLabel("Beginn – Datum").fill("2026-03-29");
  await page.getByLabel("Beginn – Uhrzeit").fill("02:30");
  await page.getByLabel("Ende – Datum").fill("2026-03-29");
  await page.getByLabel("Ende – Uhrzeit").fill("05:00");
  await save(page);
  await expect(page.getByRole("alert").filter({ hasText: /Zeitumstellung nicht/ })).toBeVisible(
    SLOW,
  );
  await expect(page.getByLabel("Beginn – Uhrzeit")).toHaveValue("02:30");
  expect(field(`to_char(start_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI')`)).toBe(
    "2026-10-31T22:00",
  );
  await page.getByLabel("Beginn – Datum").fill("2026-10-31");
  await page.getByLabel("Beginn – Uhrzeit").fill("23:00");
  await page.getByLabel("Ende – Datum").fill("2026-11-01");
  await page.getByLabel("Ende – Uhrzeit").fill("04:00");

  // 5. Place: half-filled is refused, complete is saved.
  await page.getByLabel("Name des Orts").fill("Keller");
  await save(page);
  await expect(
    page.getByRole("alert").filter({ hasText: /Namen des Orts und die Adresse/ }),
  ).toBeVisible(SLOW);
  await page.getByLabel("Adresse (Straße und Hausnummer)").fill("Musterstraße 1");
  await page.getByLabel("Postleitzahl").fill("10115");
  await page.getByLabel("Stadt").fill("Berlin");

  // 6. P04: four atmosphere terms are an error, nothing is cut off.
  for (const term of ["Gemütlich", "Intim/persönlich", "Entspannt", "Lebhaft"]) {
    await page.getByRole("checkbox", { name: term }).check();
  }
  await save(page);
  await expect(
    page.getByRole("alert").filter({ hasText: /höchstens 3/ }),
  ).toBeVisible(SLOW);
  await page.getByRole("checkbox", { name: "Lebhaft" }).uncheck();
  await page.getByRole("checkbox", { name: "Entspannt" }).uncheck();

  // 7. P08: an online route without a link is a named gap, then fixed.
  await page.getByRole("checkbox", { name: "Online-Tickets" }).check();
  await save(page);
  await expect(gaps).toContainText("Für den Online-Zugang fehlt ein gültiger Link.", SLOW);
  await expect(gaps).not.toContainText("Der Ort mit Adresse fehlt.");
  await page.getByLabel("Link für Online-Tickets").fill("tickets.example.org/abend");
  await save(page);
  await expect(gaps).not.toContainText("Online-Zugang", SLOW);
  expect(field("access_routes::text")).toContain("https://tickets.example.org/abend");

  // 8. P07: the price. Unanswered is a gap; "unknown" is its own state.
  await expect(gaps).toContainText("Der Preis fehlt.");
  await page.getByRole("radio", { name: "Preis noch nicht bekannt" }).check();
  await save(page);
  await expect(gaps).not.toContainText("Der Preis fehlt.", SLOW);
  expect(field("price_state")).toBe("unknown");
  expect(field("coalesce(price_model::text, '')")).toBe("unknown");
  expect(field("coalesce(price_amount_minor::text, '')")).toBe("");

  await page.getByRole("radio", { name: "Festpreis" }).check();
  await page.getByLabel("Betrag in Euro (nur bei Festpreis)").fill("12,50");
  await save(page);
  await expect
    .poll(() => field("coalesce(price_amount_minor::text, '')"), SLOW)
    .toBe("1250");
  expect(field("price_state")).toBe("provided");
  await page.reload();
  await expect(page.getByLabel("Betrag in Euro (nur bei Festpreis)")).toHaveValue(
    "12,50",
    SLOW,
  );

  // 9. Only the image is missing now (P05: it gates publishing, not the draft).
  await expect(gaps.getByRole("listitem")).toHaveCount(1, SLOW);
  await expect(gaps).toContainText("Ein bestätigtes Eventbild fehlt.");

  // 10. The image: alt text and rights are mandatory. The form is reset after
  // every attempt, so the file is chosen again each time.
  const png = { name: "buehne.png", mimeType: "image/png", buffer: PNG };
  await page.getByLabel(/^Eventbild \(JPEG/).setInputFiles(png);
  await page.getByRole("button", { name: "Bild hochladen" }).click();
  await expect(page.getByText("Bitte beschreibe das Bild kurz")).toBeVisible(SLOW);
  await expect(page.getByText(/Bitte bestätige, dass du das Bild/)).toBeVisible();
  await expect(gaps).toContainText("Ein bestätigtes Eventbild fehlt.");
  await page.getByLabel(/^Eventbild \(JPEG/).setInputFiles(png);
  await page.getByLabel("Bildbeschreibung (Alternativtext)").fill("Bühne bei Nacht");
  await page.getByLabel(/Ich habe die Rechte an diesem Bild/).check();
  await page.getByRole("button", { name: "Bild hochladen" }).click();
  await expect(page.getByText("Das fehlt noch")).toHaveCount(0, SLOW);
  await expect(
    page.getByRole("img", { name: "Bühne bei Nacht" }),
  ).toBeVisible(SLOW);
  expect(
    sql(
      `select public_object_path from public.media_uses where event_id = '${eventId}' and role = 'event_image'`,
    ),
  ).toMatch(new RegExp(`^events/${eventId}/[0-9a-f-]+\\.png$`));

  // 11. The draft appears on the home page, privately.
  await page.goto("/organizer");
  await expect(page.getByRole("link", { name: TITLE })).toBeVisible(SLOW);
  await expect(page.getByText("Entwurf – privat")).toBeVisible();
  expect(
    sql(`select publication_state from public.events where id = '${eventId}'`),
  ).toBe("private");

  // 12. Another organizer cannot reach the draft.
  const response = await otherPage.goto(`/organizer/events/${eventId}/edit`);
  expect(response?.status()).toBe(404);

  await context.close();
  await otherContext.close();
});
