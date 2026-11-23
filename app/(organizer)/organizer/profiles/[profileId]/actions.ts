"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  describeGaps,
  extensionFor,
  inspectProfileImage,
  parseAltText,
  parseCrop,
  parseGapDetail,
  parseProfileInput,
  parseSlug,
  readImageSize,
  safeFileName,
  type Crop,
  type FieldErrorCode,
  type FieldErrors,
  type ImageInspection,
} from "@/lib/domain/profile-publication";
import {
  ensureEditableDraft,
  loadProfileState,
  loadRevision,
  toExtraLinksJson,
} from "@/lib/profile/draft";
import { copyPublishedImage } from "@/lib/profile/publish";
import { requireOwnedProfileId } from "@/lib/profile/load";

// State of the old forms (submit, publish, founder approval). Their texts are
// still German literals; they move to the catalog with the submit screens.
export type FormState = {
  ok: boolean;
  message?: string;
  errors?: { rights?: string };
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

function imagePath(profileId: string) {
  return `/organizer/profiles/${profileId}/image`;
}

function previewPath(profileId: string) {
  return `/organizer/profiles/${profileId}/preview`;
}

// ---------------------------------------------------------------------------
// Step 1: details (ORG-03a to ORG-04)
// ---------------------------------------------------------------------------
export type DetailsValues = {
  name: string;
  shortIntro: string;
  slug: string;
  officialUrl: string;
  instagram: string;
  extraLinks: string[];
  publicContact: string;
};

export type SlugErrorCode = "format" | "taken" | "reserved";

// "required" is only used when a live profile is saved: it must stay complete
// (Figma LPA-01b). Drafts of a first profile may have gaps.
export type DetailsErrors = Omit<
  FieldErrors,
  "extraLinks" | "name" | "shortIntro" | "officialUrl"
> & {
  slug?: SlugErrorCode;
  name?: FieldErrorCode | "required";
  shortIntro?: FieldErrorCode | "required";
  officialUrl?: FieldErrorCode | "required";
  extraLinks?: (FieldErrorCode | null)[];
};

export type DetailsState =
  | { status: "idle" }
  // The values stay in the form; the errors say what to fix.
  | { status: "invalid"; errors: DetailsErrors }
  // Nothing was saved (technical failure). Z03.
  | { status: "failed" };

export async function saveDetails(
  profileId: string,
  _previous: DetailsState,
  formData: FormData,
): Promise<DetailsState> {
  await requireOwnedProfileId(profileId, editPath(profileId));

  const parsed = parseProfileInput({
    name: formData.get("name"),
    shortIntro: formData.get("shortIntro"),
    officialUrl: formData.get("officialUrl"),
    instagram: formData.get("instagram"),
    extraLinks: formData.getAll("extraLinks"),
    publicContact: formData.get("publicContact"),
  });
  const errors: DetailsErrors = parsed.ok ? {} : { ...parsed.errors };

  const supabase = await createClient();
  const userId = await currentUserId(supabase);
  const profile = userId ? await loadProfileState(supabase, profileId) : null;

  if (!userId || !profile) {
    return { status: "failed" };
  }

  // The address can be changed until the first approval. After that the field
  // is read-only and a submitted value is ignored.
  const slugField = formData.get("slug");
  const wantsSlug =
    profile.firstApprovedRevisionId === null && typeof slugField === "string";
  let newSlug: string | null = null;

  if (wantsSlug) {
    const slug = parseSlug(slugField);

    if (!slug.ok) {
      errors.slug = "format";
    } else if (slug.value !== profile.slug) {
      newSlug = slug.value;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { status: "invalid", errors };
  }

  if (newSlug) {
    const { error } = await supabase.rpc("change_profile_slug", {
      p_profile_id: profileId,
      p_slug: newSlug,
    });

    if (error) {
      switch (error.code) {
        case "DK006":
          return { status: "invalid", errors: { slug: "format" } };
        case "DK007":
          return { status: "invalid", errors: { slug: "reserved" } };
        case "DK008":
          return { status: "invalid", errors: { slug: "taken" } };
        default:
          return { status: "failed" };
      }
    }
  }

  if (!parsed.ok) {
    return { status: "failed" };
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
        instagram_handle: parsed.value.instagram || null,
        extra_links: toExtraLinksJson(parsed.value.extraLinks),
        public_contact: parsed.value.publicContact || null,
      })
      .eq("id", revisionId)
      .select("id");

    if (error || !data || data.length !== 1) {
      return { status: "failed" };
    }
  } catch {
    return { status: "failed" };
  }

  revalidatePath(editPath(profileId));
  revalidatePath(previewPath(profileId));
  revalidatePath("/organizer");

  // The button that was pressed decides where to go. The data is saved first.
  redirect(formData.get("intent") === "later" ? "/organizer" : imagePath(profileId));
}

