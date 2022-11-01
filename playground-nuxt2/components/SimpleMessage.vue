<template>
  <p>{{ message }}</p>
</template>

<script lang="ts">
export default {
  name: "SimpleMessage",
  props: {
    message: {
      type: String,
      default: "I am a simple message"
    }
  }
};
</script>
