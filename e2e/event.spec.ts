import { expect, test, type Page } from "@playwright/test";

import { clearMailbox, waitForCode } from "./support/inbucket";
import { makeFounder, provisionAs, sql, userIdByEmail } from "./support/seed";
import { germanContext } from "./support/language";
import { PROFILE_PNG } from "./support/profile-flow";

// Needs the local Supabase stack (see the e2e-auth CI job). Covers the private
// event draft (Slice 4) through the Figma screens: Event steps (basics, date and time, place), editor,
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

async function signInWithCode(page: Page, email: string) {
  await clearMailbox(email);
  await page.goto("/login");
  await page.getByLabel("E-Mail-Adresse").fill(email);
  await page.getByRole("button", { name: "Code senden" }).click();

  const code = await waitForCode(email);
  await page.getByLabel("Code aus der E-Mail").fill(code);
  await page.getByRole("button", { name: "Anmelden", exact: true }).click();
  await page.waitForURL("**/organizer");
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

  const context = await germanContext(browser, {
    baseURL: BASE_URL,
    viewport: { width: 1128, height: 900 },
  });
  const page = await context.newPage();

  // Accounts and profiles: provisioned the way the founder does it.
  await signInWithCode(page, emails.ownerA);
  await page.getByRole("button", { name: "Abmelden" }).click();
  await page.waitForURL("**/login", SLOW);
  const otherContext = await germanContext(browser, { baseURL: BASE_URL });
  const otherPage = await otherContext.newPage();
  await signInWithCode(otherPage, emails.ownerB);
  await signInWithCode(page, emails.founder);
  const founderId = userIdByEmail(emails.founder);
  makeFounder(founderId);
  const profileA = provisionAs(
    founderId,
    userIdByEmail(emails.ownerA),
    `ev-a-${run}`,
    "Alpha",
  );
  provisionAs(founderId, userIdByEmail(emails.ownerB), `ev-b-${run}`, "Beta");
  await page.getByRole("button", { name: "Abmelden" }).click();
  await page.waitForURL("**/login", SLOW);
  await signInWithCode(page, emails.ownerA);

  // 1. Step 1 "Worum geht es?" (EVT-01a). No draft exists until the first
  // save. The start page leads a new profile through its details first
  // (ORG-103a), so the step is opened directly.
  await expect(page.getByRole("heading", { name: "Dein Profil" })).toBeVisible(
    SLOW,
  );
  await page.goto(`/organizer/events/new?profile=${profileA}`);
  await expect(
    page.getByRole("heading", { name: "Worum geht es?", level: 1 }),
  ).toBeVisible(SLOW);
  await shot(page, "01-grundlagen");

  // "Weiter" names what is missing and saves nothing (EVT-01b).
  await page
    .getByRole("button", { name: "Weiter zu Datum und Uhrzeit" })
    .click();
  await expect(page.getByText("Gib deinem Event einen Titel.")).toBeVisible();
  await expect(
    page.getByText("Wähle ein Format. Passt keins, melde dich bei uns."),
  ).toBeVisible();
  await expect(page.getByLabel("Titel", { exact: true })).toBeFocused();
  await shot(page, "02-grundlagen-fehler");
  expect(
    sql(
      `select count(*) from public.events where organizer_id = '${profileA}'`,
    ),
  ).toBe("0");

  await page.getByLabel("Titel", { exact: true }).fill(TITLE);
  await page.getByRole("combobox", { name: "Format" }).click();
  await page.getByRole("option", { name: "Konzert" }).click();
  await page
    .getByLabel("Beschreibung", { exact: true })
    .fill("Live im Keller.");
  await page
    .getByRole("button", { name: "Weiter zu Datum und Uhrzeit" })
    .click();
  await page.waitForURL("**/organizer/events/*/edit/time", SLOW);
  const eventId = page.url().split("/events/")[1].split("/")[0];
  const base = `/organizer/events/${eventId}`;

  const field = (column: string) =>
    sql(
      `select ${column} from public.event_revisions r join public.events e on e.draft_revision_id = r.id where e.id = '${eventId}'`,
    );
  expect(field("title_state")).toBe("provided");
  expect(field("format_state")).toBe("provided");
  expect(field("start_state")).toBe("unanswered");
  expect(field("price_state")).toBe("unanswered");

  // 2. P01/P05: the check names every gap that is still open.
  await page.goto(`${base}/preview`);
  await expect(
    page.getByRole("heading", { name: "Noch Angaben offen" }),
  ).toBeVisible(SLOW);
  await expect(
    page.getByText("Datum und Uhrzeit des Beginns fehlen."),
  ).toBeVisible();
  await expect(
    page.getByText("Der Ort mit Adresse und Stadt fehlt."),
  ).toBeVisible();
  await expect(page.getByText(/^Eventbild fehlt\. Speichern/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Zur Prüfung einreichen" }),
  ).toBeDisabled();
  await shot(page, "03-check-luecken");

  // 3. Step 2 "Wann findet es statt?" (EVT-02a): a night event (P11), UTC
  // instants. Date typed, time as time.
  await page.goto(`${base}/edit`);
  await page.waitForURL("**/edit/time", SLOW);
  await shot(page, "04-datum-leer");
  await page.locator("#startDate").fill("31.10.2026");
  await page.locator("#startTime").fill("23:00");
  await page.locator("#endDate").fill("01.11.2026");
  await page.locator("#endTime").fill("04:00");
  await expect(page.getByText("Ende am Folgetag")).toBeVisible();
  await page.getByRole("button", { name: "Weiter zum Ort" }).click();
  await page.waitForURL("**/edit/place", SLOW);
  expect(
    field(`to_char(start_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI')`),
  ).toBe("2026-10-31T22:00");
  expect(
    field(`to_char(end_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI')`),
  ).toBe("2026-11-01T03:00");
  await page.goto(`${base}/edit/time`);
  await expect(page.locator("#startDate")).toHaveValue("31.10.2026", SLOW);
  await expect(page.locator("#startTime")).toHaveValue("23:00");
  await expect(page.locator("#endDate")).toHaveValue("01.11.2026");

  // 4. P13: a time the clock change skips is refused and the input stays.
  await page.locator("#startDate").fill("29.03.2026");
  await page.locator("#startTime").fill("02:30");
  await page.locator("#endDate").fill("29.03.2026");
  await page.locator("#endTime").fill("05:00");
  await page.getByRole("button", { name: "Weiter zum Ort" }).click();
  await expect(
    page.getByText("Diese Uhrzeit gibt es wegen der Zeitumstellung nicht."),
  ).toBeVisible(SLOW);
  await expect(page.locator("#startDate")).toHaveValue("29.03.2026");
  expect(
    field(`to_char(start_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI')`),
  ).toBe("2026-10-31T22:00");

  // The end before the start is named (EVT-02b), the end can be left open.
  await page.locator("#startDate").fill("31.10.2026");
  await page.locator("#startTime").fill("23:00");
  await page.locator("#endDate").fill("31.10.2026");
  await page.locator("#endTime").fill("20:00");
  await page.getByRole("button", { name: "Weiter zum Ort" }).click();
  await expect(
    page.getByText("Das Ende liegt vor dem Beginn.").first(),
  ).toBeVisible(SLOW);
  await shot(page, "05-datum-ende-vor-beginn");
  await page.locator("#endDate").fill("01.11.2026");
  await page.locator("#endTime").fill("04:00");
  await page.getByRole("button", { name: "Weiter zum Ort" }).click();
  await page.waitForURL("**/edit/place", SLOW);

  // 5. Step 3 "Wo findet es statt?" (EVT-03a). "Weiter" with only a name names
  // the street and the city (EVT-03b); "Später weitermachen" keeps the name
  // (EVT-08) and "Zum Entwurf" leads back to this step.
  await shot(page, "06-ort-leer");
  await page.getByLabel("Name des Ortes").fill("Keller");
  await page
    .getByRole("button", { name: "Weiter zu Preis und Zugang" })
    .click();
  await expect(
    page.getByText(
      "Gib die Straße mit Hausnummer an, damit Gäste dich finden.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Gib die Stadt an.")).toBeVisible();
  await shot(page, "07-ort-fehler");

  // No connection (EVT-09b): the input stays, leaving asks first (EVT-09c).
  await context.setOffline(true);
  await page.getByRole("button", { name: "Später weitermachen" }).click();
  await expect(page.getByText("Keine Verbindung.")).toBeVisible(SLOW);
  await shot(page, "08-keine-verbindung");
  await page.getByRole("link", { name: "Zurück" }).click();
  await expect(
    page.getByRole("heading", { name: "Dein Entwurf ist nicht gesichert" }),
  ).toBeVisible();
  await shot(page, "09-nicht-gesichert");
  await context.setOffline(false);
  await page
    .getByRole("button", { name: "Zurück und noch einmal versuchen" })
    .click();
  await page.waitForURL("**/saved", SLOW);
  await expect(
    page.getByRole("heading", { name: "Dein Entwurf ist gesichert" }),
  ).toBeVisible();
  await shot(page, "10-entwurf-gesichert");
  expect(field("place_name")).toBe("Keller");
  expect(field("place_state")).toBe("unanswered");
  await page.getByRole("link", { name: "Zum Entwurf" }).click();
  await page.waitForURL("**/edit/place", SLOW);
  await expect(page.getByLabel("Name des Ortes")).toHaveValue("Keller");
  await page.getByLabel("Straße und Hausnummer").fill("Musterstraße 1");
  await page.getByLabel("Postleitzahl").fill("10115");
  await page.getByLabel("Stadt", { exact: true }).fill("Berlin");
  await page
    .getByRole("button", { name: "Weiter zu Preis und Zugang" })
    .click();
  await page.waitForURL("**/edit/price", SLOW);
  expect(field("place_name")).toBe("Keller");
  expect(field("place_state")).toBe("provided");
  await page.goto(`${base}/edit`);
  await shot(page, "11-editor-gefuellt");

  // 6. Atmosphäre (EVT-06): P04, at most three terms. The fourth is not
  // offered while three are chosen, so nothing is cut off silently. The answer
  // stays unanswered until the step is saved.
  await page.goto(`${base}/edit/atmosphere`);
  await expect(
    page.getByRole("heading", { name: "Wie fühlt sich der Abend an?" }),
  ).toBeVisible(SLOW);
  expect(field("atmosphere_state")).toBe("unanswered");
  await expect(
    page.getByText(/Eine Angabe zur Atmosphäre braucht dein Event/),
  ).toBeVisible();
  for (const term of ["Gemütlich", "Intim/persönlich", "Entspannt"]) {
    await chip(page, term).click();
  }
  await expect(page.getByText("3 von 3 gewählt.")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Lebhaft" })).toBeDisabled();
  await shot(page, "05-atmosphaere-drei");
  await chip(page, "Entspannt").click();
  await expect(page.getByRole("checkbox", { name: "Lebhaft" })).toBeEnabled();
  await chip(page, "Lebhaft").click();
  await page
    .getByRole("button", { name: "Weiter zu den freiwilligen Angaben" })
    .click();
  await page.waitForURL(`**${base}/edit/more`, SLOW);
  expect(field("atmosphere_state")).toBe("provided");
  expect(field("atmosphere_tags::text")).toContain("Lebhaft");

  // 6b. Mehr zum Abend (EVT-07): a concert has no suggested blocks
  // (EVT-07m-e). Blocks come from the picker (EVT-07m-b), can be removed and
  // brought back (EVT-07m-f), a wrong field names itself (EVT-07m-g). Nothing
  // is stored until the step is saved; NULL means "never saved".
  await expect(
    page.getByRole("heading", {
      name: "Was sollen Gäste noch wissen?",
      level: 1,
    }),
  ).toBeVisible(SLOW);
  await expect(
    page.getByText("Für dieses Format haben wir keine Vorschläge."),
  ).toBeVisible();
  expect(field("modules is null")).toBe("t");
  await shot(page, "05b-mehr-leer");

  await page.getByRole("button", { name: "Weiteren Baustein wählen" }).click();
  await expect(
    page.getByRole("heading", { name: "Weitere Bausteine", level: 1 }),
  ).toBeVisible();
  await shot(page, "05c-mehr-bausteine");
  await page.locator("#pick-music").click();
  await page.locator("#pick-participants").click();
  await page.getByRole("button", { name: "Hinzufügen", exact: true }).click();

  await page.getByLabel("Musikalische Präzisierung").fill("Dub Techno");
  await page.getByLabel("Breite Musikrichtungen").click();
  await page.locator("#genre-electronic").click();
  await page.locator("#genre-jazz").click();
  await page.keyboard.press("Escape");
  await expect(page.getByText("2 ausgewählt")).toBeVisible();
  await page
    .getByLabel("Beteiligte", { exact: true })
    .fill("Mara — DJ-Set\nKaro — DJ-Set");
  await shot(page, "05d-mehr-gefuellt");

  // Removing keeps the answer until the step is saved; "Rückgängig" brings the
  // block back as it was.
  await page.getByRole("button", { name: "Baustein entfernen" }).last().click();
  await expect(page.getByText(/„Beteiligte“ wurde entfernt/)).toBeVisible();
  await shot(page, "05e-mehr-entfernt");
  await page.getByRole("button", { name: "Rückgängig" }).click();
  await expect(page.getByText("Mara — DJ-Set, Karo — DJ-Set")).toBeVisible();

  // A wrong time names itself and saves nothing (EVT-07m-g).
  await page.getByRole("button", { name: "Weiteren Baustein wählen" }).click();
  await page.locator("#pick-entry_age").click();
  await page.getByRole("button", { name: "Hinzufügen", exact: true }).click();
  await page.getByLabel("Einlass ab").fill("halb zehn");
  await page.getByRole("button", { name: "Weiter zur Vorschau" }).click();
  await expect(page.getByText("Bitte prüfe eine Angabe.")).toBeVisible();
  await expect(page.getByText("Gib die Uhrzeit so ein: 21:30.")).toBeVisible();
  await expect(page.getByLabel("Einlass ab")).toBeFocused();
  await shot(page, "05f-mehr-fehler");
  expect(field("modules is null")).toBe("t");

  await page.getByLabel("Einlass ab").fill("21:30");
  await page.getByRole("combobox", { name: "Altersregel" }).click();
  await page.getByRole("option", { name: "Mindestalter" }).click();
  await page.getByLabel("Mindestalter", { exact: true }).fill("18");
  await page.getByRole("button", { name: "Weiter zur Vorschau" }).click();
  // The last step leads to the submit checklist (EIN-01). This profile is still
  // a shell, so the checklist sends the owner to its preview, which names the gaps.
  await page.waitForURL(/\/organizer\/profiles\/[^/]+\/preview/, SLOW);
  expect(field("modules->'entry_age'->>'doors_at'")).toBe("21:30");
  expect(field("modules->'entry_age'->>'min_age'")).toBe("18");
  expect(field("modules->'music'->>'precision'")).toBe("Dub Techno");
  expect(field("modules->'music'->'genres'::text")).toContain("jazz");
  expect(field("modules->'participants'->>'text'")).toContain("Karo — DJ-Set");
  // Stored blocks are exactly the ones on the page.
  expect(
    field(
      "(select string_agg(k, ',' order by k) from jsonb_object_keys(modules) k)",
    ),
  ).toBe("entry_age,music,participants");

  // 7. Preis und Zugang (EVT-04). P08: an online route without a link is a
  // named gap. A link must start with https:// (EVT-04n); nothing is added
  // for the organizer.
  await page.goto(`${base}/edit/price`);
  await expect(
    page.getByRole("heading", { name: "Preis und Zugang", level: 1 }),
  ).toBeVisible(SLOW);
  await page.getByRole("checkbox", { name: "Online-Ticket" }).check();
  await page.getByRole("button", { name: "Weiter zum Eventbild" }).click();
  await page.waitForURL("**/edit/image", SLOW);
  await page.goto(`${base}/preview`);
  await expect(
    page.getByText("Für den Online-Zugang fehlt ein gültiger Link."),
  ).toBeVisible(SLOW);
  await expect(page.getByText("Der Ort mit Adresse fehlt.")).toHaveCount(0);
  await page.goto(`${base}/edit/price`);
  await page
    .getByLabel("Link zum Ticketverkauf")
    .fill("tickets.example.org/abend");
  await page.getByRole("button", { name: "Weiter zum Eventbild" }).click();
  await expect(
    page.getByText(
      "Das ist kein gültiger Link. Er muss mit https:// beginnen.",
    ),
  ).toBeVisible(SLOW);
  await shot(page, "05-link-fehler");
  await page
    .getByLabel("Link zum Ticketverkauf")
    .fill("https://tickets.example.org/abend");
  await page.getByRole("button", { name: "Weiter zum Eventbild" }).click();
  await page.waitForURL("**/edit/image", SLOW);
  expect(field("access_routes::text")).toContain(
    "https://tickets.example.org/abend",
  );

  // 8. P07: the price. Unanswered is a gap; "unknown" is its own state and is
  // never shown as "Frei".
  await page.goto(`${base}/preview`);
  await expect(page.getByText("Der Preis fehlt.")).toBeVisible(SLOW);
  await page.goto(`${base}/edit/price`);
  await page.getByRole("combobox", { name: "Preisform" }).click();
  await page.getByRole("option", { name: "Noch nicht bekannt" }).click();
  await shot(page, "06-preis-unbekannt");
  await expect(
    page.getByText("Dein Preis wird als „noch offen“ angezeigt."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Weiter zum Eventbild" }).click();
  await page.waitForURL("**/edit/image", SLOW);
  expect(field("price_state")).toBe("unknown");
  expect(field("coalesce(price_model::text, '')")).toBe("unknown");
  expect(field("coalesce(price_amount_minor::text, '')")).toBe("");

  await page.goto(`${base}/edit/price`);
  await page.getByRole("combobox", { name: "Preisform" }).click();
  await page.getByRole("option", { name: "Festpreis" }).click();
  // A price type with an amount needs one: empty is an error, not "free".
  await page.getByRole("button", { name: "Weiter zum Eventbild" }).click();
  await expect(
    page.getByText("Gib einen Betrag an, zum Beispiel 12,00."),
  ).toBeVisible(SLOW);
  await page.getByLabel("Preis in Euro").fill("12,50");
  await page.getByRole("button", { name: "Weiter zum Eventbild" }).click();
  await page.waitForURL("**/edit/image", SLOW);
  await expect
    .poll(() => field("coalesce(price_amount_minor::text, '')"), SLOW)
    .toBe("1250");
  expect(field("price_state")).toBe("provided");
  await page.goto(`${base}/edit/price`);
  await expect(page.getByLabel("Preis in Euro")).toHaveValue("12,50", SLOW);
  await shot(page, "07-preis-fest");

  // 9. Only the image is missing now (P05: it gates publishing, not the draft).
  await page.goto(`${base}/preview`);
  await expect(
    page.getByRole("heading", { name: "Prüft euren öffentlichen Auftritt" }),
  ).toBeVisible(SLOW);
  await expect(
    page.getByRole("heading", { name: "Eventbild fehlt" }),
  ).toBeVisible();
  await expect(page.getByText(/Pflichtlücke/)).toHaveCount(0);
  await shot(page, "08-check-bild-fehlt");

  // 10. The image (EVT-05): chosen and uploaded at once, the description is
  // optional. The rights are confirmed at submission (EIN-01), not here.
  await page.getByRole("link", { name: "Eventbild ergänzen" }).click();
  await expect(
    page.getByRole("heading", { name: "Zeig dein Event" }),
  ).toBeVisible(SLOW);
  await expect(
    page.getByText("Ohne Bild kannst du weiterarbeiten."),
  ).toBeVisible();
  await shot(page, "09-eventbild");
  await page.locator('input[type="file"]').setInputFiles({
    name: "buehne.png",
    mimeType: "image/png",
    buffer: PROFILE_PNG,
  });
  await expect(page.getByText("buehne.png")).toBeVisible(SLOW);
  await page
    .getByLabel("Bildbeschreibung (freiwillig)")
    .fill("Bühne bei Nacht");
  await page.getByRole("button", { name: "Weiter zur Atmosphäre" }).click();
  await page.waitForURL("**/edit/atmosphere", SLOW);
  expect(
    sql(
      `select public_object_path from public.media_uses where event_id = '${eventId}' and role = 'event_image'`,
    ),
  ).toMatch(new RegExp(`^events/${eventId}/[0-9a-f-]+\\.png$`));
  expect(
    sql(
      `select alt_text from public.media_uses where event_id = '${eventId}' and role = 'event_image'`,
    ),
  ).toBe("Bühne bei Nacht");

  // 11. The event is complete, but the profile is still a shell, so the joint
  // submission is not available yet.
  await page.goto(`${base}/preview`);
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
    ["edit/basics", "m1-grundlagen"],
    ["edit/time", "m1-datum"],
    ["edit/place", "m1-ort"],
    ["saved", "m1-gesichert"],
    ["edit/price", "m2-preis"],
    ["edit/image", "m2-eventbild"],
    ["edit/atmosphere", "m2-atmosphaere"],
    ["edit/more", "m2-mehr"],
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
  for (const path of [
    "edit",
    "edit/time",
    "edit/price",
    "edit/image",
    "edit/atmosphere",
    "edit/more",
    "saved",
    "access",
    "atmosphere",
    "preview",
    "image",
  ]) {
    const response = await otherPage.goto(`${base}/${path}`);
    expect(response?.status()).toBe(404);
  }

  await context.close();
  await otherContext.close();
});
