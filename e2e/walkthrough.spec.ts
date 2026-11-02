import { expect, test, type Page } from "@playwright/test";

import {
  clearMailbox,
  mailsWithSubject,
  waitForCode,
  waitForMail,
} from "./support/inbucket";
import { makeFounder, provisionAs, userIdByEmail } from "./support/seed";

// One browser window, one video. The whole profile flow is played through the
// user interface, with a real sign-out and sign-in at every change of role, so
// that a person can watch it instead of clicking through it. The CI attaches
// the video to the run (see the e2e-auth job). Needs the local Supabase stack.

const BASE_URL = "http://127.0.0.1:3000";
const VIDEO_DIR = "test-results/walkthrough";
const VIDEO_FILE = `${VIDEO_DIR}/ablauf.webm`;

// The CI serves the app with `next dev`, which compiles routes on first use.
const SLOW = { timeout: 20_000 };

const run = `w${Date.now().toString(36)}`;
const emails = {
  founder: `walk-founder-${run}@example.test`,
  owner: `walk-owner-${run}@example.test`,
};
const slug = `walk-${run}`;
const NAME = "Walkthrough Events";
const QUESTION_TEXT = "Funktioniert der Link zu eurer Seite?";

const QUESTION_MAIL = /Rückfrage zu deiner Einreichung/;
const LIVE_MAIL = /ist jetzt live/;

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
  await page.waitForURL("**/organizer", SLOW);
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Abmelden" }).click();
  await page.waitForURL("**/login", SLOW);
}

// Short pause so that a viewer of the video can follow what happened.
async function beat(page: Page, ms = 1200) {
  await page.waitForTimeout(ms);
}

async function submitForReview(page: Page) {
  await page.getByLabel(/Angaben geprüft und bin berechtigt/).check();
  await page.getByLabel(/öffentlich wird/).check();
  await beat(page, 600);
  await page.getByRole("button", { name: "Zur Prüfung einreichen" }).click();
  await expect(
    page.getByText("Eingereicht. DISKOE prüft dein Profil.").first(),
  ).toBeVisible(SLOW);
  await beat(page);
}

