import {
  defineNuxtModule,
  addPlugin,
  resolveModule,
  createResolver,
  addVitePlugin,
  addComponent,
  addTemplate,
  addPluginTemplate
} from "@nuxt/kit";
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
    configKey: "ssrLit"
  },
  defaults: {
    litElementPrefix: "",
    templateSources: ["pages", "components", "layouts", "app.vue"]
  },
  async setup(options, nuxt) {
    nuxt.options.nitro.moduleSideEffects = nuxt.options.nitro.moduleSideEffects || [];
    nuxt.options.nitro.moduleSideEffects.push("@lit-labs/ssr/lib/render-lit-html.js");

    const { resolve } = createResolver(import.meta.url);
    const resolveRuntimeModule = (path: string) => resolveModule(path, { paths: resolve("./runtime") });

    addPlugin(resolveRuntimeModule("./plugins/shim.client"));
    addPlugin(resolveRuntimeModule("./plugins/hydrateSupport.client"));

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
      filePath: resolve("./runtime/components/LitWrapperServer"),
      mode: "server"
    });

    // This creates a virtual plugin that passes the compiler options
    // to the vue app. This does not happen otherwise, and is needed
    // so that the element hydrates correctly
    addPluginTemplate({
      filename: "compilerOptions.mjs",
      getContents() {
        return `import { defineNuxtPlugin } from "#imports";
    export default defineNuxtPlugin(( app ) => {
      app.vueApp.config.compilerOptions = {};
      app.vueApp.config.compilerOptions.isCustomElement = (tag) =>
        ${
          Array.isArray(options.litElementPrefix)
            ? `['${options.litElementPrefix.join("','")}'].some((p) => tag.startsWith(p))`
            : `tag.startsWith(${
                options.litElementPrefix
              })) || ${nuxt.options.vue.compilerOptions.isCustomElement?.toString()}`
        }
      ;
    })`;
      },
      mode: "client"
    });

    const isCustomElement = nuxt.options.vue.compilerOptions.isCustomElement || (() => false);
    nuxt.options.vue.compilerOptions.isCustomElement = (tag) =>
      (Array.isArray(options.litElementPrefix)
        ? options.litElementPrefix.some((p) => tag.startsWith(p))
        : tag.startsWith(options.litElementPrefix)) || isCustomElement(tag);

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
