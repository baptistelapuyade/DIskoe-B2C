import type { MetadataRoute } from "next";

import { listSitemapEntries } from "@/lib/public/queries";
import { siteUrl } from "@/lib/public/site";

// Only public addresses: published profiles and their events that are not
// cancelled and not over for more than 12 months. Drafts are not in the views
// and so can not appear here.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { profiles, events } = await listSitemapEntries();
  const last = (iso: string | null) => (iso ? new Date(iso) : undefined);

  return [
    ...profiles.map((entry) => ({
      url: `${base}/${entry.slug}`,
      lastModified: last(entry.updatedAt),
    })),
    ...events.map((entry) => ({
      url: `${base}/e/${entry.slug}`,
      lastModified: last(entry.updatedAt),
    })),
  ];
}
