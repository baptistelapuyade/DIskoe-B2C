import type { MetadataRoute } from "next";

import { buildRobots } from "@/lib/public/robots-rules";
import { indexingEnabled, siteUrl } from "@/lib/public/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(indexingEnabled(), siteUrl());
}
