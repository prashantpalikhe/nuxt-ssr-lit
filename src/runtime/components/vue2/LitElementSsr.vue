<template>
  <div>
    <component :is="litElementTagName" v-if="litSsrHtml" v-html="litSsrHtml" />
    <slot v-else />
  </div>
</template>

<script lang="ts">
// import { createRenderer } from "vue-server-renderer";
import { renderLitElement } from "../../utils/litRenderer";
export default {
  name: "LitElementSsr",
  data() {
    // eslint-disable-next-line vue/require-slots-as-functions
    const defaultSlot = this.$slots.default;
    const litElementVnode = defaultSlot?.[0];
    const litElementTagName = litElementVnode?.tag;
    // const { renderToString } = createRenderer();

    return {
      litElementVnode,
      litElementTagName,
      litSsrHtml: ""
      // renderToString
    };
  },

  async serverPrefetch() {
    console.log("in server prefetch for ", this.litElementTagName);
    this.litSsrHtml = await renderLitElement(this.litElementTagName, this.litElementVnode);
  }
};
</script>
