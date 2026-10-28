<template>
  <my-list :label="label">
    <my-list-item :label="label" />
    <my-list-item :label="label" />
  </my-list>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

const label = ref("server");

onMounted(() => {
  label.value = "client";
});
</script>
