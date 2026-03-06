import path from "path";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:8085",
    viewport: { width: 1440, height: 900 },
    screenshot: "only-on-failure",
  },
  retries: 1,
  webServer: {
    command: "CI=1 npx expo start --web --port 8085",
    port: 8085,
    timeout: 180_000,
    reuseExistingServer: true,
    cwd: path.join(__dirname, ".."),
  },
});
