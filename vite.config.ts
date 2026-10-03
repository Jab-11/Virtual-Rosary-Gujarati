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
    base: "/Virtual-Rosary-Gujarati-HFYPG/",
    plugins: [
      nitro({
        preset: "node-server",
      }),
    ],
  },
});
