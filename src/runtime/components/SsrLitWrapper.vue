<script lang="ts">
import { defineComponent, h } from '#imports'

function isCustomElementTag (name) {
  return typeof name === 'string' && /-/.test(name)
}

function getCustomElementConstructor (name) {
  if (typeof customElements !== 'undefined' && isCustomElementTag(name)) {
    return customElements.get(name) || null
  } else if (typeof name === 'function') {
    return name
  }
  return null
}

export default defineComponent({
  name: 'SsrLitWrapper',
  data () {
    const ceVnode = this.$slots.default()[0]
    const ceTagName = ceVnode?.type

    return {
      ceVnode,
      ceTagName,
      slots: [],
      renderer: null,
      LitElementRenderer: null
    }
  },

  async serverPrefetch () {
    this.renderer = await this.setRenderer()
    this.slots = await this.resolveSlots()
  },

  methods: {
    async setRenderer () {
      const { LitElementRenderer } = await import('@lit-labs/ssr/lib/lit-element-renderer.js')

      return new LitElementRenderer(this.ceTagName)
    },

    async resolveSlots () {
      const { renderToString } = await import('@vue/server-renderer')
      const ceVnode = this.$slots.default?.()?.[0]

      if (!ceVnode || !ceVnode.children?.length) { return [] }

      const slotVnodes = ceVnode.children.filter(vnode => Boolean(vnode.props.slot))

      if (!slotVnodes.length) { return [] }

      const slotVnodeToHtmlPromises = slotVnodes.map((slotVnode) => {
        return renderToString(slotVnode)
      })

      return Promise.all(slotVnodeToHtmlPromises)
    },

    attachPropsToRenderer () {
      const CustomElementConstructor = getCustomElementConstructor(this.ceTagName)
      const props = this.ceVnode.props

      if (props) {
        for (const [key, value] of Object.entries(props)) {
          if (key in CustomElementConstructor.prototype) {
            this.renderer.setProperty(key, value)
          }
        }
      }
    },

    renderShadow () {
      const yieldedShadowContents = this.renderer.renderShadow({})
      let shadowContents = ''
      for (const chunk of yieldedShadowContents) {
        shadowContents += chunk
      }

      return shadowContents
    }
  },

  render () {
    if (process.server) {
      this.attachPropsToRenderer()

      this.renderer.connectedCallback()

      const staticHtml = `<${this.ceTagName}><template shadowroot="open">${this.renderShadow()}</template>${this.slots.join('')}</${this.ceTagName}>`

      return h('div', { innerHTML: staticHtml })
    }
    return h('div', this.$slots.default())
  }
})
</script>
