import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@jobjitsu/queue",
    globals: false,
    environment: "node",
    include: ["src/**/*.{test,spec}.ts", "tests/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.{test,spec}.ts"],
    },
    passWithNoTests: true,
  },
});
