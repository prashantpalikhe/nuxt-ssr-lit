import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import "@lit-labs/ssr/lib/render-lit-html.js";
import { renderToString } from "@vue/server-renderer";
import { LitElementRenderer } from "@lit-labs/ssr/lib/lit-element-renderer.js";
import { isCustomElementTag, getCustomElementConstructor } from "./customElements";

export async function renderLitElement(tagName: string, vNode: any): Promise<string | undefined> {
  if (!vNode || !isCustomElementTag(tagName)) {
    return;
  }

  try {
    const renderer = new LitElementRenderer(tagName);

    attachPropsToRenderer(renderer, tagName, vNode);

    renderer.connectedCallback();

    const shadowContents = getShadowContents(renderer);
    const resolvedSlots = (await resolveSlots(vNode)) || [];
    const slots = resolvedSlots.join("");

    return `<${tagName}${getAttributesToRender(
      renderer
    )}><template shadowroot="open">${shadowContents}</template>${slots}</${tagName}>`;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return "";
  }
}

function resolveSlots(vNode: any): Promise<any> {
  let children = vNode.children || [];
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
}

function attachPropsToRenderer(renderer, tagName, vNode) {
  const customElementConstructor = getCustomElementConstructor(tagName);
  const props = vNode.props;

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      // check if this is a reactive property
      if (
        customElementConstructor !== null &&
        typeof customElementConstructor !== "string" &&
        key in customElementConstructor.prototype
      ) {
        renderer.setProperty(key, value);
      } else {
        renderer.setAttribute(key, value);
      }
    }
  }
}

function getAttributesToRender(renderer: LitElementRenderer): string {
  return iterableToString(renderer.renderAttributes());
}

function getShadowContents(renderer: LitElementRenderer): string {
  return iterableToString(renderer.renderShadow({}));
}

function iterableToString(iterable: Iterable<string>) {
  let s = "";
  for (const i of iterable) {
    s += i;
  }
  return s;
}
