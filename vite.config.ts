import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the built bundle works when embedded in Google Sites
// (served from an arbitrary path) or opened from any static host.
export default defineConfig({
  base: "./",
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
  },
});
