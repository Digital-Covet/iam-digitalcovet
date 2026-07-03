import { defineConfig } from "vite";
import { nitroV2Plugin as nitro } from "@solidjs/vite-plugin-nitro-2";

import { solidStart } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [solidStart({ middleware: "./src/middleware.ts" }), tailwindcss(),
  nitro({ preset: "vercel" }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~": path.resolve(__dirname, "./src"),
      "@generated": path.resolve(__dirname, "./generated/")
    },
  },
});
