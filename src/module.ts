import {
  defineNuxtModule,
  addPlugin,
  addComponentsDir,
  resolveModule,
  createResolver
} from '@nuxt/kit'
import { name, version } from '../package.json'

export default defineNuxtModule({
  meta: {
    name,
    version,
    configKey: 'nuxtSsrLit'
  },
  async setup () {
    const { resolve } = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolveModule(path, { paths: resolve('./runtime') })

    addPlugin(resolveRuntimeModule('./plugins/shim.server'))
    addPlugin(resolveRuntimeModule('./plugins/shim.client'))
    addPlugin(resolveRuntimeModule('./plugins/hydrateSupport.client'))

    await addComponentsDir({
      path: resolve('./runtime/components'),
      pathPrefix: false,
      prefix: '',
      level: 999,
      global: true
    })
  }
})
