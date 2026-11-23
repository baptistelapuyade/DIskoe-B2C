import { defineConfig, devices } from "@playwright/test";

import { GERMAN_COOKIE } from "./e2e/support/language";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    // Platform copy is English by default; the specs check German texts, so
    // their pages start with the German choice (see e2e/support/language.ts).
    storageState: { cookies: [GERMAN_COOKIE], origins: [] },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000",
    // The e2e specs read the open state (sitemap, robots); the closed state is unit-tested.
    env: {
      SITE_INDEXING: "on",
      // The dev server restarts itself when it nears the default Node heap
      // limit, which stalls pages for minutes in the long specs. Give it more
      // room in CI only.
      ...(process.env.CI ? { NODE_OPTIONS: "--max-old-space-size=4096" } : {}),
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
