import { defineNuxtPlugin } from "#imports";

export default defineNuxtPlugin(async () => {
  // shadowRootMode is the standardized attribute.
  // Chromium 90-111 supported shadowRoot, so we check for that as well.
  const hasNativeDsd =
    Object.hasOwnProperty.call(HTMLTemplateElement.prototype, "shadowRootMode") ||
    Object.hasOwnProperty.call(HTMLTemplateElement.prototype, "shadowRoot");

  if (!hasNativeDsd) {
    const { hydrateShadowRoots } = await import("@webcomponents/template-shadowroot/template-shadowroot.js");
    hydrateShadowRoots(document.body);
    document.body.removeAttribute("dsd-pending");
  }
});
