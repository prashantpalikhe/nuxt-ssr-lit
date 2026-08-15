import type { VNodeProps } from "vue";
import { LitElementRenderer } from "@lit-labs/ssr/lib/lit-element-renderer.js";
import { getCustomElementConstructor, isCustomElementTag } from "./customElements";
import type { Thunk, ThunkedRenderResult } from "@lit-labs/ssr/lib/render-result";
import type { ssrRenderVNode } from "@vue/server-renderer";

export function createLitElementRenderer(tagName: string, props: VNodeProps): LitElementRenderer | null {
  if (!isCustomElementTag(tagName)) {
    return null;
  }

  const renderer = new LitElementRenderer(tagName);
  attachPropsToRenderer(renderer, props);

  return renderer;
}

function attachPropsToRenderer(renderer: LitElementRenderer, props: VNodeProps): LitElementRenderer {
  const customElementConstructor = getCustomElementConstructor(renderer.tagName);

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
          renderer.setProperty(key, true);
        } else {
          renderer.setProperty(key, value);
        }
      } else {
        renderer.setAttribute(key, value as string);
      }
    }
  }

  return renderer;
}

type PushFn = Parameters<typeof ssrRenderVNode>[0];
type SSRBufferItem = Parameters<PushFn>[0];

/**
 * Normalizes a value into an array.
 * @returns `value` if an array or `[value]` if not
 */
const toArray = <T>(value: T | T[]): T[] =>
  Array.isArray(value) ? value : [value];

/**
 * Converts a {@link ThunkedRenderResult} into an {@link SSRBufferItem}.
 * This is done by evaluating all {@link Thunk}s recursively.
 */
export const realize = (value?: Thunk | ReturnType<Thunk>): SSRBufferItem => {
  while (typeof value === 'function') {
    value = value() ?? undefined;
  }

  if (!value) return '';
  if (typeof value === 'string') return value;

  if (Array.isArray(value))
    return value.map(realize).filter(x => !!x);

  if (typeof value['then'] === 'function')
    return value.then(x => toArray(realize(x)));

  throw new Error("Unexpected item");
}
