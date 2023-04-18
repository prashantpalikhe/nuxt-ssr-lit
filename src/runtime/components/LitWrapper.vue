<script lang="ts">
import { h, defineComponent, defineAsyncComponent } from "vue";

import LitWrapperClient from "./LitWrapperClient.vue";
const LitWrapperServer = defineAsyncComponent(() => import("./LitWrapperServer.vue"));

export default defineComponent({
  name: "LitWrapper",

  render() {
    return h(process.server ? LitWrapperServer : LitWrapperClient, this.$slots.default);
  }
});
</script>
