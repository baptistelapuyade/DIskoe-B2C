import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";

import type { Database } from "../lib/db/types";

import {
  clearMailbox,
  mailsWithSubject,
  waitForCode,
  waitForMail,
} from "./support/inbucket";
import { makeFounder, provisionAs, sql, userIdByEmail } from "./support/seed";

// Needs the local Supabase stack (see the e2e-auth CI job). Covers the
// founder's decision (approval that publishes at once, or a question), the copy
// of the image into the public bucket and the owner's later publication.

const BASE_URL = "http://127.0.0.1:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

// The CI serves the app with `next dev`, which compiles routes on first use.
const SLOW = { timeout: 20_000 };

const run = `q${Date.now().toString(36)}`;
const emails = {
  founder: `founder-${run}@example.test`,
  ownerA: `owner-a-${run}@example.test`,
  ownerB: `owner-b-${run}@example.test`,
  visitor: `visitor-${run}@example.test`,
};
const QUESTION_MAIL = /Eine Frage zu deinem Profil/;
const LIVE_MAIL = /ist jetzt live/;
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
  let correctedB = "";
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

  test("the founder reaches the review list through a link, an owner does not see it", async ({ browser }) => {
    const founder = await pageFor(browser, "founder");
    await founder.page.goto("/organizer");
    const link = founder.page.getByRole("link", { name: /^Prüfung( \(\d+\))?$/ });
    await expect(link).toBeVisible(SLOW);
    await link.click();
    await expect(founder.page.getByRole("heading", { name: "Profile zur Prüfung" })).toBeVisible(SLOW);
    // The internal pages have their own way back and out.
    await expect(founder.page.getByRole("link", { name: "Organizer-Ansicht" })).toBeVisible();
    await founder.context.close();

    const owner = await pageFor(browser, "ownerA");
    await owner.page.goto("/organizer");
    await expect(owner.page.getByRole("button", { name: "Abmelden" })).toBeVisible(SLOW);
    await expect(owner.page.getByRole("link", { name: /^Prüfung/ })).toHaveCount(0);
    await owner.context.close();
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

  test("the founder asks a question instead of approving", async ({ browser }) => {
    const { context, page } = await pageFor(browser, "founder");

    await page.goto(`/internal/approvals/${profileB}`);
    await expect(page.getByRole("heading", { name: "Beta Events", exact: true })).toBeVisible();

    await page.getByLabel("Deine Frage an den Organizer").fill("Der Link scheint nicht zu funktionieren.");
    await page.getByRole("button", { name: "Rückfrage stellen" }).click();
    // The form disappears after the save; the page keeps the facts.
    await expect(page.getByText("Zu diesem Stand ist eine Rückfrage gestellt.", { exact: false })).toBeVisible(SLOW);
    await expect(page.getByRole("heading", { name: "Gestellte Rückfrage" })).toBeVisible();

    expect(
      sql(`select count(*) from public.review_requests where profile_id = '${profileB}' and revision_id = '${revisionB}'`),
    ).toBe("1");
    expect(sql(`select publication_state from public.profiles where id = '${profileB}'`)).toBe("private");

    // The organizer gets one system mail: no question text, no token, only a
    // link to the sign-in protected start page.
    const questionMail = await waitForMail(emails.ownerB, QUESTION_MAIL);
    expect(questionMail.body).toContain("keine Absage");
    expect(questionMail.body).toContain(`${BASE_URL}/organizer/profiles/${profileB}/status`);
    expect(questionMail.body).not.toContain("Der Link scheint nicht zu funktionieren.");
    expect(await mailsWithSubject(emails.ownerB, QUESTION_MAIL)).toHaveLength(1);
    expect(await mailsWithSubject(emails.ownerA, QUESTION_MAIL)).toHaveLength(0);
    await expect(page.getByText("Mail vom Anbieter angenommen")).toBeVisible();
    expect(sql(`select status || ':' || attempts from public.profile_mails where profile_id = '${profileB}' and kind = 'profile_question'`)).toBe("sent:1");
    await expect(page.getByRole("button", { name: /^Mail (erneut )?senden$/ })).toHaveCount(0);

    // A failed mail is shown as failed and can be sent again from the page.
    sql(`update public.profile_mails set status = 'failed' where profile_id = '${profileB}' and kind = 'profile_question'`);
    await page.reload();
    await expect(page.getByText("Mail fehlgeschlagen").first()).toBeVisible();
    await page.getByRole("button", { name: "Mail erneut senden" }).click();
    await expect(page.getByText("Mail vom Anbieter angenommen")).toBeVisible(SLOW);
    expect(sql(`select status || ':' || attempts from public.profile_mails where profile_id = '${profileB}' and kind = 'profile_question'`)).toBe("sent:2");
    expect(await mailsWithSubject(emails.ownerB, QUESTION_MAIL)).toHaveLength(2);

    // The question moves to its own tab.
    await page.goto("/internal/approvals?tab=question");
    await expect(page.getByText(`/${slugB} ·`)).toBeVisible();
    await page.goto("/internal/approvals?tab=open");
    await expect(page.getByText(`/${slugB} ·`)).toHaveCount(0);

    await context.close();
  });

  test("the owner reads the question, cannot hand in the same revision again", async ({ browser }) => {
    const resubmit = await ownerBApi.rpc("submit_profile_for_review", {
      p_profile_id: profileB,
      p_expected_draft_revision_id: revisionB,
      p_confirmed_rights: true,
      p_confirmed_usage: true,
    });
    expect(resubmit.error?.code).toBe("DK003");

    const { context, page } = await pageFor(browser, "ownerB");
    await page.goto("/organizer");
    await expect(page.getByText("Der Link scheint nicht zu funktionieren.")).toBeVisible();
    await expect(page.getByText("Das ist keine Absage.", { exact: false })).toBeVisible();
    await page.getByRole("link", { name: "Angabe korrigieren" }).click();
    await expect(page.getByRole("heading", { name: "Wir haben eine Frage zu deinem Profil" })).toBeVisible();
    await expect(page.getByText("Der Link scheint nicht zu funktionieren.")).toBeVisible();

    await context.close();
  });

  test("the founder sees the queue and approves exactly the shown revision", async ({ browser }) => {
    const { context, page } = await pageFor(browser, "founder");

    await page.goto("/internal/approvals");
    await expect(page.getByText(`/${slugA} ·`)).toBeVisible();

    await page.goto(`/internal/approvals/${profileA}`);
    await expect(page.getByRole("heading", { name: "Alpha Events", exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "Bühne" })).toBeVisible();

    const anon = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    expect((await anon.from("public_profiles").select("slug").eq("slug", slugA)).data).toEqual([]);

    await page.getByRole("button", { name: "Freigeben und veröffentlichen" }).click();
    await expect(page.getByText("Dieser Stand wird sofort öffentlich.", { exact: false })).toBeVisible();
    // Still nothing public before the second confirmation.
    expect((await anon.from("public_profiles").select("slug").eq("slug", slugA)).data).toEqual([]);
    await page.getByRole("button", { name: "Ja, freigeben und veröffentlichen" }).click();
    await expect(page.getByText("Freigegeben und veröffentlicht.").first()).toBeVisible(SLOW);

    expect(
      sql(`select count(*) from public.publication_audit where entity_id = '${profileA}' and action in ('approve_first', 'publish') and revision_id = '${revisionA}'`),
    ).toBe("2");
    expect(sql(`select publication_state from public.profiles where id = '${profileA}'`)).toBe("published");
    expect(sql(`select published_revision_id = first_approved_revision_id from public.profiles where id = '${profileA}'`)).toBe("t");

    // Exactly one "live" mail, to the owner of this profile only.
    const liveMail = await waitForMail(emails.ownerA, LIVE_MAIL);
    expect(liveMail.body).toContain("Alpha Events");
    expect(liveMail.body).toContain(`${BASE_URL}/organizer/profiles/${profileA}/status`);
    expect(await mailsWithSubject(emails.ownerA, LIVE_MAIL)).toHaveLength(1);
    expect(await mailsWithSubject(emails.ownerB, LIVE_MAIL)).toHaveLength(0);
    expect(sql(`select status from public.profile_mails where profile_id = '${profileA}' and kind = 'profile_live'`)).toBe("sent");
    await expect(page.getByText("Mail vom Anbieter angenommen").first()).toBeVisible();

    // Nothing to send again once the provider accepted the mail.
    const again = await founderApi.rpc("claim_profile_mail", {
      p_profile_id: profileA,
      p_revision_id: revisionA,
      p_kind: "profile_live",
    });
    expect(again.error).toBeNull();
    expect(again.data).toBeNull();
    await page.reload();
    await expect(page.getByRole("button", { name: /^Mail (erneut )?senden$/ })).toHaveCount(0);

    // Data and image are public; the original stays private.
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

    const privatePath = sql(
      `select a.private_object_path from public.media_assets a join public.media_uses u on u.asset_id = a.id where u.profile_id = '${profileA}'`,
    );
    const privateTry = await fetch(
      `${SUPABASE_URL}/storage/v1/object/public/private-media/${privatePath}`,
    );
    expect(privateTry.status).not.toBe(200);
    expect(sql(`select count(*) from storage.objects where bucket_id = 'public-media' and name like 'profiles/${profileA}/%'`)).toBe("1");

    // The profile moved to the finished tab; the other one is still private.
    await page.goto("/internal/approvals?tab=done");
    await expect(page.getByText(`/${slugA} ·`)).toBeVisible();
    await page.goto("/internal/approvals?tab=open");
    await expect(page.getByText(`/${slugA} ·`)).toHaveCount(0);
    expect((await anon.from("public_profiles").select("slug").eq("slug", slugB)).data).toEqual([]);

    await context.close();
  });

  test("a changed draft cannot be approved on the old preview", async () => {
    // Owner B edits after the hand-in: the app creates a new revision.
    const imageUse = sql(
      `select profile_image_use_id from public.profile_revisions where id = '${revisionB}'`,
    );
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

    // The new draft has no image yet, so it is incomplete.
    const incomplete = await founderApi.rpc("approve_first_profile", {
      p_profile_id: profileB,
      p_expected_draft_revision_id: next.data!.id,
    });
    expect(incomplete.error?.code).toBe("DK002");

    // The owner completes the correction and hands it in again.
    const linked = await ownerBApi
      .from("profile_revisions")
      .update({ profile_image_use_id: imageUse })
      .eq("id", next.data!.id)
      .select("id");
    expect(linked.data).toHaveLength(1);

    // Complete but not handed in yet: approval is refused.
    const unsubmitted = await founderApi.rpc("approve_first_profile", {
      p_profile_id: profileB,
      p_expected_draft_revision_id: next.data!.id,
    });
    expect(unsubmitted.error?.code).toBe("DK003");

    const submit = await ownerBApi.rpc("submit_profile_for_review", {
      p_profile_id: profileB,
      p_expected_draft_revision_id: next.data!.id,
      p_confirmed_rights: true,
      p_confirmed_usage: true,
    });
    expect(submit.error).toBeNull();
    correctedB = next.data!.id;
  });

  test("the corrected profile is approved and published in one step", async ({ browser }) => {
    const { context, page } = await pageFor(browser, "founder");

    await page.goto("/internal/approvals?tab=open");
    await expect(page.getByText(`/${slugB} ·`)).toBeVisible();

    await page.goto(`/internal/approvals/${profileB}`);
    await page.getByRole("button", { name: "Freigeben und veröffentlichen" }).click();
    await page.getByRole("button", { name: "Ja, freigeben und veröffentlichen" }).click();
    await expect(page.getByText("Freigegeben und veröffentlicht.").first()).toBeVisible(SLOW);

    expect(sql(`select published_revision_id = '${correctedB}' from public.profiles where id = '${profileB}'`)).toBe("t");
    expect(sql(`select count(*) from storage.objects where bucket_id = 'public-media' and name like 'profiles/${profileB}/%'`)).toBe("1");
    await waitForMail(emails.ownerB, LIVE_MAIL);
    expect(await mailsWithSubject(emails.ownerB, LIVE_MAIL)).toHaveLength(1);

    await context.close();
  });

  test("after the approval the owner sees a live profile and may keep editing", async ({ browser }) => {
    // The first publication is not an owner step any more.
    const again = await ownerAApi.rpc("publish_profile", {
      p_profile_id: profileA,
      p_expected_draft_revision_id: revisionA,
    });
    expect(again.error?.code).toBe("DK001");

    const { context, page } = await pageFor(browser, "ownerA");
    await page.goto("/organizer");
    await expect(page.getByText("Dein Profil ist veröffentlicht.")).toBeVisible(SLOW);
    await expect(page.getByText("Änderungen bleiben privat, bis du sie selbst bestätigst.")).toBeVisible();

    await page.goto(`/organizer/profiles/${profileA}/edit`);
    await expect(page.getByText("DISKOE hat dieses Profil freigegeben.", { exact: false })).toHaveCount(0);
    await page.getByLabel("Kurzvorstellung").fill("A new text that is not public yet.");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("Gespeichert. Der Entwurf bleibt privat.")).toBeVisible(SLOW);

    const anon = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    const rows = await anon.from("public_profiles").select("short_intro").eq("slug", slugA);
    expect(rows.data![0].short_intro).toBe("Alpha Events nights.");

    await page.goto(`/organizer/profiles/${profileA}/preview`);
    await expect(page.getByRole("button", { name: "Änderungen veröffentlichen" })).toBeVisible();

    await context.close();
  });

  test("later changes are published only after the owner's own confirmation", async ({ browser }) => {
    const { context, page } = await pageFor(browser, "ownerA");
    await page.goto(`/organizer/profiles/${profileA}/preview`);

    await page.getByRole("button", { name: "Änderungen veröffentlichen" }).click();
    await expect(page.getByText("Die geänderten Angaben werden öffentlich sichtbar. Jetzt veröffentlichen?")).toBeVisible();
    await page.getByRole("button", { name: "Ja, jetzt veröffentlichen" }).click();
    // The publish form disappears once the draft is the published revision.
    await expect(page.getByText("Dein Profil ist veröffentlicht.")).toBeVisible(SLOW);

    const anon = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    const rows = await anon.from("public_profiles").select("short_intro").eq("slug", slugA);
    expect(rows.data![0].short_intro).toBe("A new text that is not public yet.");

    await context.close();
  });
});
