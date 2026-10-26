import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";

import type { Database } from "../lib/db/types";

import { clearMailbox, waitForCode } from "./support/inbucket";
import { makeFounder, provisionAs, sql, userIdByEmail } from "./support/seed";

// Needs the local Supabase stack (see the e2e-auth CI job). Covers the
// founder's first approval, the owner's explicit publication and the copy of
// the image into the public bucket.

const BASE_URL = "http://127.0.0.1:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

const run = `q${Date.now().toString(36)}`;
const emails = {
  founder: `founder-${run}@example.test`,
  ownerA: `owner-a-${run}@example.test`,
  ownerB: `owner-b-${run}@example.test`,
  visitor: `visitor-${run}@example.test`,
};
const slugA = `alpha-${run}`;
const slugB = `beta-${run}`;

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

type Api = SupabaseClient<Database>;

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

async function apiClientFor(email: string): Promise<Api> {
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

// Completes the draft and hands it in, the way the editor does.
async function completeAndSubmit(
  client: Api,
  userId: string,
  profileId: string,
  name: string,
) {
  const draftId = sql(
    `select draft_revision_id from public.profiles where id = '${profileId}'`,
  );

  const path = `${userId}/${crypto.randomUUID()}.png`;
  const upload = await client.storage
    .from("private-media")
    .upload(path, PNG, { contentType: "image/png" });
  expect(upload.error).toBeNull();

  const asset = await client
    .from("media_assets")
    .insert({ uploader_id: userId, private_object_path: path, mime_type: "image/png" })
    .select("id")
    .single();
  expect(asset.error).toBeNull();

  const use = await client
    .from("media_uses")
    .insert({
      asset_id: asset.data!.id,
      profile_id: profileId,
      role: "profile_image",
      alt_text: "Bühne",
    })
    .select("id")
    .single();
  expect(use.error).toBeNull();

  const confirmed = await client
    .from("media_uses")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("id", use.data!.id)
    .select("id");
  expect(confirmed.data).toHaveLength(1);

  const revision = await client
    .from("profile_revisions")
    .update({
      name,
      short_intro: `${name} nights.`,
      official_url: `https://${name.toLowerCase().replace(/ /g, "")}.example/`,
      profile_image_use_id: use.data!.id,
    })
    .eq("id", draftId)
    .select("id");
  expect(revision.data).toHaveLength(1);

  const submit = await client.rpc("submit_profile_for_review", {
    p_profile_id: profileId,
    p_expected_draft_revision_id: draftId,
    p_confirmed_rights: true,
    p_confirmed_usage: true,
  });
  expect(submit.error).toBeNull();

  return draftId;
}

test.describe.configure({ mode: "serial" });

test.describe("first approval, publication and public image", () => {
  test.setTimeout(180_000);

  const states: Record<string, Awaited<ReturnType<BrowserContext["storageState"]>>> = {};
  let profileA = "";
  let profileB = "";
  let revisionA = "";
  let revisionB = "";
  let founderApi: Api;
  let ownerBApi: Api;
  let ownerAApi: Api;

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
    profileA = provisionAs(founderId, userIdByEmail(emails.ownerA), slugA, "Alpha Events");
    profileB = provisionAs(founderId, userIdByEmail(emails.ownerB), slugB, "Beta Events");

    ownerAApi = await apiClientFor(emails.ownerA);
    ownerBApi = await apiClientFor(emails.ownerB);
    founderApi = await apiClientFor(emails.founder);

    revisionA = await completeAndSubmit(ownerAApi, userIdByEmail(emails.ownerA), profileA, "Alpha Events");
    revisionB = await completeAndSubmit(ownerBApi, userIdByEmail(emails.ownerB), profileB, "Beta Events");
  });

  async function pageFor(browser: Browser, key: string) {
    const context = await browser.newContext({
      baseURL: BASE_URL,
      storageState: states[key],
    });
    return { context, page: await context.newPage() };
  }

  test("only the founder reaches the review pages", async ({ browser, request }) => {
    for (const key of ["ownerA", "visitor"]) {
      const { context, page } = await pageFor(browser, key);
      const response = await page.goto("/internal/approvals");
      expect(response?.status()).toBe(404);
      const detail = await page.goto(`/internal/approvals/${profileA}`);
      expect(detail?.status()).toBe(404);
      await context.close();
    }

    const anonymous = await request.get("/internal/approvals", { maxRedirects: 0 });
    expect([302, 303, 307, 308]).toContain(anonymous.status());
    expect(anonymous.headers().location).toContain("/login");
  });

  test("an owner can neither approve nor publish before the approval", async ({ browser }) => {
    const approve = await ownerAApi.rpc("approve_first_profile", {
      p_profile_id: profileA,
      p_expected_draft_revision_id: revisionA,
    });
    expect(approve.error?.code).toBe("42501");

    const publish = await ownerAApi.rpc("publish_profile", {
      p_profile_id: profileA,
      p_expected_draft_revision_id: revisionA,
    });
    expect(publish.error?.code).toBe("DK003");

    const { context, page } = await pageFor(browser, "ownerA");
    await page.goto(`/organizer/profiles/${profileA}/preview`);
    await expect(page.getByText(/In Prüfung/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Veröffentlichen" })).toHaveCount(0);
    await context.close();
  });

  test("the founder sees the queue and approves exactly the shown revision", async ({ browser }) => {
    const { context, page } = await pageFor(browser, "founder");

    await page.goto("/internal/approvals");
    await expect(page.getByText(`/${slugA} ·`)).toBeVisible();
    await expect(page.getByText(`/${slugB} ·`)).toBeVisible();

    await page.goto(`/internal/approvals/${profileA}`);
    await expect(page.getByRole("heading", { name: "Alpha Events" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Bühne" })).toBeVisible();
    await page.getByRole("button", { name: "Diesen Stand freigeben" }).click();
    await expect(page.getByText("Freigegeben. Der Organizer kann das Profil jetzt selbst veröffentlichen.")).toBeVisible();

    expect(
      sql(`select count(*) from public.publication_audit where entity_id = '${profileA}' and action = 'approve_first' and revision_id = '${revisionA}'`),
    ).toBe("1");
    // Approval alone publishes nothing.
    expect(sql(`select publication_state from public.profiles where id = '${profileA}'`)).toBe("private");

    await page.goto("/internal/approvals");
    await expect(page.getByText(`/${slugA} ·`)).toHaveCount(0);
    await expect(page.getByText(`/${slugB} ·`)).toBeVisible();

    await context.close();
  });

  test("a changed draft cannot be approved on the old preview", async () => {
    // Owner B edits after the hand-in: the app creates a new revision.
    const next = await ownerBApi
      .from("profile_revisions")
      .insert({
        profile_id: profileB,
        created_by: userIdByEmail(emails.ownerB),
        name: "Beta Events",
        short_intro: "Changed after the hand-in.",
        official_url: "https://betaevents.example/",
      } as never)
      .select("id")
      .single();
    expect(next.error).toBeNull();
    const switched = await ownerBApi
      .from("profiles")
      .update({ draft_revision_id: next.data!.id })
      .eq("id", profileB)
      .select("id");
    expect(switched.data).toHaveLength(1);

    const stale = await founderApi.rpc("approve_first_profile", {
      p_profile_id: profileB,
      p_expected_draft_revision_id: revisionB,
    });
    expect(stale.error?.code).toBe("DK001");

    // The new draft was never handed in and is not approvable: it also has
    // no image yet.
    const incomplete = await founderApi.rpc("approve_first_profile", {
      p_profile_id: profileB,
      p_expected_draft_revision_id: next.data!.id,
    });
    expect(incomplete.error?.code).toBe("DK002");
  });

  test("after the approval the owner may publish, but not edit", async ({ browser }) => {
    const { context, page } = await pageFor(browser, "ownerA");

    await page.goto(`/organizer/profiles/${profileA}/edit`);
    await expect(page.getByText("DISKOE hat dieses Profil freigegeben.", { exact: false })).toBeVisible();
    await page.getByLabel("Kurzvorstellung").fill("Sneaky change.");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("Das Profil ist freigegeben. Bitte veröffentliche es zuerst", { exact: false })).toBeVisible();
    expect(
      sql(`select short_intro from public.profile_revisions where id = '${revisionA}'`),
    ).toBe("Alpha Events nights.");

    await page.goto(`/organizer/profiles/${profileA}/preview`);
    await expect(page.getByRole("button", { name: "Veröffentlichen" })).toBeVisible();

    await context.close();
  });

  test("publishing is explicit, makes the data and the image public", async ({ browser }) => {
    const { context, page } = await pageFor(browser, "ownerA");
    await page.goto(`/organizer/profiles/${profileA}/preview`);

    // Nothing public yet.
    const anon = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    expect((await anon.from("public_profiles").select("slug").eq("slug", slugA)).data).toEqual([]);

    await page.getByRole("button", { name: "Veröffentlichen" }).click();
    await expect(page.getByText("Dein Profil wird öffentlich sichtbar. Jetzt veröffentlichen?")).toBeVisible();
    // Still nothing public before the second confirmation.
    expect((await anon.from("public_profiles").select("slug").eq("slug", slugA)).data).toEqual([]);
    await page.getByRole("button", { name: "Ja, jetzt veröffentlichen" }).click();
    await expect(page.getByText("Dein Profil ist veröffentlicht.")).toBeVisible();

    const rows = await anon
      .from("public_profiles")
      .select("slug, name, profile_image_path")
      .eq("slug", slugA);
    expect(rows.data).toHaveLength(1);
    expect(rows.data![0].name).toBe("Alpha Events");
    const imagePath = rows.data![0].profile_image_path!;
    expect(imagePath).toMatch(new RegExp(`^profiles/${profileA}/`));

    const publicImage = await fetch(
      `${SUPABASE_URL}/storage/v1/object/public/public-media/${imagePath}`,
    );
    expect(publicImage.status).toBe(200);

    // The original stays private; the other profile is not public.
    const privatePath = sql(
      `select a.private_object_path from public.media_assets a join public.media_uses u on u.asset_id = a.id where u.profile_id = '${profileA}'`,
    );
    const privateTry = await fetch(
      `${SUPABASE_URL}/storage/v1/object/public/private-media/${privatePath}`,
    );
    expect(privateTry.status).not.toBe(200);
    expect((await anon.from("public_profiles").select("slug").eq("slug", slugB)).data).toEqual([]);
    expect(sql(`select count(*) from storage.objects where bucket_id = 'public-media'`)).toBe("1");

    await context.close();
  });

  test("editing after publishing leaves the public version unchanged", async ({ browser }) => {
    const { context, page } = await pageFor(browser, "ownerA");

    await page.goto(`/organizer/profiles/${profileA}/edit`);
    await page.getByLabel("Kurzvorstellung").fill("A new text that is not public yet.");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("Gespeichert. Der Entwurf bleibt privat.")).toBeVisible();

    const anon = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    const rows = await anon.from("public_profiles").select("short_intro").eq("slug", slugA);
    expect(rows.data![0].short_intro).toBe("Alpha Events nights.");

    await page.goto(`/organizer/profiles/${profileA}/preview`);
    await expect(page.getByRole("button", { name: "Änderungen veröffentlichen" })).toBeVisible();

    await context.close();
  });
});
