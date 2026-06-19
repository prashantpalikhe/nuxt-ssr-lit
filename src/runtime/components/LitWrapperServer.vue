<script lang="ts">
import { defineComponent, ssrUtils, mergeProps } from "vue";
import type { ComponentInternalInstance } from "vue";
import { ssrRenderVNode, ssrRenderAttrs } from "@vue/server-renderer";
import { LitElementRenderer } from "@lit-labs/ssr/lib/lit-element-renderer.js";
import { collectResultSync } from "@lit-labs/ssr/lib/render-result.js";
import { createLitElementRenderer } from "../utils/litElementRenderer";

type PushFn = Parameters<typeof ssrRenderVNode>[0];

/**
 * https://github.com/lit/lit/blob/ada3ffce30cdb6a2f9a9d476767eaf747a0b2667/packages/labs/ssr/src/lib/render-result.ts#L95C1-L129C3
 * Joins a RenderResult or ThunkedRenderResult into a string synchronously.
 *
 * This function throws if a RenderResult contains a Promise.
 */
const collectResultSync = (
  result: RenderResult | ThunkedRenderResult,
  throwOnPromise: boolean = true
): string => {
  let str = '';
  for (const chunk of result) {
    let value:
      | string
      | Thunk
      | Promise<string | RenderResult | ThunkedRenderResult>
      | RenderResult
      | ReturnType<Thunk> = chunk;

    while (typeof value === 'function') {
      value = value();
    }

    if (typeof value === 'string') {
      str += value;
    } else if (Array.isArray(value)) {
      str += collectResultSync(value);
    } else if (value !== undefined) {
      if (throwOnPromise) {
        throw new Error(
          'Promises not supported in collectResultSync. ' +
            'Please use collectResult.'
        );
      }
      // Rather than error the whole thing, just silently fail it.
    }
  }

  return str;
};

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

      const shadowContents = renderer.renderShadow({
        elementRenderers: [LitElementRenderer],
        customElementInstanceStack: [renderer],
        customElementHostStack: [renderer],
        eventTargetStack: [renderer.element],
        slotStack: [],
        deferHydration: false,
      });


      if (shadowContents != null) {
      // I'm assuming this renderer needs to be synchronous. If we support async, we can remove our custom `collectResultSync` and swap to using Lit's `await collectResult(shadowContents)`
        push(collectResultSync(shadowContents, false));
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

