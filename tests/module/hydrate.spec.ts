import { describe, test, expect, vi, afterEach } from "vitest";
import { hydrateServerRenderedElement, type ServerRenderedElement } from "../../src/runtime/utils/hydrate";

/**
 * Just enough of a server-rendered Lit element: removing `defer-hydration` connects it, and its first
 * update hydrates it and lets the elements in its shadow root hydrate, as Lit's hydration does.
 */
class FakeElement implements ServerRenderedElement {
  readonly name: string;
  readonly log: string[];
  readonly attributes = new Set(["defer-hydration"]);
  readonly children: ServerRenderedElement[];
  parentElement: ServerRenderedElement | null;
  /** What its shadow root holds, in tree order. */
  rendered: ServerRenderedElement[];
  hasUpdated?: boolean = false;
  isUpdatePending = true;
  /**
   * Where its first update throws, if it does: rendering the element at that index of its shadow
   * root, after letting go of the ones before it, or after rendering, in a hook like `firstUpdated`.
   */
  throws?: number | "after rendering";

  constructor(name: string, log: string[]) {
    this.name = name;
    this.log = log;
    this.children = [];
    this.parentElement = null;
    this.rendered = [];
  }

  get shadowRoot() {
    return {
      querySelectorAll: (selectors: string) => {
        if (selectors !== "[defer-hydration]") throw new Error(`unexpected selectors ${selectors}`);
        return this.rendered.filter((el) => el.hasAttribute?.("defer-hydration"));
      }
    };
  }

  performUpdate() {
    if (!this.isUpdatePending) return;
    this.isUpdatePending = false;
    for (const [index, el] of this.rendered.entries()) {
      if (index === this.throws) throw new Error(`${this.name} failed`);
      el.removeAttribute?.("defer-hydration");
    }
    this.hasUpdated = true;
    this.log.push(`${this.name} hydrated`);
    if (this.throws === "after rendering") throw new Error(`${this.name} failed`);
  }

  hasAttribute(name: string) {
    return this.attributes.has(name);
  }

  removeAttribute(name: string) {
    if (this.attributes.delete(name) && name === "defer-hydration") this.log.push(`${this.name} connected`);
  }

  /** Puts elements in its light DOM. */
  append(...children: FakeElement[]) {
    for (const child of children) {
      child.parentElement = this;
      this.children.push(child);
    }
    return this;
  }

  /** Puts elements in its shadow root, in tree order. */
  render(...elements: FakeElement[]) {
    this.rendered = elements;
    return this;
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("hydrateServerRenderedElement", () => {
  test("hydrates a server-rendered element before returning", () => {
    const log: string[] = [];
    hydrateServerRenderedElement(new FakeElement("el", log));
    expect(log).toEqual(["el connected", "el hydrated"]);
  });

  test("hydrates the elements its shadow root renders, each after the one rendering it", () => {
    const log: string[] = [];
    const inner = new FakeElement("inner", log).render(new FakeElement("innermost", log));
    const outer = new FakeElement("outer", log).render(inner, new FakeElement("sibling", log));
    hydrateServerRenderedElement(outer);
    expect(log).toEqual([
      "outer connected",
      "inner connected",
      "sibling connected",
      "outer hydrated",
      "innermost connected",
      "inner hydrated",
      "innermost hydrated",
      "sibling hydrated"
    ]);
  });

  test("connects the Lit elements around it that are still waiting first, and leaves their update to their own wrapper", () => {
    const log: string[] = [];
    const a = new FakeElement("a", log);
    const b = new FakeElement("b", log);
    const group = new FakeElement("group", log).render(new FakeElement("rendered", log)).append(a, b);
    const section = new FakeElement("section", log).append(group);
    section.attributes.clear();
    delete section.hasUpdated;
    const layout = new FakeElement("layout", log).append(section);
    // Vue runs the mounted hooks of children first.
    hydrateServerRenderedElement(a);
    expect(log).toEqual(["layout connected", "group connected", "a connected", "a hydrated"]);
    hydrateServerRenderedElement(b);
    hydrateServerRenderedElement(group);
    hydrateServerRenderedElement(layout);
    expect(log.slice(4)).toEqual([
      "b connected",
      "b hydrated",
      "rendered connected",
      "group hydrated",
      "rendered hydrated",
      "layout hydrated"
    ]);
  });

  test("leaves an element rendered in the browser, and the elements around it, to their own updates", () => {
    const log: string[] = [];
    const browserRendered = new FakeElement("browser-rendered", log);
    browserRendered.attributes.clear();
    const group = new FakeElement("group", log).append(browserRendered);
    hydrateServerRenderedElement(browserRendered);
    expect(log).toEqual([]);
    hydrateServerRenderedElement(group);
    expect(log).toEqual(["group connected", "group hydrated"]);
    expect(browserRendered.isUpdatePending).toBe(true);
  });

  test("leaves a Lit element rendered in the browser around it to its own update", () => {
    const log: string[] = [];
    const el = new FakeElement("el", log);
    const browserRendered = new FakeElement("browser-rendered", log).append(el);
    browserRendered.attributes.clear();
    hydrateServerRenderedElement(el);
    hydrateServerRenderedElement(browserRendered);
    expect(log).toEqual(["el connected", "el hydrated"]);
    expect(browserRendered.isUpdatePending).toBe(true);
  });

  test("leaves a waiting element around it that is not a Lit element alone", () => {
    const log: string[] = [];
    const el = new FakeElement("el", log);
    const div = new FakeElement("div", log).append(el);
    delete div.hasUpdated;
    hydrateServerRenderedElement(el);
    expect(log).toEqual(["el connected", "el hydrated"]);
    expect(div.hasAttribute("defer-hydration")).toBe(true);
  });

  test("reports an update that throws after returning, and hydrates what it let go", () => {
    const scheduled: Array<() => void> = [];
    vi.stubGlobal("queueMicrotask", (callback: () => void) => scheduled.push(callback));
    const log: string[] = [];
    const group = new FakeElement("group", log).render(
      new FakeElement("released", log),
      new FakeElement("unreached", log)
    );
    group.throws = 1;

    expect(() => hydrateServerRenderedElement(group)).not.toThrow();
    // The element the failed update did not reach keeps waiting, as Lit leaves it.
    expect(log).toEqual(["group connected", "released connected", "released hydrated"]);
    expect(scheduled).toHaveLength(1);
    expect(() => scheduled.forEach((callback) => callback())).toThrow("group failed");
  });

  test("hydrates the elements an update that throws after rendering has let hydrate", () => {
    const scheduled: Array<() => void> = [];
    vi.stubGlobal("queueMicrotask", (callback: () => void) => scheduled.push(callback));
    const log: string[] = [];
    const outer = new FakeElement("outer", log).render(new FakeElement("inner", log));
    outer.throws = "after rendering";

    expect(() => hydrateServerRenderedElement(outer)).not.toThrow();
    expect(log).toEqual(["outer connected", "inner connected", "outer hydrated", "inner hydrated"]);
    expect(() => scheduled.forEach((callback) => callback())).toThrow("outer failed");
  });

  test("lets an element that is not a Lit element hydrate, without updating it", () => {
    const log: string[] = [];
    const el = new FakeElement("el", log);
    delete el.hasUpdated;
    hydrateServerRenderedElement(el);
    expect(log).toEqual(["el connected"]);
  });

  test("ignores a root that is not an element", () => {
    expect(() => hydrateServerRenderedElement(null)).not.toThrow();
    expect(() => hydrateServerRenderedElement({})).not.toThrow();
  });
});
