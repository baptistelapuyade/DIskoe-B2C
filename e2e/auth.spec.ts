import { createClient } from "@supabase/supabase-js";
import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";

import type { Database } from "../lib/db/types";

import { clearMailbox, waitForCode, waitForLink } from "./support/inbucket";
import { makeFounder, provisionAs, sql, userIdByEmail } from "./support/seed";
import { germanContext } from "./support/language";

// Needs the local Supabase stack (see the e2e-auth CI job and
// docs/runbooks/supabase-auth-setup.md). Anyone can sign in; only the
// founder-provisioned assignment opens the organizer area.

const BASE_URL = "http://127.0.0.1:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

const run = Date.now().toString(36);
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

async function signedInContext(
  browser: Browser,
  states: Record<string, Awaited<ReturnType<BrowserContext["storageState"]>>>,
  key: string,
) {
  return germanContext(browser, { baseURL: BASE_URL, storageState: states[key] });
}

async function apiClientFor(email: string) {
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await clearMailbox(email);
  const sent = await client.auth.signInWithOtp({ email });
  expect(sent.error).toBeNull();

  const verified = await client.auth.verifyOtp({
    email,
    token: await waitForCode(email),
    type: "email",
  });
  expect(verified.error).toBeNull();

  return client;
}

test.describe.configure({ mode: "serial" });

