<script lang="ts">
import { defineComponent } from "vue";
import { hydrateServerRenderedElement } from "../utils/hydrate";

export default defineComponent({
  setup(_, context) {
    return () => context.slots.default?.()?.[0];
  },

  mounted() {
    hydrateServerRenderedElement(this.$el);
  }
});
</script>
