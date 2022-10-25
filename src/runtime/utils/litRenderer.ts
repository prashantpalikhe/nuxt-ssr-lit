// Notes on placement of the DOM shim
/* It must be placed above the render-lit-html file or that fails as it needs the shim APIs
 * It must also be placed AFTER the vue-router has initialised. The only way to do that in Nuxt 3 is to have it
 * here, directly before the render-lit-html file.
 * For Nuxt 2, it does not have to be here, but it _must_ be present before the components are loaded,
 * so therefore it is registered as a plugin
 * Having it twice for Nuxt 2 does nothing as the shim is a singleton and will not overwrite itself if it is
 * already installed
 */
import "@lit-labs/ssr/lib/install-global-dom-shim";
import "@lit-labs/ssr/lib/render-lit-html.js";
import { LitElementRenderer } from "@lit-labs/ssr/lib/lit-element-renderer.js";
import { isCustomElementTag, getCustomElementConstructor } from "./customElements";

// export type RenderToStringRenderer = (input: App | VNode, context?: SSRContext) =>  Promise<string>

// This `any` could a VNode from Vue3 or Vue2
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function renderLitElement(tagName: string, vNode: any, renderToString: any): Promise<string | undefined> {
  if (!vNode || !isCustomElementTag(tagName)) {
    return;
  }
  try {
    const renderer = new LitElementRenderer(tagName);

    attachPropsToRenderer(renderer, tagName, vNode);

    renderer.connectedCallback();

    const shadowContents = getShadowContents(renderer);
    const resolvedSlots = (await resolveSlots(vNode, renderToString)) || [];
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveSlots(vNode: any, renderToString: any): Promise<any> {
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
