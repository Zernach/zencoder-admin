import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:8081",
    viewport: { width: 1440, height: 900 },
    screenshot: "only-on-failure",
  },
  retries: 1,
  webServer: {
    command: "npx expo start --web --port 8081",
    port: 8081,
    reuseExistingServer: true,
  },
});
