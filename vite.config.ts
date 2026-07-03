import { defineConfig } from "vite";
import { nitroV2Plugin as nitro } from "@solidjs/vite-plugin-nitro-2";

import { solidStart } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [solidStart(), tailwindcss(),
  nitro({
    preset: "vercel",
    routeRules: {
      "/api/auth/**": {
        cors: {
          origin: ["https://share.digitalcovet.com", "https://portfolio.digitalcovet.com"],
          methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          allowHeaders: ["Content-Type", "Authorization"],
          credentials: true,
        },
      },
    },
  }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~": path.resolve(__dirname, "./src"),
      "@generated": path.resolve(__dirname, "./generated/")
    },
  },
});
