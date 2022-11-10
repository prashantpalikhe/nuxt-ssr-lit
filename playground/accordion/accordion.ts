import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("my-accordion")
export class Accordion extends LitElement {
  /**
   * Render
   */
  render() {
    return html`<div class="accordion"><slot></slot></div>`;
  }
}
