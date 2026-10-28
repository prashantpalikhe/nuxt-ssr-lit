import { LitElement, html } from "lit";

// Throws once it has rendered in the browser, like an element with a bug.
export class MyFailingElement extends LitElement {
  firstUpdated() {
    throw new Error("my-failing-element failed");
  }

  render() {
    return html`<p>Failing element</p>`;
  }
}
customElements.define("my-failing-element", MyFailingElement);
