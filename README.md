# nuxt-ssr-lit

A Nuxt3 module for server-side rendering and client-side hydration of Lit custom elements.

## 🚀 Usage

_Note: This module is for Nuxt3._ The [work on Nuxt2 support](https://github.com/prashantpalikhe/nuxt-ssr-lit/issues/9) is in progress. We are looking for assistance in finishing up the module.

### Installation

Install `nuxt-ssr-lit`.

```shell
npm install nuxt-ssr-lit
# yarn add nuxt-ssr-lit
```

Add following code to modules section of nuxt.config.js.

```js
import { defineNuxtConfig } from "nuxt";

export default defineNuxtConfig({
  modules: [
    ["nuxt-ssr-lit", { litElementPrefix: ["acme-"] }]
    // ...
  ]
});
```

That's it! Now all the Lit elements prefixed with `acme-` will be Server-Side Rendered.

## 👨‍💻 Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start [playground](./playground) in development mode.

## How does it work?

All the Lit elements in the Nuxt project that uses the prefix(es) provided in the module option are wrapped with a Vue component called [LitWrapper](./src/runtime/components/LitWrapper.vue).

This auto-wrapping is done via a Vite Plugin called [AutoLitWrapper](./src/runtime/plugins/autoLitWrapper.ts) and therefore happens during build time. By default, the plugin only operates on Vue files, which helps to optimize performance by avoiding unnecessary processing.

So, if there is a Lit element used in one of the components. E.g. `<acme-button>Hello world</acme-button>`, the code that is actually generated and used by Nuxt/Vue will be `<LitWrapper><acme-button>Hello world</acme-button></LitWrapper>`.

[The LitWrapper component on the server side](./src/runtime/components/LitWrapperServer.ts) uses the [@lit-labs/ssr](https://www.npmjs.com/package/@lit-labs/ssr)'s [LitElementRenderer](https://github.com/lit/lit/blob/main/packages/labs/ssr/src/lib/lit-element-renderer.ts) to render the wrapped Lit element with [Declarative Shadow DOM](https://web.dev/declarative-shadow-dom/). This makes the Lit component render properly on the browser without having the JS to load and execute and as soon the server HTML is parsed.

[The LitWrapper component on the client side](./src/runtime/components/LitWrapperClient.ts) does nothing and let the normal client-side hydration take place.

## Caveats

The Lit components are SSR-ed on the Node side by applying a [tiny DOM shim](https://lit.dev/docs/ssr/dom-emulation/) to Node. Not all DOM APIs are available. E.g. getting the assigned slots or children, dispatching custom events, adding event listeners on [lifecycle hooks that are called on the server-side](https://lit.dev/docs/ssr/authoring/#standard-custom-element-and-litelement) will not work. Avoiding such client-side activities on server-run code will take you long way.

Also, check the `@lit-labs/ssr`'s [library status](https://lit.dev/docs/ssr/overview/#library-status) for more information.
