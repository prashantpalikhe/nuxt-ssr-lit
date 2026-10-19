import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

const styles = css`
  :host {
    display: inline-block;
  }
`;

export default class SimpleField extends LitElement {
  static styles = styles;

  static shadowRootOptions: ShadowRootInit = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  render(): TemplateResult {
    return html`<input />`;
  }
}

if (!customElements.get("simple-field")) {
  customElement("simple-field")(SimpleField);
}
