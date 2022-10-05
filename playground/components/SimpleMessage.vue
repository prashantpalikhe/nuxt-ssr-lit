<template>
  <p>{{ message }}</p>
</template>

<script lang="ts" setup>
defineProps({
  message: {
    type: String,
    default: 'I am a simple message'
  }
})
</script>
