<script lang="ts">
import { defineComponent, ssrUtils, mergeProps } from "vue";
import type { ComponentInternalInstance } from "vue";
import { ssrRenderVNode, ssrRenderAttrs } from "@vue/server-renderer";
import { LitElementRenderer } from "@lit-labs/ssr/lib/lit-element-renderer.js";
import { createLitElementRenderer } from "../utils/litElementRenderer";

type PushFn = Parameters<typeof ssrRenderVNode>[0];

export default defineComponent({
  ssrRender(
    ctx: ComponentInternalInstance["proxy"],
    push: PushFn,
    litWrapperInstance: ComponentInternalInstance,
    litWrapperAttrs: Record<string, unknown>
  ) {
    const [litElementVNode] = litWrapperInstance.slots.default!();
    const litElementTagName = String(litElementVNode.type);

    const litElementVNodeProps = litElementVNode.props || {};
    const renderer = createLitElementRenderer(litElementTagName, litElementVNodeProps);

    if (!renderer) {
      return null;
    }

    try {
      renderer.connectedCallback();

      const attributes = ssrRenderAttrs(mergeProps(litElementVNodeProps, litWrapperAttrs));

      push(
        `<${litElementTagName}${attributes} defer-hydration="true"><template shadowrootmode="open" shadowroot="open">`
      );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      for (const shadowContent of renderer.renderShadow({
        elementRenderers: [LitElementRenderer],
        customElementInstanceStack: [renderer],
        customElementHostStack: [renderer]
      }) as Iterable<string>) {
        push(shadowContent);
      }

      push(`</template>`);

      // Render the LitElement slot
      const litElementChildren = litElementVNode.children
        ? Array.isArray(litElementVNode.children)
          ? litElementVNode.children
          : [litElementVNode.children]
        : [];

      litElementChildren.forEach((child) => ssrRenderVNode(push, ssrUtils.normalizeVNode(child), litWrapperInstance));

      push(`</${litElementTagName}>`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);

      return null;
    }
  }
});
</script>
