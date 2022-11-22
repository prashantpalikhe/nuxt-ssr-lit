import { defineComponent, h } from "vue";
import type { VNodeArrayChildren, VNode } from "vue";
// Note - these two imports need to be in this order and before the lit-element-renderer. Importing them as a plugin places these _after_ the renderer import so they **must** be in this file
// The dom-shim installation is a singleton and will only run once with minimal overhead.
import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import "@lit-labs/ssr/lib/render-lit-html.js";
import { renderToString } from "@vue/server-renderer";
import { LitElementRenderer } from "@lit-labs/ssr/lib/lit-element-renderer.js";
import { isCustomElementTag, getCustomElementConstructor } from "../utils/customElements";

export default defineComponent({
  data() {
    const defaultSlot = this.$slots.default?.()?.[0]?.children as VNodeArrayChildren;
    const litElementVnode = defaultSlot?.[0] as VNode;
    const litElementTagName = litElementVnode?.type as string | symbol;

    return {
      litElementVnode,
      litElementTagName,
      litSsrHtml: "",
      renderer: null as LitElementRenderer | null
    };
  },

  methods: {
    resolveSlots() {
      let children = (this.litElementVnode.children as VNodeArrayChildren | string) || [];
      if (!Array.isArray(children)) {
        children = [children];
      }

      const childToHtmlPromises = children.map((child) => {
        if (child && typeof child === "object" && child.__v_isVNode) {
          return renderToString(child);
        }

        return Promise.resolve(child);
      });

      return Promise.all(childToHtmlPromises);
    },

    attachPropsToRenderer(): void {
      const customElementConstructor = getCustomElementConstructor(this.litElementTagName);
      const props = this.litElementVnode.props;

      if (props && this.renderer) {
        for (const [key, value] of Object.entries(props)) {
          // check if this is a reactive property
          if (
            customElementConstructor !== null && // The element exists
            typeof customElementConstructor !== "string" && // It's not just a string
            key in customElementConstructor.prototype // The property we're looking for is on the prototype
          ) {
            const isBooleanProp =
              customElementConstructor.elementProperties &&
              typeof customElementConstructor.elementProperties.get(key)?.type() === "boolean";
            if (isBooleanProp && value === "") {
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

    getShadowContents(): string | undefined {
      if (this.renderer) {
        return this.iterableToString(
          this.renderer.renderShadow({
            elementRenderers: [LitElementRenderer],
            customElementInstanceStack: [],
            customElementHostStack: [],
            deferHydration: false
          })
        );
      }
    },

    iterableToString(iterable: Iterable<string>): string {
      let s = "";
      for (const i of iterable) {
        s += i;
      }
      return s;
    }
  },

  async serverPrefetch(): Promise<void> {
    if (!this.litElementVnode || !isCustomElementTag(this.litElementTagName)) {
      return;
    }

    try {
      this.renderer = new LitElementRenderer(this.litElementTagName as string); // symbols are rejected in isCustomElementTag

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
    // This is the case when the node is a fragment created by a v-for on a lit element
    if (typeof this.litElementTagName === "symbol") {
      return h(this.litElementVnode);
    }

    return h(this.litElementTagName, {
      innerHTML: this.litSsrHtml,
      ...this.litElementVnode.props
    });
  }
});
