export default {
  render(ctx) {
    return ctx.$slots.default?.()?.[0]?.children[0];
  },
  mounted() {
    this.$el?.removeAttribute("defer-hydration");
  }
};
