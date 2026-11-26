import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";

import type { Database } from "../lib/db/types";

import { clearMailbox, waitForCode } from "./support/inbucket";
import { makeFounder, provisionAs, sql, userIdByEmail } from "./support/seed";
import { germanContext } from "./support/language";

// Needs the local Supabase stack (see the e2e-auth CI job). Covers the rest of
// Slice 5: a live event is cancelled, postponed without a date and then given a
// replacement date, which publishes no other private change.

const BASE_URL = "http://127.0.0.1:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const SLOW = { timeout: 20_000 };

const run = `s${Date.now().toString(36)}`;
const emails = {
  founder: `founder-${run}@example.test`,
  owner: `owner-${run}@example.test`,
};
const slug = `delta-${run}`;
// The run suffix keeps the titles unique among the other specs' events.
const CANCEL_TITLE = `Zwischen den Boxen ${run}`;
const MOVE_TITLE = `Nachschlag ${run}`;
const BLOCKED_TITLE = `Zugabe ${run}`;
const EDIT_TITLE = `Hofkonzert ${run}`;

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
    access_routes: [{ kind: "walk_in" }],
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
  altText: string | null,
): Promise<Ids> {
  const event = await client
    .from("events")
    .insert({ organizer_id: profileId, slug: `${title.toLowerCase().replace(/[^a-z]/g, "-")}-${run}` })
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

// The management page after an action. If the form stays, its message tells why.
async function expectManagePage(page: Page, eventId: string) {
  try {
    await expect(page).toHaveURL(new RegExp(`/events/${eventId}/manage$`), SLOW);
  } catch (error) {
    const messages = await page.locator('[role="alert"], [role="status"]').allTextContents();
    throw new Error(`Still on ${page.url()}: ${messages.join(" | ") || "no message"}`, { cause: error });
  }
}

test.describe.configure({ mode: "serial" });

test.describe("cancel and reschedule a live event", () => {
  test.setTimeout(240_000);

  let ownerState: Awaited<ReturnType<BrowserContext["storageState"]>>;
  let founderState: Awaited<ReturnType<BrowserContext["storageState"]>>;
  let ownerApi: Api;
  let ownerId = "";
  let profileId = "";
  let cancel: Ids;
  let move: Ids;
  let blocked: Ids;
  let edit: Ids;

  async function signIn(browser: Browser, email: string) {
    const context = await germanContext(browser, { baseURL: BASE_URL });
    const page = await context.newPage();
    await clearMailbox(email);
    await page.goto("/login");
    await page.getByLabel("E-Mail-Adresse").fill(email);
    await page.getByRole("button", { name: "Code senden" }).click();
    await page.getByLabel("Code aus der E-Mail").fill(await waitForCode(email));
    await page.getByRole("button", { name: "Anmelden", exact: true }).click();
    await page.waitForURL("**/organizer");
    const state = await context.storageState();
    await context.close();
    return state;
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

  // A private change: a new draft revision with another description.
  async function privateChange(ids: Ids, description: string) {
    const created = await ownerApi
      .from("event_revisions")
      .insert(completeRow(ids.eventId, ownerId, ids.title, ids.useId, description))
      .select("id")
      .single();
    expect(created.error).toBeNull();
    const pointed = await ownerApi
      .from("events")
      .update({ draft_revision_id: created.data!.id })
      .eq("id", ids.eventId)
      .select("id");
    expect(pointed.data).toHaveLength(1);
  }

  function publicEvent(title: string) {
    const anon = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });

    return anon
      .from("public_events")
      .select("public_status, description, start_at")
      .eq("title", title)
      .maybeSingle();
  }

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(300_000);

    founderState = await signIn(browser, emails.founder);
    ownerApi = await apiClientFor(emails.owner);
    ownerId = userIdByEmail(emails.owner);
    const founderId = userIdByEmail(emails.founder);
    makeFounder(founderId);
    profileId = provisionAs(founderId, ownerId, slug, "Delta Kollektiv");
    ownerState = await signIn(browser, emails.owner);

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
        name: "Delta Kollektiv",
        short_intro: "Delta Kollektiv macht Nächte.",
        official_url: "https://delta.example/",
        profile_image_use_id: profileUse,
      })
      .eq("id", profileRevision)
      .select("id");
    expect(filled.data).toHaveLength(1);

    // The first event goes through the founder, the others are published by
    // the owner. All three are live before the tests start.
    cancel = await createCompleteEvent(ownerApi, ownerId, profileId, CANCEL_TITLE, null);
    const submit = await ownerApi.rpc("submit_first_publication", {
      p_profile_id: profileId,
      p_expected_draft_revision_id: profileRevision,
      p_event_id: cancel.eventId,
      p_expected_event_draft_revision_id: cancel.revisionId,
      p_confirmed_rights: true,
      p_confirmed_usage: true,
    });
    expect(submit.error).toBeNull();

    const founderApi = await apiClientFor(emails.founder);
    const approved = await founderApi.rpc("approve_first_publication", {
      p_profile_id: profileId,
      p_expected_draft_revision_id: profileRevision,
      p_event_id: cancel.eventId,
      p_expected_event_draft_revision_id: cancel.revisionId,
    });
    expect(approved.error).toBeNull();

    move = await createCompleteEvent(ownerApi, ownerId, profileId, MOVE_TITLE, null);
    await publishAlone(move);
    blocked = await createCompleteEvent(ownerApi, ownerId, profileId, BLOCKED_TITLE, null);
    await publishAlone(blocked);
    edit = await createCompleteEvent(ownerApi, ownerId, profileId, EDIT_TITLE, null);
    await publishAlone(edit);
  });

  test("cancelling needs its own confirmation and publishes no private change", async ({ browser }) => {
    await privateChange(cancel, "Private Korrektur, noch nicht veröffentlicht.");
    const publishedBefore = sql(
      `select published_revision_id from public.events where id = '${cancel.eventId}'`,
    );

    const context = await germanContext(browser, { baseURL: BASE_URL, storageState: ownerState });
    const page = await context.newPage();

    await page.goto(`/organizer/events/${cancel.eventId}/manage`);
    // The event has a private change, so the page is "live with changes"
    // (EVM-01b); moving and cancelling stay available there.
    await expect(page.getByRole("link", { name: "Absagen", exact: true })).toBeVisible(SLOW);
    await page.getByRole("link", { name: "Absagen", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Event wirklich absagen?" })).toBeVisible(SLOW);
    await expect(page.getByText(CANCEL_TITLE).first()).toBeVisible();

    // "Nicht absagen" leaves without a change.
    await page.getByRole("link", { name: "Nicht absagen" }).click();
    await expectManagePage(page, cancel.eventId);
    expect(sql(`select public_status from public.events where id = '${cancel.eventId}'`)).toBe("scheduled");

    // EVA-01b: without the tick nothing happens.
    await page.goto(`/organizer/events/${cancel.eventId}/cancel`);
    await page.getByRole("button", { name: "Event absagen" }).click();
    await expect(page.getByText("Bitte bestätige die Absage.")).toBeVisible(SLOW);
    expect(sql(`select public_status from public.events where id = '${cancel.eventId}'`)).toBe("scheduled");

    // EVA-01a and EVA-02: with the tick the cancellation is public.
    await page.getByRole("checkbox", { name: "Ich sage dieses Event ab." }).click();
    await page.getByRole("button", { name: "Event absagen" }).click();
    await expect(page).toHaveURL(new RegExp(`/events/${cancel.eventId}/cancelled$`), SLOW);
    await expect(page.getByRole("heading", { name: "Die Absage ist öffentlich" })).toBeVisible(SLOW);
    await page.getByRole("link", { name: "Zur Eventverwaltung" }).click();
    await expectManagePage(page, cancel.eventId);
    await expect(page.getByText("Dieses Event ist als abgesagt veröffentlicht.")).toBeVisible(SLOW);
    await expect(page.getByRole("link", { name: "Absagen", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Verschieben", exact: true })).toHaveCount(0);

    expect(sql(`select public_status from public.events where id = '${cancel.eventId}'`)).toBe("cancelled");
    expect(sql(`select published_revision_id from public.events where id = '${cancel.eventId}'`)).toBe(publishedBefore);
    const publicRow = await publicEvent(CANCEL_TITLE);
    expect(publicRow.data?.public_status).toBe("cancelled");
    expect(publicRow.data?.description).not.toContain("Private Korrektur");

    // The cancel page of a cancelled event leads back.
    await page.goto(`/organizer/events/${cancel.eventId}/cancel`);
    await expect(page).toHaveURL(new RegExp(`/events/${cancel.eventId}/manage$`));

    // EVV-06: the cancelled event comes back with a new date. A start in the
    // past is refused, the private change stays private.
    await page.getByRole("link", { name: "Neuen Termin setzen" }).first().click();
    await expect(page).toHaveURL(new RegExp(`/events/${cancel.eventId}/reopen$`), SLOW);
    await expect(page.getByRole("heading", { name: "Event mit neuem Termin wieder öffnen" })).toBeVisible(SLOW);
    await page.getByLabel("Neues Datum").fill("01.01.2025");
    await page.getByLabel("Beginn").fill("20:00");
    await page.getByRole("button", { name: "Event wieder öffnen" }).click();
    await expect(page.getByText("Der Termin liegt in der Vergangenheit.")).toBeVisible(SLOW);
    expect(sql(`select public_status from public.events where id = '${cancel.eventId}'`)).toBe("cancelled");

    await page.getByLabel("Neues Datum").fill("10.08.2027");
    await page.getByLabel("Beginn").fill("20:00");
    await page.getByRole("button", { name: "Event wieder öffnen" }).click();
    await expect(page).toHaveURL(new RegExp(`/events/${cancel.eventId}/reopened$`), SLOW);
    await expect(page.getByRole("heading", { name: "Das Event ist wieder öffentlich" })).toBeVisible(SLOW);

    expect(sql(`select public_status from public.events where id = '${cancel.eventId}'`)).toBe("rescheduled");
    expect(sql(`select published_revision_id from public.events where id = '${cancel.eventId}'`)).not.toBe(publishedBefore);
    const reopened = await publicEvent(CANCEL_TITLE);
    expect(reopened.data?.public_status).toBe("rescheduled");
    // 20:00 Berlin summer time is 18:00 UTC.
    expect(new Date(reopened.data!.start_at!).toISOString()).toBe("2027-08-10T18:00:00.000Z");
    expect(reopened.data?.description).not.toContain("Private Korrektur");
    await context.close();
  });

  test("postponing without a date, then giving a replacement date", async ({ browser }) => {
    const context = await germanContext(browser, { baseURL: BASE_URL, storageState: ownerState });
    const page = await context.newPage();

    await page.goto(`/organizer/events/${move.eventId}/reschedule`);
    await expect(page.getByRole("heading", { name: "Event verschieben" })).toBeVisible(SLOW);
    await page.getByRole("link", { name: "Termin steht noch nicht fest" }).click();
    await expect(page.getByRole("heading", { name: "Verschieben ohne neuen Termin" })).toBeVisible(SLOW);
    await page.getByRole("button", { name: "Ohne Termin verschieben" }).click();

    // EVV-04b: the postponement is public.
    await expect(page).toHaveURL(new RegExp(`/events/${move.eventId}/postponed$`), SLOW);
    await expect(page.getByRole("heading", { name: "Verschiebung ist öffentlich" })).toBeVisible(SLOW);
    expect(sql(`select public_status from public.events where id = '${move.eventId}'`)).toBe("postponed_undated");
    expect((await publicEvent(MOVE_TITLE)).data?.public_status).toBe("postponed_undated");

    // Without a date the only way on is a replacement date (EVV-05a).
    await page.getByRole("link", { name: "Ersatztermin eintragen" }).click();
    await expect(page.getByRole("heading", { name: "Ersatztermin eintragen" })).toBeVisible(SLOW);
    await expect(page.getByRole("link", { name: "Termin steht noch nicht fest" })).toHaveCount(0);

    // Nothing entered: the start is named.
    await page.getByRole("button", { name: "Termin eintragen" }).click();
    await expect(page.getByText("Gib das Datum an.")).toBeVisible(SLOW);

    // EVV-01b: a start in the past is refused.
    await page.getByLabel("Neues Datum").fill("01.01.2025");
    await page.getByLabel("Beginn").fill("20:00");
    await page.getByRole("button", { name: "Termin eintragen" }).click();
    await expect(page.getByText("Der Termin liegt in der Vergangenheit.")).toBeVisible(SLOW);

    // The old start is not a replacement.
    await page.getByLabel("Neues Datum").fill("05.06.2027");
    await page.getByLabel("Beginn").fill("23:00");
    await page.getByRole("button", { name: "Termin eintragen" }).click();
    await expect(page.getByText("Das ist der bisherige Termin. Wähle einen anderen.")).toBeVisible(SLOW);

    await page.getByLabel("Neues Datum").fill("10.07.2027");
    await page.getByLabel("Beginn").fill("21:00");
    await page.getByRole("button", { name: "Termin eintragen" }).click();

    // EVV-05b: the date is entered.
    await expect(page).toHaveURL(new RegExp(`/events/${move.eventId}/scheduled$`), SLOW);
    await expect(page.getByRole("heading", { name: "Der Termin ist eingetragen" })).toBeVisible(SLOW);
    await page.getByRole("link", { name: "Zur Eventverwaltung" }).click();
    await expectManagePage(page, move.eventId);
    // A moved event is live again with the new date (no extra state in Figma).
    await expect(page.getByText("Sa, 10.7.2027, 21:00", { exact: false }).first()).toBeVisible(SLOW);

    expect(sql(`select public_status from public.events where id = '${move.eventId}'`)).toBe("rescheduled");
    const row = await publicEvent(MOVE_TITLE);
    expect(row.data?.public_status).toBe("rescheduled");
    // 21:00 Berlin summer time is 19:00 UTC.
    expect(new Date(row.data!.start_at!).toISOString()).toBe("2027-07-10T19:00:00.000Z");
    await context.close();
  });

  test("a replacement date publishes no private changes and the draft takes the date", async ({ browser }) => {
    await privateChange(blocked, "Noch nicht veröffentlichte Beschreibung.");
    const context = await germanContext(browser, { baseURL: BASE_URL, storageState: ownerState });
    const page = await context.newPage();

    await page.goto(`/organizer/events/${blocked.eventId}/reschedule`);
    await expect(page.getByRole("heading", { name: "Event verschieben" })).toBeVisible(SLOW);
    await page.getByLabel("Neues Datum").fill("14.08.2027");
    await page.getByLabel("Beginn").fill("20:00");
    await page.getByRole("button", { name: "Termin verschieben" }).click();
    // EVV-04a: the new date is public.
    await expect(page).toHaveURL(new RegExp(`/events/${blocked.eventId}/rescheduled$`), SLOW);
    await expect(page.getByRole("heading", { name: "Der neue Termin ist öffentlich" })).toBeVisible(SLOW);

    expect(sql(`select public_status from public.events where id = '${blocked.eventId}'`)).toBe("rescheduled");
    const row = await publicEvent(BLOCKED_TITLE);
    expect(row.data?.public_status).toBe("rescheduled");
    // 20:00 Berlin summer time is 18:00 UTC; the private text is not public.
    expect(new Date(row.data!.start_at!).toISOString()).toBe("2027-08-14T18:00:00.000Z");
    expect(row.data?.description).not.toContain("Noch nicht veröffentlicht");

    // The draft keeps its private text and has the new date.
    expect(
      sql(
        `select to_char(r.start_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI') || '|' || r.description from public.events e join public.event_revisions r on r.id = e.draft_revision_id where e.id = '${blocked.eventId}'`,
      ),
    ).toBe("2027-08-14T18:00|Noch nicht veröffentlichte Beschreibung.");
    await context.close();
  });

  // The page binds what the owner saw; a change made in between is not
  // overwritten but reported (DK001).
  test("a change made after the page was opened is reported, not overwritten", async ({ browser }) => {
    const first = await germanContext(browser, { baseURL: BASE_URL, storageState: ownerState });
    const second = await germanContext(browser, { baseURL: BASE_URL, storageState: ownerState });
    const one = await first.newPage();
    const two = await second.newPage();

    for (const page of [one, two]) {
      await page.goto(`/organizer/events/${blocked.eventId}/reschedule`);
      await expect(page.getByRole("heading", { name: "Event verschieben" })).toBeVisible(SLOW);
      await expect(page.getByLabel("Neues Datum")).toBeEnabled(SLOW);
    }

    await two.getByLabel("Neues Datum").fill("15.08.2027");
    await two.getByLabel("Beginn").fill("19:00");
    await two.getByRole("button", { name: "Termin verschieben" }).click();
    await expect(two).toHaveURL(new RegExp(`/events/${blocked.eventId}/rescheduled$`), SLOW);

    await one.getByLabel("Neues Datum").fill("16.08.2027");
    await one.getByLabel("Beginn").fill("20:00");
    await one.getByRole("button", { name: "Termin verschieben" }).click();
    await expect(one.getByText("Das Event hat sich geändert.")).toBeVisible(SLOW);
    // What was typed stays, and the other change is public.
    await expect(one.getByLabel("Neues Datum")).toHaveValue("16.08.2027");
    const row = await publicEvent(BLOCKED_TITLE);
    // 19:00 Berlin summer time is 17:00 UTC.
    expect(new Date(row.data!.start_at!).toISOString()).toBe("2027-08-15T17:00:00.000Z");
    await first.close();
    await second.close();
  });

  test("someone else does not reach the pages", async ({ browser }) => {
    const context = await germanContext(browser, { baseURL: BASE_URL, storageState: founderState });
    const page = await context.newPage();

    for (const path of ["cancel", "reschedule"]) {
      await page.goto(`/organizer/events/${blocked.eventId}/${path}`);
      await expect(page.getByRole("button", { name: /absagen|verschieben|bestätigen/i })).toHaveCount(0);
    }
    await context.close();
  });

  // Figma EVB-01 to EVB-06b: a live event is changed in the private draft, the
  // changes are reviewed and published with both confirmations, and a second
  // draft is discarded again.
  test("a live event is changed, published and discarded again", async ({ browser }) => {
    const base = `/organizer/events/${edit.eventId}`;
    const context = await germanContext(browser, { baseURL: BASE_URL, storageState: ownerState });
    const page = await context.newPage();

    // The steps of the first event are not for a live event.
    await page.goto(`${base}/edit`);
    await expect(page).toHaveURL(new RegExp(`${base}/changes/edit$`), SLOW);

    // EVB-01b: a missing title is named, nothing is saved.
    await page.getByLabel("Titel", { exact: true }).fill("");
    await page.getByRole("button", { name: "Änderungen speichern" }).click();
    await expect(page.getByText("Bitte prüfe eine Angabe.")).toBeVisible(SLOW);
    await expect(page.getByText("Gib dem Event einen Titel.")).toBeVisible();

    // An address without the pattern is refused with the example.
    await page.getByLabel("Titel", { exact: true }).fill(`${EDIT_TITLE} im Hof`);
    await page.getByLabel("Adresse", { exact: true }).fill("Nebenstraße 5");
    await page.getByRole("button", { name: "Änderungen speichern" }).click();
    await expect(page.getByText(/Schreibe die Adresse so: Straße Nr\., PLZ Ort/)).toBeVisible(SLOW);

    // EVB-02: saved, and the public page still shows the old title.
    await page.getByLabel("Adresse", { exact: true }).fill("Nebenstraße 5, 10117 Berlin");
    await page.getByLabel("Beginn", { exact: true }).fill("22:00");
    await page.getByRole("button", { name: "Änderungen speichern" }).click();
    await expect(page).toHaveURL(new RegExp(`${base}/changes/saved$`), SLOW);
    expect((await publicEvent(EDIT_TITLE)).data).not.toBeNull();
    expect((await publicEvent(`${EDIT_TITLE} im Hof`)).data).toBeNull();

    // EVB-03b: what changes.
    await page.getByRole("link", { name: "Änderungen prüfen" }).click();
    await expect(page.getByRole("heading", { name: "Das ändert sich" })).toBeVisible(SLOW);
    await expect(page.getByText("Bisher 23:00 Uhr · Neu 22:00 Uhr")).toBeVisible();
    await page.getByRole("link", { name: "Weiter zur Bestätigung" }).click();

    // EVB-04b: both ticks are needed.
    await expect(page.getByRole("heading", { name: "Änderungen veröffentlichen" })).toBeVisible(SLOW);
    await page.getByRole("button", { name: "Jetzt veröffentlichen" }).click();
    await expect(page.getByText("Bitte bestätige beide Punkte.")).toBeVisible(SLOW);

    // EVB-05: published; guests see the new title.
    await page.getByRole("checkbox").nth(0).click();
    await page.getByRole("checkbox").nth(1).click();
    await page.getByRole("button", { name: "Jetzt veröffentlichen" }).click();
    await expect(page).toHaveURL(new RegExp(`${base}/changes/published$`), SLOW);
    await expect(page.getByRole("heading", { name: "Änderungen sind veröffentlicht" })).toBeVisible();
    expect((await publicEvent(`${EDIT_TITLE} im Hof`)).data).not.toBeNull();

    // A page that showed an older stand of the same draft publishes nothing:
    // the draft is changed in place by a second tab after the first page was
    // opened.
    await page.goto(`${base}/changes/edit`);
    await page.getByLabel("Beschreibung", { exact: true }).fill("Erste Fassung.");
    await page.getByRole("button", { name: "Änderungen speichern" }).click();
    await expect(page).toHaveURL(new RegExp(`${base}/changes/saved$`), SLOW);
    await page.getByRole("link", { name: "Änderungen prüfen" }).click();
    await page.getByRole("link", { name: "Weiter zur Bestätigung" }).click();
    await expect(page.getByRole("heading", { name: "Änderungen veröffentlichen" })).toBeVisible(SLOW);
    await page.getByRole("checkbox").nth(0).click();
    await page.getByRole("checkbox").nth(1).click();
    const secondTab = await context.newPage();
    await secondTab.goto(`${base}/changes/edit`);
    await secondTab.getByLabel("Beschreibung", { exact: true }).fill("Zweite Fassung.");
    await secondTab.getByRole("button", { name: "Änderungen speichern" }).click();
    await expect(secondTab).toHaveURL(new RegExp(`${base}/changes/saved$`), SLOW);
    await secondTab.close();
    await page.getByRole("button", { name: "Jetzt veröffentlichen" }).click();
    await expect(page).toHaveURL(new RegExp(`${base}/changes\\?stale=1$`), SLOW);
    const unchanged = (await publicEvent(`${EDIT_TITLE} im Hof`)).data?.description;
    expect(unchanged).not.toBe("Erste Fassung.");
    expect(unchanged).not.toBe("Zweite Fassung.");

    // EVB-06a/06b: another change is discarded; the event stays as it was.
    await page.goto(`${base}/changes/edit`);
    await page.getByLabel("Beschreibung", { exact: true }).fill("Nur ein privater Gedanke.");
    await page.getByRole("button", { name: "Änderungen speichern" }).click();
    await expect(page).toHaveURL(new RegExp(`${base}/changes/saved$`), SLOW);
    await page.goto(`${base}/manage`);
    await page.getByRole("link", { name: "Änderungen verwerfen" }).click();
    await expect(page.getByRole("heading", { name: "Änderungen verwerfen?" })).toBeVisible(SLOW);
    await page.getByRole("button", { name: "Änderungen verwerfen" }).click();
    await expect(page).toHaveURL(new RegExp(`${base}/changes/discarded$`), SLOW);
    expect(
      sql(
        `select draft_revision_id = published_revision_id from public.events where id = '${edit.eventId}'`,
      ),
    ).toBe("t");
    expect((await publicEvent(`${EDIT_TITLE} im Hof`)).data?.description).not.toBe("Nur ein privater Gedanke.");

    await context.close();
  });

  // Figma EVM-02a/02b: a live event is copied as a new private draft. The date
  // stays open, the original stays live and untouched.
  test("a live event is copied as a new draft without a date", async ({ browser }) => {
    const context = await germanContext(browser, { baseURL: BASE_URL, storageState: ownerState });
    const page = await context.newPage();
    // The edit event carries its new title since the test before.
    const COPY_TITLE = `${EDIT_TITLE} im Hof`;
    const copies = (where: string) =>
      sql(
        `select count(*) from public.events e join public.event_revisions r on r.id = e.draft_revision_id where r.title = '${COPY_TITLE}' and ${where}`,
      );

    await page.goto(`/organizer/events/${edit.eventId}/manage`);
    await page.getByRole("link", { name: "Als neues Event kopieren" }).click();
    await expect(page.getByRole("heading", { name: "Als neues Event kopieren" })).toBeVisible(SLOW);

    await page.getByRole("button", { name: "Entwurf anlegen" }).click();
    await expect(page).toHaveURL(/\/organizer\/events\/[0-9a-f-]{36}\/copied$/, SLOW);
    await expect(page.getByRole("heading", { name: "Entwurf angelegt" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Datum setzen" })).toBeVisible();

    // One private copy with an open date; the original is still the live one.
    expect(copies("e.published_revision_id is null and r.start_state = 'unanswered'")).toBe("1");
    expect(copies("e.published_revision_id is not null")).toBe("1");
    expect((await publicEvent(COPY_TITLE)).data).not.toBeNull();

    // A copy that was never published has no copy page of its own.
    const copyUrl = page.url();
    await page.goto(copyUrl.replace(/\/copied$/, "/copy"));
    await expect(page).not.toHaveURL(/\/copy$/, SLOW);
    await expect(page.getByRole("button", { name: "Entwurf anlegen" })).toHaveCount(0);

    await context.close();
  });
});
