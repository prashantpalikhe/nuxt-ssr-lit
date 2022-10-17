import { css, html, LitElement, PropertyDeclarations, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

const styles = css`
  :host {
    display: inline-flex;
  }

  :host(:focus) {
    outline: none;
  }

  :host([hidden]) {
    display: none;
  }

  :host button {
    align-items: center;
    background: red;
    border: 1px solid #919191;
    border-radius: 0.2rem;
    color: #fff;
    cursor: pointer;
    display: flex;
    font-family: sans-serif;
    outline: none;
    transition: all 0.4s;
    width: 100%;
  }

  :host button:hover {
    background: #5e5e5e;
    border-color: #5e5e5e;
  }

  :host button:active {
    background: #3b3b3b;
    border-color: #3b3b3b;
  }

  :host button:focus {
    border-color: white;
    box-shadow: 0 0 0 1px #919191, inset 0 0 0 1px #919191;
  }

  :host button:disabled {
    background: #8ac7fc;
    border-color: #8ac7fc;
    color: #919191;
    cursor: not-allowed;
  }
`;

export default class SimpleButton extends LitElement {
  static styles = styles;

  static properties = {
    disabled: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.disabled = false;
  }

  _button?: HTMLButtonElement | null;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("click", this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("click", this);
  }

  firstUpdated(): void {
    this._button = this.querySelector("button");
  }

  handleEvent(evt: Event): void {
    evt.stopPropagation();
    this._button?.focus();
  }

  render(): TemplateResult {
    return html`
      <button ?disabled=${this.disabled}>
        <slot></slot>
      </button>
    `;
  }
}

if (!customElements.get("simple-button")) {
  customElement("simple-button")(SimpleButton);
}
