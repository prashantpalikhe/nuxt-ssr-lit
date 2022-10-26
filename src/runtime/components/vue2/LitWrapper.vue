<template>
  <client-only>
    <slot />
    <LitElementSsr slot="placeholder" />
  </client-only>
</template>

<script lang="ts">
import LitElementSsr from "./LitElementSsr.vue";
export default {
  name: "LitWrapper",
  components: { LitElementSsr },
  data() {
    return {
      isServer: false
    };
  }
};
</script>
<style lang="css">
.lit-wrapper {
  display: unset;
}
</style>
