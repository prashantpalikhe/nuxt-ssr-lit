<template>
  <h1>
    {{ injectedVariable }}
  </h1>
</template>

<script setup>
import { inject } from "vue";

const injectedVariable = inject("injectedVariable");
</script>
