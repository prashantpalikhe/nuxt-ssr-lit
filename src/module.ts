import { defineNuxtModule, addPlugin, createResolver, addVitePlugin, addComponent } from "@nuxt/kit";
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

    await addComponent({
      name: "LitWrapper",
      filePath: resolve("./runtime/components/LitWrapper.vue")
    });

    await addComponent({
      name: "LitWrapperClient",
      filePath: resolve("./runtime/components/LitWrapperClient")
    });

    await addComponent({
      name: "LitWrapperServer",
      filePath: resolve("./runtime/components/LitWrapperServer")
    });

    const isCustomElement = nuxt.options.vue.compilerOptions.isCustomElement || (() => false);
    nuxt.options.vue.compilerOptions.isCustomElement = (tag) =>
      (Array.isArray(options.litElementPrefix)
        ? options.litElementPrefix.some((p) => tag.startsWith(p))
        : tag.startsWith(options.litElementPrefix)) || isCustomElement(tag);

    addVitePlugin(
      autoLitWrapper({
        litElementPrefix: options.litElementPrefix,
        sourcemap: !!nuxt.options.sourcemap.server || !!nuxt.options.sourcemap.client
      })
    );
  }
});
