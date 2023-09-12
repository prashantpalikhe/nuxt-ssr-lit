import { LitElement, css, html } from "lit";

export class MyElement extends LitElement {
  static properties = {
    name: { type: String },
    theme: { type: String }
  };

  static styles = css`
    .my-element {
      background-color: black;
      color: white;
      padding: 16px;
    }

    .my-element--light {
      background-color: gray;
      color: black;
    }

    button {
      background: wite;
      color: black;
      border-radius: 4px;
      border: none;
      padding: 8px;
      margin: 12px 0;
      cursor: pointer;
    }
  `;

  constructor() {
    super();
    this.name = "default";
    this.theme = "dark";
  }

  onButtonClick() {
    console.log("Lit button clicked");
    const event = new CustomEvent("my-event", {
      detail: {
        message: "Something important happened"
      }
    });
    this.dispatchEvent(event);
  }

  render() {
    return html` <div class="my-element my-element--${this.theme}">
      <slot name="prepend">Default prepend text</slot>
      <div>
        <button type="button" @click="${this.onButtonClick}"><slot>Lit button with name "${this.name}"</slot></button>
      </div>
      <slot name="append">Default append text</slot>
    </div>`;
  }
}

customElements.define("my-element", MyElement);
