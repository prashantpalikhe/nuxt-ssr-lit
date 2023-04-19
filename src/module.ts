import { defineNuxtModule, addPlugin, createResolver, addVitePlugin, addComponentsDir } from "@nuxt/kit";
import { name, version } from "../package.json";
import autoLitWrapper from "./runtime/plugins/autoLitWrapper";

export interface NuxtSsrLitOptions {
  litElementPrefix: string | string[];
}

export default defineNuxtModule<NuxtSsrLitOptions>({
  meta: {
    name,
    version,
    configKey: "ssrLit"
  },
  defaults: {
    litElementPrefix: []
  },
  async setup(options, nuxt) {
    nuxt.options.nitro.moduleSideEffects = nuxt.options.nitro.moduleSideEffects || [];
    nuxt.options.nitro.moduleSideEffects.push("@lit-labs/ssr/lib/render-lit-html.js");

    const { resolve } = createResolver(import.meta.url);

    addPlugin(resolve("./runtime/plugins/antiFouc.server"));
    addPlugin(resolve("./runtime/plugins/polyfill.client"));
    addPlugin(resolve("./runtime/plugins/hydrateSupport.client"));

    await addComponentsDir({ path: resolve("./runtime/components/") });

    const isCustomElement = nuxt.options.vue.compilerOptions.isCustomElement || (() => false);
    nuxt.options.vue.compilerOptions.isCustomElement = (tag) =>
      (Array.isArray(options.litElementPrefix)
        ? options.litElementPrefix.some((p) => tag.startsWith(p))
        : tag.startsWith(options.litElementPrefix)) || isCustomElement(tag);

    addVitePlugin(autoLitWrapper({ litElementPrefix: options.litElementPrefix }));
  }
});
