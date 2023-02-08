<script>
import { defineComponent, h, withCtx } from "vue";
import LitWrapperClient from "./LitWrapperClient";
import LitWrapperServer from "./LitWrapperServer";

export default defineComponent({
  name: "LitWrapper",

  render() {
    const [wrappedCustomElement] = this.$slots.default();

    return h(
      process.server ? LitWrapperServer : LitWrapperClient,
      withCtx(() => wrappedCustomElement)
    );
  }
});
</script>
