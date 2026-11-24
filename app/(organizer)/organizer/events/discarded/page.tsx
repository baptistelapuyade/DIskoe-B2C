import { cookies } from "next/headers";

import { EventDiscardedScreen } from "@/components/event/discard-screens";
import { requireOwner } from "@/lib/auth/server";
import { DISCARDED_COOKIE } from "@/lib/event/discard-cookie";
import { getLang } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

// After discarding an event draft (Figma EVB-07b). The title comes from the
// short-lived cookie the action set; without it the text has no name.
export default async function EventDiscardedPage() {
  await requireOwner("/organizer/events/discarded");

  const lang = await getLang();
  const raw = (await cookies()).get(DISCARDED_COOKIE)?.value ?? "";
  let title: string | null = null;

  try {
    title = decodeURIComponent(raw).trim().slice(0, 200) || null;
  } catch {
    title = null;
  }

  return <EventDiscardedScreen lang={lang} title={title} />;
}