test.describe("sign-in and organizer assignment", () => {
  test.setTimeout(180_000);

  const states: Record<
    string,
    Awaited<ReturnType<BrowserContext["storageState"]>>
  > = {};

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(300_000);

    // 1. Everyone signs in through the real UI. This creates the accounts and
    //    nothing else: no profile, no role.
    for (const [key, email] of Object.entries(emails)) {
      const context = await germanContext(browser, { baseURL: BASE_URL });
      const page = await context.newPage();
      await signInWithCode(page, email);
      states[key] = await context.storageState();
      await context.close();
    }

    expect(
      sql(
        `select count(*) from public.profiles p join auth.users u on u.id = p.owner_id where u.email like '%-${run}@example.test'`,
      ),
    ).toBe("0");

    // 2. The founder assigns the profiles through the real provisioning path.
    const founderId = userIdByEmail(emails.founder);
    makeFounder(founderId);
    provisionAs(founderId, userIdByEmail(emails.ownerA), slugA, "Alpha Events");
    provisionAs(founderId, userIdByEmail(emails.ownerB), slugB, "Beta Events");
  });

  test("anonymous visitors are sent to the login page", async ({ page }) => {
    await page.goto("/organizer");
    await expect(page).toHaveURL(/\/login\?next=%2Forganizer$/);

    await page.goto("/organizer/anything");
    await expect(page).toHaveURL(/\/login\?next=%2Forganizer%2Fanything$/);
  });

  test("an invalid e-mail address is rejected without sending", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("E-Mail-Adresse").fill("not-an-address");
    await page.getByRole("button", { name: "Code senden" }).click();
    await expect(
      page.getByText("Das ist keine vollständige E-Mail-Adresse. Prüfe sie."),
    ).toBeVisible();
  });

  test("a wrong code shows the error and keeps the address (ORG-97)", async ({
    page,
  }) => {
    const email = `wrong-${run}@example.test`;
    await clearMailbox(email);
    await page.goto("/login");
    await page.getByLabel("E-Mail-Adresse").fill(email);
    await page.getByRole("button", { name: "Code senden" }).click();
    await expect(page.getByText(email)).toBeVisible();

    await page.getByLabel("Code aus der E-Mail").fill("000000");
    await page.getByRole("button", { name: "Anmelden", exact: true }).click();
    await expect(
      page.getByText("Der Code stimmt nicht oder ist abgelaufen."),
    ).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByLabel("Code aus der E-Mail")).toBeEnabled();
  });

  test("five wrong codes lock the sign-in for ten minutes (ORG-02b)", async ({
    page,
  }) => {
    const email = `locked-${run}@example.test`;
    await clearMailbox(email);
    await page.goto("/login");
    await page.getByLabel("E-Mail-Adresse").fill(email);
    await page.getByRole("button", { name: "Code senden" }).click();
    await expect(page.getByLabel("Code aus der E-Mail")).toBeVisible();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await page.getByLabel("Code aus der E-Mail").fill("000000");
      await page.getByRole("button", { name: "Anmelden", exact: true }).click();
      if (attempt < 4) {
        await expect(
          page.getByText("Der Code stimmt nicht oder ist abgelaufen."),
        ).toBeVisible();
      }
    }

    await expect(page.getByText("Zu viele falsche Codes.")).toBeVisible();
    await expect(page.getByLabel("Code aus der E-Mail")).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Anmelden", exact: true }),
    ).toBeDisabled();
  });

  test("an expired link leads to a new code (ORG-99)", async ({ page }) => {
    const email = `expired-${run}@example.test`;
    await clearMailbox(email);
    await page.goto("/login?error=link");
    await expect(
      page.getByRole("heading", { name: "Dieser Link gilt nicht mehr" }),
    ).toBeVisible();

    await page.getByLabel("E-Mail-Adresse").fill(email);
    await page.getByRole("button", { name: "Neuen Code senden" }).click();
    await expect(page.getByLabel("Code aus der E-Mail")).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test("a signed-in user without assignment gets no organizer rights", async ({
    browser,
  }) => {
    const context = await signedInContext(browser, states, "visitor");
    const page = await context.newPage();

    await page.goto("/organizer");
    await expect(
      page.getByRole("heading", { name: "Dein Konto hat noch kein Profil" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /anlegen|erstellen/i }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "hello@diskoe.world" }),
    ).toHaveAttribute("href", "mailto:hello@diskoe.world");
    await expect(
      page.getByRole("link", { name: /anlegen|erstellen/i }),
    ).toHaveCount(0);

    await context.close();
  });

  test("the founder role alone does not open an organizer profile", async ({
    browser,
  }) => {
    const context = await signedInContext(browser, states, "founder");
    const page = await context.newPage();

    await page.goto("/organizer");
    await expect(
      page.getByRole("heading", { name: "Dein Konto hat noch kein Profil" }),
    ).toBeVisible();

    await context.close();
  });

  test("an assigned owner sees only the own profile", async ({ browser }) => {
    const context = await signedInContext(browser, states, "ownerA");
    const page = await context.newPage();

    await page.goto("/organizer");
    await expect(page.getByRole("heading", { name: "Dein Profil", exact: true })).toBeVisible();
    await expect(page.getByText("Alpha Events")).toBeVisible();
    await expect(page.getByText("Beta Events")).toHaveCount(0);

    await context.close();
  });

  test("the API gives each account only its own data", async () => {
    const ownerA = await apiClientFor(emails.ownerA);
    const visitor = await apiClientFor(emails.visitor);
    const bRevisionId = sql(
      `select draft_revision_id from public.profiles where slug = '${slugB}'`,
    );

    const mine = await ownerA.from("my_profiles").select("slug");
    expect(mine.error).toBeNull();
    expect(mine.data?.map((row) => row.slug)).toEqual([slugA]);

    const otherProfile = await ownerA
      .from("profiles")
      .select("id")
      .eq("slug", slugB);
    expect(otherProfile.data).toEqual([]);

    const otherRevision = await ownerA
      .from("profile_revisions")
      .select("id")
      .eq("id", bRevisionId);
    expect(otherRevision.data).toEqual([]);

    const visitorMine = await visitor.from("my_profiles").select("slug");
    expect(visitorMine.error).toBeNull();
    expect(visitorMine.data).toEqual([]);

    const visitorId = userIdByEmail(emails.visitor);
    const insert = await visitor
      .from("profiles")
      .insert({ owner_id: visitorId, slug: `self-made-${run}` });
    expect(insert.error?.code).toBe("42501");

    const provision = await visitor.rpc("provision_profile_owner", {
      target_user_id: visitorId,
      target_slug: `self-made-rpc-${run}`,
    });
    expect(provision.error?.code).toBe("42501");
  });

  test("the e-mail link signs in and keeps the target inside the organizer area", async ({
    browser,
  }) => {
    const context = await germanContext(browser, { baseURL: BASE_URL });
    const page = await context.newPage();

    await clearMailbox(emails.ownerA);
    await page.goto("/login");
    await page.getByLabel("E-Mail-Adresse").fill(emails.ownerA);
    await page.getByRole("button", { name: "Code senden" }).click();
    await expect(page.getByLabel("Code aus der E-Mail")).toBeVisible();

    await page.goto(await waitForLink(emails.ownerA));
    await expect(page).toHaveURL(`${BASE_URL}/organizer`);
    await expect(page.getByText("Alpha Events")).toBeVisible();

    await context.close();
  });

  test("a broken callback never redirects outside the site", async ({
    request,
  }) => {
    const response = await request.get(
      "/auth/callback?code=bogus&next=//evil.example",
      { maxRedirects: 0 },
    );

    expect(response.status()).toBe(303);
    expect(response.headers().location).toBe(`${BASE_URL}/login?error=link`);
  });

  test("the language switch changes the texts and is remembered", async ({
    browser,
  }) => {
    const context = await signedInContext(browser, states, "ownerA");
    const page = await context.newPage();

    await page.goto("/organizer");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page.getByRole("button", { name: "Abmelden" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Impressum" })).toBeVisible();

    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Imprint" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    // The choice is kept for the next visit.
    await page.reload();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
    await expect(page.getByRole("button", { name: "EN" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.getByRole("button", { name: "DE" }).click();
    await expect(page.getByRole("button", { name: "Abmelden" })).toBeVisible();

    await context.close();
  });

  test("signing out ends the session", async ({ browser }) => {
    const context = await signedInContext(browser, states, "ownerA");
    const page = await context.newPage();

    await page.goto("/organizer");
    await page.getByRole("button", { name: "Abmelden" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/login`);

    await page.goto("/organizer");
    await expect(page).toHaveURL(/\/login\?next=%2Forganizer$/);

    await context.close();
  });
});
