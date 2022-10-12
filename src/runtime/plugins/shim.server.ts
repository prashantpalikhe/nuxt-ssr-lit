import '@lit-labs/ssr/lib/install-global-dom-shim.js'
import { defineNuxtPlugin } from '#imports'

// See https://github.com/lit/lit/issues/2393
document.currentScript = null

export default defineNuxtPlugin(() => {})
