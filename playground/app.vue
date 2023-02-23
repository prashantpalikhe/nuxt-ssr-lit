<template>
  <div>
    <header>
      <nav>
        <ul>
          <li>
            <NuxtLink to="/"> Default </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/with-vue-bindings"> With Vue bindings </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/nested-lit-element-in-slot"> Nested Lit element in slot </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/vue-component-in-slot"> Vue component in slot </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/multiple-different-element-tags"> Multiple different element tags </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/simple-element"> A different element </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/attribute-testing"> Testing different attributes </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/with-v-for"> With v-for </NuxtLink>
          </li>
        </ul>
      </nav>
    </header>

    <main>
      <NuxtPage />
    </main>
  </div>
</template>
