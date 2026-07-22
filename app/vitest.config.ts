import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@jobjitsu/app",
    globals: false,
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
    passWithNoTests: true,
  },
});
