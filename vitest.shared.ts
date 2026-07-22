import { defineConfig } from "vitest/config";

/**
 * Shared Vitest defaults for JobJitsu packages.
 * Privacy must-pass tests land later — no network by default.
 */
export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.{test,spec}.ts", "tests/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.{test,spec}.ts", "**/index.ts"],
    },
    passWithNoTests: true,
  },
});
