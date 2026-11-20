import { createClient } from "@supabase/supabase-js";
import {
  expect,
  test,
  type BrowserContext,
  type Page,
} from "@playwright/test";

import type { Database } from "../lib/db/types";

import { clearMailbox, waitForCode } from "./support/inbucket";
import { makeFounder, provisionAs, sql, userIdByEmail } from "./support/seed";
import { germanContext } from "./support/language";
import {
  chooseProfileImage,
  saveDetails,
  solidPng,
  submitProfileWithoutEvent,
} from "./support/profile-flow";

// Needs the local Supabase stack (see the e2e-auth CI job). Covers the owner's
// private profile editor, the private preview and the hand-in for review.
// Founder approval and publishing are Slice 3c.

const BASE_URL = "http://127.0.0.1:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

const run = `p${Date.now().toString(36)}`;
const emails = {
  founder: `founder-${run}@example.test`,
  ownerA: `owner-a-${run}@example.test`,
  ownerB: `owner-b-${run}@example.test`,
  visitor: `visitor-${run}@example.test`,
};
const slugA = `alpha-${run}`;
const slugB = `beta-${run}`;


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

test.describe.configure({ mode: "serial" });

test.describe("profile editor, preview and hand-in", () => {
  test.setTimeout(180_000);

  const states: Record<
    string,
    Awaited<ReturnType<BrowserContext["storageState"]>>
  > = {};
  let profileA = "";

  const editUrl = () => `/organizer/profiles/${profileA}/edit`;
  const imageUrl = () => `/organizer/profiles/${profileA}/image`;
  const previewUrl = () => `/organizer/profiles/${profileA}/preview`;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(300_000);

    for (const [key, email] of Object.entries(emails)) {
      const context = await germanContext(browser, { baseURL: BASE_URL });
      const page = await context.newPage();
      await signInWithCode(page, email);
      states[key] = await context.storageState();
      await context.close();
    }

    const founderId = userIdByEmail(emails.founder);
    makeFounder(founderId);
    profileA = provisionAs(
      founderId,
      userIdByEmail(emails.ownerA),
      slugA,
      "Alpha Events",
    );
    provisionAs(founderId, userIdByEmail(emails.ownerB), slugB, "Beta Events");
  });

  async function pageFor(
    browser: import("@playwright/test").Browser,
    key: string,
  ) {
    const context = await germanContext(browser, {
      baseURL: BASE_URL,
      storageState: states[key],
    });
    return { context, page: await context.newPage() };
  }

  test("the start page names the next step for a new profile", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");
    await page.goto("/organizer");

    await expect(page.getByRole("heading", { name: "Dein Profil", exact: true })).toBeVisible();
    await expect(page.getByText("Dir fehlen noch Angaben:")).toBeVisible();
    await page.getByRole("link", { name: "Angaben ergänzen" }).click();
    await expect(
      page.getByRole("heading", { name: "Erzähl uns von deinem Projekt" }),
    ).toBeVisible();

    await context.close();
  });

  test("step 1 shows the name and the profile address, which can still be changed", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");

    await page.goto(editUrl());
    await expect(page.getByLabel("Name deines Projekts")).toHaveValue("Alpha Events");
    await expect(page.getByLabel("Profiladresse")).toHaveValue(slugA);

    await context.close();
  });

  test("invalid input is refused and nothing unsafe is saved", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");

    await page.goto(editUrl());
    await page.getByLabel("Website", { exact: true }).fill("javascript:alert(1)");
    await page.getByLabel("Instagram", { exact: true }).fill("not a handle!");
    await page.getByRole("button", { name: "Weiter zum Profilbild" }).click();
    await expect(page.getByText("Bitte prüfe zwei Angaben.")).toBeVisible();
    await expect(page.getByText("Das ist kein gültiger Link.", { exact: false })).toBeVisible();
    await expect(page.getByText("Das ist kein gültiger Instagram-Name.", { exact: false })).toBeVisible();

    expect(
      sql(
        `select count(*) from public.profile_revisions where profile_id = '${profileA}' and (official_url is not null or instagram_handle is not null)`,
      ),
    ).toBe("0");

    await context.close();
  });

  test("the profile address is checked and can be changed before the first approval", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");

    // Taken by another profile.
    await page.goto(editUrl());
    await page.getByLabel("Profiladresse").fill(slugB);
    await page.getByLabel("Website", { exact: true }).fill("alpha.example");
    await page.getByRole("button", { name: "Weiter zum Profilbild" }).click();
    await expect(page.getByText("Diese Adresse ist schon vergeben.")).toBeVisible();
    expect(sql(`select slug from public.profiles where id = '${profileA}'`)).toBe(slugA);

    // Wrong format.
    await page.getByLabel("Profiladresse").fill("A B");
    await page.getByRole("button", { name: "Weiter zum Profilbild" }).click();
    await expect(page.getByText("Nur Kleinbuchstaben, Zahlen und Bindestriche", { exact: false })).toBeVisible();

    // A free address is applied.
    await page.getByLabel("Profiladresse").fill(`${slugA}-neu`);
    await page.getByRole("button", { name: "Weiter zum Profilbild" }).click();
    await page.waitForURL("**/image");
    expect(sql(`select slug from public.profiles where id = '${profileA}'`)).toBe(`${slugA}-neu`);

    // Back to the original address for the later tests.
    await page.goto(editUrl());
    await page.getByLabel("Profiladresse").fill(slugA);
    await page.getByRole("button", { name: "Später weitermachen" }).click();
    await page.waitForURL("**/organizer");
    expect(sql(`select slug from public.profiles where id = '${profileA}'`)).toBe(slugA);

    await context.close();
  });

  test("an incomplete draft can be saved and stays private", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");

    await page.goto(editUrl());
    await saveDetails(
      page,
      {
        intro: "Nights in Berlin.",
        website: "alpha.example",
        instagram: "https://instagram.com/alpha.events/",
      },
      "later",
    );
    await page.waitForURL("**/organizer");

    await page.goto(editUrl());
    await expect(page.getByLabel("Kurzvorstellung")).toHaveValue("Nights in Berlin.");
    await expect(page.getByLabel("Website", { exact: true })).toHaveValue("https://alpha.example/");
    // A pasted Instagram link is stored as the handle.
    await expect(page.getByLabel("Instagram", { exact: true })).toHaveValue("@alpha.events");
    expect(
      sql(`select instagram_handle from public.profile_revisions where profile_id = '${profileA}'`),
    ).toBe("alpha.events");

    // Still only one revision: an editable draft is updated in place.
    expect(
      sql(`select count(*) from public.profile_revisions where profile_id = '${profileA}'`),
    ).toBe("1");

    // Not public, neither through the view nor the API.
    const anon = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    const publicRows = await anon.from("public_profiles").select("slug").eq("slug", slugA);
    expect(publicRows.data ?? []).toEqual([]);

    await context.close();
  });

  test("the preview is private, lists the gap and offers no hand-in yet", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");

    const response = await page.goto(previewUrl());
    expect(response?.headers()["cache-control"]).toContain("no-store");
    await expect(page.getByRole("heading", { name: "Alpha Events" })).toBeVisible();
    await expect(page.getByText("Dir fehlen noch Angaben:")).toBeVisible();
    await expect(page.getByRole("link", { name: "Weiter zum ersten Event" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Profil ohne Event einreichen" })).toHaveCount(0);

    await context.close();
  });

  test("wrong files are refused before anything is uploaded", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");
    await page.goto(imageUrl());

    // Text pretending to be an image.
    await chooseProfileImage(page, {
      name: "fake.png",
      mimeType: "image/png",
      buffer: Buffer.from("this is not an image"),
    });
    await expect(page.getByText("Dieses Format geht nicht.")).toBeVisible();

    // Too small (1 x 1 pixel).
    await chooseProfileImage(page, {
      name: "tiny.png",
      mimeType: "image/png",
      buffer: solidPng(1, 1),
    });
    await expect(page.getByText("Das Bild ist zu klein.")).toBeVisible();

    // Wrong type.
    await chooseProfileImage(page, {
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hello"),
    });
    await expect(page.getByText("Dieses Format geht nicht.")).toBeVisible();

    expect(
      sql(`select count(*) from public.media_uses where profile_id = '${profileA}'`),
    ).toBe("0");

    await context.close();
  });

  test("a chosen image is uploaded at once, can be cropped and completes the draft", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");
    await page.goto(imageUrl());

    await chooseProfileImage(page);
    await expect(page.getByRole("button", { name: "Weiter zur Vorschau" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ausschnitt ändern" })).toBeVisible();
    expect(
      sql(`select count(*) from public.media_uses where profile_id = '${profileA}' and confirmed_at is not null`),
    ).toBe("1");

    // The crop: the centred default is replaced by a stored crop.
    await page.getByRole("link", { name: "Ausschnitt ändern" }).click();
    await page.waitForURL("**/image/crop");
    await page.getByRole("button", { name: "Vergrößern" }).click();
    await page.getByRole("button", { name: "Ausschnitt übernehmen" }).click();
    await page.waitForURL("**/image");
    expect(
      sql(`select count(*) from public.media_uses where profile_id = '${profileA}' and crop is not null`),
    ).not.toBe("0");

    // The optional description is saved with "Weiter zur Vorschau".
    await page.getByLabel("Bildbeschreibung (freiwillig)").fill("Bühne bei Nacht");
    await page.getByRole("button", { name: "Weiter zur Vorschau" }).click();
    await page.waitForURL("**/preview");

    await expect(page.getByRole("img", { name: "Bühne bei Nacht" })).toBeVisible();
    await expect(page.getByText("Dir fehlen noch Angaben:")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Weiter zum ersten Event" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Profil ohne Event einreichen" })).toBeVisible();

    // The reserved public path exists, but no file is in the public bucket.
    expect(
      sql(
        `select count(*) from public.media_uses where profile_id = '${profileA}' and public_object_path is not null and confirmed_at is not null`,
      ),
    ).toBe("1");
    expect(
      sql(`select count(*) from storage.objects where bucket_id = 'public-media' and name like 'profiles/${profileA}/%'`),
    ).toBe("0");

    await context.close();
  });

  test("the hand-in needs both declarations and is recorded for this revision", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");
    await page.goto(previewUrl());
    await page.getByRole("link", { name: "Profil ohne Event einreichen" }).click();
    await page.waitForURL("**/submit");
    await page.getByRole("link", { name: "Weiter zur Bestätigung" }).click();
    await page.waitForURL(/\/submit\/confirm/);

    await page.getByRole("button", { name: "Zur Prüfung einreichen" }).click();
    await expect(page.getByText("Bitte bestätige beide Punkte.")).toBeVisible();
    expect(
      sql(`select count(*) from public.publication_audit where entity_id = '${profileA}' and action = 'submit_for_review'`),
    ).toBe("0");

    await page.getByLabel(/Angaben geprüft und bin berechtigt/).check();
    await page.getByLabel(/nötigen Rechte/).check();
    await page.getByRole("button", { name: "Zur Prüfung einreichen" }).click();
    await expect(
      page.getByRole("heading", { name: "Wir prüfen dein Profil" }),
    ).toBeVisible();

    expect(
      sql(
        `select count(*) from public.publication_audit a join public.profiles p on p.id = a.entity_id and p.draft_revision_id = a.revision_id where a.entity_id = '${profileA}' and a.action = 'submit_for_review'`,
      ),
    ).toBe("1");

    await page.goto(previewUrl());
    await expect(page.getByText(/In Prüfung/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Zur Prüfung einreichen" })).toHaveCount(0);

    // The start page says what is going on and that nothing is left to do.
    await page.goto("/organizer");
    await expect(page.getByText("Wir prüfen Profil und Event gemeinsam")).toBeVisible();
    await expect(page.getByText("Du musst nichts tun.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Eingereichtes ansehen" })).toBeVisible();

    // The status page: read-only copy of what was handed in, and the way back.
    await page.goto(`/organizer/profiles/${profileA}/status`);
    await expect(
      page.getByText(/In Prüfung · eingereicht am /),
    ).toBeVisible();
    await page.getByRole("link", { name: "Eingereichte Fassung ansehen" }).click();
    await expect(
      page.getByRole("heading", { name: "Deine eingereichte Fassung" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Profil ändern" })).toHaveCount(0);
    await page.getByRole("link", { name: "Einreichung zurückziehen" }).click();
    await expect(
      page.getByRole("heading", { name: "Einreichung zurückziehen?" }),
    ).toBeVisible();
    // "No" leaves everything as it is.
    await page.getByRole("link", { name: "Nein, in Prüfung lassen" }).click();
    await expect(
      page.getByRole("heading", { name: "Wir prüfen dein Profil" }),
    ).toBeVisible();
    expect(
      sql(
        `select count(*) from public.publication_audit where entity_id = '${profileA}' and action = 'withdraw'`,
      ),
    ).toBe("0");

    await context.close();
  });

  test("editing after the hand-in creates a new revision and withdraws the hand-in", async ({
    browser,
  }) => {
    const submittedRevision = sql(
      `select draft_revision_id from public.profiles where id = '${profileA}'`,
    );
    const { context, page } = await pageFor(browser, "ownerA");

    await page.goto(editUrl());
    await saveDetails(page, { intro: "Nights in Berlin, every Friday." }, "later");
    await page.waitForURL("**/organizer");

    const draft = sql(`select draft_revision_id from public.profiles where id = '${profileA}'`);
    expect(draft).not.toBe(submittedRevision);
    expect(
      sql(`select count(*) from public.profile_revisions where profile_id = '${profileA}'`),
    ).toBe("2");
    // The handed-in revision is unchanged.
    expect(
      sql(`select short_intro from public.profile_revisions where id = '${submittedRevision}'`),
    ).toBe("Nights in Berlin.");
    // The image carries over to the new revision.
    expect(
      sql(`select profile_image_use_id is not null from public.profile_revisions where id = '${draft}'`),
    ).toBe("t");

    await page.goto(previewUrl());
    await expect(page.getByRole("link", { name: "Profil ohne Event einreichen" })).toBeVisible();

    await context.close();
  });

  test("the owner can withdraw a hand-in and hand in again", async ({ browser }) => {
    const { context, page } = await pageFor(browser, "ownerA");

    await submitProfileWithoutEvent(page, profileA);
    await page.goto(`/organizer/profiles/${profileA}/withdraw`);
    await page.getByRole("button", { name: "Ja, zurückziehen" }).click();
    await expect(
      page.getByRole("heading", { name: "Du kannst wieder bearbeiten" }),
    ).toBeVisible();
    expect(
      sql(
        `select count(*) from public.publication_audit where entity_id = '${profileA}' and action = 'withdraw'`,
      ),
    ).toBe("1");

    // After the withdrawal the checklist is the way in again.
    await page.getByRole("link", { name: "Zur Prüfliste" }).click();
    await expect(
      page.getByRole("heading", { name: "Prüfe, was öffentlich wird" }),
    ).toBeVisible();

    await context.close();
  });

  test("other accounts cannot reach the profile", async ({ browser, request }) => {
    const ownerB = await pageFor(browser, "ownerB");
    const response = await ownerB.page.goto(editUrl());
    expect(response?.status()).toBe(404);
    const preview = await ownerB.page.goto(previewUrl());
    expect(preview?.status()).toBe(404);
    await ownerB.context.close();

    const visitor = await pageFor(browser, "visitor");
    await visitor.page.goto(editUrl());
    await expect(visitor.page).toHaveURL(`${BASE_URL}/organizer`);
    await visitor.context.close();

    // The founder role alone is no organizer assignment either.
    const founder = await pageFor(browser, "founder");
    await founder.page.goto(previewUrl());
    await expect(founder.page).toHaveURL(`${BASE_URL}/organizer`);
    await founder.context.close();

    const anonymous = await request.get(editUrl(), { maxRedirects: 0 });
    expect([302, 303, 307, 308]).toContain(anonymous.status());
    expect(anonymous.headers().location).toContain("/login");
  });
});
