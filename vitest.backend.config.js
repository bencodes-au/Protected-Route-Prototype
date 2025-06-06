import { defineConfig } from "vitest/config";

export default defineConfig({
  root: ".",
  test: {
    environment: "node",
    include: ["backend/tests/**/*.{test,spec}.js"],
    globals: true,
    setupFiles: [],
  },
});
