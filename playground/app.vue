<template>
  <div>
    <h1 class="font-serif text-3xl">
      Nuxt SSR Lit
    </h1>

    <button @click="updateValues">
      Update Lit element from Vue
    </button>

    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt error quis ipsa. Nisi animi quia corporis non dignissimos, earum dolore odit adipisci quam veritatis maxime sunt, fuga aut, saepe reiciendis?</p>

    <LitWrapper>
      <my-element :name="name" @my-event="updateValues">
        <span slot="prepend">
          <SimpleMessage :message="prependText" />
        </span>

        <span slot="append">
          <p>{{ appendText }}</p>
        </span>
      </my-element>
    </LitWrapper>

    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores quaerat et non vel enim sed exercitationem repellat, iure, ducimus repudiandae quod debitis, id tempore magni dignissimos. Velit porro quae quam.</p>

    <LitWrapper>
      <my-element />
    </LitWrapper>

    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores quaerat et non vel enim sed exercitationem repellat, iure, ducimus repudiandae quod debitis, id tempore magni dignissimos. Velit porro quae quam.</p>

    <LitWrapper>
      <p>
        I am a regular paragraph wrapped by the LitWrapper
      </p>
    </LitWrapper>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import './my-element'

const name = ref('foo')
const prependText = ref('Vue component in prepend slot')
const appendText = ref('Regular paragraph in append slot')

function updateValues () {
  const now = new Date()
  const time = now.toLocaleTimeString()

  name.value = `foo (Updated: ${time})`
  prependText.value = `Vue component in prepend slot (Updated: ${time})`
  appendText.value = `Regular paragraph in append slot (Updated: ${time})`
}
</script>
