<template>
  <LitWrapperServer v-if="isServer"><slot></slot></LitWrapperServer>
  <LitWrapperClient v-else><slot></slot></LitWrapperClient>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "LitWrapper",

  data() {
    return {
      isServer: process.server
    };
  }
});
</script>
