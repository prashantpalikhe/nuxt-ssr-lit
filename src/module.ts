import {
  defineNuxtModule,
  addPlugin,
  addComponentsDir,
  resolveModule,
  createResolver,
  addVitePlugin,
  isNuxt2,
  isNuxt3
} from "@nuxt/kit";
import { name, version } from "../package.json";
import autoLitWrapper from "./runtime/plugins/nuxt3/autoLitWrapper";

export interface NuxtSsrLitOptions {
  litElementPrefix: string | string[];
  templateSources?: string[];
}

async function setupNuxt3(options, nuxt) {
  nuxt.options.nitro.moduleSideEffects = nuxt.options.nitro.moduleSideEffects || [];
  nuxt.options.nitro.moduleSideEffects.push(
    "@lit-labs/ssr/lib/install-global-dom-shim.js",
    "@lit-labs/ssr/lib/render-lit-html.js"
  );
  const { resolve } = createResolver(import.meta.url);
  const resolveRuntimeModule = (path: string) => resolveModule(path, { paths: resolve("./runtime") });

  addPlugin(resolveRuntimeModule("./plugins/nuxt3/shim.client"));
  addPlugin(resolveRuntimeModule("./plugins/nuxt3/hydrateSupport.client"));

  await addComponentsDir({ path: resolve("./runtime/components/vue3") });
  const isCustomElement = nuxt.options.vue.compilerOptions.isCustomElement || (() => false);
  nuxt.options.vue.compilerOptions.isCustomElement = (tag) =>
    (Array.isArray(options.litElementPrefix)
      ? options.litElementPrefix.some((p) => tag.startsWith(p))
      : tag.startsWith(options.litElementPrefix)) || isCustomElement(tag);
}

async function setupNuxt2(options, nuxt) {
  // nuxt.options.nitro.moduleSideEffects = nuxt.options.nitro.moduleSideEffects || [];
  // nuxt.options.nitro.moduleSideEffects.push(
  //   "@lit-labs/ssr/lib/install-global-dom-shim.js",
  //   "@lit-labs/ssr/lib/render-lit-html.js"
  // );
  const { resolve } = createResolver(import.meta.url);
  const resolveRuntimeModule = (path: string) => resolveModule(path, { paths: resolve("./runtime") });

  addPlugin(resolveRuntimeModule("./plugins/nuxt2/shim.client"));
  addPlugin(resolveRuntimeModule("./plugins/nuxt2/hydrateSupport.client"));

  await addComponentsDir({ path: resolve("./runtime/components/vue2") });
  // const isCustomElement = nuxt.options.vue.compilerOptions.isCustomElement || (() => false);
  // nuxt.options.vue.compilerOptions.isCustomElement = (tag) =>
  //   (Array.isArray(options.litElementPrefix)
  //     ? options.litElementPrefix.some((p) => tag.startsWith(p))
  //     : tag.startsWith(options.litElementPrefix)) || isCustomElement(tag);
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
    if (isNuxt3()) {
      await setupNuxt3(options, nuxt);
    } else if (isNuxt2()) {
      await setupNuxt2(options, nuxt);
    }

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
