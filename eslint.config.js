import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/**
 * Flat ESLint config for the JobJitsu monorepo.
 * Type-aware linting applies to package `src` (excluding tests).
 * Config/test files use non-type-aware rules so every file still lints cleanly.
 */
export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/node_modules/**",
      "pnpm-lock.yaml",
      "docs/**",
      "assets/**",
      ".changeset/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/src/**/*.{ts,tsx}"],
    ignores: ["**/*.{test,spec}.ts", "**/*.{test,spec}.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: [
      "**/*.{test,spec}.ts",
      "**/*.{test,spec}.tsx",
      "**/vitest.config.ts",
      "vitest.*.ts",
      "**/vitest.setup.ts",
      "*.config.js",
      "*.config.ts",
      "commitlint.config.js",
      "prettier.config.js",
      "eslint.config.js",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  eslintConfigPrettier,
);
