import type { VNodeProps } from "vue";
import { LitElementRenderer } from "@lit-labs/ssr/lib/lit-element-renderer.js";
import { getCustomElementConstructor, isCustomElementTag } from "./customElements";

export function createLitElementRenderer(tagName: string, props: VNodeProps): LitElementRenderer | null {
  if (!isCustomElementTag(tagName)) {
    return null;
  }

  const renderer = new LitElementRenderer(tagName);
  attachPropsToRenderer(renderer, props);

  return renderer;
}

export function getShadowContents(renderer: LitElementRenderer): string {
  return iterableToString(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    renderer.renderShadow({
      elementRenderers: [LitElementRenderer],
      customElementInstanceStack: [renderer],
      customElementHostStack: [renderer]
    }) as Iterable<string>
  );
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

function iterableToString(iterable: Iterable<string>) {
  let s = "";
  for (const i of iterable) {
    s += i;
  }
  return s;
}
