import { defineComponent, h } from "vue";
// Note - these two imports need to be in this order and before the lit-element-renderer. Importing them as a plugin places these _after_ the renderer import so they **must** be in this file
// The dom-shim installation is a singleton and will only run once with minimal overhead.
import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import "@lit-labs/ssr/lib/render-lit-html.js";
import { renderToString } from "@vue/server-renderer";
import { LitElementRenderer } from "@lit-labs/ssr/lib/lit-element-renderer.js";
import { isCustomElementTag, getCustomElementConstructor } from "../utils/customElements";

export default defineComponent({
  data() {
    const defaultSlot = this.$slots.default?.()?.[0]?.children;
    const litElementVnode = defaultSlot?.[0];
    const litElementTagName = litElementVnode?.type;

    return {
      litElementVnode,
      litElementTagName,
      litSsrHtml: "",
      renderer: null
    };
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

    attachPropsToRenderer() {
      const customElementConstructor = getCustomElementConstructor(this.litElementTagName);
      const props = this.litElementVnode.props;

      if (props) {
        for (const [key, value] of Object.entries(props)) {
          // check if this is a reactive property
          if (
            customElementConstructor !== null &&
            typeof customElementConstructor !== "string" &&
            key in customElementConstructor.prototype
          ) {
            this.renderer.setProperty(key, value);
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
      return this.iterableToString(this.renderer.renderShadow({}));
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
    if (!this.litElementVnode || !isCustomElementTag(this.litElementTagName)) {
      return;
    }

    try {
      this.renderer = new LitElementRenderer(this.litElementTagName);

      this.attachPropsToRenderer();

      this.renderer.connectedCallback();

      const shadowContents = this.getShadowContents();
      const resolvedSlots = (await this.resolveSlots()) || [];
      const slots = resolvedSlots.join("");

      this.litSsrHtml = `<template shadowroot="open">${shadowContents}</template>${slots}`;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      this.litSsrHtml = "";
    }
  },

  render() {
    const attrs = this.getAttributesToRender();

    return h(this.litElementTagName, {
      innerHTML: this.litSsrHtml,
      ...attrs
    });
  }
});