// ---------------------------------------------------------------------------
// Step 2: profile picture (ORG-05a to ORG-05g)
// ---------------------------------------------------------------------------
export type UploadErrorCode = "tooBig" | "tooSmall" | "format" | "failed";

export type ImageActionResult =
  | { status: "ok" }
  | {
      status: "error";
      code: UploadErrorCode;
      // Only for tooBig (bytes) and tooSmall (width, height).
      bytes?: number;
      width?: number;
      height?: number;
    };

type Client = Awaited<ReturnType<typeof createClient>>;

// The centred largest square: the default crop of a new image.
function centredCrop(width: number, height: number): Crop {
  const side = Math.min(width, height);

  return {
    x: (width - side) / 2 / width,
    y: (height - side) / 2 / height,
    w: side / width,
    h: side / height,
  };
}

function toJson(crop: Crop) {
  return { x: crop.x, y: crop.y, w: crop.w, h: crop.h };
}

// Makes `useId` the picture of the editable draft. Used after an upload and
// when a crop or description has to go to a new use.
async function linkImageUse(
  supabase: Client,
  userId: string,
  profileId: string,
  useId: string,
): Promise<boolean> {
  const profile = await loadProfileState(supabase, profileId);

  if (!profile) return false;

  const { revisionId } = await ensureEditableDraft(supabase, userId, profile);

  const { data, error } = await supabase
    .from("profile_revisions")
    .update({ profile_image_use_id: useId })
    .eq("id", revisionId)
    .select("id");

  return !error && data !== null && data.length === 1;
}

// A new use of an asset, confirmed at once. The confirmation only marks the
// picture as the chosen one for the private draft; the rights are confirmed
// when the profile is submitted (EIN-02a), and nothing is public before the
// founder approves.
async function createConfirmedUse(
  supabase: Client,
  input: { assetId: string; profileId: string; altText: string | null; crop: Crop },
): Promise<string | null> {
  const { data: use, error } = await supabase
    .from("media_uses")
    .insert({
      asset_id: input.assetId,
      profile_id: input.profileId,
      role: "profile_image",
      alt_text: input.altText,
      crop: toJson(input.crop),
    })
    .select("id")
    .single();

  if (error || !use) return null;

  const { data: confirmed, error: confirmError } = await supabase
    .from("media_uses")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("id", use.id)
    .select("id");

  return confirmError || !confirmed || confirmed.length !== 1 ? null : use.id;
}

export async function uploadProfileImage(
  profileId: string,
  formData: FormData,
): Promise<ImageActionResult> {
  await requireOwnedProfileId(profileId, imagePath(profileId));

  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", code: "format" };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const inspected: ImageInspection = inspectProfileImage(bytes);

  if (!inspected.ok) {
    switch (inspected.code) {
      case "tooBig":
        return { status: "error", code: "tooBig", bytes: inspected.bytes };
      case "tooSmall":
        return {
          status: "error",
          code: "tooSmall",
          width: inspected.width,
          height: inspected.height,
        };
      default:
        return { status: "error", code: "format" };
    }
  }

  const supabase = await createClient();
  const userId = await currentUserId(supabase);

  if (!userId) return { status: "error", code: "failed" };

  const path = `${userId}/${crypto.randomUUID()}.${extensionFor(inspected.type)}`;

  const { error: uploadError } = await supabase.storage
    .from("private-media")
    .upload(path, bytes, { contentType: inspected.type, upsert: false });

  if (uploadError) return { status: "error", code: "failed" };

  // From here on a failure leaves an unused private file behind. Clients cannot
  // delete objects (no delete policy); cleanup is a later, explicit step.
  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .insert({
      uploader_id: userId,
      private_object_path: path,
      mime_type: inspected.type,
      original_filename: safeFileName(file.name),
    })
    .select("id")
    .single();

  if (assetError || !asset) return { status: "error", code: "failed" };

  // A crop sent by the client counts when it is a square in this image;
  // otherwise the largest centred square is used.
  const sent = formData.get("crop");
  let crop = centredCrop(inspected.width, inspected.height);

  if (typeof sent === "string") {
    try {
      const checked = parseCrop(JSON.parse(sent), inspected);
      if (checked) crop = checked;
    } catch {
      // keep the default
    }
  }

  const useId = await createConfirmedUse(supabase, {
    assetId: asset.id,
    profileId,
    altText: null,
    crop,
  });

  if (!useId || !(await safeLink(supabase, userId, profileId, useId))) {
    return { status: "error", code: "failed" };
  }

  revalidatePath(imagePath(profileId));
  revalidatePath(previewPath(profileId));
  return { status: "ok" };
}

