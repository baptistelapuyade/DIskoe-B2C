import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type BrowserContext } from "@playwright/test";

import type { Database } from "../lib/db/types";

import {
  clearMailbox,
  mailsWithSubject,
  waitForCode,
  waitForMail,
} from "./support/inbucket";
import { makeFounder, provisionAs, sql, userIdByEmail } from "./support/seed";
import { germanContext } from "./support/language";

// Needs the local Supabase stack (see the e2e-auth CI job). Covers Slice 5: the
// first event is submitted together with the profile, the founder decides on
// both, and a later event is published by the owner alone.

const BASE_URL = "http://127.0.0.1:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const SLOW = { timeout: 20_000 };

const run = `p${Date.now().toString(36)}`;
const emails = {
  founder: `founder-${run}@example.test`,
  owner: `owner-${run}@example.test`,
};
const slug = `gamma-${run}`;
const FIRST_TITLE = "Zwischen den Boxen";
const LATER_TITLE = "Nachschlag";
const LIVE_MAIL = /ist jetzt live/;
const QUESTION_MAIL = /Eine Frage zu deinem Profil/;

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

type Api = SupabaseClient<Database>;

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
  use:
    | { profile_id: string; role: "profile_image" }
    | { event_id: string; role: "event_image" },
  altText: string | null,
): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.png`;
  const upload = await client.storage
    .from("private-media")
    .upload(path, PNG, { contentType: "image/png" });
  expect(upload.error).toBeNull();

  const asset = await client
    .from("media_assets")
    .insert({
      uploader_id: userId,
      private_object_path: path,
      mime_type: "image/png",
    })
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

// A complete private event with a confirmed image, as the editor would leave it.
async function createCompleteEvent(
  client: Api,
  userId: string,
  profileId: string,
  title: string,
  altText: string | null,
): Promise<{ eventId: string; revisionId: string; useId: string }> {
  const event = await client
    .from("events")
    .insert({
      organizer_id: profileId,
      slug: `${title.toLowerCase().replace(/[^a-z]/g, "-")}-${run}`,
    })
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
    .insert(
      asInsert({
        event_id: eventId,
        created_by: userId,
        title_state: "provided",
        title,
        description_state: "provided",
        description: `${title}: eine Nacht im Nebenraum.`,
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
        atmosphere_tags: ["warm"],
        event_image_use_id: useId,
      }),
    )
    .select("id")
    .single();
  expect(revision.error).toBeNull();

  const pointed = await client
    .from("events")
    .update({ draft_revision_id: revision.data!.id })
    .eq("id", eventId)
    .select("id");
  expect(pointed.data).toHaveLength(1);

  return { eventId, revisionId: revision.data!.id, useId };
}

test.describe.configure({ mode: "serial" });

test.describe("first publication: profile and first event together", () => {
  test.setTimeout(240_000);

  let founderState: Awaited<ReturnType<BrowserContext["storageState"]>>;
  let profileId = "";
  let profileRevision = "";
  let first = { eventId: "", revisionId: "", useId: "" };
  let ownerApi: Api;
  let ownerId = "";

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(300_000);

    const context = await germanContext(browser, { baseURL: BASE_URL });
    const page = await context.newPage();
    await clearMailbox(emails.founder);
    await page.goto("/login");
    await page.getByLabel("E-Mail-Adresse").fill(emails.founder);
    await page.getByRole("button", { name: "Code senden" }).click();
    await page
      .getByLabel("Code aus der E-Mail")
      .fill(await waitForCode(emails.founder));
    await page.getByRole("button", { name: "Anmelden", exact: true }).click();
    await page.waitForURL("**/organizer");
    founderState = await context.storageState();
    await context.close();

    // The owner signs in through the API only (the sign-in itself is covered
    // elsewhere); that creates the user.
    ownerApi = await apiClientFor(emails.owner);
    ownerId = userIdByEmail(emails.owner);
    const founderId = userIdByEmail(emails.founder);
    makeFounder(founderId);
    profileId = provisionAs(founderId, ownerId, slug, "Gamma Kollektiv");

    profileRevision = sql(
      `select draft_revision_id from public.profiles where id = '${profileId}'`,
    );
    const profileUse = await uploadConfirmedImage(
      ownerApi,
      ownerId,
      { profile_id: profileId, role: "profile_image" },
      "Bühne",
    );
    const filled = await ownerApi
      .from("profile_revisions")
      .update({
        name: "Gamma Kollektiv",
        short_intro: "Gamma Kollektiv macht Nächte.",
        official_url: "https://gamma.example/",
        profile_image_use_id: profileUse,
      })
      .eq("id", profileRevision)
      .select("id");
    expect(filled.data).toHaveLength(1);

    // No description for the event image: it is optional and counts as decoration.
    first = await createCompleteEvent(
      ownerApi,
      ownerId,
      profileId,
      FIRST_TITLE,
      null,
    );
  });

  test("the owner submits profile and first event together", async () => {
    const submit = await ownerApi.rpc("submit_first_publication", {
      p_profile_id: profileId,
      p_expected_draft_revision_id: profileRevision,
      p_event_id: first.eventId,
      p_expected_event_draft_revision_id: first.revisionId,
      p_confirmed_rights: true,
      p_confirmed_usage: true,
    });
    expect(submit.error).toBeNull();

    // Nothing is public yet.
    const anon = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    expect(
      (await anon.from("public_profiles").select("slug").eq("slug", slug)).data,
    ).toEqual([]);
    expect(
      sql(
        `select publication_state from public.events where id = '${first.eventId}'`,
      ),
    ).not.toBe("published");
  });

  test("the founder sees profile, event and both images and asks a question", async ({
    browser,
  }) => {
    const context = await germanContext(browser, {
      baseURL: BASE_URL,
      storageState: founderState,
    });
    const page = await context.newPage();

    await page.goto(`/internal/approvals/${profileId}`);
    await expect(
      page.getByRole("heading", { name: "Gamma Kollektiv", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: FIRST_TITLE, exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("img", { name: "Bühne" })).toBeVisible();
    await expect(
      page.getByText("keine (Bild zählt als Dekoration)"),
    ).toBeVisible();

    await page.getByLabel("Betroffene Stelle").selectOption("Ort");
    await page
      .getByLabel("Deine Frage an den Organizer")
      .fill("Stimmt die Adresse der Halle?");
    await page.getByRole("button", { name: "Rückfrage stellen" }).click();
    // The form disappears after the save; the page keeps the facts.
    await expect(
      page.getByText("Zu diesem Stand ist eine Rückfrage gestellt.", {
        exact: false,
      }),
    ).toBeVisible(SLOW);
    await expect(
      page.getByRole("heading", { name: "Gestellte Rückfrage" }),
    ).toBeVisible();

    const stored = sql(
      `select message from public.review_requests where profile_id = '${profileId}' and event_revision_id = '${first.revisionId}'`,
    );
    expect(stored).toContain("Betroffen: Ort");
    expect(stored).toContain("Stimmt die Adresse der Halle?");

    const mail = await waitForMail(emails.owner, QUESTION_MAIL);
    expect(mail.body).toContain(
      `${BASE_URL}/organizer/profiles/${profileId}/question`,
    );
    expect(
      sql(
        `select publication_state from public.events where id = '${first.eventId}'`,
      ),
    ).not.toBe("published");
    await context.close();
  });

  test("after a change the owner submits again and the founder approves both", async ({
    browser,
  }) => {
    // The owner corrects the event: a new draft revision replaces the old one.
    const corrected = await ownerApi
      .from("event_revisions")
      .insert(
        asInsert({
          event_id: first.eventId,
          created_by: ownerId,
          title_state: "provided",
          title: FIRST_TITLE,
          description_state: "provided",
          description: "Korrigiert: eine Nacht im Nebenraum.",
          format_state: "provided",
          primary_format: "club_night",
          start_state: "provided",
          start_at: "2027-06-05T21:00:00Z",
          end_state: "unknown",
          place_state: "provided",
          place_name: "Halle 3",
          address_line: "Hauptstraße 2",
          postal_code: "10115",
          city: "Berlin",
          price_state: "unknown",
          price_model: "unknown",
          access_state: "provided",
          access_routes: [{ kind: "walk_in" }],
          atmosphere_state: "provided",
          atmosphere_tags: ["warm"],
          event_image_use_id: first.useId,
        }),
      )
      .select("id")
      .single();
    expect(corrected.error).toBeNull();
    const repoint = await ownerApi
      .from("events")
      .update({ draft_revision_id: corrected.data!.id })
      .eq("id", first.eventId)
      .select("id");
    expect(repoint.data).toHaveLength(1);
    first.revisionId = corrected.data!.id;

    // The old question belongs to the old event revision and blocks nothing.
    const again = await ownerApi.rpc("submit_first_publication", {
      p_profile_id: profileId,
      p_expected_draft_revision_id: profileRevision,
      p_event_id: first.eventId,
      p_expected_event_draft_revision_id: first.revisionId,
      p_confirmed_rights: true,
      p_confirmed_usage: true,
    });
    expect(again.error).toBeNull();

    const context = await germanContext(browser, {
      baseURL: BASE_URL,
      storageState: founderState,
    });
    const page = await context.newPage();
    await clearMailbox(emails.owner);

    await page.goto(`/internal/approvals/${profileId}`);
    await expect(
      page.getByText("Hauptstraße 2", { exact: false }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Freigeben und veröffentlichen" })
      .click();
    await expect(
      page.getByText("Jetzt freigeben und veröffentlichen?", { exact: false }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Ja, freigeben und veröffentlichen" })
      .click();
    await expect(
      page.getByText("Freigegeben und veröffentlicht.").first(),
    ).toBeVisible(SLOW);

    expect(
      sql(
        `select publication_state from public.profiles where id = '${profileId}'`,
      ),
    ).toBe("published");
    expect(
      sql(
        `select publication_state from public.events where id = '${first.eventId}'`,
      ),
    ).toBe("published");

    // Both images are readable in the public bucket.
    const publicPaths = sql(
      `select count(*) from storage.objects o join public.media_uses mu on mu.public_object_path = o.name where o.bucket_id = 'public-media' and mu.profile_id = '${profileId}' or (o.bucket_id = 'public-media' and mu.event_id = '${first.eventId}' and mu.public_object_path = o.name)`,
    );
    expect(Number(publicPaths)).toBe(2);

    const liveMail = await waitForMail(emails.owner, LIVE_MAIL);
    expect(liveMail.body).toContain(FIRST_TITLE);
    expect(liveMail.body).toContain(
      `${BASE_URL}/organizer/events/${first.eventId}/manage`,
    );
    expect(await mailsWithSubject(emails.owner, LIVE_MAIL)).toHaveLength(1);
    await context.close();
  });

  test("a later event is published by the owner alone", async () => {
    const later = await createCompleteEvent(
      ownerApi,
      ownerId,
      profileId,
      LATER_TITLE,
      "Eine Tanzfläche",
    );

    const state = sql(
      `select state_version || ',' || public_status from public.events where id = '${later.eventId}'`,
    ).split(",");
    const args = {
      p_event_id: later.eventId,
      p_expected_draft_revision_id: later.revisionId,
      p_expected_published_revision_id: null as unknown as string,
      p_expected_state_version: Number(state[0]),
      p_expected_status:
        state[1] as Database["public"]["Enums"]["event_status"],
    };

    const withoutConfirmation = await ownerApi.rpc("publish_event", {
      ...args,
      p_confirmed_rights: false,
      p_confirmed_usage: false,
    });
    expect(withoutConfirmation.error).not.toBeNull();
    expect(
      sql(
        `select publication_state from public.events where id = '${later.eventId}'`,
      ),
    ).not.toBe("published");

    const published = await ownerApi.rpc("publish_event", {
      ...args,
      p_confirmed_rights: true,
      p_confirmed_usage: true,
    });
    expect(published.error).toBeNull();
    expect(
      sql(
        `select publication_state from public.events where id = '${later.eventId}'`,
      ),
    ).toBe("published");
  });
});
