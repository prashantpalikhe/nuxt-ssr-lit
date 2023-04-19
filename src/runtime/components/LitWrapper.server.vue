<script lang="ts">
import { defineComponent, h, isVNode } from "vue";
import "@lit-labs/ssr/lib/render-lit-html.js";
import { renderToString } from "@vue/server-renderer";
import { LitElementRenderer } from "@lit-labs/ssr/lib/lit-element-renderer.js";
import { isCustomElementTag, getCustomElementConstructor } from "../utils/customElements";

export default defineComponent({
  data() {
    const [litElementVNode] = this.$slots.default();
    const litElementTagName = litElementVNode?.type;

    return {
      litElementVNode,
      litElementTagName,
      litSsrHtml: "",
      renderer: null
    };
  },

  methods: {
    resolveSlots() {
      let children = this.litElementVNode.children || [];
      if (!Array.isArray(children)) {
        children = [children];
      }

      const childToHtmlPromises = children.map((child) => {
        if (isVNode(child)) {
          return renderToString(child);
        }

        return Promise.resolve(child);
      });

      return Promise.all(childToHtmlPromises);
    },

    attachPropsToRenderer() {
      const customElementConstructor = getCustomElementConstructor(this.litElementTagName);
      const props = this.litElementVNode.props;

      if (props) {
        for (const [key, value] of Object.entries(props)) {
          // check if this is a reactive property
          if (
            customElementConstructor !== null &&
            typeof customElementConstructor !== "string" &&
            key in customElementConstructor.prototype
          ) {
            const isBooleanProp = customElementConstructor.elementProperties.get(key)?.type === Boolean;

            if (isBooleanProp && value === "") {
              // handle key only boolean props e.g. <my-element disabled></my-element>
              this.renderer.setProperty(key, true);
            } else {
              this.renderer.setProperty(key, value);
            }
          } else {
            this.renderer.setAttribute(key, value);
          }
        }
      }
    },

    getAttributesToRender() {
      if (this.renderer.element.attributes) {
        return Object.fromEntries(
          this.renderer.element.attributes.map((attribute) => [attribute.name, attribute.value])
        );
      }

      return {};
    },

    getShadowContents() {
      return this.iterableToString(
        this.renderer.renderShadow({
          elementRenderers: [LitElementRenderer],
          customElementInstanceStack: [],
          customElementHostStack: [],
          deferHydration: true
        })
      );
    },

    iterableToString(iterable: Iterable<string>) {
      let s = "";
      for (const i of iterable) {
        s += i;
      }
      return s;
    }
  },

  async serverPrefetch() {
    if (!this.litElementVNode || !isCustomElementTag(this.litElementTagName)) {
      return;
    }

    try {
      this.renderer = new LitElementRenderer(this.litElementTagName);

      this.attachPropsToRenderer();

      this.renderer.connectedCallback();

      const shadowContents = this.getShadowContents();
      const resolvedSlots = (await this.resolveSlots()) || [];
      const slots = resolvedSlots.join("");

      this.litSsrHtml = `<template shadowrootmode="open" shadowroot="open">${shadowContents}</template>${slots}`;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      this.litSsrHtml = "";
    }
  },

  render() {
    if (!this.litElementVNode) return;

    const props = this.litElementVNode.props || {};

    return h(this.litElementTagName, {
      innerHTML: this.litSsrHtml,
      ...props
    });
  }
});
</script>
