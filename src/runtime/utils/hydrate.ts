export interface ServerRenderedElement {
  hasAttribute?: (name: string) => boolean;
  removeAttribute?: (name: string) => void;
  parentElement?: ServerRenderedElement | null;
  shadowRoot?: { querySelectorAll: (selectors: string) => ArrayLike<ServerRenderedElement> } | null;
  // False on a Lit element until its first update.
  hasUpdated?: boolean;
  // ReactiveElement#performUpdate: `protected` in Lit's typings, which document it as the way to
  // process a pending update synchronously.
  performUpdate?: () => void;
}

// Lit elements that a child's wrapper has connected, left to hydrate when their own wrapper mounts.
const connectedEarly = new WeakSet<ServerRenderedElement>();

/**
 * Lets a server-rendered element hydrate, and hydrates it before returning, together with the
 * elements it renders.
 *
 * Lit takes the server's markup over as an element's first render and writes only its property and
 * event bindings, so that render has to see the values the server rendered with. Vue has just set
 * them, hydrating the element. A change made next, in the mounted hook of a component around it,
 * reaches the element at once if the hook writes the element's property, and otherwise in Vue's
 * scheduler flush, a microtask queued while hydrating: Lit's first update, a microtask queued only
 * now, would run after it, and classes, attributes and text would keep the server's values.
 *
 * The Lit elements around it that are still waiting are connected first, outermost first, so that a
 * parent is connected before its children's first update, as it was when they hydrated in a
 * microtask. Each one hydrates when its own wrapper mounts: Vue runs the mounted hooks of children
 * first, so children still hydrate before their parent, and what a parent writes on them in its
 * first update reaches them as an ordinary update.
 */
export function hydrateServerRenderedElement(el: ServerRenderedElement | null | undefined) {
  if (!el || (!el.hasAttribute?.("defer-hydration") && !connectedEarly.has(el))) {
    return;
  }
  for (const ancestor of waitingLitAncestors(el)) {
    ancestor.removeAttribute?.("defer-hydration");
    connectedEarly.add(ancestor);
  }
  el.removeAttribute?.("defer-hydration");
  hydrate(el);
}

function waitingLitAncestors(el: ServerRenderedElement) {
  const ancestors: ServerRenderedElement[] = [];
  for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (ancestor.hasAttribute?.("defer-hydration") && ancestor.hasUpdated === false) {
      ancestors.unshift(ancestor);
    }
  }
  return ancestors;
}

/**
 * Runs the element's first update, then the one of each element the server rendered in its shadow
 * root, which that update lets hydrate. Its light DOM is left to Vue: each element there is
 * hydrated by its own wrapper.
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
    // Still waiting if the update failed before reaching it: Lit leaves it to the next render.
    if (!child.hasAttribute?.("defer-hydration")) {
      hydrate(child);
    }
  }
}
