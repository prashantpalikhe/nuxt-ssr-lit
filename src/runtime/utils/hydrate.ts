// Vue's `$el` can be a text or comment node, or an element that isn't a Lit element, so every
// member is optional.
export interface ServerRenderedElement {
  hasAttribute?: (name: string) => boolean;
  removeAttribute?: (name: string) => void;
  parentElement?: ServerRenderedElement | null;
  shadowRoot?: { querySelectorAll: (selectors: string) => ArrayLike<ServerRenderedElement> } | null;
  // False on a Lit element until its first update.
  hasUpdated?: boolean;
  // `protected` in Lit's typings, which document it for running a pending update right away.
  performUpdate?: () => void;
}

// Lit elements connected early by an element inside them; each hydrates when its own wrapper mounts.
const connectedEarly = new WeakSet<ServerRenderedElement>();

/**
 * Hydrates a server-rendered element right away, while it still has the values the server rendered.
 *
 * Lit hydrates an element by reusing the server's HTML: it doesn't redraw text, attributes or
 * classes. If it waited for its usual microtask, a value changed in `onMounted` would already have
 * reached the element, and the page would keep showing the server's values.
 *
 * The Lit elements that contain it and haven't hydrated yet are connected first, so that their
 * controllers already listen when it first renders. Each of them hydrates when its own wrapper
 * mounts, after this one: Vue mounts children first.
 */
export function hydrateServerRenderedElement(el: ServerRenderedElement | null | undefined) {
  // Elements rendered in the browser have no `defer-hydration`: Lit updates them as usual.
  if (!el || (!el.hasAttribute?.("defer-hydration") && !connectedEarly.has(el))) {
    return;
  }
  for (const ancestor of unhydratedLitAncestors(el)) {
    ancestor.removeAttribute?.("defer-hydration");
    connectedEarly.add(ancestor);
  }
  el.removeAttribute?.("defer-hydration");
  hydrate(el);
}

// Outermost first.
function unhydratedLitAncestors(el: ServerRenderedElement) {
  const ancestors: ServerRenderedElement[] = [];
  for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.hasAttribute?.("defer-hydration") && ancestor.hasUpdated === false) {
      ancestors.unshift(ancestor);
    }
  }
  return ancestors;
}

/**
 * Runs the element's first update, then hydrates the elements the server rendered in its shadow
 * root. The elements in its light DOM are hydrated by their own wrapper.
 */
function hydrate(el: ServerRenderedElement) {
  const rendered = Array.from(el.shadowRoot?.querySelectorAll("[defer-hydration]") ?? []);
  if (el.hasUpdated === false) {
    try {
      el.performUpdate?.();
    } catch (error) {
      // Reported the way Lit reports a failed update. Thrown from here, it would reach Vue's error
      // handler, and Nuxt would show its error page.
      Promise.reject(error);
    }
  }
  for (const child of rendered) {
    // Still has the attribute if the update threw before reaching it.
    if (!child.hasAttribute?.("defer-hydration")) {
      hydrate(child);
    }
  }
}
