// lit-elements
import { CSSResult, LitElement, html, TemplateResult, css } from "lit";
import { classMap } from "lit/directives/class-map.js";
import "./my-step-indicator-item";

type Fit = "small" | "medium" | "large";
type Orientation = "horizontal" | "vertical";
type State = "completed" | "current" | "pending";

/**
 * @element `my-step-indicator`
 */
export class MyStepIndicator extends LitElement {
  declare currentindex: number;
  declare fit: Fit;
  declare labels: Array<string>;
  declare orientation: Orientation;

  static get styles(): CSSResult {
    return css`
      my-step-indicator-item {
        display: inline-block;
        border: 1px solid green;
        height: 1em;
        min-width: 2em;
      }
      .my-step-indicator {
        display: block;
        border: 1px solid red;
        height: 20px;
      }
    `;
  }

  static properties = {
    currentindex: { type: Number },
    fit: { type: String, attribute: true, reflect: true },
    labels: { type: Array, reflect: true },
    orientation: { type: String, attribute: true, reflect: true }
  };

  constructor() {
    super();
    this.currentindex = 0;
    this.fit = "medium";
    this.labels = [];
    this.orientation = "horizontal";
  }

  /* render */
  protected render(): TemplateResult {
    const classes = {
      [`${this.orientation}`]: true
    };
    return html`<ol role="list" class="my-step-indicator ${classMap(classes)}" aria-label="steps progress indicator">
      ${this.renderSteps()}
    </ol>`;
  }

  private renderSteps(): TemplateResult[] | TemplateResult {
    console.log("render steps with labels", this.labels);

    if (!this.labels?.length) {
      return html`<slot></slot>`;
    }

    return (
      this.labels &&
      this.labels.map((label, index) => {
        return html`
          <my-step-indicator-item
            orientation=${this.orientation}
            fit=${this.fit}
            state=${this.getStateName(index)}
            .label=${label}
          >
          </my-step-indicator-item>
        `;
      })
    );
  }

  private getStateName(index: number): State {
    const current = index === this.currentindex;
    const completed = index < this.currentindex;

    return current ? "current" : completed ? "completed" : "pending";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-step-indicator": MyStepIndicator;
  }
}

customElements.get("my-step-indicator") || customElements.define("my-step-indicator", MyStepIndicator);
