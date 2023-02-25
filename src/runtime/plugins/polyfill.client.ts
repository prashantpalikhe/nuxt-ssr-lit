import { defineNuxtPlugin } from "#imports";

export default defineNuxtPlugin(async () => {
  // shadowRootMode is the standardized attribute.
  // but to support current Chrome, we need to check for shadowRoot as well.
  // TODO: we can remove shadowRoot when Chrome 111 is released or is at least the last 2 released versions.
  const hasNativeDsd =
    Object.hasOwnProperty.call(HTMLTemplateElement.prototype, "shadowRootMode") ||
    Object.hasOwnProperty.call(HTMLTemplateElement.prototype, "shadowRoot");

  if (!hasNativeDsd) {
    const { hydrateShadowRoots } = await import("@webcomponents/template-shadowroot/template-shadowroot.js");
    hydrateShadowRoots(document.body);
    document.body.removeAttribute("dsd-pending");
  }
});
