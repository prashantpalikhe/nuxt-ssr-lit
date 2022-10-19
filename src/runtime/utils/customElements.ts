export function isCustomElementTag(name: string) {
  return typeof name === "string" && /-/.test(name);
}

export function getCustomElementConstructor(name: string): CustomElementConstructor | string | null {
  if (typeof customElements !== "undefined" && isCustomElementTag(name)) {
    return customElements.get(name) || null;
  } else if (typeof name === "function") {
    return name;
  }
  return null;
}
