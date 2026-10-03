import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    prerender: {
      enabled: true,
      crawlLinks: true,
      autoSubfolderIndex: true,
    },
  },

  vite: {
    plugins: [
      nitro({
        preset: "node-server",
      }),
    ],
  },

  base: "/Virtual-Rosary-Gujarati/",
});
