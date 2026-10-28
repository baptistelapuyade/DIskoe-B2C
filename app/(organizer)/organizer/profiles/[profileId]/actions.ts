"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  checkImage,
  describeGaps,
  extensionFor,
  parseAltText,
  parseGapDetail,
  parseProfileInput,
  type FieldErrors,
} from "@/lib/domain/profile-publication";
import { ensureEditableDraft, loadProfileState } from "@/lib/profile/draft";
import { copyPublishedImage } from "@/lib/profile/publish";
import { requireOwnedProfileId } from "@/lib/profile/load";

export type FormState = {
  ok: boolean;
  message?: string;
  errors?: FieldErrors & { image?: string; altText?: string; rights?: string };
  gaps?: string[];
};

const GENERIC_ERROR =
  "Das hat leider nicht geklappt. Bitte versuche es noch einmal.";

async function currentUserId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

function editPath(profileId: string) {
  return `/organizer/profiles/${profileId}/edit`;
}

export async function saveDetails(
  profileId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwnedProfileId(profileId, editPath(profileId));

  const parsed = parseProfileInput({
    name: formData.get("name"),
    shortIntro: formData.get("shortIntro"),
    officialUrl: formData.get("officialUrl"),
    publicContact: formData.get("publicContact"),
  });

  if (!parsed.ok) {
    return { ok: false, errors: parsed.errors };
  }

  const supabase = await createClient();
  const userId = await currentUserId(supabase);
  const profile = userId ? await loadProfileState(supabase, profileId) : null;

  if (!userId || !profile) {
    return { ok: false, message: GENERIC_ERROR };
  }

  try {
    const { revisionId } = await ensureEditableDraft(supabase, userId, profile);

    // Row Level Security filters silently: an update that touches no row is a
    // failure, not a success.
    const { data, error } = await supabase
      .from("profile_revisions")
      .update({
        name: parsed.value.name || null,
        short_intro: parsed.value.shortIntro || null,
        official_url: parsed.value.officialUrl || null,
        public_contact: parsed.value.publicContact || null,
      })
      .eq("id", revisionId)
      .select("id");

    if (error || !data || data.length !== 1) {
      return { ok: false, message: GENERIC_ERROR };
    }
  } catch {
    return { ok: false, message: GENERIC_ERROR };
  }

  revalidatePath(editPath(profileId));
  revalidatePath(`/organizer/profiles/${profileId}/preview`);
  return { ok: true, message: "Gespeichert. Der Entwurf bleibt privat." };
}