async function safeLink(
  supabase: Client,
  userId: string,
  profileId: string,
  useId: string,
): Promise<boolean> {
  try {
    return await linkImageUse(supabase, userId, profileId, useId);
  } catch {
    return false;
  }
}

// Changes crop and/or description of the current picture. The use is edited in
// place while no confirmed revision refers to it; otherwise (after a
// submission) a new use of the same file takes over, and the old revisions keep
// what they showed.
async function changeCurrentImage(
  profileId: string,
  patch: { crop?: Crop; altText?: string | null },
): Promise<boolean> {
  const supabase = await createClient();
  const userId = await currentUserId(supabase);
  const profile = userId ? await loadProfileState(supabase, profileId) : null;

  if (!userId || !profile?.draftRevisionId) return false;

  const revision = await loadRevision(supabase, profile.draftRevisionId);

  if (!revision?.profileImageUseId) return false;

  const { data: use } = await supabase
    .from("media_uses")
    .select("id, asset_id, alt_text, crop")
    .eq("id", revision.profileImageUseId)
    .maybeSingle();

  if (!use) return false;

  const values: { crop?: ReturnType<typeof toJson>; alt_text?: string | null } = {};
  if (patch.crop) values.crop = toJson(patch.crop);
  if (patch.altText !== undefined) values.alt_text = patch.altText;

  const { data: updated, error } = await supabase
    .from("media_uses")
    .update(values)
    .eq("id", use.id)
    .select("id");

  if (!error && updated && updated.length === 1) return true;

  const fallback = patch.crop ?? readStoredCrop(use.crop);

  if (!fallback) return false;

  const useId = await createConfirmedUse(supabase, {
    assetId: use.asset_id,
    profileId,
    altText: patch.altText !== undefined ? patch.altText : use.alt_text,
    crop: fallback,
  });

  return useId !== null && (await safeLink(supabase, userId, profileId, useId));
}

function readStoredCrop(raw: unknown): Crop | null {
  if (typeof raw !== "object" || raw === null) return null;

  const { x, y, w, h } = raw as Record<string, unknown>;

  return [x, y, w, h].every((n) => typeof n === "number")
    ? { x, y, w, h } as Crop
    : null;
}

export type CropResult = { status: "ok" } | { status: "error" };

export async function saveProfileCrop(
  profileId: string,
  input: Crop,
): Promise<CropResult> {
  await requireOwnedProfileId(profileId, imagePath(profileId));

  const supabase = await createClient();
  const profile = await loadProfileState(supabase, profileId);
  const revision = profile?.draftRevisionId
    ? await loadRevision(supabase, profile.draftRevisionId)
    : null;

  if (!revision?.profileImageUseId) return { status: "error" };

  // The crop must be a square in this very image, so the server reads the
  // size from the stored file.
  const { data: use } = await supabase
    .from("media_uses")
    .select("asset_id")
    .eq("id", revision.profileImageUseId)
    .maybeSingle();
  const { data: asset } = use
    ? await supabase
        .from("media_assets")
        .select("private_object_path, mime_type")
        .eq("id", use.asset_id)
        .maybeSingle()
    : { data: null };

  if (!asset) return { status: "error" };

  const { data: blob } = await supabase.storage
    .from("private-media")
    .download(asset.private_object_path);

  if (!blob) return { status: "error" };

  const type = asset.mime_type as "image/jpeg" | "image/png" | "image/webp";
  const size = readImageSize(new Uint8Array(await blob.arrayBuffer()), type);
  const crop = size ? parseCrop(input, size) : null;

  if (!crop) return { status: "error" };

  try {
    if (!(await changeCurrentImage(profileId, { crop }))) {
      return { status: "error" };
    }
  } catch {
    return { status: "error" };
  }

  revalidatePath(imagePath(profileId));
  revalidatePath(previewPath(profileId));
  return { status: "ok" };
}

export type AltState = { status: "idle" } | { status: "invalid" } | { status: "failed" };

// "Weiter zur Vorschau" with a picture: saves the description, then goes on.
export async function saveImageStep(
  profileId: string,
  _previous: AltState,
  formData: FormData,
): Promise<AltState> {
  await requireOwnedProfileId(profileId, imagePath(profileId));

  const alt = parseAltText(formData.get("altText"));

  if (!alt.ok) return { status: "invalid" };

  try {
    if (!(await changeCurrentImage(profileId, { altText: alt.value }))) {
      return { status: "failed" };
    }
  } catch {
    return { status: "failed" };
  }

  revalidatePath(previewPath(profileId));
  redirect(previewPath(profileId));
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
