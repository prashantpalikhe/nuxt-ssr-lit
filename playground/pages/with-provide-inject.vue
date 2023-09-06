<template>
  <simple-button>
    <ComponentWithInject />
  </simple-button>
</template>

<script setup>
import { provide } from "vue";

provide("injectedVariable", "I am injected");
</script>
