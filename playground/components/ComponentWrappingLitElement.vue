<template>
  <simple-button v-if="true" class="this-class-should-also-exist" data-attr-should-also-exist>Button</simple-button>
  <simple-button v-else>Button</simple-button>
</template>

<style scoped>
.this-class-should-also-exist {
  padding: 10px;
  border: 1px solid red;
}
</style>
