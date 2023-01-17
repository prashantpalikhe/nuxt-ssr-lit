import { defineComponent, h } from "vue";
import "@lit-labs/ssr/lib/render-lit-html.js";
import { renderToString } from "@vue/server-renderer";
import { LitElementRenderer } from "@lit-labs/ssr/lib/lit-element-renderer.js";
import { isCustomElementTag, getCustomElementConstructor } from "../utils/customElements";

export default defineComponent({
  data() {
    const defaultSlot = this.$slots.default?.()?.[0]?.children;
    const litElementVnode = defaultSlot?.[0];
    const litElementTagName = litElementVnode?.type as string | symbol;

    return {
      litElementVnode,
      litElementTagName,
      litSsrHtml: "",
      renderer: null as LitElementRenderer | null
    };
  },

  methods: {
    resolveSlots(): Promise<unknown[]> {
      let children = this.litElementVnode.children || [];
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

    getAttributesToRender(): Record<string, unknown> {
      if (this.renderer.element.attributes) {
        return Object.fromEntries(
          this.renderer.element.attributes.map((attribute) => [attribute.name, attribute.value])
        );
      }

      return {};
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

    const attrs = this.getAttributesToRender();

    return h(this.litElementTagName, {
      innerHTML: this.litSsrHtml,
      ...attrs,
      "defer-hydration": true
    });
  }
});
