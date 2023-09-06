<script lang="ts">
import { defineComponent, getCurrentInstance, ssrUtils } from "vue";
import "@lit-labs/ssr/lib/render-lit-html.js";
import { ssrRenderVNode, ssrRenderAttrs } from "@vue/server-renderer";
import { createSSRVNodesBuffer } from "../utils/ssr";
import { createLitElementRenderer, getShadowContents } from "../utils/litElementRenderer";

export default defineComponent({
  setup(_, ctx) {
    const vm = getCurrentInstance();

    const defaultSlot = ctx.slots.default?.();

    const [litElementVNode] = defaultSlot || [];
    const litElementTagName = litElementVNode?.type;

    const ssrVNodes = createSSRVNodesBuffer();

    // We only want to render the children of the lit element, not the Lit element itself
    // The Lit element will be rendered in the ssrRender function
    const litElementChildren = Array.isArray(litElementVNode?.children)
      ? litElementVNode?.children
      : [litElementVNode?.children];

    if (litElementChildren) {
      for (let i = 0; i < litElementChildren.length; i++) {
        ssrRenderVNode(ssrVNodes.push, ssrUtils.normalizeVNode(litElementChildren[i]), vm);
      }
    }

    return {
      ssrVNodes,
      litElementVNode,
      litElementTagName
    };
  },

  ssrRender(ctx: any, push: any) {
    const props = ctx.litElementVNode?.props || {};
    const renderer = createLitElementRenderer(ctx.litElementTagName as string, props);

    if (!renderer) return null;

    try {
      renderer.connectedCallback();

      push(`<${ctx.litElementTagName}${ssrRenderAttrs(props)} defer-hydration="true">`);
      push(`<template shadowrootmode="open" shadowroot="open">${getShadowContents(renderer)}</template>`);
      push(ctx.ssrVNodes.getBuffer());
      push(`</${ctx.litElementTagName}>`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);

      return null;
    }
  }
});
</script>
