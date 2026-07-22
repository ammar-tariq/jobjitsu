import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * UI shell only — Tauri host wraps this webview later (ADR 0001).
 * Domain packages stay out of the renderer except presentation (`@jobjitsu/ui`).
 */
export default defineConfig({
  plugins: [react()],
  root: ".",
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    outDir: "dist-ui",
    emptyOutDir: true,
  },
});
