import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
  },
  server: {
    port: 3000,
    open: true,
    host: true, // Allow external access
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },
    // Force Vite to use the project directory for temp files
    force: true,
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  // Add cache directory configuration
  cacheDir: ".vite",
});
