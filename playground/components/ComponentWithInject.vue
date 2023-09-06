<template>
  <h1 id="injectedVariable">
    {{ injectedVariable }}
  </h1>
</template>

<script setup>
import { inject } from "vue";

const injectedVariable = inject("injectedVariable");
</script>
