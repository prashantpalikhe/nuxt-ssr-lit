
<template>
  <div v-if="litSsrHtml" v-html="litSsrHtml" />
  <div v-else>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import '@lit-labs/ssr/lib/render-lit-html.js'
import { renderToString } from '@vue/server-renderer'
import { LitElementRenderer } from '@lit-labs/ssr/lib/lit-element-renderer.js'
import { isCustomElementTag, getCustomElementConstructor } from '../utils/customElements'

export default defineComponent({
  name: 'LitWrapper',

  data () {
    const defaultSlot = this.$slots.default?.()
    const litElementVnode = defaultSlot?.[0]
    const litElementTagName = litElementVnode?.type

    return {
      litElementVnode,
      litElementTagName,
      litSsrHtml: ''
    }
  },

  async serverPrefetch () {
    if (!this.litElementVnode || !isCustomElementTag(this.litElementTagName)) {
      return
    }

    try {
      const renderer = new LitElementRenderer(this.litElementTagName)

      this.attachPropsToRenderer(renderer)

      renderer.connectedCallback()

      const shadowContents = this.getShadowContents(renderer)
      const resolvedSlots = (await this.resolveSlots()) || []
      const slots = resolvedSlots.join('')

      this.litSsrHtml = `<${this.litElementTagName}><template shadowroot="open">${shadowContents}</template>${slots}</${this.litElementTagName}>`
    } catch {
      this.litSsrHtml = ''
    }
  },

  methods: {
    resolveSlots () {
      const slotVnodes = (this.litElementVnode.children || []).filter(vnode => Boolean(vnode.props.slot))

      const slotVnodeToHtmlPromises = slotVnodes.map(slotVnode => renderToString(slotVnode))

      return Promise.all(slotVnodeToHtmlPromises)
    },

    attachPropsToRenderer (renderer) {
      const CustomElementConstructor = getCustomElementConstructor(this.litElementTagName)
      const props = this.litElementVnode.props

      if (props) {
        for (const [key, value] of Object.entries(props)) {
          if (key in CustomElementConstructor.prototype) {
            renderer.setProperty(key, value)
          }
        }
      }
    },

    getShadowContents (renderer) {
      const yieldedShadowContents = renderer.renderShadow({})

      let shadowContents = ''
      for (const chunk of yieldedShadowContents) {
        shadowContents += chunk
      }

      return shadowContents
    }
  }
})
</script>
