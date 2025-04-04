import { defineNuxtConfig } from "nuxt/config";
import NuxtSsrLit from "..";

export default defineNuxtConfig({
  modules: [[NuxtSsrLit, { litElementPrefix: ["my-", "simple-"] }]],
  sourcemap: process.env.NODE_ENV === "test" ? false : { client: true, server: true },
  compatibilityDate: "2024-11-05",
  hooks: {
    "vite:extendConfig": (config, { isServer }) => {
      if (isServer) {
        config.build.rollupOptions.output.preserveModules = false;
      }
    }
  }
});
