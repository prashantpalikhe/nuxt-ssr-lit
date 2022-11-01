import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import { defineNuxtPlugin } from "#imports";

/**
 * Vue-Router needs `window.history` to be available when it loads,
 * OR, for the lit DOM shim to not have been installed.
 * Since the renderer was moved to Nitro, this now happens too early
 * So, until the Lit team add History into the DOM shim, we need these lines
 * This is probably the most minimal object as vue-router only looks for `window.history.length` in SSR
 */

class History {
  get length() {
    return 0;
  }
}
window.history = new History();

export default defineNuxtPlugin(() => {});
