<template>
  <div>
    <header>
      <nav>
        <ul>
          <li>
            <NuxtLink to="/">
              Default
            </nuxtlink>
          </li>
          <li>
            <NuxtLink to="/with-vue-bindings">
              With Vue bindings
            </nuxtlink>
          </li>
          <li>
            <NuxtLink to="/nested-lit-element-in-slot">
              Nested Lit element in slot
            </nuxtlink>
          </li>
          <li>
            <NuxtLink to="/vue-component-in-slot">
              Vue component in slot
            </nuxtlink>
          </li>
        </ul>
      </nav>
    </header>

    <main>
      <NuxtPage />
    </main>
  </div>
</template>
