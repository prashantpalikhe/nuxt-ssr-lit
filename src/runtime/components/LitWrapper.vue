<template>
  <LitWrapperServer v-if="isServer">
    <slot />
  </LitWrapperServer>

  <LitWrapperClient v-else>
    <slot />
  </LitWrapperClient>
</template>

<script>
import { h, defineComponent } from "vue";

export default defineComponent({
  name: "LitWrapper",

  data() {
    return {
      isServer: process.server
    };
  }
});
</script>
