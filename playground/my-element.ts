import { LitElement, css, html } from 'lit'
import { property } from 'lit/decorators.js'

export class MyElement extends LitElement {
  static styles = css`
    :host {
      font-size: 16px;
      color: green;
    }

    button {
      background: #eee;
      border: none;
      padding: 8px;
      margin: 12px 0;
    }
  `

  @property()
    name?: string = 'World'

  onButtonClick () {
    const event = new CustomEvent('my-event', {
      detail: {
        message: 'Something important happened'
      }
    })
    this.dispatchEvent(event)
  }

  render () {
    return html`
    <div>
      <slot name="prepend">Default prepend text</slot>
      <div>
        <button type="button" @click="${this.onButtonClick}">Lit button with name "${this.name}"</button>
      </div>
      <slot name="append">Default append text</slot>
    </div>`
  }
}

customElements.define('my-element', MyElement)
