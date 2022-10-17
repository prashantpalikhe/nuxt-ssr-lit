<template>
  <div class="lit-wrapper" v-if="litSsrHtml" v-html="litSsrHtml" />
  <div v-else>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// Note - these two imports need to be in this order and before the lit-element-renderer. Importing them as a plugin places these _after_ the renderer import so they **must** be in this file
// The dom-shim installation is a singleton and will only run once with minimal overhead.
import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import "@lit-labs/ssr/lib/render-lit-html.js";
import { renderToString } from "@vue/server-renderer";
import { LitElementRenderer } from "@lit-labs/ssr/lib/lit-element-renderer.js";
import { isCustomElementTag, getCustomElementConstructor } from "../utils/customElements";

export default defineComponent({
  name: "LitWrapper",

  data() {
    const defaultSlot = this.$slots.default?.();
    const litElementVnode = defaultSlot?.[0];
    const litElementTagName = litElementVnode?.type;

    return {
      litElementVnode,
      litElementTagName,
      litSsrHtml: ""
    };
  },

  async serverPrefetch() {
    if (!this.litElementVnode || !isCustomElementTag(this.litElementTagName)) {
      return;
    }

    try {
      const renderer = new LitElementRenderer(this.litElementTagName);

      this.attachPropsToRenderer(renderer);

      renderer.connectedCallback();

      const shadowContents = this.getShadowContents(renderer);
      const resolvedSlots = (await this.resolveSlots()) || [];
      const slots = resolvedSlots.join("");

      this.litSsrHtml = `<${this.litElementTagName}${this.getAttributesToRender(
        renderer
      )}><template shadowroot="open">${shadowContents}</template>${slots}</${this.litElementTagName}>`;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      this.litSsrHtml = "";
    }
  },

  methods: {
    resolveSlots() {
      let children = this.litElementVnode.children || [];
      if (!Array.isArray(children)) {
        children = [children];
      }

      const childToHtmlPromises = children.map((child) => {
        if (child.__v_isVNode) {
          return renderToString(child);
        }

        return Promise.resolve(child);
      });

      return Promise.all(childToHtmlPromises);
    },

    attachPropsToRenderer(renderer) {
      const CustomElementConstructor = getCustomElementConstructor(this.litElementTagName);
      const props = this.litElementVnode.props;

      if (props) {
        for (const [key, value] of Object.entries(props)) {
          // check if this is a reactive property
          if (key in CustomElementConstructor.prototype) {
            renderer.setProperty(key, value);
          } else {
            renderer.setAttribute(key, value);
          }
        }
      }
    },

    getAttributesToRender(renderer) {
      const yieldedAttrs = renderer.renderAttributes();

      let attrContents = "";
      for (const chunk of yieldedAttrs) {
        attrContents += chunk;
      }

      return attrContents;
    },

    getShadowContents(renderer) {
      const yieldedShadowContents = renderer.renderShadow({});

      let shadowContents = "";
      for (const chunk of yieldedShadowContents) {
        shadowContents += chunk;
      }

      return shadowContents;
    }
  }
});
</script>
<style lang="css">
.lit-wrapper {
  display: unset;
}
</style>
