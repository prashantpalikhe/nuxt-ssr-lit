import { defineNuxtConfig } from "nuxt/config";
import NuxtSsrLit from "..";

export default defineNuxtConfig({
  modules: [[NuxtSsrLit, { litElementPrefix: "my-" }]],
  vue: {
    compilerOptions: {
      isCustomElement: (el) =>
        el.toLowerCase().startsWith("simple-") ||
        el.toLowerCase().startsWith("mc-"),
    },
  },
});
