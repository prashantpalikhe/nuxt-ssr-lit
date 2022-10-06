export function isCustomElementTag (name) {
  return typeof name === 'string' && /-/.test(name)
}

export function getCustomElementConstructor (name) {
  if (typeof customElements !== 'undefined' && isCustomElementTag(name)) {
    return customElements.get(name) || null
  } else if (typeof name === 'function') {
    return name
  }
  return null
}
