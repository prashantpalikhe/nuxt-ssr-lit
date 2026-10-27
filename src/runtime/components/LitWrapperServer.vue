<script lang="ts">
import { defineComponent, ssrUtils, mergeProps } from "vue";
import type { ComponentInternalInstance } from "vue";
import { ssrRenderVNode, ssrRenderAttrs } from "@vue/server-renderer";
import { LitElementRenderer } from "@lit-labs/ssr/lib/lit-element-renderer.js";
import { createLitElementRenderer, realize } from "../utils/litElementRenderer";

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

      // The shadow root options the element declares have to be written to the declarative shadow
      // root: `delegatesFocus` cannot be recovered on the client, since `createRenderRoot` adopts
      // the server's shadow root and `ShadowRoot.delegatesFocus` is read-only once it exists.
      const { mode = "open", delegatesFocus } = renderer.shadowRootOptions;
      const delegatesFocusAttribute = delegatesFocus ? " shadowrootdelegatesfocus" : "";

      push(
        `<${litElementTagName}${attributes} defer-hydration="true"><template shadowrootmode="${mode}" shadowroot="${mode}"${delegatesFocusAttribute}>`
      );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      for (const shadowContent of realize(renderer.renderShadow({
        elementRenderers: [LitElementRenderer],
        customElementInstanceStack: [renderer],
        customElementHostStack: [renderer],
        eventTargetStack: [renderer.element],
        slotStack: []
      }))) {
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
