// lit-elements
import { LitElement, html, TemplateResult, CSSResultArray, isServer, svg } from "lit";
import { classMap } from "lit/directives/class-map.js";
type Fit = "small" | "medium" | "large";
type Orientation = "horizontal" | "vertical";
type State = "completed" | "current" | "pending";

export class MyStepIndicatorItem extends LitElement {
  static get styles(): CSSResultArray {
    return [];
  }

  declare fit: Fit;
  declare label: string;
  declare orientation: Orientation;
  declare state: State;
  declare icon: string;

  static properties = {
    fit: { type: String, attribute: true, reflect: true },
    label: { type: String },
    orientation: { type: String, attribute: true, reflect: true },
    state: { type: String, attribute: true, reflect: true }
  };

  constructor() {
    super();
    this.fit = "medium";
    this.label = "";
    this.orientation = "horizontal";
    this.state = "pending";
  }

  /* render */
  public render(): TemplateResult {
    const classes = {
      [`${this.fit}`]: true,
      [`${this.orientation}`]: true,
      [`${this.state}`]: true
    };
    return html`<span class="${classMap(classes)}">${this.label}</span>`;
  }
}

customElements.get("my-step-indicator-item") || customElements.define("my-step-indicator-item", MyStepIndicatorItem);
