import path from "node:path";
import { solidStart } from "@solidjs/start/config";
import { nitroV2Plugin as nitro } from "@solidjs/vite-plugin-nitro-2";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    solidStart({ middleware: "./src/middleware/index.ts" }),
    tailwindcss(),
    nitro({ preset: "vercel" }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "~": path.resolve(import.meta.dirname, "./src"),
      "@generated": path.resolve(import.meta.dirname, "./generated/"),
    },
  },
});
