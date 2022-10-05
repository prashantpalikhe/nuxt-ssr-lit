<template>
  <div>
    <h1 class="font-serif text-3xl">
      Nuxt SSR Lit
    </h1>

    <button class="bg-white text-black p-2 my-4" @click="updateValues">
      Update values with Vue button
    </button>

    <SsrLitWrapper>
      <my-element :name="name" @my-event="updateValues">
        <span slot="prepend">
          <SimpleMessage :message="prependText" />
          <p>This is a native paragraph</p>
        </span>

        <span slot="append">
          <SimpleMessage :message="appendText" />
        </span>
      </my-element>
    </SsrLitWrapper>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import './my-element'

const name = ref('foo')
const prependText = ref('I am a prepend component')
const appendText = ref('I am an append component')

function updateValues () {
  const now = new Date()
  const time = now.toLocaleTimeString()

  name.value = `foo (${time})`
  prependText.value = `I am a prepend component (${time})`
  appendText.value = `I am an append component (${time})`
}
</script>
