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
    "nuxt-ssr-lit"
    // ...
  ]
});
```

### Getting started

Once you have installed the module to your Nuxt project, wrap your Lit custom elements with `<LitWrapper />` component provided by the module. The component is auto-imported.

```HTML
<template>
  <LitWrapper>
    <my-lit-custom-element :my-prop="myValue" @my-event="myEventHandler">
      <div slot="my-slot">Foo bar</div>
    </my-lit-custom-element>
  </LitWrapper>
</template>
```

Now, your Lit custom element should be server-side rendered and client-side hydrated. 🙌

## 👨‍💻 Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start [playground](./playground) in development mode.
