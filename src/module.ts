<<<<<<< HEAD
import {
  defineNuxtModule,
  addPlugin,
  addComponentsDir,
  resolveModule,
  createResolver,
  addVitePlugin,
} from "@nuxt/kit";
=======
import { defineNuxtModule, addPlugin, addComponentsDir, resolveModule, createResolver, addVitePlugin } from "@nuxt/kit";
>>>>>>> main
import { name, version } from "../package.json";
import autoLitWrapper from "./runtime/plugins/autoLitWrapper";

export interface NuxtSsrLitOptions {
  litElementPrefix: string | string[];
  templateSources?: string[];
}

export default defineNuxtModule<NuxtSsrLitOptions>({
  meta: {
    name,
    version,
    configKey: "nuxtSsrLit"
  },
  defaults: {
    litElementPrefix: "",
    templateSources: ["pages", "components", "layouts", "app.vue"]
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    const resolveRuntimeModule = (path: string) => resolveModule(path, { paths: resolve("./runtime") });

    addPlugin(resolveRuntimeModule("./plugins/shim.server"));
    addPlugin(resolveRuntimeModule("./plugins/shim.client"));
    addPlugin(resolveRuntimeModule("./plugins/hydrateSupport.client"));

    await addComponentsDir({ path: resolve("./runtime/components") });

    nuxt.options.nitro.moduleSideEffects = nuxt.options.nitro.moduleSideEffects || [];
    nuxt.options.nitro.moduleSideEffects.push(
      ...["@lit-labs/ssr/lib/render-lit-html.js", "@lit-labs/ssr/lib/install-global-dom-shim.js"]
    );

    const isCustomElement = nuxt.options.vue.compilerOptions.isCustomElement || (() => false);
    nuxt.options.vue.compilerOptions.isCustomElement = (tag) =>
      tag.startsWith(options.litElementPrefix) || isCustomElement(tag);

    const srcDir = nuxt.options.srcDir;

    addVitePlugin(
      autoLitWrapper({
        litElementPrefix: options.litElementPrefix,
        templateSources: options.templateSources,
        srcDir,
        sourcemap: nuxt.options.sourcemap
      })
    );
  }
});
