import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/types";

type Client = SupabaseClient<Database>;

// A new use of an asset, confirmed at once. The confirmation only marks the
// picture as the chosen one for the private draft; the rights are confirmed
// when the event is submitted, and nothing is public before the founder
// approves (same as the profile picture).
export async function createConfirmedEventUse(
  supabase: Client,
  input: { assetId: string; eventId: string; altText: string | null },
): Promise<string | null> {
  const { data: use, error } = await supabase
    .from("media_uses")
    .insert({
      asset_id: input.assetId,
      event_id: input.eventId,
      role: "event_image",
      alt_text: input.altText,
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
