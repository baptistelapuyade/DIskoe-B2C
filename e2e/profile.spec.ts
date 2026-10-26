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

test.describe.configure({ mode: "serial" });

test.describe("profile editor, preview and hand-in", () => {
  test.setTimeout(180_000);

  const states: Record<
    string,
    Awaited<ReturnType<BrowserContext["storageState"]>>
  > = {};
  let profileA = "";

  const editUrl = () => `/organizer/profiles/${profileA}/edit`;
  const previewUrl = () => `/organizer/profiles/${profileA}/preview`;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(300_000);

    for (const [key, email] of Object.entries(emails)) {
      const context = await browser.newContext({ baseURL: BASE_URL });
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
    const context = await browser.newContext({
      baseURL: BASE_URL,
      storageState: states[key],
    });
    return { context, page: await context.newPage() };
  }

  test("the editor shows what is missing and the fixed address", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");

    await page.goto(editUrl());
    await expect(page.getByRole("heading", { name: "Profil bearbeiten" })).toBeVisible();
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Alpha Events");
    await expect(page.getByText("Die Kurzvorstellung fehlt.")).toBeVisible();
    await expect(page.getByText("Ein bestätigtes Profilbild fehlt.")).toBeVisible();
    await expect(page.getByText(`/${slugA}`)).toBeVisible();
    // The address is not an input: only the founder sets it.
    await expect(page.getByLabel(/adresse|slug/i)).toHaveCount(0);

    await context.close();
  });

  test("invalid input is refused and nothing unsafe is saved", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");

    await page.goto(editUrl());
    await page.getByLabel("Offizieller Link").fill("javascript:alert(1)");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("Bitte gib einen gültigen Link ein", { exact: false })).toBeVisible();

    expect(
      sql(
        `select count(*) from public.profile_revisions where profile_id = '${profileA}' and official_url is not null`,
      ),
    ).toBe("0");

    await context.close();
  });

  test("an incomplete draft can be saved and stays private", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");

    await page.goto(editUrl());
    await page.getByLabel("Kurzvorstellung").fill("Nights in Berlin.");
    await page.getByLabel("Offizieller Link").fill("alpha.example");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("Gespeichert. Der Entwurf bleibt privat.")).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Kurzvorstellung")).toHaveValue("Nights in Berlin.");
    await expect(page.getByLabel("Offizieller Link")).toHaveValue("https://alpha.example/");

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
    await expect(page.getByText("Ein bestätigtes Profilbild fehlt.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Zur Prüfung einreichen" })).toHaveCount(0);

    await context.close();
  });

  test("images need the right type, a description and the confirmation", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");
    await page.goto(editUrl());

    // Text pretending to be an image.
    await page.getByLabel(/Profilbild/).setInputFiles({
      name: "fake.png",
      mimeType: "image/png",
      buffer: Buffer.from("this is not an image"),
    });
    await page.getByLabel("Bildbeschreibung (Alternativtext)").fill("Bühne");
    await page.getByLabel(/Ich habe die Rechte an diesem Bild/).check();
    await page.getByRole("button", { name: "Bild hochladen" }).click();
    await expect(page.getByText("Bitte lade ein Bild als JPEG, PNG oder WebP hoch.")).toBeVisible();

    // A real image without description and confirmation.
    await page.reload();
    await page.getByLabel(/Profilbild/).setInputFiles({
      name: "stage.png",
      mimeType: "image/png",
      buffer: PNG,
    });
    await page.getByRole("button", { name: "Bild hochladen" }).click();
    await expect(page.getByText("Bitte beschreibe das Bild kurz (Alternativtext).")).toBeVisible();
    await expect(page.getByText("Bitte bestätige, dass du das Bild verwenden")).toBeVisible();

    expect(
      sql(
        `select count(*) from public.media_uses where profile_id = '${profileA}'`,
      ),
    ).toBe("0");

    await context.close();
  });

  test("a confirmed image completes the draft and stays private", async ({
    browser,
  }) => {
    const { context, page } = await pageFor(browser, "ownerA");
    await page.goto(editUrl());

    await page.getByLabel(/Profilbild/).setInputFiles({
      name: "stage.png",
      mimeType: "image/png",
      buffer: PNG,
    });
    await page.getByLabel("Bildbeschreibung (Alternativtext)").fill("Bühne bei Nacht");
    await page.getByLabel(/Ich habe die Rechte an diesem Bild/).check();
    await page.getByRole("button", { name: "Bild hochladen" }).click();
    await expect(page.getByText("Das Bild ist gespeichert und bleibt bis zur Veröffentlichung privat.")).toBeVisible();

    await page.goto(previewUrl());
    await expect(page.getByRole("img", { name: "Bühne bei Nacht" })).toBeVisible();
    await expect(page.getByText("Das fehlt noch:")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Zur Prüfung einreichen" })).toBeVisible();

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

    await page.getByRole("button", { name: "Zur Prüfung einreichen" }).click();
    await expect(page.getByText("Bitte bestätige beide Angaben")).toBeVisible();
    expect(
      sql(`select count(*) from public.publication_audit where entity_id = '${profileA}' and action = 'submit_for_review'`),
    ).toBe("0");

    await page.getByLabel(/Rechte an allen Texten und Bildern/).check();
    await page.getByLabel(/öffentlich angezeigt werden/).check();
    await page.getByRole("button", { name: "Zur Prüfung einreichen" }).click();
    await expect(page.getByText("Eingereicht. DISKOE prüft den Entwurf.").first()).toBeVisible();

    expect(
      sql(
        `select count(*) from public.publication_audit a join public.profiles p on p.id = a.entity_id and p.draft_revision_id = a.revision_id where a.entity_id = '${profileA}' and a.action = 'submit_for_review'`,
      ),
    ).toBe("1");

    await page.reload();
    await expect(page.getByText(/In Prüfung/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Zur Prüfung einreichen" })).toHaveCount(0);

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
    await page.getByLabel("Kurzvorstellung").fill("Nights in Berlin, every Friday.");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("Gespeichert. Der Entwurf bleibt privat.")).toBeVisible();

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
    await expect(page.getByRole("button", { name: "Zur Prüfung einreichen" })).toBeVisible();

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
