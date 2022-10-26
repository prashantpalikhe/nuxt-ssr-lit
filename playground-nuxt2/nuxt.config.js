import NuxtSsrLit from "..";

export default {
  head: {
    title: "nuxt2-playground",
    htmlAttrs: {
      lang: "en"
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },
  vue: {
    config: {
      ignoredElements: [/^(simple|my)-/]
    }
  },
  loading: false,
  components: true,
  buildModules: ["@nuxt/typescript-build"],
  modules: [NuxtSsrLit]
};
