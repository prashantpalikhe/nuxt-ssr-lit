# nuxt-ssr-lit (🚧 WIP)

Nuxt3 module for server-side rendering and client-side hydration of Lit custom elements.

## 🚀 Usage

_Note: This module is for Nuxt3._

### Installation

Install `nuxt-ssr-lit`.

```shell
npm install nuxt-ssr-lit
# yarn add nuxt-ssr-lit
```

_Note: This module is not yet available in NPM registry_

Add following code to modules section of nuxt.config.js.

```js
import { defineNuxtConfig } from "nuxt";

export default defineNuxtConfig({
  modules: [
    ["nuxt-ssr-lit", {litElementPrefix: 'acme-'}],
    // ...
  ]
});
```

That's it! Now all the Lit elements prefixed with `acme-` will be Server-Side Rendered.

## 👨‍💻 Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start [playground](./playground) in development mode.
