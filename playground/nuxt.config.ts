import { defineNuxtConfig } from "nuxt/config";
import NuxtSsrLit from "..";

export default defineNuxtConfig({
  modules: [[NuxtSsrLit, { litElementPrefix: ["my-", "simple-"] }]],
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => {
        return tag.startsWith("my-") || tag.startsWith("simple-");
      }
    }
  }
});
