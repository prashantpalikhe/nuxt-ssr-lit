import {
  defineNuxtModule,
  addPlugin,
  addComponentsDir,
  resolveModule,
  createResolver,
  addVitePlugin
} from '@nuxt/kit'
import MagicString from 'magic-string'
import { name, version } from '../package.json'

export interface NuxtSsrLitOptions {
  litElementPrefix: string;
  templateSources?: string[];
}

export default defineNuxtModule<NuxtSsrLitOptions>({
  meta: {
    name,
    version,
    configKey: 'nuxtSsrLit'
  },
  defaults: {
    litElementPrefix: '',
    templateSources: ['pages', 'components', 'layouts', 'app.vue']
  },
  async setup (options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) =>
      resolveModule(path, { paths: resolve('./runtime') })

    addPlugin(resolveRuntimeModule('./plugins/shim.server'))
    addPlugin(resolveRuntimeModule('./plugins/shim.client'))
    addPlugin(resolveRuntimeModule('./plugins/hydrateSupport.client'))

    await addComponentsDir({ path: resolve('./runtime/components') })

    nuxt.options.nitro.moduleSideEffects =
      nuxt.options.nitro.moduleSideEffects || []
    nuxt.options.nitro.moduleSideEffects.push(
      ...[
        '@lit-labs/ssr/lib/render-lit-html.js',
        '@lit-labs/ssr/lib/install-global-dom-shim.js'
      ]
    )

    const isCustomElement =
      nuxt.options.vue.compilerOptions.isCustomElement || (() => false)
    nuxt.options.vue.compilerOptions.isCustomElement = tag =>
      tag.startsWith(options.litElementPrefix) || isCustomElement(tag)

    const srcDir = nuxt.options.srcDir

    addVitePlugin({
      name: 'autoLitWrapper',
      transform (code, id) {
        const skipTransform =
          id.includes('node_modules') ||
          !options.templateSources.some(dir =>
            id.includes(`${srcDir}/${dir}`)
          )

        if (skipTransform) {
          return
        }
        // Borrowed from https://github.com/nuxt/framework/blob/26b1c9ca0ece63d4ea6731d75b83fbe253022485/packages/nuxt/src/components/tree-shake.ts#L67-L74
        const s = new MagicString(code)

        const openTagRegex = new RegExp(
          `<(${options.litElementPrefix}[a-z-]+)`,
          'g'
        )
        const endTagRegex = new RegExp(
          `<\\/(${options.litElementPrefix}[a-z-]+)>`,
          'g'
        )

        s.replace(openTagRegex, '<LitWrapper><$1').replace(
          endTagRegex,
          '</$1></LitWrapper>'
        )
        // No need to check for s.hasChanged() - nuxt warns about sourcemap potentially being wrong if it's not re-generated
        return {
          code: s.toString(),
          map: nuxt.options.sourcemap.server
            ? s.generateMap({ source: id, includeContent: true })
            : undefined
        }
      }
    })
  }
})
