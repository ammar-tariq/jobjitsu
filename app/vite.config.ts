import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST;

/**
 * UI shell for the Tauri webview (ADR 0001).
 * Domain packages stay out of the renderer except presentation (`@jobjitsu/ui`).
 */
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  root: ".",
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    outDir: "dist-ui",
    emptyOutDir: true,
    target: process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
});
