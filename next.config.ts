import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Profile image uploads go through a Server Action (limit is 5 MB plus form overhead).
    serverActions: { bodySizeLimit: "6mb" },
  },
  async headers() {
    const noStore = [{ key: "Cache-Control", value: "no-store" }];

    return [
      { source: "/organizer", headers: noStore },
      { source: "/organizer/:path*", headers: noStore },
      { source: "/login", headers: noStore },
      { source: "/auth/:path*", headers: noStore },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
  sourcemaps: {
    disable: true,
  },
});
