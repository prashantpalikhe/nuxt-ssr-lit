import { LitElement, html } from "lit";

export class MyInner extends LitElement {
  static properties = { label: { type: String } };
  declare label: string;

  constructor() {
    super();
    this.label = "default";
  }

  render() {
    return html`<span class="inner inner--${this.label}">Inner element: ${this.label}</span>`;
  }
}
customElements.define("my-inner", MyInner);

export class MyOuter extends LitElement {
  static properties = { label: { type: String } };
  declare label: string;

  constructor() {
    super();
    this.label = "default";
  }

  render() {
    return html`<p class="outer outer--${this.label}">Outer element: ${this.label}</p>
      <my-inner .label=${this.label}></my-inner>`;
  }
}
customElements.define("my-outer", MyOuter);