test("the whole profile flow, from the first entry to the live profile", async ({
  browser,
}) => {
  test.setTimeout(360_000);

  const context = await browser.newContext({
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();
  const video = page.video();

  try {
    // Preparation (not part of the story): both accounts exist, the founder
    // role is set and the profile is assigned the way the founder does it.
    await signInWithCode(page, emails.owner);
    await signOut(page);
    await signInWithCode(page, emails.founder);
    const founderId = userIdByEmail(emails.founder);
    makeFounder(founderId);
    provisionAs(founderId, userIdByEmail(emails.owner), slug, NAME);
    await signOut(page);

    // 1. The organizer fills the profile and hands it in.
    await signInWithCode(page, emails.owner);
    await expect(page.getByText("Dir fehlen noch Angaben.")).toBeVisible(SLOW);
    await beat(page);
    await page.getByRole("link", { name: "Angaben vervollständigen" }).click();
    await page.getByLabel("Kurzvorstellung").fill("Nächte in Berlin.");
    await page.getByLabel("Offizieller Link").fill("walkthrough.example");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(
      page.getByText("Gespeichert. Der Entwurf bleibt privat."),
    ).toBeVisible(SLOW);
    await beat(page);

    await page.getByLabel(/Profilbild/).setInputFiles({
      name: "buehne.png",
      mimeType: "image/png",
      buffer: PNG,
    });
    await page
      .getByLabel("Bildbeschreibung · freiwillig")
      .fill("Bühne bei Nacht");
    await page.getByLabel(/Ich habe die Rechte an diesem Bild/).check();
    await page.getByRole("button", { name: "Bild hochladen" }).click();
    await expect(
      page.getByText(
        "Das Bild ist gespeichert und bleibt bis zur Freigabe privat.",
      ),
    ).toBeVisible(SLOW);
    await beat(page);

    await page.getByRole("link", { name: "Vorschau" }).click();
    await expect(page.getByRole("img", { name: "Bühne bei Nacht" })).toBeVisible(
      SLOW,
    );
    await beat(page);
    await submitForReview(page);

    await page.goto("/organizer");
    await expect(page.getByText("Du musst nichts tun.")).toBeVisible(SLOW);
    await beat(page);
    await signOut(page);

    // 2. The founder opens the list through the header link and asks a question.
    await signInWithCode(page, emails.founder);
    await page.getByRole("link", { name: /^Prüfung( \(\d+\))?$/ }).click();
    await expect(
      page.getByRole("heading", { name: "Profile zur Prüfung" }),
    ).toBeVisible(SLOW);
    await beat(page);
    await page
      .locator("li", { hasText: `/${slug}` })
      .getByRole("link", { name: "Prüfen" })
      .click();
    await expect(
      page.getByRole("heading", { name: `Profil: ${NAME}`, exact: true }),
    ).toBeVisible(SLOW);
    await beat(page);
    await page.getByRole("link", { name: "Rückfrage stellen" }).click();
    await page.getByLabel("Betroffene Stelle").selectOption("Profiltext");
    await page.getByLabel("Deine Frage").fill(QUESTION_TEXT);
    await page.getByRole("button", { name: "Rückfrage senden" }).click();
    await expect(
      page.getByText("Zu diesem Stand ist eine Rückfrage gestellt.", {
        exact: false,
      }),
    ).toBeVisible(SLOW);
    await beat(page);

    const questionMail = await waitForMail(emails.owner, QUESTION_MAIL);
    expect(questionMail.body).toContain(
      `${BASE_URL}/organizer/profiles/`,
    );
    await signOut(page);

    // 3. The organizer reads the question, corrects and hands in again.
    await signInWithCode(page, emails.owner);
    await expect(page.getByText(QUESTION_TEXT, { exact: false })).toBeVisible(
      SLOW,
    );
    await beat(page);
    await page.getByRole("link", { name: "Angabe korrigieren" }).click();
    await expect(
      page.getByRole("heading", {
        name: "Wir haben eine Frage zu deinem Profil",
      }),
    ).toBeVisible(SLOW);
    await beat(page);
    await page.getByRole("link", { name: "Angabe korrigieren" }).click();
    await page
      .getByLabel("Offizieller Link")
      .fill("https://www.walkthrough.example/");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(
      page.getByText("Gespeichert. Der Entwurf bleibt privat."),
    ).toBeVisible(SLOW);
    await beat(page);
    await page.getByRole("link", { name: "Vorschau" }).click();
    await expect(page.getByRole("img", { name: "Bühne bei Nacht" })).toBeVisible(
      SLOW,
    );
    await submitForReview(page);
    await signOut(page);

    // 4. The founder approves; the profile goes live at once.
    await signInWithCode(page, emails.founder);
    await page.getByRole("link", { name: /^Prüfung( \(\d+\))?$/ }).click();
    await page
      .locator("li", { hasText: `/${slug}` })
      .getByRole("link", { name: "Prüfen" })
      .click();
    await expect(page.getByRole("img", { name: "Bühne bei Nacht" })).toBeVisible(
      SLOW,
    );
    await beat(page);
    await page
      .getByRole("button", { name: "Freigeben und veröffentlichen" })
      .click();
    await beat(page, 800);
    await page
      .getByRole("button", { name: "Ja, freigeben und veröffentlichen" })
      .click();
    await expect(
      page.getByText("Freigegeben und veröffentlicht.").first(),
    ).toBeVisible(SLOW);
    await beat(page);

    await waitForMail(emails.owner, LIVE_MAIL);
    expect(await mailsWithSubject(emails.owner, LIVE_MAIL)).toHaveLength(1);
    await signOut(page);

    // 5. The organizer sees a live profile.
    await signInWithCode(page, emails.owner);
    await expect(page.getByText("Dein Profil ist veröffentlicht.")).toBeVisible(
      SLOW,
    );
    await beat(page, 2000);
  } finally {
    // The video is only written when the page is closed. Save it under a fixed
    // name, also when the test failed, so that it can be looked at.
    await context.close();
    await video?.saveAs(VIDEO_FILE);
  }
});
