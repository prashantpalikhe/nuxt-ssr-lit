<template>
  <ComponentWrappingLitElement
    class="this-class-should-exist"
    data-attr-should-exist
    @click="onClick"
  ></ComponentWrappingLitElement>
</template>

<script setup>
function onClick() {
  console.log("clicked");
}
</script>

<style>
.this-class-should-exist {
  background-color: yellow;
}
</style>
