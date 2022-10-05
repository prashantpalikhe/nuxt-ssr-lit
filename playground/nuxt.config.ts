import { defineNuxtConfig } from 'nuxt/config'
import NuxtSsrLit from '..'

export default defineNuxtConfig({
  modules: [
    NuxtSsrLit
  ],
  NuxtSsrLit: {},
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('my-')
    }
  }
})
