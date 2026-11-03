import { archiveInstant } from "../domain/time";

// Past events stay in the sitemap for 12 months after their archive cut-off,
// the same span the profile archive uses (Delta v0.5). A postponed event
// without a new date is never old; an event we cannot date stays listed.
const WINDOW_MONTHS = 12;

export function inSitemapWindow(
  event: {
    status: string;
    startInstant: string | null;
    endInstant: string | null;
    timezone: string | null;
  },
  now: Date = new Date(),
): boolean {
  if (event.status === "postponed_undated") return true;
  if (!event.startInstant || !event.timezone) return true;

  const archiveAt = archiveInstant(
    event.startInstant,
    event.endInstant,
    event.timezone,
  );
  if (!archiveAt) return true;

  const limit = new Date(archiveAt);
  limit.setUTCMonth(limit.getUTCMonth() + WINDOW_MONTHS);

  return now.getTime() < limit.getTime();
}
