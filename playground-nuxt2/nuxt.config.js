import NuxtSsrLit from "..";

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
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
  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    "@nuxt/typescript-build"
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [NuxtSsrLit],
  build: {
    babel: {
      presets() {
        const modules = "auto";

        return [
          [
            "@nuxt/babel-preset-app",
            {
              modules,
              corejs: { version: 3 }
            }
          ]
        ];
      }
    }
  }
};
