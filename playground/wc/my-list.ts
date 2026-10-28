import { LitElement, html, type ReactiveController } from "lit";

// Counts the items of a list. Like most controllers, it listens only while its host is connected.
class ItemsController implements ReactiveController {
  host: LitElement;
  count = 0;

  constructor(host: LitElement) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    this.host.addEventListener("my-item-rendered", this.onItemRendered);
  }

  hostDisconnected() {
    this.host.removeEventListener("my-item-rendered", this.onItemRendered);
  }

  onItemRendered = () => {
    this.count++;
  };
}

export class MyList extends LitElement {
  static properties = { label: { type: String } };
  declare label: string;
  items = new ItemsController(this);

  constructor() {
    super();
    this.label = "default";
  }

  render() {
    return html`<p>List: ${this.label}</p>
      <slot></slot>`;
  }
}
customElements.define("my-list", MyList);

// Tells its list that it has rendered.
export class MyListItem extends LitElement {
  static properties = { label: { type: String } };
  declare label: string;

  constructor() {
    super();
    this.label = "default";
  }

  firstUpdated() {
    this.dispatchEvent(new Event("my-item-rendered", { bubbles: true }));
  }

  render() {
    return html`<span>Item: ${this.label}</span>`;
  }
}
customElements.define("my-list-item", MyListItem);
