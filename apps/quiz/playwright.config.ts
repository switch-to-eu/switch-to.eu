import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/load-players*"],
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:5018",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "pnpm build && pnpm start -p 5018",
    url: "http://localhost:5018",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
