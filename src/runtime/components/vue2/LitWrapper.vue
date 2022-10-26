<template>
  <div>
    <slot />
    <LitElementSsr v-if="isServer" />
  </div>
</template>

<script lang="ts">
import LitElementSsr from "./LitElementSsr.vue";
export default {
  name: "LitWrapper",
  components: { LitElementSsr },
  data() {
    return {
      isServer: process.server
    };
  }
};
</script>
<style lang="css">
.lit-wrapper {
  display: unset;
}
</style>
