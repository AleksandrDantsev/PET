import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  plugins: [vue()],
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 5173,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});