import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import componentStyles from "./accordion-item.css?inline";

@customElement("my-accordion-item")
export class AccordionItem extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      open: { type: Boolean }
    };
  }

  /**
   * Apply styles
   */
  static get styles() {
    return [
      css`
        ${unsafeCSS(componentStyles)}
      `
    ];
  }

  constructor() {
    super();
    this.open = false;
  }

  /**
   * Methods
   */
  show() {
    this.open = true;
    this.dispatchEvent(new CustomEvent("accordion-item-show", { bubbles: true }));
  }

  hide() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("accordion-item-hide", { bubbles: true }));
  }

  toggle() {
    this.open ? this.hide() : this.show();
  }

  _handleKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      return this.show();
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      return this.hide();
    }
  }

  /**
   * Render
   */
  render() {
    return html`<div class="accordion-item">
      <button
        id="invoker"
        class="accordion-item__invoker"
        aria-controls="content"
        aria-expanded=${this.open}
        tabindex="0"
        @click=${this.toggle}
        @keydown=${this._handleKeyDown}
      >
        <span class="accordion-item__title">${this.title}</span>
        <span class="accordion-item__icon">${this.open ? "-" : "+"}</span>
      </button>

      <div class="accordion-item__content" id="content" role="region" aria-labelledby="invoker" ?hidden=${!this.open}>
        <slot></slot>
      </div>
    </div>`;
  }
}
