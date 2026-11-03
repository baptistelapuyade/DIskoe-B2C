import type { MetadataRoute } from "next";

// Pure, so the open and the closed state can be tested without a server.
export function buildRobots(open: boolean, base: string): MetadataRoute.Robots {
  if (!open) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/organizer", "/internal", "/auth", "/login", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