export async function uploadImage(
  profileId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwnedProfileId(profileId, editPath(profileId));

  const file = formData.get("image");
  const alt = parseAltText(formData.get("altText"));
  const rights = formData.get("rights") === "on";
  const errors: NonNullable<FormState["errors"]> = {};

  if (!alt.ok) errors.altText = alt.message;
  if (!rights) {
    errors.rights =
      "Bitte bestätige, dass du das Bild verwenden und öffentlich zeigen darfst.";
  }

  if (!(file instanceof File) || file.size === 0) {
    errors.image = "Bitte wähle eine Bilddatei aus.";
  }

  if (Object.keys(errors).length > 0 || !(file instanceof File) || !alt.ok) {
    return { ok: false, errors };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const checked = checkImage(bytes);

  if (!checked.ok) {
    return { ok: false, errors: { image: checked.message } };
  }

  const supabase = await createClient();
  const userId = await currentUserId(supabase);
  const profile = userId ? await loadProfileState(supabase, profileId) : null;

  if (!userId || !profile) {
    return { ok: false, message: GENERIC_ERROR };
  }

  const path = `${userId}/${crypto.randomUUID()}.${extensionFor(checked.type)}`;

  const { error: uploadError } = await supabase.storage
    .from("private-media")
    .upload(path, bytes, { contentType: checked.type, upsert: false });

  if (uploadError) {
    return { ok: false, message: GENERIC_ERROR };
  }

  // From here on a failure leaves an unused private file behind. Clients cannot
  // delete objects (no delete policy); cleanup is a later, explicit step.
  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .insert({
      uploader_id: userId,
      private_object_path: path,
      mime_type: checked.type,
    })
    .select("id")
    .single();

  if (assetError || !asset) {
    return { ok: false, message: GENERIC_ERROR };
  }

  const { data: use, error: useError } = await supabase
    .from("media_uses")
    .insert({
      asset_id: asset.id,
      profile_id: profileId,
      role: "profile_image",
      alt_text: alt.value,
    })
    .select("id")
    .single();

  if (useError || !use) {
    return { ok: false, message: GENERIC_ERROR };
  }

  // The checkbox is the explicit confirmation. The database stamps who and
  // when, and reserves the public path.
  const { data: confirmed, error: confirmError } = await supabase
    .from("media_uses")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("id", use.id)
    .select("id");

  if (confirmError || !confirmed || confirmed.length !== 1) {
    return { ok: false, message: GENERIC_ERROR };
  }

  try {
    const { revisionId } = await ensureEditableDraft(supabase, userId, profile);

    const { data: linked, error: linkError } = await supabase
      .from("profile_revisions")
      .update({ profile_image_use_id: use.id })
      .eq("id", revisionId)
      .select("id");

    if (linkError || !linked || linked.length !== 1) {
      return { ok: false, message: GENERIC_ERROR };
    }
  } catch {
    return { ok: false, message: GENERIC_ERROR };
  }

  revalidatePath(editPath(profileId));
  revalidatePath(`/organizer/profiles/${profileId}/preview`);
  return {
    ok: true,
    message: "Das Bild ist gespeichert und bleibt bis zur Freigabe privat.",
  };
}

export async function submitForReview(
  profileId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwnedProfileId(
    profileId,
    `/organizer/profiles/${profileId}/preview`,
  );

  const rights = formData.get("rights") === "on";
  const usage = formData.get("usage") === "on";

  if (!rights || !usage) {
    return {
      ok: false,
      errors: {
        rights: "Bitte bestätige beide Angaben, bevor du das Profil einreichst.",
      },
    };
  }

  const supabase = await createClient();
  const profile = await loadProfileState(supabase, profileId);

  if (!profile || !profile.draftRevisionId) {
    return { ok: false, message: GENERIC_ERROR };
  }

  const { error } = await supabase.rpc("submit_profile_for_review", {
    p_profile_id: profileId,
    p_expected_draft_revision_id: profile.draftRevisionId,
    p_confirmed_rights: rights,
    p_confirmed_usage: usage,
  });

  if (error) {
    switch (error.code) {
      case "DK001":
        return {
          ok: false,
          message:
            "Der Entwurf wurde zwischenzeitlich geändert. Bitte lade die Seite neu und prüfe die Vorschau noch einmal.",
        };
      case "DK002":
        return {
          ok: false,
          message: "Es fehlen noch Angaben.",
          gaps: describeGaps(parseGapDetail(error.details)).map(
            (gap) => gap.message,
          ),
        };
      case "DK003":
        return {
          ok: false,
          message:
            "Dieser Stand kann nicht noch einmal eingereicht werden. Bitte ändere zuerst eine Angabe, besonders wenn DISKOE dir eine Frage gestellt hat.",
        };
      default:
        return { ok: false, message: GENERIC_ERROR };
    }
  }

  revalidatePath(`/organizer/profiles/${profileId}/preview`);
  revalidatePath("/organizer");
  return {
    ok: true,
    message:
      "Eingereicht. DISKOE prüft dein Profil. Mit der Freigabe wird es öffentlich.",
  };
}

function publishFailure(code: string | undefined, details?: string | null): FormState {
  switch (code) {
    case "DK001":
      return {
        ok: false,
        message:
          "Das Profil hat sich zwischenzeitlich geändert. Bitte lade die Seite neu und prüfe die Vorschau noch einmal.",
      };
    case "DK002":
      return {
        ok: false,
        message: "Es fehlen noch Angaben.",
        gaps: describeGaps(parseGapDetail(details)).map((gap) => gap.message),
      };
    case "DK003":
      return {
        ok: false,
        message:
          "Veröffentlichen ist gerade nicht möglich: Es gibt nichts Neues oder das Profil wurde noch nicht von DISKOE freigegeben.",
      };
    default:
      return { ok: false, message: GENERIC_ERROR };
  }
}

export async function publishProfile(
  profileId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwnedProfileId(
    profileId,
    `/organizer/profiles/${profileId}/preview`,
  );

  // The client asks once more before sending this value.
  if (formData.get("confirmed") !== "yes") {
    return { ok: false, message: "Bitte bestätige das Veröffentlichen." };
  }

  const supabase = await createClient();
  const profile = await loadProfileState(supabase, profileId);

  if (!profile || !profile.draftRevisionId) {
    return { ok: false, message: GENERIC_ERROR };
  }

  const { error } = await supabase.rpc("publish_profile", {
    p_profile_id: profileId,
    p_expected_draft_revision_id: profile.draftRevisionId,
    p_expected_published_revision_id: profile.publishedRevisionId ?? undefined,
  });

  if (error) {
    return publishFailure(error.code, error.details);
  }

  // The data is public from here on; the image file follows. A failure is
  // shown and can be repeated, the profile is not complete until it worked.
  const copied = await copyPublishedImage(supabase, profileId);

  revalidatePath(`/organizer/profiles/${profileId}/preview`);
  revalidatePath(`/organizer/profiles/${profileId}/edit`);
  revalidatePath("/organizer");

  return copied === "copied"
    ? { ok: true, message: "Deine Änderungen sind veröffentlicht." }
    : {
        ok: true,
        message:
          "Deine Änderungen sind veröffentlicht, aber das Bild ist noch nicht öffentlich. Bitte versuche es noch einmal.",
      };
}

export async function retryImagePublish(
  profileId: string,
  _previous: FormState,
): Promise<FormState> {
  await requireOwnedProfileId(
    profileId,
    `/organizer/profiles/${profileId}/preview`,
  );

  const supabase = await createClient();
  const copied = await copyPublishedImage(supabase, profileId);

  revalidatePath(`/organizer/profiles/${profileId}/preview`);

  return copied === "copied"
    ? { ok: true, message: "Das Bild ist jetzt öffentlich." }
    : {
        ok: false,
        message: "Das Bild konnte noch nicht veröffentlicht werden. Bitte versuche es später noch einmal.",
      };
}
