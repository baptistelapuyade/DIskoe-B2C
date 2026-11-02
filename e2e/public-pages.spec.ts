import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

import type { Database } from "../lib/db/types";

import { clearMailbox, waitForCode } from "./support/inbucket";
import { makeFounder, provisionAs, sql, userIdByEmail } from "./support/seed";

// Needs the local Supabase stack (see the e2e-auth CI job). Slice 6: the public
// pages show the confirmed, published state without a login, and nothing else.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const SLOW = { timeout: 20_000 };

const run = `s${Date.now().toString(36)}`;
const emails = {
  founder: `founder-${run}@example.test`,
  owner: `owner-${run}@example.test`,
};
const profileSlug = `pub-${run}`;
const LIVE = { title: `Zwischen den Boxen ${run}`, slug: `pub-live-${run}` };
const CANCELLED = { title: `Abgesagte Nacht ${run}`, slug: `pub-cancelled-${run}` };
const POSTPONED = { title: `Verschobene Nacht ${run}`, slug: `pub-postponed-${run}` };
const DRAFT = { title: `Privater Entwurf ${run}`, slug: `pub-draft-${run}` };

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

type Api = SupabaseClient<Database>;

type Ids = { eventId: string; revisionId: string; useId: string; title: string };

// revision_no is assigned by a database trigger and is not grantable to clients;
// the generated type still lists it as required (same workaround as lib/event).
type NewEventRevision = Omit<
  Database["public"]["Tables"]["event_revisions"]["Insert"],
  "revision_no"
>;

