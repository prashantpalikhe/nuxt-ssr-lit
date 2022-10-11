<template>
  <div>
    <button @click="updateValues">
      Update Lit element from Vue
    </button>

    <my-element :name="name" @my-event="updateValues">
      <span slot="prepend">
        <SimpleMessage :message="prependText" />
      </span>

      <span slot="append">
        <p>{{ appendText }}</p>
      </span>
    </my-element>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

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
