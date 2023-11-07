import { LitElement, html } from "lit";

export class SimpleParent extends LitElement {
  render() {
    return html`<p>parent</p>
      <simple-child></simple-child>`;
  }
}
customElements.define("simple-parent", SimpleParent);

export class SimpleChild extends LitElement {
  render() {
    return html`<p>child</p>`;
  }
}
customElements.define("simple-child", SimpleChild);
