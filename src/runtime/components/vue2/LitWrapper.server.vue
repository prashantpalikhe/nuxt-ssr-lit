<template>
  <div class="lit-wrapper" v-if="litSsrHtml" v-html="litSsrHtml" />
  <div v-else>
    <slot />
  </div>
</template>

<script lang="ts">
import { renderLitElement } from "../../utils/litRenderer";

export default {
  name: "LitWrapper",

  data() {
    const defaultSlot = this.$slots.default?.();
    const litElementVnode = defaultSlot?.[0];
    const litElementTagName = litElementVnode?.type;

    return {
      litElementVnode,
      litElementTagName,
      litSsrHtml: ""
    };
  },

  async serverPrefetch() {
    this.litSsrHtml = await renderLitElement(this.litElementTagName, this.litElementVnode);
  }
};
</script>
<style lang="css">
.lit-wrapper {
  display: unset;
}
</style>
