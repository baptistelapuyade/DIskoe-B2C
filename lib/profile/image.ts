import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/types";

type Client = SupabaseClient<Database>;

export type ProfileImage = {
  useId: string;
  altText: string | null;
  confirmed: boolean;
  publicObjectPath: string | null;
  privateObjectPath: string | null;
  signedUrl: string | null;
};

// Reads the image use and, for private previews, a short-lived signed URL of
// the original. Callers are the owner or the founder; Row Level Security and
// the storage policies decide what is visible.
export async function loadImage(
  supabase: Client,
  useId: string,
): Promise<ProfileImage | null> {
  const { data: use } = await supabase
    .from("media_uses")
    .select("id, alt_text, confirmed_at, public_object_path, asset_id")
    .eq("id", useId)
    .maybeSingle();

  if (!use) {
    return null;
  }

  const { data: asset } = await supabase
    .from("media_assets")
    .select("private_object_path")
    .eq("id", use.asset_id)
    .maybeSingle();

  let signedUrl: string | null = null;
  if (asset) {
    const { data: signed } = await supabase.storage
      .from("private-media")
      .createSignedUrl(asset.private_object_path, 300);
    signedUrl = signed?.signedUrl ?? null;
  }

  return {
    useId: use.id,
    altText: use.alt_text,
    confirmed: use.confirmed_at !== null && use.public_object_path !== null,
    publicObjectPath: use.public_object_path,
    privateObjectPath: asset?.private_object_path ?? null,
    signedUrl,
  };
}
