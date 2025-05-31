import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: "frontend",
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 3001,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "frontend"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.js",
    include: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
  },
});
