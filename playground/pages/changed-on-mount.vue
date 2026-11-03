<template>
  <div>
    <p>
      The server renders a dark element named "server"; the page switches it to a light one named "client" as it mounts,
      as a value restored from localStorage would. Once hydrated, the element is light and named "client".
    </p>
    <my-element :name="name" :theme="theme" />
    <p>The same for an element that passes the value on to another one, rendered in its shadow root.</p>
    <my-outer :label="name" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

const name = ref("server");
const theme = ref("dark");

onMounted(() => {
  name.value = "client";
  theme.value = "light";
});
</script>
