import {
  defineNuxtModule,
  addPlugin,
  addComponentsDir,
  resolveModule,
  createResolver,
  addVitePlugin,
  isNuxt2,
  isNuxt3,
  extendWebpackConfig,
  addWebpackPlugin
} from "@nuxt/kit";
import { ModuleOptions, Nuxt } from "@nuxt/schema";
import { name, version } from "../package.json";
import autoLitWrapper from "./runtime/plugins/autoLitWrapper";

export interface NuxtSsrLitOptions extends ModuleOptions {
  litElementPrefix: string | string[];
  templateSources?: string[];
}

async function setupNuxt3(options: NuxtSsrLitOptions, nuxt: Nuxt) {
  nuxt.options.nitro.moduleSideEffects = nuxt.options.nitro.moduleSideEffects || [];
  nuxt.options.nitro.moduleSideEffects.push(
    "@lit-labs/ssr/lib/install-global-dom-shim.js",
    "@lit-labs/ssr/lib/render-lit-html.js"
  );

  const { resolve } = createResolver(import.meta.url);
  const resolveRuntimeModule = (path: string) => resolveModule(path, { paths: resolve("./runtime") });

  nuxt.options.nitro.plugins = nuxt.options.nitro.plugins || [];
  nuxt.options.nitro.plugins.push(resolveRuntimeModule("./plugins/nitro/nitroLitRenderer"));

  addPlugin(resolveRuntimeModule("./plugins/nuxt3/shim.client"));
  addPlugin(resolveRuntimeModule("./plugins/nuxt3/hydrateSupport.client"));
  addPlugin(resolveRuntimeModule("./plugins/nuxt3/domShim.server"));

  await addComponentsDir({ path: resolve("./runtime/components/vue3") });
  const isCustomElement = nuxt.options.vue.compilerOptions.isCustomElement || (() => false);
  nuxt.options.vue.compilerOptions.isCustomElement = (tag) =>
    (Array.isArray(options.litElementPrefix)
      ? options.litElementPrefix.some((p) => tag.startsWith(p))
      : tag.startsWith(options.litElementPrefix)) || isCustomElement(tag);

  const srcDir = nuxt.options.srcDir;
  // addVitePlugin(
  //   autoLitWrapper.vite({
  //     litElementPrefix: options.litElementPrefix,
  //     templateSources: options.templateSources,
  //     srcDir,
  //     sourcemap: nuxt.options.sourcemap
  //   })
  // );
}

async function setupNuxt2(options: NuxtSsrLitOptions, nuxt: Nuxt) {
  nuxt.options.build.transpile = ["@lit-labs/ssr", "lit"];

  const { resolve } = createResolver(import.meta.url);
  // This is required to work around lit using node-fetch@3 and nuxt2 using node-fetch@2
  nuxt.options.alias = {
    ...nuxt.options.alias,
    "node-fetch": resolve(__dirname, "../node_modules/node-fetch")
  };
  extendWebpackConfig((config) => {
    if (Array.isArray(config.externals)) {
      config.externals.push("module");
    } else {
      config.externals = "module"; // This line is essential or Webpack
    }

    // This rule works at build and dev time, but not in test
    config.module?.rules.push({
      test: /\.js$/i,
      use: require.resolve("./runtime/utils/importMetaLoader")
    });
  });

  const resolveRuntimeModule = (path: string) => resolveModule(path, { paths: resolve("./runtime") });

  addPlugin(resolveRuntimeModule("./plugins/nuxt2/shim.client"));
  addPlugin(resolveRuntimeModule("./plugins/nuxt2/hydrateSupport.client"));
  addPlugin(resolveRuntimeModule("./plugins/nuxt2/domShim.server")); // For Nuxt 2, the DOM Shim is now outside of the renderer as it is required when Lit components are imported

  await addComponentsDir({ path: resolve("./runtime/components/vue2") });
  // await addComponent({ filePath: resolve("./runtime/components/vue2/LitWrapper.vue"), name: "LitWrapper" });
  // const isCustomElement = nuxt.options.vue.compilerOptions.isCustomElement || (() => false);
  // nuxt.options.vue.compilerOptions.isCustomElement = (tag) =>
  //   (Array.isArray(options.litElementPrefix)
  //     ? options.litElementPrefix.some((p) => tag.startsWith(p))
  //     : tag.startsWith(options.litElementPrefix)) || isCustomElement(tag);

  const srcDir = nuxt.options.srcDir;
  addWebpackPlugin(
    autoLitWrapper.webpack({
      litElementPrefix: options.litElementPrefix,
      templateSources: options.templateSources,
      srcDir,
      sourcemap: nuxt.options.sourcemap
    }),
    { server: true }
  );
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: "nuxtSsrLit"
  },
  defaults: {
    litElementPrefix: "",
    templateSources: ["pages", "components", "layouts", "app.vue"]
  },
  async setup(options: ModuleOptions, nuxt: Nuxt) {
    if (isNuxt3()) {
      await setupNuxt3(options as NuxtSsrLitOptions, nuxt);
    } else if (isNuxt2()) {
      await setupNuxt2(options as NuxtSsrLitOptions, nuxt);
    }
  }
});
