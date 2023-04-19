<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup(_, context) {
    return () => context.slots.default?.()?.[0];
  }
});
</script>
