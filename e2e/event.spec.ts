import { expect, test, type Page } from "@playwright/test";

import { clearMailbox, waitForCode } from "./support/inbucket";
import { makeFounder, provisionAs, sql, userIdByEmail } from "./support/seed";

// Needs the local Supabase stack (see the e2e-auth CI job). Covers the private
// event draft (Slice 4) through the Figma screens: Eventstart, Editor,
// Atmosphäre, Preis und Zugang, Veröffentlichungscheck and Eventbild. Saving an
// incomplete draft, concrete gaps, price unknown, DST, atmosphere limit, online
// access link, event image. Publishing is Slice 5.

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

async function save(page: Page, name: string) {
  await page.getByRole("button", { name, exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Gespeichert", SLOW);
}

// The chips are native checkboxes behind a styled pill: they are toggled by
// their visible text.
const chip = (page: Page, term: string) =>
  page.getByText(term, { exact: true });

// Screenshots of every screen, attached to the CI run (artifact "event-screens")
// so that they can be held against the Figma frames.
async function shot(page: Page, name: string) {
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `test-results/screens/${name}.png`,
    fullPage: true,
  });
}

test("the event draft: incomplete saves, concrete gaps, price, time, access, image", async ({
  browser,
}) => {
  test.setTimeout(300_000);

  const context = await browser.newContext({
    baseURL: BASE_URL,
    viewport: { width: 1128, height: 900 },
  });
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

  // 1. Eventstart: only "Manuell eingeben" exists; it opens an empty draft.
  await expect(page.getByText("Du hast noch kein Event angelegt.")).toBeVisible(
    SLOW,
  );
  await page.getByRole("link", { name: "Event anlegen" }).click();
  await expect(
    page.getByRole("heading", { name: "Was steht als Nächstes an?" }),
  ).toBeVisible(SLOW);
  await shot(page, "01-eventstart");
  await page.getByRole("button", { name: "Manuell eingeben" }).click();
  await page.waitForURL("**/organizer/events/*/edit", SLOW);
  const eventId = page.url().split("/events/")[1].split("/")[0];
  const base = `/organizer/events/${eventId}`;
  await expect(
    page.getByRole("heading", { name: "Neues Event", level: 1 }),
  ).toBeVisible(SLOW);

  const field = (column: string) =>
    sql(
      `select ${column} from public.event_revisions r join public.events e on e.draft_revision_id = r.id where e.id = '${eventId}'`,
    );
  expect(field("title_state")).toBe("unanswered");
  expect(field("price_state")).toBe("unanswered");
  await shot(page, "02-editor-leer");

  // 2. P01/P05: an empty draft exists; the check names every gap, the image too.
  await page.getByRole("link", { name: "Zur Vorschau" }).click();
  await expect(
    page.getByRole("heading", { name: "Noch Angaben offen" }),
  ).toBeVisible(SLOW);
  await expect(page.getByText("Der Titel fehlt.")).toBeVisible();
  await expect(page.getByText("Die Beschreibung fehlt.")).toBeVisible();
  await expect(page.getByText("Der Ort mit Adresse fehlt.")).toBeVisible();
  await expect(page.getByText(/^Eventbild fehlt\. Speichern/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Zur Prüfung einreichen" }),
  ).toBeDisabled();
  await shot(page, "03-check-luecken");
  await page.getByRole("link", { name: "Zurück zum Editor" }).click();

  // 3. Title, format, description and a night event (P11): UTC instants.
  await page.getByLabel("Titel", { exact: true }).fill(TITLE);
  await page.getByLabel("Hauptformat").selectOption("concert");
  await page.getByLabel("Beschreibung", { exact: true }).fill("Live im Keller.");
  await page.getByLabel("Beginn", { exact: true }).fill("2026-10-31T23:00");
  await page.getByLabel("Ende", { exact: true }).fill("2026-11-01T04:00");
  await save(page, "Grundlagen speichern");
  await expect(
    page.getByRole("heading", { name: TITLE, level: 1 }),
  ).toBeVisible(SLOW);
  expect(field(`to_char(start_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI')`)).toBe(
    "2026-10-31T22:00",
  );
  expect(field(`to_char(end_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI')`)).toBe(
    "2026-11-01T03:00",
  );
  await page.reload();
  await expect(page.getByLabel("Beginn", { exact: true })).toHaveValue(
    "2026-10-31T23:00",
    SLOW,
  );
  await expect(page.getByLabel("Ende", { exact: true })).toHaveValue(
    "2026-11-01T04:00",
  );

  // 4. P13: a time the clock change skips is refused and the input stays.
  await page.getByLabel("Beginn", { exact: true }).fill("2026-03-29T02:30");
  await page.getByLabel("Ende", { exact: true }).fill("2026-03-29T05:00");
  await page.getByRole("button", { name: "Grundlagen speichern" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: /Zeitumstellung nicht/ }),
  ).toBeVisible(SLOW);
  await expect(page.getByLabel("Beginn", { exact: true })).toHaveValue(
    "2026-03-29T02:30",
  );
  expect(field(`to_char(start_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI')`)).toBe(
    "2026-10-31T22:00",
  );
  await page.getByLabel("Beginn", { exact: true }).fill("2026-10-31T23:00");
  await page.getByLabel("Ende", { exact: true }).fill("2026-11-01T04:00");

  // 5. Place: half-filled is refused, complete is saved.
  await page.getByLabel("Name des Orts").fill("Keller");
  await page.getByRole("button", { name: "Grundlagen speichern" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: /Namen des Orts und die Adresse/ }),
  ).toBeVisible(SLOW);
  await page.getByLabel("Straße und Hausnummer").fill("Musterstraße 1");
  await page.getByLabel("Postleitzahl").fill("10115");
  await page.getByLabel("Stadt", { exact: true }).fill("Berlin");
  await save(page, "Grundlagen speichern");
  expect(field("place_name")).toBe("Keller");
  await shot(page, "04-editor-gefuellt");

  // 6. Atmosphäre: P04, four terms are an error, nothing is cut off. The
  // answer stays unanswered until "Auswahl übernehmen".
  await page.getByRole("link", { name: "Atmosphäre ergänzen" }).click();
  await expect(
    page.getByRole("heading", { name: "Wie fühlt sich der Abend an?" }),
  ).toBeVisible(SLOW);
  expect(field("atmosphere_state")).toBe("unanswered");
  for (const term of ["Gemütlich", "Intim/persönlich", "Entspannt", "Lebhaft"]) {
    await chip(page, term).click();
  }
  await page.getByRole("button", { name: "Auswahl übernehmen" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: /höchstens 3/ }),
  ).toBeVisible(SLOW);
  await shot(page, "05-atmosphaere-fehler");
  await chip(page, "Lebhaft").click();
  await chip(page, "Entspannt").click();
  await save(page, "Auswahl übernehmen");
  expect(field("atmosphere_state")).toBe("provided");
  await page.getByRole("link", { name: "Zurück zum Entwurf" }).click();

  // 7. Preis und Zugang. P08: an online route without a link is a named gap.
  await page.getByRole("link", { name: "Preis und Zugang bearbeiten" }).click();
  await expect(
    page.getByRole("heading", { name: "Preis und Zugang", level: 1 }),
  ).toBeVisible(SLOW);
  await page.getByRole("checkbox", { name: "Online-Ticket" }).check();
  await save(page, "Angaben übernehmen");
  await page.goto(`${base}/preview`);
  await expect(
    page.getByText("Für den Online-Zugang fehlt ein gültiger Link."),
  ).toBeVisible(SLOW);
  await expect(page.getByText("Der Ort mit Adresse fehlt.")).toHaveCount(0);
  await page.goto(`${base}/access`);
  await page.getByLabel("Ticketlink").fill("tickets.example.org/abend");
  await save(page, "Angaben übernehmen");
  expect(field("access_routes::text")).toContain("https://tickets.example.org/abend");

  // 8. P07: the price. Unanswered is a gap; "unknown" is its own state and is
  // never shown as "Frei".
  await page.goto(`${base}/preview`);
  await expect(page.getByText("Der Preis fehlt.")).toBeVisible(SLOW);
  await page.goto(`${base}/access`);
  await page.getByLabel("Preisform").selectOption({ label: "Noch nicht bekannt" });
  await shot(page, "06-preis-unbekannt");
  await expect(page.getByText("Preis noch offen").first()).toBeVisible();
  await save(page, "Angaben übernehmen");
  expect(field("price_state")).toBe("unknown");
  expect(field("coalesce(price_model::text, '')")).toBe("unknown");
  expect(field("coalesce(price_amount_minor::text, '')")).toBe("");

  await page.getByLabel("Preisform").selectOption({ label: "Festpreis" });
  await page.getByLabel("Preis in EUR").fill("12,50");
  await save(page, "Angaben übernehmen");
  await expect
    .poll(() => field("coalesce(price_amount_minor::text, '')"), SLOW)
    .toBe("1250");
  expect(field("price_state")).toBe("provided");
  await page.reload();
  await expect(page.getByLabel("Preis in EUR")).toHaveValue("12,50", SLOW);
  await shot(page, "07-preis-fest");

  // 9. Only the image is missing now (P05: it gates publishing, not the draft).
  await page.goto(`${base}/preview`);
  await expect(
    page.getByRole("heading", { name: "Prüft euren öffentlichen Auftritt" }),
  ).toBeVisible(SLOW);
  await expect(page.getByRole("heading", { name: "Eventbild fehlt" })).toBeVisible();
  await expect(page.getByText(/Pflichtlücke/)).toHaveCount(0);
  await shot(page, "08-check-bild-fehlt");

  // 10. The image: alt text and rights are mandatory. The form is reset after
  // every attempt, so the file is chosen again each time.
  await page.getByRole("link", { name: "Eventbild ergänzen" }).click();
  await expect(
    page.getByRole("heading", { name: "Wie soll euer Event erscheinen?" }),
  ).toBeVisible(SLOW);
  await shot(page, "09-eventbild");
  const png = { name: "buehne.png", mimeType: "image/png", buffer: PNG };
  await page.getByLabel(/^Eventbild \(JPEG/).setInputFiles(png);
  await page.getByRole("button", { name: "Bild hochladen" }).click();
  await expect(page.getByText(/Bitte bestätige, dass du das Bild/)).toBeVisible(SLOW);
  await expect(page.getByText("Bitte beschreibe das Bild kurz")).toHaveCount(0);
  await page.getByLabel(/^Eventbild \(JPEG/).setInputFiles(png);
  await page.getByLabel("Bildbeschreibung · freiwillig").fill("Bühne bei Nacht");
  await page.getByLabel(/Ich habe die Rechte an diesem Bild/).check();
  await page.getByRole("button", { name: "Bild hochladen" }).click();
  await expect(
    page.getByRole("img", { name: "Bühne bei Nacht" }),
  ).toBeVisible(SLOW);
  expect(
    sql(
      `select public_object_path from public.media_uses where event_id = '${eventId}' and role = 'event_image'`,
    ),
  ).toMatch(new RegExp(`^events/${eventId}/[0-9a-f-]+\\.png$`));

  // 11. The event is complete, but the profile is still a shell, so the joint
  // submission is not available yet.
  await page.getByRole("link", { name: "Zur Eventvorschau" }).click();
  await expect(
    page.getByRole("heading", { name: "Pflichtangaben vollständig" }),
  ).toBeVisible(SLOW);
  await expect(
    page.getByRole("button", { name: "Zur Prüfung einreichen" }),
  ).toBeDisabled();
  await expect(
    page.getByText(/Zum Einreichen fehlen noch Angaben am Profil/),
  ).toBeVisible();
  await shot(page, "10-check-vollstaendig");

  // Mobile frames (Figma M01 to M03).
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [path, name] of [
    ["edit", "m1-editor"],
    ["atmosphere", "m2-atmosphaere"],
    ["preview", "m3-check"],
  ]) {
    await page.goto(`${base}/${path}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible(SLOW);
    await shot(page, name);
  }
  await page.setViewportSize({ width: 1128, height: 900 });

  // 12. The draft appears on the home page, privately.
  await page.goto("/organizer");
  await expect(page.getByRole("link", { name: TITLE })).toBeVisible(SLOW);
  await expect(page.getByText("Entwurf – privat")).toBeVisible();
  expect(
    sql(`select publication_state from public.events where id = '${eventId}'`),
  ).toBe("private");

  // 13. Another organizer cannot reach the draft or any of its pages.
  for (const path of ["edit", "access", "atmosphere", "preview", "image"]) {
    const response = await otherPage.goto(`${base}/${path}`);
    expect(response?.status()).toBe(404);
  }

  await context.close();
  await otherContext.close();
});
