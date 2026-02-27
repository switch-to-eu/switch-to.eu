import { defineConfig } from "@playwright/test";

/**
 * Playwright config for the interactive load-player test.
 *
 * - No webServer (expects the app to already be running)
 * - No retries (this is a manual, interactive test)
 * - 30 minute timeout per test
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "load-players.spec.ts",
  timeout: 30 * 60_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: "http://localhost:5018",
  },
  projects: [
    {
      name: "load-players",
      use: { browserName: "chromium" },
    },
  ],
});
