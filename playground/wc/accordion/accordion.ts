import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

export class Accordion extends LitElement {
  /**
   * Render
   */
  render() {
    return html`<div class="accordion"><slot></slot></div>`;
  }
}
if (!customElements.get("my-accordion")) {
  customElement("my-accordion")(Accordion);
}