function asInsert(row: NewEventRevision) {
  return row as Database["public"]["Tables"]["event_revisions"]["Insert"];
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

async function uploadConfirmedImage(
  client: Api,
  userId: string,
  use: { profile_id: string; role: "profile_image" } | { event_id: string; role: "event_image" },
  altText: string | null,
): Promise<string> {
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

  const created = await client
    .from("media_uses")
    .insert({ asset_id: asset.data!.id, alt_text: altText, ...use })
    .select("id")
    .single();
  expect(created.error).toBeNull();

  const confirmed = await client
    .from("media_uses")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("id", created.data!.id)
    .select("id");
  expect(confirmed.data).toHaveLength(1);

  return created.data!.id;
}

// The revision row of a complete event, as the editor would leave it.
function completeRow(
  eventId: string,
  userId: string,
  title: string,
  useId: string,
  description = `${title}: eine Nacht im Nebenraum.`,
) {
  return asInsert({
    event_id: eventId,
    created_by: userId,
    title_state: "provided",
    title,
    description_state: "provided",
    description,
    format_state: "provided",
    primary_format: "club_night",
    start_state: "provided",
    start_at: "2027-06-05T21:00:00Z",
    end_state: "unknown",
    place_state: "provided",
    place_name: "Halle 3",
    address_line: "Hauptstraße 1",
    postal_code: "10115",
    city: "Berlin",
    price_state: "unknown",
    price_model: "unknown",
    access_state: "provided",
    access_routes: [{ kind: "walk_in" }, { kind: "online_ticket", url: "https://tickets.example.test/x" }],
    atmosphere_state: "provided",
    atmosphere_tags: ["Gemütlich"],
    event_image_use_id: useId,
  });
}

// A complete private event with a confirmed image, as the editor would leave it.
async function createCompleteEvent(
  client: Api,
  userId: string,
  profileId: string,
  title: string,
  eventSlug: string,
  altText: string | null,
): Promise<Ids> {
  const event = await client
    .from("events")
    .insert({ organizer_id: profileId, slug: eventSlug })
    .select("id")
    .single();
  expect(event.error).toBeNull();
  const eventId = event.data!.id;

  const useId = await uploadConfirmedImage(
    client,
    userId,
    { event_id: eventId, role: "event_image" },
    altText,
  );

  const revision = await client
    .from("event_revisions")
    .insert(completeRow(eventId, userId, title, useId))
    .select("id")
    .single();
  expect(revision.error).toBeNull();

  const pointed = await client
    .from("events")
    .update({ draft_revision_id: revision.data!.id })
    .eq("id", eventId)
    .select("id");
  expect(pointed.data).toHaveLength(1);

  return { eventId, revisionId: revision.data!.id, useId, title };
}


test.describe.configure({ mode: "serial" });

test.describe("public pages", () => {
  test.setTimeout(240_000);

  let ownerApi: Api;
  let ownerId = "";
  let profileId = "";
  let live: Ids;
  let cancelled: Ids;
  let postponed: Ids;

  function stateOf(ids: Ids) {
    const [version, status, published] = sql(
      `select state_version || ',' || public_status || ',' || published_revision_id from public.events where id = '${ids.eventId}'`,
    ).split(",");

    return {
      p_event_id: ids.eventId,
      p_expected_published_revision_id: published,
      p_expected_state_version: Number(version),
      p_expected_status: status as Database["public"]["Enums"]["event_status"],
    };
  }

  async function publishAlone(ids: Ids) {
    const state = sql(
      `select state_version || ',' || public_status from public.events where id = '${ids.eventId}'`,
    ).split(",");
    const published = await ownerApi.rpc("publish_event", {
      p_event_id: ids.eventId,
      p_expected_draft_revision_id: ids.revisionId,
      p_expected_published_revision_id: null as unknown as string,
      p_expected_state_version: Number(state[0]),
      p_expected_status: state[1] as Database["public"]["Enums"]["event_status"],
      p_confirmed_rights: true,
      p_confirmed_usage: true,
    });
    expect(published.error).toBeNull();
  }

  test.beforeAll(async () => {
    test.setTimeout(300_000);

    // Sign-in creates the users; the founder and owner never use a browser here.
    const founderApi = await apiClientFor(emails.founder);
    ownerApi = await apiClientFor(emails.owner);
    ownerId = userIdByEmail(emails.owner);
    const founderId = userIdByEmail(emails.founder);
    makeFounder(founderId);
    profileId = provisionAs(founderId, ownerId, profileSlug, "Pub Kollektiv");

    const profileRevision = sql(
      `select draft_revision_id from public.profiles where id = '${profileId}'`,
    );
    const profileUse = await uploadConfirmedImage(
      ownerApi,
      ownerId,
      { profile_id: profileId, role: "profile_image" },
      null,
    );
    const filled = await ownerApi
      .from("profile_revisions")
      .update({
        name: "Pub Kollektiv",
        short_intro: "Pub Kollektiv macht Nächte.",
        official_url: "https://pub.example/",
        profile_image_use_id: profileUse,
      })
      .eq("id", profileRevision)
      .select("id");
    expect(filled.data).toHaveLength(1);

    live = await createCompleteEvent(ownerApi, ownerId, profileId, LIVE.title, LIVE.slug, null);
    const submit = await ownerApi.rpc("submit_first_publication", {
      p_profile_id: profileId,
      p_expected_draft_revision_id: profileRevision,
      p_event_id: live.eventId,
      p_expected_event_draft_revision_id: live.revisionId,
      p_confirmed_rights: true,
      p_confirmed_usage: true,
    });
    expect(submit.error).toBeNull();
    const approved = await founderApi.rpc("approve_first_publication", {
      p_profile_id: profileId,
      p_expected_draft_revision_id: profileRevision,
      p_event_id: live.eventId,
      p_expected_event_draft_revision_id: live.revisionId,
    });
    expect(approved.error).toBeNull();

    cancelled = await createCompleteEvent(ownerApi, ownerId, profileId, CANCELLED.title, CANCELLED.slug, null);
    await publishAlone(cancelled);
    const cancel = await ownerApi.rpc("cancel_event", stateOf(cancelled));
    expect(cancel.error).toBeNull();

    postponed = await createCompleteEvent(ownerApi, ownerId, profileId, POSTPONED.title, POSTPONED.slug, null);
    await publishAlone(postponed);
    const postpone = await ownerApi.rpc("postpone_event", stateOf(postponed));
    expect(postpone.error).toBeNull();

    // Never published: stays private.
    await createCompleteEvent(ownerApi, ownerId, profileId, DRAFT.title, DRAFT.slug, null);
  });

  test("a live event is public without login, with meta tags and JSON-LD", async ({ page }) => {
    const response = await page.goto(`/e/${LIVE.slug}`);
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1, name: LIVE.title })).toBeVisible(SLOW);
    await expect(page.getByText("Club", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Sa., 05.06.2027").first()).toBeVisible();
    await expect(page.getByText("Preis noch offen").first()).toBeVisible();
    await expect(page.getByText("Frei", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Pub Kollektiv/ }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Zum Ticketanbieter/ })).toHaveAttribute(
      "href",
      "https://tickets.example.test/x",
    );

    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      new RegExp(LIVE.title),
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/e/${LIVE.slug}$`),
    );

    const jsonLd = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}",
    );
    expect(jsonLd["@type"]).toBe("Event");
    expect(jsonLd.name).toBe(LIVE.title);
    expect(jsonLd.eventStatus).toBe("https://schema.org/EventScheduled");
    // The price is unknown: no offer, and no price 0.
    expect(jsonLd.offers).toBeUndefined();
    expect(jsonLd.startDate).toBe("2027-06-05T21:00:00.000Z");
  });

  test("a cancelled event is marked and offers no ticket", async ({ page }) => {
    const response = await page.goto(`/e/${CANCELLED.slug}`);
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("status").getByText("Abgesagt")).toBeVisible(SLOW);
    await expect(page.getByRole("link", { name: /Zum Ticketanbieter/ })).toHaveCount(0);

    const jsonLd = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}",
    );
    expect(jsonLd.eventStatus).toBe("https://schema.org/EventCancelled");
  });

  test("an event postponed without a date shows no date", async ({ page }) => {
    await page.goto(`/e/${POSTPONED.slug}`);

    await expect(page.getByRole("status").getByText("Neuer Termin folgt")).toBeVisible(SLOW);
    await expect(page.getByText("Sa., 05.06.2027")).toHaveCount(0);

    const jsonLd = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}",
    );
    expect(jsonLd.startDate).toBeUndefined();
  });

  test("a draft and an unknown address are not found", async ({ page }) => {
    const draft = await page.goto(`/e/${DRAFT.slug}`);
    expect(draft?.status()).toBe(404);
    await expect(page.getByText(DRAFT.title)).toHaveCount(0);

    const unknown = await page.goto(`/e/does-not-exist-${run}`);
    expect(unknown?.status()).toBe(404);

    // A reserved word is not a profile.
    const reserved = await page.goto("/impressum");
    expect(reserved?.status()).toBe(404);
  });

  test("the profile page lists upcoming events, not cancelled or private ones", async ({ page }) => {
    const response = await page.goto(`/${profileSlug}`);
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1, name: "Pub Kollektiv" })).toBeVisible(SLOW);
    await expect(page.getByRole("link", { name: new RegExp(LIVE.title) })).toHaveAttribute(
      "href",
      `/e/${LIVE.slug}`,
    );
    // Postponed without a date: listed, without a date.
    const postponedLink = page.getByRole("link", { name: new RegExp(POSTPONED.title) });
    await expect(postponedLink).toContainText("Neuer Termin folgt");
    await expect(page.getByText(CANCELLED.title)).toHaveCount(0);
    await expect(page.getByText(DRAFT.title)).toHaveCount(0);
    await expect(page.getByText("Neue Termine folgen")).toHaveCount(0);
  });

  test("the sitemap lists public addresses only", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const xml = await response.text();

    expect(xml).toContain(`/e/${LIVE.slug}<`);
    expect(xml).toContain(`/e/${POSTPONED.slug}<`);
    expect(xml).toContain(`/${profileSlug}<`);
    expect(xml).not.toContain(CANCELLED.slug);
    expect(xml).not.toContain(DRAFT.slug);
  });

  test("robots.txt keeps the private areas out and names the sitemap", async ({ request }) => {
    const text = await (await request.get("/robots.txt")).text();

    expect(text).toContain("Disallow: /organizer");
    expect(text).toContain("Disallow: /internal");
    expect(text).toMatch(/Sitemap: .*\/sitemap\.xml/);
  });

  test("a profile without upcoming events says that new dates follow", async ({ page }) => {
    expect((await ownerApi.rpc("cancel_event", stateOf(live))).error).toBeNull();
    expect((await ownerApi.rpc("cancel_event", stateOf(postponed))).error).toBeNull();

    await page.goto(`/${profileSlug}`);
    await expect(page.getByText("Neue Termine folgen.")).toBeVisible(SLOW);
    await expect(page.getByText(LIVE.title)).toHaveCount(0);
  });
});
