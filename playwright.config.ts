import { defineConfig, devices } from "@playwright/test";

import { GERMAN_COOKIE } from "./e2e/support/language";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // The specs share one database; on CI they run one after another.
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    // Without a limit a click or fill on a missing element waits until the test
    // times out and the log names no step.
    actionTimeout: process.env.CI ? 30_000 : 0,
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
    // The long CI job (E2E_BUILD=1) tests a production build: the dev server
    // compiled every route on first use, grew until it restarted itself and
    // stalled pages for minutes.
    command: process.env.E2E_BUILD
      ? "npm run build && npm run start -- --hostname 127.0.0.1"
      : "npm run dev -- --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000",
    // Show server output in the CI log so that server-side errors are visible.
    stdout: process.env.E2E_BUILD ? "pipe" : "ignore",
    // The e2e specs read the open state (sitemap, robots); the closed state is unit-tested.
    env: { SITE_INDEXING: "on" },
    reuseExistingServer: !process.env.CI,
    timeout: process.env.E2E_BUILD ? 480_000 : 120_000,
  },
});
